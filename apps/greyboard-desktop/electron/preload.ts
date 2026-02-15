import { contextBridge, ipcRenderer } from 'electron'

const CHANNELS = {
  APP_GET_VERSION: 'greyboard:app:getVersion',
  APP_GET_PLATFORM: 'greyboard:app:getPlatform',
  FILES_IMPORT_BOARD: 'greyboard:files:importBoard',
  FILES_EXPORT_BOARD: 'greyboard:files:exportBoard',
  NOTIFICATIONS_SHOW: 'greyboard:notifications:show',
  UPDATES_CHECK: 'greyboard:updates:check',
  UPDATES_ON_STATUS: 'greyboard:updates:onStatus',
} as const

contextBridge.exposeInMainWorld('greyboardDesktop', {
  app: {
    getVersion: () => ipcRenderer.invoke(CHANNELS.APP_GET_VERSION),
    getPlatform: () => ipcRenderer.invoke(CHANNELS.APP_GET_PLATFORM),
  },
  files: {
    importBoard: () => ipcRenderer.invoke(CHANNELS.FILES_IMPORT_BOARD),
    exportBoard: (data: string) =>
      ipcRenderer.invoke(CHANNELS.FILES_EXPORT_BOARD, data),
  },
  notifications: {
    show: (title: string, body: string) =>
      ipcRenderer.invoke(CHANNELS.NOTIFICATIONS_SHOW, title, body),
  },
  updates: {
    check: () => ipcRenderer.invoke(CHANNELS.UPDATES_CHECK),
    onStatus: (callback: (status: string, info?: unknown) => void) => {
      const listener = (
        _event: Electron.IpcRendererEvent,
        status: string,
        info?: unknown
      ) => {
        callback(status, info)
      }
      ipcRenderer.on(CHANNELS.UPDATES_ON_STATUS, listener)
      return () => {
        ipcRenderer.removeListener(CHANNELS.UPDATES_ON_STATUS, listener)
      }
    },
  },
})
