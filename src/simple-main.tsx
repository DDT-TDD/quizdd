import React from 'react'
import ReactDOM from 'react-dom/client'
import { SimpleApp } from './SimpleApp'

console.log('🔍 simple-main: Script started')
console.log('🔍 simple-main: React version:', React.version)
console.log('🔍 simple-main: Window object:', typeof window)
console.log('🔍 simple-main: Document ready state:', document.readyState)

// Check if root element exists
const rootElement = document.getElementById('root')
console.log('🔍 simple-main: Root element found:', !!rootElement)

if (!rootElement) {
  console.error('❌ simple-main: Root element not found!')
  document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1><p>The #root element is missing from the HTML.</p></div>'
} else {
  console.log('✅ simple-main: Root element found, creating React root...')
  
  try {
    const root = ReactDOM.createRoot(rootElement)
    console.log('✅ simple-main: React root created successfully')
    
    console.log('🔍 simple-main: Rendering SimpleApp...')
    root.render(
      <React.StrictMode>
        <SimpleApp />
      </React.StrictMode>,
    )
    console.log('✅ simple-main: SimpleApp rendered successfully')
  } catch (error) {
    console.error('❌ simple-main: Failed to create React root or render app:', error)
    document.body.innerHTML = `<div style="padding: 20px; color: red;"><h1>React Error</h1><p>${error}</p></div>`
  }
}

// Add global error handlers
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason)
})

console.log('✅ simple-main: Script completed')