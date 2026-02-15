import { app, ipcMain } from 'electron'

export function registerAppHandlers() {
  ipcMain.handle('greyboard:app:getVersion', () => {
    return app.getVersion()
  })

  ipcMain.handle('greyboard:app:getPlatform', () => {
    return process.platform
  })
}
