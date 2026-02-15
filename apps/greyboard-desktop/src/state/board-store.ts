import { create } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import {
  boardListSchema,
  persistedBoardV1Schema,
  type PersistedBoardV1,
} from '../lib/persistence/schema'

const STORAGE_KEY = 'greyboard-desktop:boards'

let persistTimer: ReturnType<typeof setTimeout> | null = null

interface BoardState {
  boards: PersistedBoardV1[]
}

interface BoardActions {
  addBoard: (board: PersistedBoardV1) => void
  removeBoard: (id: string) => void
  updateBoard: (id: string, updates: Partial<PersistedBoardV1>) => void
  importBoard: (json: string) => PersistedBoardV1 | null
  exportBoard: (id: string) => string | null
}

/**
 * Custom storage adapter that preserves the version-wrapped BoardList format
 * and validates data with Zod on read.
 */
const boardStorage: PersistStorage<BoardState> = {
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

      return { state: { boards: parsed.data.boards }, version: 0 }
    } catch {
      console.warn('Failed to load boards from localStorage')
      return null
    }
  },
  setItem: (key, value: StorageValue<BoardState>) => {
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ version: 1, boards: value.state.boards }))
      } catch {
        console.warn('Failed to save boards to localStorage')
      }
    }, 300)
  },
  removeItem: (key) => {
    localStorage.removeItem(key)
  },
}

export const useBoardStore = create<BoardState & BoardActions>()(
  persist(
    (set, get) => ({
      boards: [],

      addBoard: (board) => {
        set((state) => ({ boards: [...state.boards, board] }))
      },

      removeBoard: (id) => {
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
        }))
      },

      updateBoard: (id, updates) => {
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        }))
      },

      importBoard: (json) => {
        try {
          const result = persistedBoardV1Schema.safeParse(JSON.parse(json))
          if (!result.success) {
            console.warn('Failed to import board: invalid format')
            return null
          }
          const board: PersistedBoardV1 = {
            ...result.data,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          get().addBoard(board)
          return board
        } catch {
          console.warn('Failed to import board: invalid JSON')
          return null
        }
      },

      exportBoard: (id) => {
        const board = get().boards.find((b) => b.id === id)
        if (!board) return null
        return JSON.stringify(board, null, 2)
      },
    }),
    {
      name: STORAGE_KEY,
      storage: boardStorage,
      partialize: (state) => ({ boards: state.boards }),
    }
  )
)
