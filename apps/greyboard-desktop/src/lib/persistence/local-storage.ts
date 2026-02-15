import { boardListSchema, type BoardList, type PersistedBoardV1 } from './schema'

const STORAGE_KEY = 'greyboard-desktop:boards'

export function loadBoards(): PersistedBoardV1[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = boardListSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      console.warn('Invalid board data in localStorage, returning empty list')
      return []
    }

    return parsed.data.boards
  } catch {
    console.warn('Failed to load boards from localStorage')
    return []
  }
}

export function saveBoards(boards: PersistedBoardV1[]): void {
  const data: BoardList = {
    version: 1,
    boards,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearBoards(): void {
  localStorage.removeItem(STORAGE_KEY)
}
