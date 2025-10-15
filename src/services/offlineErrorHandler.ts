/**
 * Offline Error Handler - Manages errors in offline-first environment
 * Provides fallback mechanisms and graceful degradation
 */

import React from 'react'
// import { offlineService } from './offlineService' // Removed to avoid circular dependency
import { contentCacheService } from './contentCacheService'

export interface OfflineError {
  id: string
  type: 'network' | 'cache' | 'storage' | 'content' | 'unknown'
  message: string
  originalError: Error
  timestamp: Date
  context?: any
  resolved: boolean
  fallbackUsed?: string
}

export interface FallbackStrategy {
  name: string
  description: string
  execute: () => Promise<any>
  priority: number
}

export interface ErrorRecoveryOptions {
  enableAutoRetry: boolean
  maxRetries: number
  retryDelayMs: number
  enableFallbacks: boolean
  enableGracefulDegradation: boolean
}

class OfflineErrorHandler {
  private errors: Map<string, OfflineError> = new Map()
  private fallbackStrategies: Map<string, FallbackStrategy[]> = new Map()
  private options: ErrorRecoveryOptions
  private listeners: Set<(errors: OfflineError[]) => void> = new Set()

  constructor(options: Partial<ErrorRecoveryOptions> = {}) {
    this.options = {
      enableAutoRetry: true,
      maxRetries: 3,
      retryDelayMs: 1000,
      enableFallbacks: true,
      enableGracefulDegradation: true,
      ...options
    }

    this.setupFallbackStrategies()
  }

  /**
   * Setup fallback strategies for different operations
   */
  private setupFallbackStrategies(): void {
    // Fallbacks for getting subjects
    this.addFallbackStrategy('getSubjects', [
      {
        name: 'cache',
        description: 'Use cached subjects',
        priority: 1,
        execute: async () => {
          const subjects = await contentCacheService.getSubjects()
          if (subjects.length === 0) {
            throw new Error('No cached subjects available')
          }
          return subjects
        }
      },
      {
        name: 'default',
        description: 'Use default subject list',
        priority: 2,
        execute: async () => {
          return [
            { id: 1, name: 'Mathematics', displayName: 'Mathematics', iconPath: '', colorScheme: 'blue' },
            { id: 2, name: 'English', displayName: 'English', iconPath: '', colorScheme: 'green' },
            { id: 3, name: 'Science', displayName: 'Science', iconPath: '', colorScheme: 'purple' },
            { id: 4, name: 'Geography', displayName: 'Geography', iconPath: '', colorScheme: 'orange' }
          ]
        }
      }
    ])

    // Fallbacks for getting questions
    this.addFallbackStrategy('getQuestions', [
      {
        name: 'cache',
        description: 'Use cached questions',
        priority: 1,
        execute: async () => {
          // This will be set dynamically based on the request
          throw new Error('Cache fallback needs specific implementation')
        }
      },
      {
        name: 'sample',
        description: 'Use sample questions',
        priority: 2,
        execute: async () => {
          return this.generateSampleQuestions()
        }
      }
    ])

    // Fallbacks for profile operations
    this.addFallbackStrategy('getProfiles', [
      {
        name: 'localStorage',
        description: 'Use local storage backup',
        priority: 1,
        execute: async () => {
          // Profiles should always be available locally
          throw new Error('Profile storage failure - this should not happen')
        }
      }
    ])

    // Fallbacks for progress updates
    this.addFallbackStrategy('updateProgress', [
      {
        name: 'queue',
        description: 'Queue progress update for later',
        priority: 1,
        execute: async () => {
          // This is handled by the offline service
          console.log('Progress update queued for retry')
          return true
        }
      }
    ])
  }

