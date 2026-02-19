import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { type DocumentFile } from '../../electron/lib/desktop-api'
import { useDocumentStore } from '../state/document-store'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function FolderIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  )
}

function FileIcon() {
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
      className="shrink-0 text-muted-foreground"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}

function RefreshIcon() {
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
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="text-muted-foreground">
          <FolderIcon />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
    </div>
  )
}

function FileListItem({ file }: { file: DocumentFile }) {
  const navigate = useNavigate()
  const displayName = file.name.replace(/\.md$/, '')

  return (
    <button
      type="button"
      onClick={() => navigate(`/document/${encodeURIComponent(file.name)}`)}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50"
    >
      <FileIcon />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-card-foreground">
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeDate(file.lastModified)} · {formatBytes(file.sizeBytes)}
        </p>
      </div>
    </button>
  )
}

export function DocumentList() {
  const { folderPath, files, isLoading, error, selectFolder, loadFolder, refreshFiles } =
    useDocumentStore()

  useEffect(() => {
    loadFolder()
  }, [loadFolder])

  if (isLoading && !folderPath) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Error state: folder no longer exists
  if (error && !folderPath) {
    return (
      <EmptyState
        title="Folder not found"
        description={error}
        action={
          <button
            type="button"
            onClick={selectFolder}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Select New Folder
          </button>
        }
      />
    )
  }

  // No folder selected yet
  if (!folderPath) {
    return (
      <EmptyState
        title="No folder selected"
        description="Select a folder containing your markdown documents to get started."
        action={
          <button
            type="button"
            onClick={selectFolder}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Select Folder
          </button>
        }
      />
    )
  }

  const folderName = folderPath.split('/').pop() ?? folderPath

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium" title={folderPath}>
            {folderName}
          </h2>
          <p className="text-xs text-muted-foreground">
            {files.length} {files.length === 1 ? 'document' : 'documents'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshFiles}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent/50 disabled:opacity-50"
            title="Refresh file list"
          >
            <RefreshIcon />
            Refresh
          </button>
          <button
            type="button"
            onClick={selectFolder}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent/50"
          >
            Change Folder
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">Scanning folder...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">
              No markdown files found in this folder.
            </p>
            <button
              type="button"
              onClick={selectFolder}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Try a different folder
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <FileListItem key={file.name} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
