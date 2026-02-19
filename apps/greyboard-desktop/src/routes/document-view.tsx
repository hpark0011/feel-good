import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowBackwardIcon } from '@feel-good/icons'
import { Button } from '@feel-good/ui/primitives/button'
import { desktopAPI } from '../lib/ipc/client'

export function DocumentView() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const displayName = name?.replace(/\.md$/, '') ?? 'Unknown'

  useEffect(() => {
    if (!name) {
      setError('No file name provided')
      setIsLoading(false)
      return
    }

    const fileName = name
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
  }, [name])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate('/')}
          title="Back to file list"
        >
          <ArrowBackwardIcon className="size-4" />
        </Button>
        <h2 className="truncate text-sm font-medium" title={name ?? ''}>
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
