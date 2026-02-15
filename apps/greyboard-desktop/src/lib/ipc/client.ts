import { type DesktopAPI } from '../../types/desktop-api'

function getDesktopAPI(): DesktopAPI | null {
  if (typeof window !== 'undefined' && window.greyboardDesktop) {
    return window.greyboardDesktop
  }
  return null
}

export const desktopAPI = {
  app: {
    getVersion: async () => {
      const api = getDesktopAPI()
      return api?.app.getVersion() ?? 'unknown'
    },
    getPlatform: async () => {
      const api = getDesktopAPI()
      return api?.app.getPlatform() ?? 'unknown'
    },
  },
  files: {
    importBoard: async () => {
      const api = getDesktopAPI()
      return api?.files.importBoard() ?? null
    },
    exportBoard: async (data: string) => {
      const api = getDesktopAPI()
      return api?.files.exportBoard(data) ?? false
    },
  },
  notifications: {
    show: async (title: string, body: string) => {
      const api = getDesktopAPI()
      await api?.notifications.show(title, body)
    },
  },
  updates: {
    check: async () => {
      const api = getDesktopAPI()
      return api?.updates.check() ?? { status: 'error' }
    },
    onStatus: (callback: (status: string, info?: unknown) => void) => {
      const api = getDesktopAPI()
      return api?.updates.onStatus(callback) ?? (() => {})
    },
  },
  isAvailable: () => getDesktopAPI() !== null,
}
