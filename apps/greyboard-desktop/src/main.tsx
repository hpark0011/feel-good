import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { initTheme } from './hooks/use-theme'
import '../styles/globals.css'

function initPlatform() {
  const isMac = navigator.platform.startsWith('Mac')
  document.documentElement.dataset.platform = isMac ? 'darwin' : 'win32'
}

initTheme()
initPlatform()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
