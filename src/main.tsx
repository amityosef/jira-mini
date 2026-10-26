import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/App'

import '@/index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('SprintFlow could not find the #root element to mount into.')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
