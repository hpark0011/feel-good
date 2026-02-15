import { useBoardStore } from '../state/board-store'
import { desktopAPI } from '../lib/ipc/client'

export function Dashboard() {
  const boards = useBoardStore((s) => s.boards)
  const importBoard = useBoardStore((s) => s.importBoard)

  const handleImport = async () => {
    const content = await desktopAPI.files.importBoard()
    if (content) {
      importBoard(content)
    }
  }

  const handleExport = async (id: string) => {
    const board = useBoardStore.getState().exportBoard(id)
    if (board) {
      await desktopAPI.files.exportBoard(board)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your boards will appear here.
          </p>
        </div>
        <button
          type="button"
          onClick={handleImport}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Import Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            No boards yet. Import a board to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <h3 className="font-medium text-card-foreground">
                {board.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Updated {new Date(board.updatedAt).toLocaleDateString()}
              </p>
              <button
                type="button"
                onClick={() => handleExport(board.id)}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Export
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
