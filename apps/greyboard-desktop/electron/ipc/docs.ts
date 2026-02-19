import { type BrowserWindow, app, dialog, ipcMain } from 'electron'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { CHANNELS } from '../lib/channels'
import { type DocumentFile } from '../lib/desktop-api'
import { readFilePayloadSchema } from '../lib/validators'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

let selectedFolderPath: string | null = null

function getSettingsPath(): string {
  return path.join(app.getPath('userData'), 'docs-settings.json')
}

async function loadPersistedFolder(): Promise<string | null> {
  try {
    const content = await readFile(getSettingsPath(), 'utf-8')
    const data = JSON.parse(content)
    if (typeof data.folderPath === 'string') {
      // Verify the folder still exists
      const info = await stat(data.folderPath)
      if (info.isDirectory()) {
        return data.folderPath
      }
    }
  } catch {
    // File doesn't exist or is invalid — that's fine
  }
  return null
}

async function persistFolder(folderPath: string | null): Promise<void> {
  try {
    await writeFile(
      getSettingsPath(),
      JSON.stringify({ folderPath }),
      'utf-8'
    )
  } catch {
    console.warn('Failed to persist folder path')
  }
}

export function registerDocHandlers(mainWindow: BrowserWindow) {
  // Load persisted folder on registration
  loadPersistedFolder().then((folder) => {
    selectedFolderPath = folder
  })

  ipcMain.handle(CHANNELS.DOCS_SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Document Folder',
      properties: ['openDirectory'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const folderPath = result.filePaths[0]
    if (!folderPath) return null

    selectedFolderPath = folderPath
    await persistFolder(folderPath)

    return { path: folderPath }
  })

  ipcMain.handle(CHANNELS.DOCS_GET_FOLDER, async () => {
    if (!selectedFolderPath) return null

    // Verify the folder still exists
    try {
      const info = await stat(selectedFolderPath)
      if (!info.isDirectory()) {
        selectedFolderPath = null
        await persistFolder(null)
        return null
      }
    } catch {
      selectedFolderPath = null
      await persistFolder(null)
      return null
    }

    return { path: selectedFolderPath }
  })

  ipcMain.handle(CHANNELS.DOCS_LIST_FILES, async () => {
    if (!selectedFolderPath) return []

    try {
      const entries = await readdir(selectedFolderPath, { withFileTypes: true })
      const files: DocumentFile[] = []

      for (const entry of entries) {
        // Skip non-files, symlinks, and hidden files
        if (!entry.isFile()) continue
        if (entry.name.startsWith('.')) continue
        if (!entry.name.endsWith('.md')) continue

        try {
          const filePath = path.join(selectedFolderPath, entry.name)
          const fileInfo = await stat(filePath)

          files.push({
            name: entry.name,
            lastModified: fileInfo.mtime.toISOString(),
            sizeBytes: fileInfo.size,
          })
        } catch {
          // Skip files we can't stat
        }
      }

      // Sort alphabetically
      files.sort((a, b) => a.name.localeCompare(b.name))

      return files
    } catch {
      return []
    }
  })

  ipcMain.handle(
    CHANNELS.DOCS_READ_FILE,
    async (_event: Electron.IpcMainInvokeEvent, payload: unknown) => {
      const parsed = readFilePayloadSchema.safeParse(payload)
      if (!parsed.success) {
        throw new Error(`Invalid file name: ${parsed.error.message}`)
      }

      if (!selectedFolderPath) {
        throw new Error('No folder selected')
      }

      const filePath = path.join(selectedFolderPath, parsed.data.name)

      // Validate resolved path stays within the selected folder
      const resolvedPath = path.resolve(filePath)
      const resolvedFolder = path.resolve(selectedFolderPath)
      if (!resolvedPath.startsWith(resolvedFolder + path.sep) && resolvedPath !== resolvedFolder) {
        throw new Error('Access denied: path is outside selected folder')
      }

      const fileInfo = await stat(filePath)
      if (fileInfo.size > MAX_FILE_SIZE) {
        throw new Error('File too large (max 10MB)')
      }

      const content = await readFile(filePath, 'utf-8')
      return { name: parsed.data.name, content }
    }
  )
}
