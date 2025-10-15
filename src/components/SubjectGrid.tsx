import { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useNavigation } from './Router'
import { contentService, ContentHelpers } from '../services/contentService'
import LoadingAnimation from './LoadingAnimation'
import TransitionWrapper from './TransitionWrapper'
import type { Subject, KeyStage } from '../types/api'
import styles from './SubjectGrid.module.css'

interface SubjectGridProps {
  onSubjectSelect?: (subject: Subject, keyStage: KeyStage) => void
}

export function SubjectGrid({ onSubjectSelect }: SubjectGridProps) {
  const { state, dispatch } = useAppContext()
  const { goToQuiz } = useNavigation()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeyStage, setSelectedKeyStage] = useState<KeyStage>('KS1')

  // Load subjects from database
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get ALL subjects - don't filter by content availability
        // This was causing only 2 subjects to show (slow query)
        const subjectsData = await contentService.getSubjects()
        
        setSubjects(subjectsData)
      } catch (err) {
        console.error('Failed to load subjects:', err)
        setError('Failed to load subjects. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadSubjects()
  }, [selectedKeyStage])

  // Handle subject selection
  const handleSubjectClick = async (subject: Subject) => {
    if (!state.currentProfile) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Please select a profile first' 
      })
      return
    }

    try {
      // Set selected subject and key stage in app state
      dispatch({
        type: 'SET_QUIZ_CONFIG',
        payload: {
          subject: subject.name,
          key_stage: selectedKeyStage,
          question_count: 10,
          randomize_questions: true,
          randomize_answers: true
        }
      })

      // Call optional callback
      if (onSubjectSelect) {
        onSubjectSelect(subject, selectedKeyStage)
      } else {
        // Default behavior: navigate to quiz
        goToQuiz()
      }
    } catch (err) {
      console.error('Failed to select subject:', err)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to start quiz. Please try again.' 
      })
    }
  }

  // Get subject color scheme
  const getSubjectColorClass = (subjectName: string): string => {
    const colorMap: Record<string, string> = {
      mathematics: styles.mathColor,
      geography: styles.geographyColor,
      english: styles.englishColor,
      science: styles.scienceColor,
      'general-knowledge': styles.generalColor,
      general_knowledge: styles.generalColor,
      times_tables: styles.timesTablesColor,
      flags_capitals: styles.flagsCapitalsColor
    }
    return colorMap[subjectName.toLowerCase()] || styles.defaultColor
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Choose Your Subject</h1>
          <p className={styles.subtitle}>Pick a subject to start learning!</p>
        </div>
        <div className={styles.loadingContainer}>
          <LoadingAnimation 
            type="quiz" 
            size="large" 
            message="Loading subjects..." 
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Choose Your Subject</h1>
        </div>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Choose Your Subject</h1>
        <p className={styles.subtitle}>Pick a subject to start learning!</p>
        
        {/* Key Stage Selector */}
        <div className={styles.keyStageSelector}>
          <label className={styles.keyStagLabel}>Learning Level:</label>
          <div className={styles.keyStageButtons}>
            <button
              className={`${styles.keyStageButton} ${
                selectedKeyStage === 'KS1' ? styles.active : ''
              }`}
              onClick={() => setSelectedKeyStage('KS1')}
            >
              <span className={styles.keyStageIcon}>🌟</span>
              Key Stage 1
              <span className={styles.keyStageAge}>(Ages 5-7)</span>
            </button>
            <button
              className={`${styles.keyStageButton} ${
                selectedKeyStage === 'KS2' ? styles.active : ''
              }`}
              onClick={() => setSelectedKeyStage('KS2')}
            >
              <span className={styles.keyStageIcon}>⭐</span>
              Key Stage 2
              <span className={styles.keyStageAge}>(Ages 7-11)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subject Grid */}
      <div className={styles.grid}>
        {subjects.map((subject, index) => (
          <TransitionWrapper
            key={subject.id || subject.name}
            type="scale"
            duration={300}
            delay={index * 100}
            isVisible={!loading}
          >
            <button
              className={`${styles.subjectCard} ${getSubjectColorClass(subject.name)}`}
              onClick={() => handleSubjectClick(subject)}
              aria-label={`Start ${subject.display_name} quiz for ${selectedKeyStage}`}
            >
              <div className={styles.cardContent}>
                <div className={styles.subjectIcon}>
                  {ContentHelpers.getSubjectIcon(subject.name)}
                </div>
                <h3 className={styles.subjectTitle}>
                  {subject.display_name}
                </h3>
                {subject.description && (
                  <p className={styles.subjectDescription}>
                    {subject.description}
                  </p>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.startText}>Start Learning</span>
                  <span className={styles.arrow}>→</span>
                </div>
              </div>
              
              {/* Animated background elements */}
              <div className={styles.cardBackground}>
                <div className={styles.backgroundPattern}></div>
              </div>
            </button>
          </TransitionWrapper>
        ))}
      </div>

      {/* Empty state */}
      {subjects.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h3 className={styles.emptyTitle}>No Subjects Available</h3>
          <p className={styles.emptyText}>
            It looks like no subjects have been loaded yet. 
            Please check back later or contact support.
          </p>
        </div>
      )}
    </div>
  )
}