/**
 * Content Cache Service - Manages content caching for offline access
 * Ensures educational content is available without internet connection
 */

import React from 'react'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import type { Question, Subject } from '../types/api'

export interface CacheEntry<T> {
  data: T
  timestamp: Date
  expiryDate: Date
  accessCount: number
  lastAccessed: Date
}

export interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missRate: number
  oldestEntry: Date | null
  newestEntry: Date | null
}

export interface CacheConfig {
  maxEntries: number
  defaultTTLHours: number
  maxSizeBytes: number
  enablePersistence: boolean
  preloadSubjects: string[]
}

class ContentCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  }
  private config: CacheConfig
  private isInitialized = false

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxEntries: 1000,
      defaultTTLHours: 24,
      maxSizeBytes: 50 * 1024 * 1024, // 50MB
      enablePersistence: true,
      preloadSubjects: ['Mathematics', 'English', 'Science', 'Geography'],
      ...config
    }
  }

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load persisted cache if enabled
      if (this.config.enablePersistence) {
        await this.loadPersistedCache()
      }

      // Preload essential content
      await this.preloadEssentialContent()

      this.isInitialized = true
      console.log('Content cache service initialized')
    } catch (error) {
      console.warn('Failed to initialize content cache:', error)
      // Continue without cache - app should still work
      this.isInitialized = true
    }
  }

  /**
   * Load persisted cache from local storage
   */
  private async loadPersistedCache(): Promise<void> {
    try {
      // In a Tauri app, we could use the file system
      // For now, we'll rebuild the cache from the database
      console.log('Loading cache from local database...')
      
      // Cache will be built on-demand from local database
      // This ensures we always have the latest local data
    } catch (error) {
      console.warn('Failed to load persisted cache:', error)
    }
  }

  /**
   * Preload essential content for offline access
   */
  private async preloadEssentialContent(): Promise<void> {
    try {
      console.log('Preloading essential content for offline access...')

      // Load subjects first
      await this.cacheSubjects()

      // Preload questions for essential subjects
      for (const subjectName of this.config.preloadSubjects) {
        await this.preloadSubjectQuestions(subjectName)
      }

      console.log('Essential content preloaded successfully')
    } catch (error) {
      console.warn('Failed to preload essential content:', error)
      // Continue - cache will be populated on-demand
    }
  }

  /**
   * Cache subjects
   */
  private async cacheSubjects(): Promise<void> {
    try {
      const subjects = await tauriAPI.getSubjects()
      this.set('subjects', subjects, 24) // Cache for 24 hours
      console.log(`Cached ${subjects.length} subjects`)
    } catch (error) {
      console.warn('Failed to cache subjects:', error)
    }
  }

  /**
   * Preload questions for a specific subject
   */
  private async preloadSubjectQuestions(subjectName: string): Promise<void> {
    try {
      // Load questions for both key stages
      const ks1Questions = await tauriAPI.getQuestionsBySubject(
        subjectName,
        'KS1',
        undefined,
        100 // Limit to 100 questions per key stage
      )
      
      const ks2Questions = await tauriAPI.getQuestionsBySubject(
        subjectName,
        'KS2',
        undefined,
        100
      )

      // Cache the questions
      this.set(`questions_${subjectName}_KS1`, ks1Questions, 24)
      this.set(`questions_${subjectName}_KS2`, ks2Questions, 24)

      console.log(`Preloaded ${ks1Questions.length + ks2Questions.length} questions for ${subjectName}`)
    } catch (error) {
      console.warn(`Failed to preload questions for ${subjectName}:`, error)
    }
  }

  /**
   * Get cached data or fetch from source
   */
  async get<T>(key: string, fetcher?: () => Promise<T>, ttlHours?: number): Promise<T | null> {
    // Check cache first
    const cached = this.cache.get(key)
    
    if (cached && !this.isExpired(cached)) {
      // Cache hit
      this.stats.hits++
      cached.accessCount++
      cached.lastAccessed = new Date()
      return cached.data as T
    }

    // Cache miss
    this.stats.misses++

    // If no fetcher provided, return null
    if (!fetcher) {
      return null
    }

    try {
      // Fetch fresh data
      const data = await fetcher()
      
      // Cache the result
      this.set(key, data, ttlHours)
      
      return data
    } catch (error) {
      console.warn(`Failed to fetch data for key ${key}:`, error)
      
      // Return expired cache data if available (better than nothing)
      if (cached) {
        console.log(`Returning expired cache data for ${key}`)
        return cached.data as T
      }
      
      return null
    }
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttlHours: number = this.config.defaultTTLHours): void {
    const now = new Date()
    const expiryDate = new Date(now.getTime() + ttlHours * 60 * 60 * 1000)

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiryDate,
      accessCount: 1,
      lastAccessed: now
    }

    this.cache.set(key, entry)

    // Check if we need to evict entries
    this.evictIfNeeded()
  }

  /**
   * Get subjects with caching
   */
  async getSubjects(): Promise<Subject[]> {
    return await this.get(
      'subjects',
      () => tauriAPI.getSubjects(),
      24
    ) || []
  }

  /**
   * Get questions with intelligent caching
   */
  async getQuestions(
    subject: string,
    keyStage?: 'KS1' | 'KS2',
    difficultyRange?: [number, number],
    count: number = 10
  ): Promise<Question[]> {
    const cacheKey = `questions_${subject}_${keyStage || 'all'}_${difficultyRange?.join('-') || 'all'}`
    
    const questions = await this.get(
      cacheKey,
      () => tauriAPI.getQuestionsBySubject(subject, keyStage, difficultyRange, count * 2), // Fetch more for better caching
      12 // Cache for 12 hours
    )

    if (!questions || questions.length === 0) {
      // Try to get from broader cache
      const broadCacheKey = `questions_${subject}_${keyStage || 'all'}`
      const broadQuestions = await this.get(broadCacheKey) as Question[] | null
      
      if (broadQuestions && broadQuestions.length > 0) {
        // Filter and return subset
        const filtered = this.filterQuestions(broadQuestions, keyStage, difficultyRange)
        return this.selectRandomQuestions(filtered, count)
      }
    }

    return questions ? this.selectRandomQuestions(questions, count) : []
  }

  /**
   * Preload content for a specific subject
   */
  async preloadSubject(subjectName: string): Promise<void> {
    await this.preloadSubjectQuestions(subjectName)
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return new Date() > entry.expiryDate
  }

  /**
   * Evict entries if cache is too large
   */
  private evictIfNeeded(): void {
    if (this.cache.size <= this.config.maxEntries) {
      return
    }

    // Sort entries by last accessed time (LRU eviction)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime())

    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - this.config.maxEntries + 1)
    
    for (const [key] of toRemove) {
      this.cache.delete(key)
      this.stats.evictions++
    }

    console.log(`Evicted ${toRemove.length} cache entries`)
  }

  /**
   * Filter questions by criteria
   */
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

  /**
   * Select random questions from array
   */
  private selectRandomQuestions(questions: Question[], count: number): Question[] {
    if (questions.length <= count) return questions
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values())
    const totalRequests = this.stats.hits + this.stats.misses
    
    return {
      totalEntries: this.cache.size,
      totalSize: this.estimateCacheSize(),
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      oldestEntry: entries.length > 0 ? 
        new Date(Math.min(...entries.map(e => e.timestamp.getTime()))) : null,
      newestEntry: entries.length > 0 ? 
        new Date(Math.max(...entries.map(e => e.timestamp.getTime()))) : null
    }
  }

  /**
   * Estimate cache size in bytes
   */
  private estimateCacheSize(): number {
    let size = 0
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation
      size += key.length * 2 // UTF-16 characters
      size += JSON.stringify(entry.data).length * 2
      size += 100 // Overhead for entry metadata
    }
    
    return size
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0 }
    console.log('Cache cleared')
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = new Date()
    const toRemove: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiryDate) {
        toRemove.push(key)
      }
    }
    
    for (const key of toRemove) {
      this.cache.delete(key)
    }
    
    if (toRemove.length > 0) {
      console.log(`Cleaned up ${toRemove.length} expired cache entries`)
    }
  }

  /**
   * Check if content is available offline
   */
  isAvailableOffline(subject: string, keyStage?: 'KS1' | 'KS2'): boolean {
    const cacheKey = `questions_${subject}_${keyStage || 'all'}`
    const cached = this.cache.get(cacheKey)
    
    return cached !== undefined && !this.isExpired(cached)
  }

  /**
   * Get offline availability status
   */
  getOfflineAvailability(): {
    subjects: string[]
    totalQuestions: number
    availableOffline: boolean
  } {
    const subjects: string[] = []
    let totalQuestions = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith('questions_') && !this.isExpired(entry)) {
        const parts = key.split('_')
        if (parts.length >= 2) {
          const subject = parts[1]
          if (!subjects.includes(subject)) {
            subjects.push(subject)
          }
          if (Array.isArray(entry.data)) {
            totalQuestions += entry.data.length
          }
        }
      }
    }
    
    return {
      subjects,
      totalQuestions,
      availableOffline: subjects.length > 0 && totalQuestions > 0
    }
  }

  /**
   * Force refresh cache for a key
   */
  async refresh(key: string, fetcher: () => Promise<any>): Promise<void> {
    try {
      const data = await fetcher()
      this.set(key, data)
      console.log(`Refreshed cache for ${key}`)
    } catch (error) {
      console.warn(`Failed to refresh cache for ${key}:`, error)
    }
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }
}

