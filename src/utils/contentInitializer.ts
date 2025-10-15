import React from 'react'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { contentSeeder } from '../services/contentSeeder'

/**
 * Content Initializer Utility
 * 
 * This utility handles the initialization of educational content in the database.
 * It ensures that the database is populated with sample questions and subjects
 * when the application starts for the first time.
 */
export class ContentInitializer {
  private static instance: ContentInitializer
  private isInitialized = false
  private initializationPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): ContentInitializer {
    if (!ContentInitializer.instance) {
      ContentInitializer.instance = new ContentInitializer()
    }
    return ContentInitializer.instance
  }

  /**
   * Initialize content if needed
   * This method is safe to call multiple times - it will only initialize once
   */
  async initializeContent(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this.performInitialization()
    return this.initializationPromise
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🚀 Initializing educational content...')

      // Check if database is already populated
      const isSeeded = await contentSeeder.isContentSeeded()
      
      if (isSeeded) {
        console.log('✅ Content already exists in database')
        this.isInitialized = true
        return
      }

      console.log('📚 Database is empty, seeding with educational content...')
      
      // Seed the database with comprehensive content
      await contentSeeder.seedAllContent()
      
      // Verify seeding was successful
      const stats = await tauriAPI.getContentStatistics()
      
      console.log('✅ Content initialization completed!')
      console.log(`📊 Statistics: ${stats.total_questions} questions across ${stats.total_subjects} subjects`)
      
      this.isInitialized = true
      
    } catch (error) {
      console.error('❌ Failed to initialize content:', error)
      this.initializationPromise = null // Allow retry
      throw new Error(`Content initialization failed: ${error}`)
    }
  }

  /**
   * Get content statistics
   */
  async getContentStats() {
    try {
      return await tauriAPI.getContentStatistics()
    } catch (error) {
      console.error('Failed to get content statistics:', error)
      return {
        total_questions: 0,
        total_subjects: 0,
        total_assets: 0,
        questions_by_subject: {}
      }
    }
  }

  /**
   * Check if content is ready
   */
  isContentReady(): boolean {
    return this.isInitialized
  }

  /**
   * Force re-initialization (useful for development/testing)
   */
  async forceReinitialize(): Promise<void> {
    this.isInitialized = false
    this.initializationPromise = null
    await this.initializeContent()
  }
}

// Export singleton instance
export const contentInitializer = ContentInitializer.getInstance()

/**
 * Hook for React components to ensure content is initialized
 */
export const useContentInitialization = () => {
  const [isReady, setIsReady] = React.useState(contentInitializer.isContentReady())
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(!contentInitializer.isContentReady())

  React.useEffect(() => {
    if (contentInitializer.isContentReady()) {
      setIsReady(true)
      setIsLoading(false)
      return
    }

    const initializeContent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await contentInitializer.initializeContent()
        setIsReady(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    initializeContent()
  }, [])

  return { isReady, isLoading, error }
}

export default contentInitializer