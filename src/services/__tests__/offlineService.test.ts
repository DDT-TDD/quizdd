import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OfflineService } from '../offlineService'

describe('OfflineService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  describe('isOnline', () => {
    it('returns true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', { value: true })
      expect(OfflineService.isOnline()).toBe(true)
    })

    it('returns false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', { value: false })
      expect(OfflineService.isOnline()).toBe(false)
    })
  })

  describe('addOfflineListener', () => {
    it('adds event listeners for online/offline events', () => {
      const mockCallback = vi.fn()
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      OfflineService.addOfflineListener(mockCallback)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
      
      addEventListenerSpy.mockRestore()
    })
  })

  describe('removeOfflineListener', () => {
    it('removes event listeners', () => {
      const mockCallback = vi.fn()
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      OfflineService.removeOfflineListener(mockCallback)
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
      
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('getOfflineCapabilities', () => {
    it('returns list of offline-capable features', () => {
      const capabilities = OfflineService.getOfflineCapabilities()
      
      expect(capabilities).toContain('Quiz taking')
      expect(capabilities).toContain('Progress tracking')
      expect(capabilities).toContain('Profile management')
      expect(capabilities).toContain('Content browsing')
    })
  })

  describe('handleOfflineError', () => {
    it('returns appropriate error message for network errors', () => {
      const networkError = new Error('Network request failed')
      const result = OfflineService.handleOfflineError(networkError)
      
      expect(result.isOfflineError).toBe(true)
      expect(result.message).toContain('offline')
    })

    it('returns generic error for non-network errors', () => {
      const genericError = new Error('Something else went wrong')
      const result = OfflineService.handleOfflineError(genericError)
      
      expect(result.isOfflineError).toBe(false)
      expect(result.message).toBe('Something else went wrong')
    })
  })
})