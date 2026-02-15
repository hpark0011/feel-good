export interface DesktopAPI {
  app: {
    getVersion: () => Promise<string>
    getPlatform: () => Promise<string>
  }
  files: {
    importBoard: () => Promise<string | null>
    exportBoard: (data: string) => Promise<boolean>
  }
  notifications: {
    show: (title: string, body: string) => Promise<void>
  }
  updates: {
    check: () => Promise<{ status: string }>
    onStatus: (
      callback: (status: string, info?: unknown) => void
    ) => () => void
  }
}
