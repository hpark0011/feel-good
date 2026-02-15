import { create } from 'zustand'
import { type PersistedBoardV1 } from '../lib/persistence/schema'
import { loadBoards, saveBoards } from '../lib/persistence/local-storage'

interface BoardState {
  boards: PersistedBoardV1[]
  selectedBoardId: string | null
}

interface BoardStore extends BoardState {
  addBoard: (board: PersistedBoardV1) => void
  removeBoard: (id: string) => void
  updateBoard: (id: string, updates: Partial<PersistedBoardV1>) => void
  selectBoard: (id: string | null) => void
  importBoard: (json: string) => PersistedBoardV1 | null
  exportBoard: (id: string) => string | null
  getSelectedBoard: () => PersistedBoardV1 | undefined
  _hydrate: () => void
  _persist: () => void
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  boards: [],
  selectedBoardId: null,

  addBoard: (board) => {
    set((state) => {
      const boards = [...state.boards, board]
      return { boards }
    })
    get()._persist()
  },

  removeBoard: (id) => {
    set((state) => {
      const boards = state.boards.filter((b) => b.id !== id)
      const selectedBoardId =
        state.selectedBoardId === id ? null : state.selectedBoardId
      return { boards, selectedBoardId }
    })
    get()._persist()
  },

  updateBoard: (id, updates) => {
    set((state) => {
      const boards = state.boards.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      )
      return { boards }
    })
    get()._persist()
  },

  selectBoard: (id) => {
    set({ selectedBoardId: id })
  },

  importBoard: (json) => {
    try {
      const parsed = JSON.parse(json) as PersistedBoardV1
      const board: PersistedBoardV1 = {
        ...parsed,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      get().addBoard(board)
      return board
    } catch {
      console.warn('Failed to import board')
      return null
    }
  },

  exportBoard: (id) => {
    const board = get().boards.find((b) => b.id === id)
    if (!board) return null
    return JSON.stringify(board, null, 2)
  },

  getSelectedBoard: () => {
    const { boards, selectedBoardId } = get()
    return boards.find((b) => b.id === selectedBoardId)
  },

  _hydrate: () => {
    const boards = loadBoards()
    set({ boards })
  },

  _persist: () => {
    saveBoards(get().boards)
  },
}))