  /**
   * Handle an error with fallback strategies
   */
  async handleError<T>(
    operation: string,
    originalError: Error,
    context?: any
  ): Promise<T> {
    const errorId = `${operation}_${Date.now()}_${Math.random()}`
    
    const offlineError: OfflineError = {
      id: errorId,
      type: this.categorizeError(originalError),
      message: originalError.message,
      originalError,
      timestamp: new Date(),
      context,
      resolved: false
    }

    this.errors.set(errorId, offlineError)
    this.notifyListeners()

    console.warn(`Handling offline error for ${operation}:`, originalError)

    // Try fallback strategies if enabled
    if (this.options.enableFallbacks) {
      const result = await this.tryFallbacks<T>(operation, offlineError)
      if (result !== null) {
        offlineError.resolved = true
        this.notifyListeners()
        return result
      }
    }

    // If graceful degradation is enabled, try to continue
    if (this.options.enableGracefulDegradation) {
      const degradedResult = await this.gracefulDegradation<T>(operation, offlineError)
      if (degradedResult !== null) {
        offlineError.resolved = true
        offlineError.fallbackUsed = 'graceful_degradation'
        this.notifyListeners()
        return degradedResult
      }
    }

    // If all else fails, throw the original error
    throw originalError
  }

  /**
   * Try fallback strategies for an operation
   */
  private async tryFallbacks<T>(operation: string, error: OfflineError): Promise<T | null> {
    const strategies = this.fallbackStrategies.get(operation)
    if (!strategies) {
      return null
    }

    // Sort by priority
    const sortedStrategies = [...strategies].sort((a, b) => a.priority - b.priority)

    for (const strategy of sortedStrategies) {
      try {
        console.log(`Trying fallback strategy: ${strategy.name} for ${operation}`)
        
        // Special handling for dynamic strategies
        if (operation === 'getQuestions' && strategy.name === 'cache') {
          const result = await this.tryQuestionCacheFallback(error.context)
          if (result) {
            error.fallbackUsed = strategy.name
            return result as T
          }
          continue
        }

        const result = await strategy.execute()
        error.fallbackUsed = strategy.name
        console.log(`Fallback strategy ${strategy.name} succeeded for ${operation}`)
        return result as T
      } catch (fallbackError) {
        console.warn(`Fallback strategy ${strategy.name} failed:`, fallbackError)
        continue
      }
    }

    return null
  }

  /**
   * Try to get questions from cache as fallback
   */
  private async tryQuestionCacheFallback(context: any): Promise<any> {
    if (!context || !context.subject) {
      return null
    }

    try {
      const questions = await contentCacheService.getQuestions(
        context.subject,
        context.keyStage,
        context.difficultyRange,
        context.count || 10
      )

      if (questions.length > 0) {
        return questions
      }
    } catch (error) {
      console.warn('Cache fallback failed:', error)
    }

    return null
  }

  /**
   * Implement graceful degradation
   */
  private async gracefulDegradation<T>(operation: string, _error: OfflineError): Promise<T | null> {
    switch (operation) {
      case 'getQuestions':
        // Return sample questions if no cache available
        return this.generateSampleQuestions() as T

      case 'getSubjects':
        // Return minimal subject list
        return [{
          id: 1,
          name: 'General',
          displayName: 'General Knowledge',
          iconPath: '',
          colorScheme: 'default'
        }] as T

      case 'updateProgress':
        // Silently fail progress updates (they'll be retried later)
        console.log('Progress update failed - will retry later')
        return true as T

      default:
        return null
    }
  }

  /**
   * Generate sample questions for fallback
   */
  private generateSampleQuestions(): any[] {
    return [
      {
        id: 1,
        type: 'multiple_choice',
        subject: 'General',
        keyStage: 'KS1',
        content: {
          text: 'What color do you get when you mix red and blue?',
          options: ['Purple', 'Green', 'Yellow', 'Orange']
        },
        correctAnswer: 'Purple',
        difficultyLevel: 1,
        tags: ['colors', 'mixing']
      },
      {
        id: 2,
        type: 'multiple_choice',
        subject: 'General',
        keyStage: 'KS1',
        content: {
          text: 'How many legs does a spider have?',
          options: ['6', '8', '10', '4']
        },
        correctAnswer: '8',
        difficultyLevel: 1,
        tags: ['animals', 'counting']
      },
      {
        id: 3,
        type: 'multiple_choice',
        subject: 'General',
        keyStage: 'KS2',
        content: {
          text: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid']
        },
        correctAnswer: 'Paris',
        difficultyLevel: 2,
        tags: ['geography', 'capitals']
      }
    ]
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: Error): OfflineError['type'] {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network'
    }
    
