import { type BrowserWindow } from 'electron'
import { registerAppHandlers } from './app'
import { registerFileHandlers } from './files'
import { registerNotificationHandlers } from './notifications'
import { registerUpdateHandlers } from './updates'

export function registerAllHandlers(mainWindow: BrowserWindow) {
  registerAppHandlers()
  registerFileHandlers(mainWindow)
  registerNotificationHandlers()
  registerUpdateHandlers(mainWindow)
}
