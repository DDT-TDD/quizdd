import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Tauri API
const mockTauriApi = {
  invoke: vi.fn(),
  listen: vi.fn(),
  emit: vi.fn(),
}

// Mock window.__TAURI__
Object.defineProperty(window, '__TAURI__', {
  value: mockTauriApi,
  writable: true,
})

// Mock Lottie animations
vi.mock('lottie-react', () => ({
  default: vi.fn(({ animationData, ...props }) => {
    const React = require('react')
    return React.createElement('div', {
      'data-testid': 'lottie-animation',
      ...props
    }, `Lottie Animation: ${animationData?.name || 'Unknown'}`)
  }),
}))

// Mock CSS modules
vi.mock('*.module.css', () => ({
  default: new Proxy({}, {
    get: (target, prop) => prop,
  }),
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
  },
  writable: true,
})