import { createHashRouter } from 'react-router-dom'
import { App } from './App'
import { Dashboard } from './routes/dashboard'
import { Settings } from './routes/settings'

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
])
