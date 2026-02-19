import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderFillIcon, DocFillIcon, ArrowClockwiseIcon } from '@feel-good/icons'
import { Button } from '@feel-good/ui/primitives/button'
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
          <FolderFillIcon className="size-12" />
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

const FileListItem = React.memo(function FileListItem({
  file,
  onSelect,
}: {
  file: DocumentFile
  onSelect: (name: string) => void
}) {
  const displayName = file.name.replace(/\.md$/, '')
  return (
    <button
      type="button"
      onClick={() => onSelect(file.name)}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50"
    >
      <DocFillIcon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-card-foreground">{displayName}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeDate(file.lastModified)} · {formatBytes(file.sizeBytes)}
        </p>
      </div>
    </button>
  )
})

export function DocumentList() {
  const { folderPath, files, isLoading, error, selectFolder, loadFolder } = useDocumentStore()

  const navigate = useNavigate()
  const handleSelectFile = React.useCallback(
    (name: string) => navigate(`/document/${encodeURIComponent(name)}`),
    [navigate],
  )

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
        action={<Button onClick={selectFolder}>Select New Folder</Button>}
      />
    )
  }

  // No folder selected yet
  if (!folderPath) {
    return (
      <EmptyState
        title="No folder selected"
        description="Select a folder containing your markdown documents to get started."
        action={<Button onClick={selectFolder}>Select Folder</Button>}
      />
    )
  }

  const folderName = folderPath.split(/[/\\]/).pop() ?? folderPath

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
          <Button
            variant="outline"
            size="sm"
            onClick={loadFolder}
            disabled={isLoading}
          >
            <ArrowClockwiseIcon className="size-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={selectFolder}>
            Change Folder
          </Button>
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
              <FileListItem key={file.name} file={file} onSelect={handleSelectFile} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
