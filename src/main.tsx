import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

console.log('🚀 MAIN.TSX: Script starting...')
console.log('🔍 MAIN.TSX: Window object:', typeof window)
console.log('🔍 MAIN.TSX: Document ready state:', document.readyState)
console.log('🔍 MAIN.TSX: Tauri available:', typeof window.__TAURI_INVOKE__)

// Ensure the root element exists (changed from 'app' to 'root')
console.log('🔍 MAIN.TSX: Looking for root element...')
const appElement = document.getElementById('root')
if (!appElement) {
  console.error('❌ MAIN.TSX: Failed to find the root element')
  console.error('Available elements:', document.body.innerHTML)
  throw new Error('Failed to find the root element')
}
console.log('✅ MAIN.TSX: Root element found')

console.log('🔍 MAIN.TSX: Creating React root...')
const root = ReactDOM.createRoot(appElement)
console.log('✅ MAIN.TSX: React root created')

console.log('🔍 MAIN.TSX: Rendering App component...')
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
console.log('✅ MAIN.TSX: App component rendered')