    if (message.includes('cache') || message.includes('expired')) {
      return 'cache'
    }
    
    if (message.includes('storage') || message.includes('database')) {
      return 'storage'
    }
    
    if (message.includes('content') || message.includes('question')) {
      return 'content'
    }
    
    return 'unknown'
  }

  /**
   * Add fallback strategy for an operation
   */
  addFallbackStrategy(operation: string, strategies: FallbackStrategy[]): void {
    this.fallbackStrategies.set(operation, strategies)
  }

  /**
   * Get all errors
   */
  getErrors(): OfflineError[] {
    return Array.from(this.errors.values())
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): OfflineError[] {
    return Array.from(this.errors.values()).filter(error => !error.resolved)
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string): void {
    const error = this.errors.get(errorId)
    if (error) {
      error.resolved = true
      this.notifyListeners()
    }
  }

  /**
   * Clear resolved errors
   */
  clearResolvedErrors(): void {
    for (const [id, error] of this.errors.entries()) {
      if (error.resolved) {
        this.errors.delete(id)
      }
    }
    this.notifyListeners()
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errors.clear()
    this.notifyListeners()
  }

  /**
   * Subscribe to error updates
   */
  subscribe(listener: (errors: OfflineError[]) => void): () => void {
    this.listeners.add(listener)
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify listeners of error changes
   */
  private notifyListeners(): void {
    const errors = this.getErrors()
    this.listeners.forEach(listener => {
      try {
        listener(errors)
      } catch (error) {
        console.error('Error in offline error handler listener:', error)
      }
    })
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number
    resolved: number
    unresolved: number
    byType: Record<string, number>
    byOperation: Record<string, number>
  } {
    const errors = this.getErrors()
    const byType: Record<string, number> = {}
    const byOperation: Record<string, number> = {}

    errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1
      
      // Extract operation from error ID
      const operation = error.id.split('_')[0]
      byOperation[operation] = (byOperation[operation] || 0) + 1
    })

    return {
      total: errors.length,
      resolved: errors.filter(e => e.resolved).length,
      unresolved: errors.filter(e => !e.resolved).length,
      byType,
      byOperation
    }
  }

  /**
   * Test offline resilience
   */
  async testOfflineResilience(): Promise<{
    passed: boolean
    results: Array<{ operation: string; success: boolean; fallbackUsed?: string }>
  }> {
    const testOperations = [
      'getSubjects',
      'getQuestions',
      'getProfiles',
      'updateProgress'
    ]

    const results: Array<{ operation: string; success: boolean; fallbackUsed?: string }> = []

    for (const operation of testOperations) {
      try {
        // Simulate error and test fallback
        const testError = new Error(`Simulated ${operation} failure`)
        
        await this.handleError(operation, testError, { 
          subject: 'Mathematics', 
          keyStage: 'KS1', 
          count: 5 
        })
        
        results.push({ operation, success: true })
      } catch (error) {
        results.push({ operation, success: false })
      }
    }

    return {
      passed: results.every(r => r.success),
      results
    }
  }
}

// Singleton instance
export const offlineErrorHandler = new OfflineErrorHandler()

// React hook for offline error handling
export function useOfflineErrorHandler() {
  const [errors, setErrors] = React.useState<OfflineError[]>([])

  React.useEffect(() => {
    const unsubscribe = offlineErrorHandler.subscribe(setErrors)
    
    // Get initial errors
    setErrors(offlineErrorHandler.getErrors())
    
    return unsubscribe
  }, [])

  return {
    errors,
    unresolvedErrors: errors.filter(e => !e.resolved),
    resolveError: (errorId: string) => offlineErrorHandler.resolveError(errorId),
    clearResolvedErrors: () => offlineErrorHandler.clearResolvedErrors(),
    clearAllErrors: () => offlineErrorHandler.clearAllErrors(),
    getErrorStats: () => offlineErrorHandler.getErrorStats(),
    testResilience: () => offlineErrorHandler.testOfflineResilience()
  }
}

export default offlineErrorHandler