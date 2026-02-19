import { type BrowserWindow } from 'electron'
import { registerAppHandlers } from './app'
import { registerDocHandlers } from './docs'
import { registerNotificationHandlers } from './notifications'
import { registerUpdateHandlers } from './updates'

export function registerAllHandlers(mainWindow: BrowserWindow) {
  registerAppHandlers()
  registerDocHandlers(mainWindow)
  registerNotificationHandlers()
  registerUpdateHandlers(mainWindow)
}
