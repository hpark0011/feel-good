import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from './router'
import { initTheme } from './hooks/use-theme'
import '../styles/globals.css'

function initPlatform() {
  const platform = window.greyboardDesktop?.platform ?? 'unknown'
  document.documentElement.dataset.platform = platform
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
