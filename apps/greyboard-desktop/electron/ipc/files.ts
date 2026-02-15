import { type BrowserWindow, dialog, ipcMain } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { exportBoardPayloadSchema } from '../lib/validators'

export function registerFileHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('greyboard:files:importBoard', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Board',
      filters: [{ name: 'Greyboard Files', extensions: ['json'] }],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    if (!filePath) return null
    const content = await readFile(filePath, 'utf-8')
    return content
  })

  ipcMain.handle(
    'greyboard:files:exportBoard',
    async (_event: Electron.IpcMainInvokeEvent, data: unknown) => {
      const parsed = exportBoardPayloadSchema.safeParse(data)
      if (!parsed.success) {
        throw new Error(`Invalid export data: ${parsed.error.message}`)
      }

      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Board',
        defaultPath: 'board.json',
        filters: [{ name: 'Greyboard Files', extensions: ['json'] }],
      })

      if (result.canceled || !result.filePath) {
        return false
      }

      await writeFile(result.filePath, parsed.data, 'utf-8')
      return true
    }
  )
}
