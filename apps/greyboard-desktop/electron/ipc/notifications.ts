import { Notification, ipcMain } from 'electron'

export function registerNotificationHandlers() {
  ipcMain.handle(
    'greyboard:notifications:show',
    (_event: Electron.IpcMainInvokeEvent, title: string, body: string) => {
      new Notification({ title, body }).show()
    }
  )
}
