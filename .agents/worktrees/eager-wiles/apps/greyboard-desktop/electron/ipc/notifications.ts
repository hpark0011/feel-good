import { Notification, ipcMain } from 'electron'
import { CHANNELS } from '../lib/channels'
import { notificationPayloadSchema } from '../lib/validators'

export function registerNotificationHandlers() {
  ipcMain.handle(
    CHANNELS.NOTIFICATIONS_SHOW,
    (_event: Electron.IpcMainInvokeEvent, data: unknown) => {
      const parsed = notificationPayloadSchema.safeParse(data)
      if (!parsed.success) {
        throw new Error(`Invalid notification data: ${parsed.error.message}`)
      }
      new Notification({ title: parsed.data.title, body: parsed.data.body }).show()
    }
  )
}