// Singleton instance
export const contentCacheService = new ContentCacheService()

// React hook for content caching
export function useContentCache() {
  const [isReady, setIsReady] = React.useState(contentCacheService.isReady())
  const [stats, setStats] = React.useState<CacheStats | null>(null)

  React.useEffect(() => {
    const initializeCache = async () => {
      if (!contentCacheService.isReady()) {
        await contentCacheService.initialize()
        setIsReady(true)
      }
    }

    initializeCache()
  }, [])

  React.useEffect(() => {
    if (isReady) {
      const updateStats = () => {
        setStats(contentCacheService.getStats())
      }

      updateStats()
      
      // Update stats periodically
      const interval = setInterval(updateStats, 30000) // Every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [isReady])

  return {
    isReady,
    stats,
    getSubjects: () => contentCacheService.getSubjects(),
    getQuestions: (subject: string, keyStage?: 'KS1' | 'KS2', difficultyRange?: [number, number], count?: number) =>
      contentCacheService.getQuestions(subject, keyStage, difficultyRange, count),
    preloadSubject: (subject: string) => contentCacheService.preloadSubject(subject),
    isAvailableOffline: (subject: string, keyStage?: 'KS1' | 'KS2') =>
      contentCacheService.isAvailableOffline(subject, keyStage),
    getOfflineAvailability: () => contentCacheService.getOfflineAvailability(),
    refresh: (key: string, fetcher: () => Promise<any>) => contentCacheService.refresh(key, fetcher),
    clear: () => contentCacheService.clear(),
    cleanup: () => contentCacheService.cleanup()
  }
}

export default contentCacheService