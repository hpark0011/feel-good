import { type BrowserWindow, ipcMain } from 'electron'

export type UpdateStatus =
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export function registerUpdateHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('greyboard:updates:check', async () => {
    try {
      const { autoUpdater } = await import('electron-updater')

      autoUpdater.on('checking-for-update', () => {
        mainWindow.webContents.send('greyboard:updates:onStatus', 'checking' satisfies UpdateStatus)
      })

      autoUpdater.on('update-available', (info) => {
        mainWindow.webContents.send('greyboard:updates:onStatus', 'available' satisfies UpdateStatus, info)
      })

      autoUpdater.on('update-not-available', () => {
        mainWindow.webContents.send('greyboard:updates:onStatus', 'not-available' satisfies UpdateStatus)
      })

      autoUpdater.on('download-progress', (progress) => {
        mainWindow.webContents.send('greyboard:updates:onStatus', 'downloading' satisfies UpdateStatus, progress)
      })

      autoUpdater.on('update-downloaded', (info) => {
        mainWindow.webContents.send('greyboard:updates:onStatus', 'downloaded' satisfies UpdateStatus, info)
      })

      autoUpdater.on('error', (err) => {
        mainWindow.webContents.send('greyboard:updates:onStatus', 'error' satisfies UpdateStatus, err.message)
      })

      await autoUpdater.checkForUpdates()
      return { status: 'checking' as UpdateStatus }
    } catch {
      return { status: 'error' as UpdateStatus }
    }
  })
}
