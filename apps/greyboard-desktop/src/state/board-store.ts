import { create } from 'zustand'
import { persist, type StateStorage } from 'zustand/middleware'
import {
  boardListSchema,
  type PersistedBoardV1,
} from '../lib/persistence/schema'

const STORAGE_KEY = 'greyboard-desktop:boards'

interface BoardState {
  boards: PersistedBoardV1[]
  selectedBoardId: string | null
}

interface BoardActions {
  addBoard: (board: PersistedBoardV1) => void
  removeBoard: (id: string) => void
  updateBoard: (id: string, updates: Partial<PersistedBoardV1>) => void
  selectBoard: (id: string | null) => void
  importBoard: (json: string) => PersistedBoardV1 | null
  exportBoard: (id: string) => string | null
  getSelectedBoard: () => PersistedBoardV1 | undefined
}

/**
 * Custom storage adapter that preserves the version-wrapped BoardList format
 * and validates data with Zod on read.
 */
const boardStorage: StateStorage = {
  getItem: (key) => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null

      const json = JSON.parse(raw)
      const parsed = boardListSchema.safeParse(json)
      if (!parsed.success) {
        console.warn('Invalid board data in localStorage, resetting')
        return null
      }

      // Return zustand-persist envelope with validated boards
      return JSON.stringify({ state: { boards: parsed.data.boards }, version: 0 })
    } catch {
      console.warn('Failed to load boards from localStorage')
      return null
    }
  },
  setItem: (key, value) => {
    try {
      const { state } = JSON.parse(value) as { state: BoardState }
      // Write in the version-wrapped BoardList format
      localStorage.setItem(key, JSON.stringify({ version: 1, boards: state.boards }))
    } catch {
      console.warn('Failed to save boards to localStorage')
    }
  },
  removeItem: (key) => {
    localStorage.removeItem(key)
  },
}

export const useBoardStore = create<BoardState & BoardActions>()(
  persist(
    (set, get) => ({
      boards: [],
      selectedBoardId: null,

      addBoard: (board) => {
        set((state) => ({ boards: [...state.boards, board] }))
      },

      removeBoard: (id) => {
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
          selectedBoardId: state.selectedBoardId === id ? null : state.selectedBoardId,
        }))
      },

      updateBoard: (id, updates) => {
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        }))
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
    }),
    {
      name: STORAGE_KEY,
      storage: boardStorage,
      partialize: (state) => ({ boards: state.boards }),
    }
  )
)
