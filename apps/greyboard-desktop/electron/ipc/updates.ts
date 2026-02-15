import { type BrowserWindow, ipcMain } from 'electron'
import { CHANNELS } from '../lib/channels'

export type UpdateStatus =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export function registerUpdateHandlers(mainWindow: BrowserWindow) {
  let listenersRegistered = false

  ipcMain.handle(CHANNELS.UPDATES_CHECK, async () => {
    try {
      const { autoUpdater } = await import('electron-updater')

      if (!listenersRegistered) {
        autoUpdater.on('checking-for-update', () => {
          mainWindow.webContents.send(CHANNELS.UPDATES_ON_STATUS, 'checking' satisfies UpdateStatus)
        })

        autoUpdater.on('update-available', (info) => {
          mainWindow.webContents.send(CHANNELS.UPDATES_ON_STATUS, 'available' satisfies UpdateStatus, info)
        })

        autoUpdater.on('update-not-available', () => {
          mainWindow.webContents.send(CHANNELS.UPDATES_ON_STATUS, 'not-available' satisfies UpdateStatus)
        })

        autoUpdater.on('download-progress', (progress) => {
          mainWindow.webContents.send(CHANNELS.UPDATES_ON_STATUS, 'downloading' satisfies UpdateStatus, progress)
        })

        autoUpdater.on('update-downloaded', (info) => {
          mainWindow.webContents.send(CHANNELS.UPDATES_ON_STATUS, 'downloaded' satisfies UpdateStatus, info)
        })

        autoUpdater.on('error', (err) => {
          mainWindow.webContents.send(CHANNELS.UPDATES_ON_STATUS, 'error' satisfies UpdateStatus, err.message)
        })

        listenersRegistered = true
      }

      await autoUpdater.checkForUpdates()
      return { status: 'checking' as UpdateStatus }
    } catch {
      return { status: 'error' as UpdateStatus }
    }
  })
}
