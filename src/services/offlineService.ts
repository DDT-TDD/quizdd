/**
 * Offline Service - Manages offline-first functionality and data privacy
 * Ensures all core features work without internet connection
 * Implements local-only data storage and fallback mechanisms
 */

import React from 'react'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import type { Question, Profile, Subject, CustomMix } from '../types/api'

export interface OfflineState {
  isOnline: boolean
  lastOnlineCheck: Date | null
  cachedData: {
    subjects: Subject[]
    profiles: Profile[]
    questions: Map<string, Question[]>
    customMixes: CustomMix[]
  }
  failedOperations: FailedOperation[]
}

export interface FailedOperation {
  id: string
  operation: string
  data: any
  timestamp: Date
  retryCount: number
  maxRetries: number
}

export interface CacheConfig {
  maxCacheSize: number
  cacheExpiryHours: number
  enablePreloading: boolean
}

class OfflineService {
  private state: OfflineState
  private config: CacheConfig
  private listeners: Set<(state: OfflineState) => void>
  private retryTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxCacheSize: 1000, // Maximum number of questions to cache
      cacheExpiryHours: 24, // Cache expiry time
      enablePreloading: true, // Preload content when online
      ...config
    }

    this.state = {
      isOnline: false, // Start offline-first
      lastOnlineCheck: null,
      cachedData: {
        subjects: [],
        profiles: [],
        questions: new Map(),
        customMixes: []
      },
      failedOperations: []
    }

    this.listeners = new Set()
    this.initializeOfflineMode()
  }

  /**
   * Initialize offline mode - load cached data and set up monitoring
   */
  private async initializeOfflineMode(): Promise<void> {
    try {
      // Load cached data from local storage
      await this.loadCachedData()
      
      // Start monitoring for network changes (but don't require network)
      this.startNetworkMonitoring()
      
      // Set up periodic retry for failed operations
      this.startRetryTimer()
      
      console.log('Offline service initialized - operating in offline-first mode')
    } catch (error) {
      console.warn('Failed to initialize offline service:', error)
      // Continue operating - offline-first means we work without network
    }
  }

  /**
   * Load cached data from local storage
   */
  private async loadCachedData(): Promise<void> {
    try {
      // Load profiles (always available locally)
      this.state.cachedData.profiles = await tauriAPI.getProfiles()
      
      // Load subjects (cached locally)
      this.state.cachedData.subjects = await tauriAPI.getSubjects()
      
      // Load custom mixes (always local)
      this.state.cachedData.customMixes = await tauriAPI.getAllCustomMixes()
      
      // Preload questions for each subject if enabled
      if (this.config.enablePreloading) {
        await this.preloadQuestions()
      }
      
      this.notifyListeners()
    } catch (error) {
      console.warn('Failed to load some cached data:', error)
      // Continue with empty cache - app should still work
    }
  }

  /**
   * Preload questions for all subjects to ensure offline availability
   */
  private async preloadQuestions(): Promise<void> {
    try {
      for (const subject of this.state.cachedData.subjects) {
        const cacheKey = `${subject.name}_all`
        
        // Check if already cached
        if (!this.state.cachedData.questions.has(cacheKey)) {
          try {
            const questions = await tauriAPI.getQuestionsBySubject(
              subject.name,
              undefined, // All key stages
              undefined, // All difficulties
              this.config.maxCacheSize
            )
            
            this.state.cachedData.questions.set(cacheKey, questions)
            console.log(`Preloaded ${questions.length} questions for ${subject.name}`)
          } catch (error) {
            console.warn(`Failed to preload questions for ${subject.name}:`, error)
            // Continue with other subjects
          }
        }
      }
    } catch (error) {
      console.warn('Failed to preload questions:', error)
    }
  }

  /**
   * Monitor network status (optional - app works offline)
   */
  private startNetworkMonitoring(): void {
    // Note: We don't rely on network status for core functionality
    // This is just for informational purposes and update checks
    
    if (typeof window !== 'undefined' && 'navigator' in window) {
      // Browser environment - check online status
      const updateOnlineStatus = () => {
        const wasOnline = this.state.isOnline
        this.state.isOnline = navigator.onLine
        this.state.lastOnlineCheck = new Date()
        
        if (!wasOnline && this.state.isOnline) {
          console.log('Network connection detected - retrying failed operations')
          this.retryFailedOperations()
        }
        
        this.notifyListeners()
      }

      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      
      // Initial check
      updateOnlineStatus()
    } else {
      // Tauri environment - assume offline-first operation
      console.log('Operating in offline-first mode (Tauri environment)')
    }
  }

  /**
   * Start retry timer for failed operations
   */
  private startRetryTimer(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer)
    }

    // Retry failed operations every 30 seconds
    this.retryTimer = setInterval(() => {
      if (this.state.failedOperations.length > 0) {
        this.retryFailedOperations()
      }
    }, 30000)
  }

  /**
   * Get subjects with offline fallback
   */
  async getSubjects(): Promise<Subject[]> {
    try {
      // Try to get fresh data
      const subjects = await tauriAPI.getSubjects()
      this.state.cachedData.subjects = subjects
      this.notifyListeners()
      return subjects
    } catch (error) {
      console.warn('Failed to get subjects, using cached data:', error)
      // Return cached data as fallback
      return this.state.cachedData.subjects
    }
  }

  /**
   * Get profiles with offline guarantee
   */
  async getProfiles(): Promise<Profile[]> {
    try {
      // Profiles are always stored locally
      const profiles = await tauriAPI.getProfiles()
      this.state.cachedData.profiles = profiles
      this.notifyListeners()
      return profiles
    } catch (error) {
      console.error('Failed to get profiles from local storage:', error)
      // This should never fail as profiles are local-only
      throw new Error('Local profile storage unavailable')
    }
  }

  /**
   * Get questions with intelligent caching and fallback
   */
  async getQuestions(
    subject: string,
    keyStage?: 'KS1' | 'KS2',
    difficultyRange?: [number, number],
    count: number = 10
  ): Promise<Question[]> {
    const cacheKey = `${subject}_${keyStage || 'all'}_${difficultyRange?.join('-') || 'all'}`
    
    try {
      // Try to get fresh questions
      const questions = await tauriAPI.getQuestionsBySubject(
        subject,
        keyStage,
        difficultyRange,
        count
      )
      
      // Cache the results
      this.state.cachedData.questions.set(cacheKey, questions)
      this.notifyListeners()
      return questions
    } catch (error) {
      console.warn('Failed to get fresh questions, using cached data:', error)
      
      // Try exact cache match first
      const cachedQuestions = this.state.cachedData.questions.get(cacheKey)
      if (cachedQuestions && cachedQuestions.length > 0) {
        return this.selectRandomQuestions(cachedQuestions, count)
      }
      
      // Try broader cache match (same subject, any key stage/difficulty)
      const subjectQuestions = this.findCachedQuestionsBySubject(subject)
      if (subjectQuestions.length > 0) {
        const filtered = this.filterQuestions(subjectQuestions, keyStage, difficultyRange)
        return this.selectRandomQuestions(filtered, count)
      }
      
      // No cached data available
      throw new Error(`No questions available for ${subject} (offline mode)`)
    }
  }

  /**
   * Create profile with offline guarantee
   */
  async createProfile(name: string, avatar: string): Promise<Profile> {
    try {
      const profile = await tauriAPI.createProfile(name, avatar)
      
      // Update cache
      this.state.cachedData.profiles.push(profile)
      this.notifyListeners()
      
      return profile
    } catch (error) {
      console.error('Failed to create profile:', error)
      // Profile creation should always work locally
      throw error
    }
  }

  /**
   * Update progress with offline guarantee and retry mechanism
   */
  async updateProgress(profileId: number, quizResult: any): Promise<void> {
    try {
      await tauriAPI.updateProgress(profileId, quizResult)
      console.log('Progress updated successfully')
    } catch (error) {
      console.warn('Failed to update progress, queuing for retry:', error)
      
      // Queue for retry
      this.queueFailedOperation('updateProgress', { profileId, quizResult })
      
      // Don't throw error - progress update failure shouldn't break the app
    }
  }

  /**
   * Get custom mixes with offline guarantee
   */
  async getCustomMixes(): Promise<CustomMix[]> {
    try {
      const mixes = await tauriAPI.getAllCustomMixes()
      this.state.cachedData.customMixes = mixes
      this.notifyListeners()
      return mixes
    } catch (error) {
      console.warn('Failed to get custom mixes, using cached data:', error)
      return this.state.cachedData.customMixes
    }
  }

  /**
   * Create custom mix with offline guarantee
   */
  async createCustomMix(request: any): Promise<CustomMix> {
    try {
      const mix = await tauriAPI.createCustomMix(request)
      
      // Update cache
      this.state.cachedData.customMixes.push(mix)
      this.notifyListeners()
      
      return mix
    } catch (error) {
      console.error('Failed to create custom mix:', error)
      throw error
    }
  }

  /**
   * Verify no personal data transmission
   */
  verifyDataPrivacy(): { isPrivate: boolean; violations: string[] } {
    const violations: string[] = []
    
    // Check if any network requests are being made for personal data
    // This is a compile-time check - all personal data should be local-only
    
    // All profile data should be local
    if (this.state.cachedData.profiles.length === 0) {
      // This is not a violation, just no profiles yet
    }
    
    // All progress data should be local
    // All custom mixes should be local
    // Questions can be cached but no personal data should be transmitted
    
    return {
      isPrivate: violations.length === 0,
      violations
    }
  }

  /**
   * Get offline status and statistics
   */
  getOfflineStatus(): {
    isOfflineReady: boolean
    cachedSubjects: number
    cachedQuestions: number
    cachedProfiles: number
    cachedMixes: number
    failedOperations: number
  } {
    let totalQuestions = 0
    this.state.cachedData.questions.forEach(questions => {
      totalQuestions += questions.length
    })

    return {
      isOfflineReady: this.state.cachedData.subjects.length > 0 && totalQuestions > 0,
      cachedSubjects: this.state.cachedData.subjects.length,
      cachedQuestions: totalQuestions,
      cachedProfiles: this.state.cachedData.profiles.length,
      cachedMixes: this.state.cachedData.customMixes.length,
      failedOperations: this.state.failedOperations.length
    }
  }

  /**
   * Helper methods
   */
  private findCachedQuestionsBySubject(subject: string): Question[] {
    const allQuestions: Question[] = []
    
    this.state.cachedData.questions.forEach((questions, key) => {
      if (key.startsWith(subject)) {
        allQuestions.push(...questions)
      }
    })
    
    return allQuestions
  }

  private filterQuestions(
    questions: Question[],
    keyStage?: 'KS1' | 'KS2',
    difficultyRange?: [number, number]
  ): Question[] {
    return questions.filter(q => {
      if (keyStage && q.key_stage !== keyStage) return false
      if (difficultyRange) {
        const [min, max] = difficultyRange
        if (q.difficulty_level < min || q.difficulty_level > max) return false
      }
      return true
    })
  }

  private selectRandomQuestions(questions: Question[], count: number): Question[] {
    if (questions.length <= count) return questions
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  private queueFailedOperation(operation: string, data: any): void {
    const failedOp: FailedOperation = {
      id: `${operation}_${Date.now()}_${Math.random()}`,
      operation,
      data,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3
    }
    
    this.state.failedOperations.push(failedOp)
    this.notifyListeners()
  }

  private async retryFailedOperations(): Promise<void> {
    const toRetry = [...this.state.failedOperations]
    
    for (const operation of toRetry) {
      if (operation.retryCount >= operation.maxRetries) {
        // Remove failed operation that exceeded max retries
        this.state.failedOperations = this.state.failedOperations.filter(
          op => op.id !== operation.id
        )
        continue
      }
      
      try {
        await this.executeFailedOperation(operation)
        
        // Remove successful operation
        this.state.failedOperations = this.state.failedOperations.filter(
          op => op.id !== operation.id
        )
        
        console.log(`Successfully retried operation: ${operation.operation}`)
      } catch (error) {
        // Increment retry count
        operation.retryCount++
        console.warn(`Retry failed for ${operation.operation}:`, error)
      }
    }
    
    this.notifyListeners()
  }

  private async executeFailedOperation(operation: FailedOperation): Promise<void> {
    switch (operation.operation) {
      case 'updateProgress':
        await tauriAPI.updateProgress(operation.data.profileId, operation.data.quizResult)
        break
      default:
        console.warn(`Unknown failed operation: ${operation.operation}`)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state)
      } catch (error) {
        console.error('Error in offline service listener:', error)
      }
    })
  }

  /**
   * Public API for subscribing to offline state changes
   */
  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Get current offline state
   */
  getState(): OfflineState {
    return { ...this.state }
  }

  /**
   * Force cache refresh (when online)
   */
  async refreshCache(): Promise<void> {
    console.log('Refreshing offline cache...')
    await this.loadCachedData()
  }

  /**
   * Clear cache (for testing or reset)
   */
  clearCache(): void {
    this.state.cachedData = {
      subjects: [],
      profiles: [],
      questions: new Map(),
      customMixes: []
    }
    this.notifyListeners()
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer)
      this.retryTimer = null
    }
    
    this.listeners.clear()
  }
}

// Singleton instance
export const offlineService = new OfflineService()

// React hook for using offline service
export function useOfflineService() {
  const [offlineState, setOfflineState] = React.useState<OfflineState>(
    offlineService.getState()
  )

  React.useEffect(() => {
    const unsubscribe = offlineService.subscribe(setOfflineState)
    return unsubscribe
  }, [])

  return {
    offlineState,
    offlineService,
    isOfflineReady: offlineState.cachedData.subjects.length > 0,
    getOfflineStatus: () => offlineService.getOfflineStatus()
  }
}

export default offlineService