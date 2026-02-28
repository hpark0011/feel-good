import { app, ipcMain } from 'electron'
import { CHANNELS } from '../lib/channels'

export function registerAppHandlers() {
  ipcMain.handle(CHANNELS.APP_GET_VERSION, () => {
    return app.getVersion()
  })

  ipcMain.handle(CHANNELS.APP_GET_PLATFORM, () => {
    return process.platform
  })
}
