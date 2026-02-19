import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { desktopAPI } from '../lib/ipc/client'

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

export function DocumentView() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const decodedName = name ? decodeURIComponent(name) : null
  const displayName = decodedName?.replace(/\.md$/, '') ?? 'Unknown'

  useEffect(() => {
    if (!decodedName) {
      setError('No file name provided')
      setIsLoading(false)
      return
    }

    const fileName = decodedName
    let cancelled = false

    async function loadFile() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await desktopAPI.docs.readFile(fileName)
        if (cancelled) return
        if (!result) {
          setError('File could not be read. It may have been moved or deleted.')
        } else {
          setContent(result.content)
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to read file')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadFile()
    return () => {
      cancelled = true
    }
  }, [decodedName])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent/50"
          title="Back to file list"
        >
          <ArrowLeftIcon />
        </button>
        <h2 className="truncate text-sm font-medium" title={decodedName ?? ''}>
          {displayName}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading file...</p>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Back to file list
            </button>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words p-6 text-sm leading-relaxed text-foreground font-mono">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}
