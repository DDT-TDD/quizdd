import React, { useState, useEffect } from 'react'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { contentSeeder } from '../services/contentSeeder'
import { contentInitializer } from '../utils/contentInitializer'
import styles from './ContentManager.module.css'

interface ContentStats {
  total_questions: number
  total_subjects: number
  total_assets: number
  questions_by_subject: Record<string, number>
}

interface Subject {
  id: number
  name: string
  display_name: string
  icon_path?: string
  color_scheme?: string
  description?: string
}

/**
 * Content Manager Component
 * 
 * Provides an interface for managing educational content including:
 * - Viewing content statistics
 * - Seeding initial content
 * - Managing subjects and questions
 * - Content verification and validation
 */
export const ContentManager: React.FC = () => {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)

  // Load initial data
  useEffect(() => {
    loadContentData()
  }, [])

  const loadContentData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load content statistics
      const contentStats = await tauriAPI.getContentStatistics()
      setStats(contentStats)

      // Load subjects
      const subjectList = await tauriAPI.getSubjects()
      setSubjects(subjectList)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedContent = async () => {
    try {
      setIsSeeding(true)
      setError(null)

      // Check if content already exists
      const isSeeded = await contentSeeder.isContentSeeded()
      
      if (isSeeded) {
        const confirmReseed = window.confirm(
          'Content already exists in the database. Do you want to add more sample content? This will not delete existing content.'
        )
        if (!confirmReseed) {
          setIsSeeding(false)
          return
        }
      }

      // Seed content
      await contentSeeder.seedAllContent()
      
      // Reload data to show updated statistics
      await loadContentData()
      
      alert('Content seeding completed successfully!')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed content')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleInitializeContent = async () => {
    try {
      setIsSeeding(true)
      setError(null)

      await contentInitializer.forceReinitialize()
      await loadContentData()
      
      alert('Content initialization completed successfully!')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize content')
    } finally {
      setIsSeeding(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading content data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📚 Content Manager</h2>
        <p>Manage educational content and database seeding</p>
      </div>

      {error && (
        <div className={styles.error}>
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={loadContentData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {/* Content Statistics */}
      {stats && (
        <div className={styles.statsSection}>
          <h3>📊 Content Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total_questions}</div>
              <div className={styles.statLabel}>Total Questions</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total_subjects}</div>
              <div className={styles.statLabel}>Subjects</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.total_assets}</div>
              <div className={styles.statLabel}>Assets</div>
            </div>
          </div>

          {/* Questions by Subject */}
          <div className={styles.subjectStats}>
            <h4>Questions by Subject</h4>
            <div className={styles.subjectGrid}>
              {Object.entries(stats.questions_by_subject).map(([subject, count]) => (
                <div key={subject} className={styles.subjectCard}>
                  <div className={styles.subjectName}>
                    {subjects.find(s => s.name === subject)?.display_name || subject}
                  </div>
                  <div className={styles.subjectCount}>{count} questions</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subjects List */}
      {subjects.length > 0 && (
        <div className={styles.subjectsSection}>
          <h3>📖 Available Subjects</h3>
          <div className={styles.subjectsList}>
            {subjects.map((subject) => (
              <div key={subject.id} className={styles.subjectItem}>
                <div className={styles.subjectInfo}>
                  <h4>{subject.display_name}</h4>
                  <p>{subject.description || 'No description available'}</p>
                  <div className={styles.subjectMeta}>
                    <span>ID: {subject.id}</span>
                    <span>Name: {subject.name}</span>
                    {subject.color_scheme && (
                      <span 
                        className={styles.colorIndicator}
                        style={{ backgroundColor: subject.color_scheme }}
                      ></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actionsSection}>
        <h3>🔧 Content Actions</h3>
        <div className={styles.actionButtons}>
          <button
            onClick={handleSeedContent}
            disabled={isSeeding}
            className={styles.seedButton}
          >
            {isSeeding ? '🌱 Seeding...' : '🌱 Seed Content'}
          </button>
          
          <button
            onClick={handleInitializeContent}
            disabled={isSeeding}
            className={styles.initButton}
          >
            {isSeeding ? '🚀 Initializing...' : '🚀 Initialize Content'}
          </button>
          
          <button
            onClick={loadContentData}
            disabled={isLoading}
            className={styles.refreshButton}
          >
            🔄 Refresh Data
          </button>
        </div>

        <div className={styles.actionDescriptions}>
          <div className={styles.actionDesc}>
            <strong>Seed Content:</strong> Add comprehensive educational questions to the database
          </div>
          <div className={styles.actionDesc}>
            <strong>Initialize Content:</strong> Force re-initialization of the content system
          </div>
          <div className={styles.actionDesc}>
            <strong>Refresh Data:</strong> Reload current content statistics and subjects
          </div>
        </div>
      </div>

      {/* Content Guidelines */}
      <div className={styles.guidelinesSection}>
        <h3>📋 Content Guidelines</h3>
        <div className={styles.guidelines}>
          <h4>Question Types Supported:</h4>
          <ul>
            <li><strong>Multiple Choice:</strong> Questions with 4 answer options</li>
            <li><strong>Fill in the Blank:</strong> Text input questions</li>
            <li><strong>Story Quiz:</strong> Reading comprehension with questions</li>
            <li><strong>Drag & Drop:</strong> Interactive matching exercises</li>
            <li><strong>Hotspot:</strong> Click on image areas</li>
          </ul>

          <h4>Subjects Covered:</h4>
          <ul>
            <li><strong>Mathematics:</strong> KS1 & KS2 arithmetic, shapes, measurements</li>
            <li><strong>Geography:</strong> Countries, capitals, flags, landmarks</li>
            <li><strong>English:</strong> Spelling, grammar, vocabulary, reading</li>
            <li><strong>Science:</strong> Plants, animals, human body, space</li>
            <li><strong>General Knowledge:</strong> History, culture, interesting facts</li>
          </ul>

          <h4>Key Stages:</h4>
          <ul>
            <li><strong>KS1:</strong> Ages 5-7 (Years 1-2)</li>
            <li><strong>KS2:</strong> Ages 7-11 (Years 3-6)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ContentManager