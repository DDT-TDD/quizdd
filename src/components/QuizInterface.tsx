import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Question, Answer, AnswerResult, QuizSession, Score } from '../types/api'
import { useAppContext } from '../contexts/AppContext'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { QuestionRenderer } from './QuestionRenderer'
import { ProgressIndicator } from './ProgressIndicator'
import { ResultsScreen } from './ResultsScreen'
import { QuizTimer } from './QuizTimer'
import RewardAnimation from './RewardAnimation'
import LoadingAnimation from './LoadingAnimation'
import TransitionWrapper from './TransitionWrapper'
import styles from './QuizInterface.module.css'

interface QuizInterfaceProps {
  session: QuizSession
  onQuizComplete: (score: Score, completedSession: QuizSession) => void
  onQuizExit: () => void
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  session,
  onQuizComplete,
  onQuizExit
}) => {
  const { state, dispatch } = useAppContext()
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerResult[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(
    session.config.time_limit_seconds ? session.config.time_limit_seconds * 1000 : undefined
  )
  const [quizStartTime] = useState(Date.now())
  const [isQuizComplete, setIsQuizComplete] = useState(false)
  const [finalScore, setFinalScore] = useState<Score | null>(null)
  const [showRewardAnimation, setShowRewardAnimation] = useState(false)
  const [rewardAnimationType, setRewardAnimationType] = useState<'success' | 'failure' | 'achievement' | 'streak'>('success')
  const quizContainerRef = useRef<HTMLDivElement>(null)

  // Load current question
  useEffect(() => {
    if (session.questions && session.questions[currentQuestionIndex]) {
      setCurrentQuestion(session.questions[currentQuestionIndex])
    }
  }, [session.questions, currentQuestionIndex])

  // Anti-cheating measures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+P
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
        (e.ctrlKey && (e.key === 'a' || e.key === 'A')) || // Disable select all
        (e.ctrlKey && (e.key === 'c' || e.key === 'C')) || // Disable copy
        (e.ctrlKey && (e.key === 'v' || e.key === 'V')) || // Disable paste
        (e.ctrlKey && (e.key === 'x' || e.key === 'X'))    // Disable cut
      ) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      // Disable right-click context menu
      e.preventDefault()
      return false
    }

    const handleSelectStart = (e: Event) => {
      // Disable text selection
      e.preventDefault()
      return false
    }

    const handleDragStart = (e: DragEvent) => {
      // Disable dragging
      e.preventDefault()
      return false
    }

    const handlePrint = (e: Event) => {
      // Disable printing
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('dragstart', handleDragStart)
    window.addEventListener('beforeprint', handlePrint)

    // Disable text selection via CSS
    if (quizContainerRef.current) {
      quizContainerRef.current.style.userSelect = 'none'
      quizContainerRef.current.style.webkitUserSelect = 'none'
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('dragstart', handleDragStart)
      window.removeEventListener('beforeprint', handlePrint)
    }
  }, [])

  // Detect if user tries to leave the page during quiz
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isQuizComplete && currentQuestion) {
        e.preventDefault()
        e.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.'
        return 'Are you sure you want to leave? Your quiz progress will be lost.'
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && !isQuizComplete && !showFeedback) {
        // User switched tabs or minimized window during quiz
        console.warn('User left quiz area - potential cheating attempt detected')
        // Could pause quiz or log this behavior
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isQuizComplete, currentQuestion, showFeedback])

  // Timer effect
  useEffect(() => {
    if (timeRemaining === undefined || timeRemaining <= 0 || isQuizComplete) {
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === undefined || prev <= 1000) {
          handleTimeUp()
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, isQuizComplete])

  const handleTimeUp = useCallback(async () => {
    if (isQuizComplete) return
    
    // Auto-submit current question with no answer if time runs out
    if (currentQuestion && !showFeedback) {
      await handleAnswerSubmit('') // Empty answer placeholder
    }
    
    // Complete the quiz
    await completeQuiz()
  }, [currentQuestion, showFeedback, isQuizComplete])

  const handleAnswerSubmit = async (answer: Answer) => {
    // STABILITY: Add comprehensive null checks
    if (!currentQuestion || isSubmitting || showFeedback || !session?.id) {
      console.warn('Cannot submit answer: invalid state', { 
        hasQuestion: !!currentQuestion, 
        isSubmitting, 
        showFeedback, 
        hasSessionId: !!session?.id 
      })
      return
    }

    setIsSubmitting(true)
    
    console.log('📝 QUIZ: Submitting answer for question', currentQuestionIndex + 1, 'of', session.questions.length)
    
    try {
      // STABILITY: Validate answer before submission
      if (answer === null || answer === undefined) {
        throw new Error('Answer cannot be null or undefined')
      }

      // STABILITY: Validate session state
      if (!session.id || typeof session.id !== 'number') {
        throw new Error('Invalid session ID')
      }

      const timeTaken = Math.floor((Date.now() - quizStartTime) / 1000)
      
      // STABILITY: Add timeout to prevent hanging
      const submitPromise = tauriAPI.submitAnswer(session.id, answer, timeTaken)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Answer submission timeout')), 10000)
      )
      
      const result = await Promise.race([submitPromise, timeoutPromise]) as any

      // STABILITY: Validate result
      if (!result || typeof result.is_correct !== 'boolean') {
        throw new Error('Invalid answer result from backend')
      }

      setLastAnswerResult(result)
      
      // FIX: Calculate new answers array length before deciding what to do next
      const newAnswersLength = answers.length + 1
      const isLastQuestion = newAnswersLength >= session.questions.length
      
      setAnswers(prev => [...prev, result])
      setShowFeedback(true)

      // Show reward animation with error handling
      try {
        setRewardAnimationType(result.is_correct ? 'success' : 'failure')
        setShowRewardAnimation(true)
      } catch (animError) {
        console.warn('Animation error (non-critical):', animError)
      }

      // Show feedback for 2 seconds before moving to next question or completing quiz
      setTimeout(() => {
        try {
          setShowRewardAnimation(false)
          
          // FIX: Check if this was the last question BEFORE moving
          if (isLastQuestion) {
            console.log('🏁 QUIZ: Last question answered, completing quiz')
            // CRITICAL FIX: Pass the complete answers array including the current answer
            // This ensures we don't use stale state from the closure
            const allAnswers = [...answers, result]
            completeQuiz(allAnswers).catch(e => console.error('Quiz completion failed:', e))
          } else {
            moveToNextQuestion()
          }
        } catch (moveError) {
          console.error('Error moving to next question:', moveError)
          // Fallback: try to complete quiz with current answers
          const allAnswers = [...answers, result]
          completeQuiz(allAnswers).catch(e => console.error('Fallback quiz completion failed:', e))
        }
      }, 2000)

    } catch (error) {
      console.error('Failed to submit answer:', error)
      
      // STABILITY: Don't crash the app - provide fallback
      try {
        // Create a fallback result for wrong answers to keep quiz going
        const fallbackResult = {
          question_id: currentQuestion.id || 0,
          is_correct: false,
          points: 0,
          correct_answer: currentQuestion.correct_answer || 'Unknown',
          explanation: 'There was an error processing your answer. Please try again.',
          time_taken: Math.floor((Date.now() - quizStartTime) / 1000)
        }
        
        setLastAnswerResult(fallbackResult)
        
        // FIX: Same logic for fallback
        const newAnswersLength = answers.length + 1
        const isLastQuestion = newAnswersLength >= session.questions.length
        
        setAnswers(prev => [...prev, fallbackResult])
        setShowFeedback(true)
        setRewardAnimationType('failure')
        setShowRewardAnimation(true)
        
        // Continue with quiz after error
        setTimeout(() => {
          setShowRewardAnimation(false)
          
          if (isLastQuestion) {
            // CRITICAL FIX: Pass complete answers array to avoid stale state
            const allAnswers = [...answers, fallbackResult]
            completeQuiz(allAnswers).catch(e => console.error('Quiz completion failed:', e))
          } else {
            moveToNextQuestion()
          }
        }, 2000)
        
      } catch (fallbackError) {
        console.error('Fallback handling failed:', fallbackError)
        dispatch({ type: 'SET_ERROR', payload: 'Quiz error occurred. Please restart the quiz.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const moveToNextQuestion = () => {
    try {
      // STABILITY: Add null checks
      if (!session || !session.questions) {
        console.error('Invalid session state in moveToNextQuestion')
        completeQuiz().catch(e => console.error('Emergency quiz completion failed:', e))
        return
      }

      setShowFeedback(false)
      setLastAnswerResult(null)

      console.log('➡️ QUIZ: Moving to next question. Current:', currentQuestionIndex + 1, 'Total:', session.questions.length)

      // FIX: Simply increment index - completion check is now done in handleAnswerSubmit
      // This function is ONLY called when there are more questions to show
      const nextIndex = currentQuestionIndex + 1
      
      console.log('➡️ QUIZ: Moving to question', nextIndex + 1)
      setCurrentQuestionIndex(nextIndex)
    } catch (error) {
      console.error('Error in moveToNextQuestion:', error)
      // Emergency fallback - try to complete quiz
      completeQuiz().catch(e => console.error('Emergency quiz completion failed:', e))
    }
  }

  const completeQuiz = async (finalAnswers?: AnswerResult[]) => {
    if (isQuizComplete) return
    
    setIsQuizComplete(true)
    
    // CRITICAL FIX: Use provided finalAnswers or current answers state
    // This ensures we use the most recent answers, not stale closure values
    const answersToUse = finalAnswers || answers
    
    try {
      console.log('🏁 QUIZ: Completing quiz with data:', {
        totalQuestions: session.questions.length,
        answersCount: answersToUse.length,
        answers: answersToUse.map(a => ({ questionId: a.question_id, isCorrect: a.is_correct })),
        currentQuestionIndex
      })

      // CRITICAL FIX: Validate we have all answers before scoring
      if (answersToUse.length !== session.questions.length) {
        console.warn('⚠️ QUIZ: Incomplete quiz detected!', {
          expected: session.questions.length,
          received: answersToUse.length
        })
      }

      // Calculate final score
      const updatedSession = {
        ...session,
        answers: answersToUse,
        completed_at: new Date().toISOString(),
        total_time_seconds: Math.floor((Date.now() - quizStartTime) / 1000)
      }

      console.log('🏁 QUIZ: Sending session for scoring:', {
        questionsLength: updatedSession.questions.length,
        answersLength: updatedSession.answers.length
      })

      const score = await tauriAPI.calculateScore(updatedSession)
      console.log('🏁 QUIZ: Received score:', score)
      setFinalScore(score)
      
      // Update progress if profile is selected
      if (state.currentProfile) {
        await tauriAPI.updateProgress(state.currentProfile.id!, {
          subject: session.config.subject,
          key_stage: session.config.key_stage,
          questions_answered: session.questions.length,
          correct_answers: score.correct_answers,
          time_spent_seconds: updatedSession.total_time_seconds
        })
      }

  onQuizComplete(score, updatedSession)
    } catch (error) {
      console.error('Failed to complete quiz:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to complete quiz. Please try again.' })
    }
  }



  if (isQuizComplete && finalScore) {
    return (
      <ResultsScreen
        score={finalScore}
        session={session}
        onContinue={() => window.location.reload()}
        onRestart={() => window.location.reload()}
        onExit={onQuizExit}
      />
    )
  }

  // STABILITY: Comprehensive safety checks - only show loading if we're actually loading
  // If quiz is complete, the ResultsScreen will render instead
  if (!isQuizComplete && (!currentQuestion || !session || !session.questions)) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingAnimation 
          type="quiz" 
          size="large" 
          message="Loading question..." 
        />
      </div>
    )
  }

  // FIX: If we somehow get out of bounds and quiz isn't complete, force completion
  if (!isQuizComplete && currentQuestionIndex >= session.questions.length) {
    console.warn('⚠️ QUIZ: Index out of bounds, forcing quiz completion')
    completeQuiz().catch(e => console.error('Force completion failed:', e))
    
    return (
      <div className={styles.loadingContainer}>
        <LoadingAnimation 
          type="quiz" 
          size="large" 
          message="Calculating your score..." 
        />
      </div>
    )
  }

  // STABILITY: Validate question data
  if (!currentQuestion || !currentQuestion.content || !currentQuestion.content.text) {
    console.error('Invalid question content:', currentQuestion)
    
    return (
      <div className={styles.errorContainer}>
        <p>Question data is invalid. Please restart the quiz.</p>
        <button onClick={onQuizExit}>Exit Quiz</button>
      </div>
    )
  }

  return (
    <div 
      ref={quizContainerRef}
      className={`${styles.quizContainer} quiz-area no-dev-tools`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Quiz Header */}
      <div className={styles.quizHeader}>
        <ProgressIndicator
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={session.questions.length}
          correctAnswers={answers.filter(a => a.is_correct).length}
        />
        
        {timeRemaining !== undefined && (
          <QuizTimer
            timeRemaining={timeRemaining}
            totalTime={session.config.time_limit_seconds! * 1000}
            onTimeUp={handleTimeUp}
          />
        )}

        <button
          className={styles.exitButton}
          onClick={onQuizExit}
          aria-label="Exit quiz"
        >
          ✕
        </button>
      </div>

      {/* Question Content */}
      <div className={`${styles.questionSection} quiz-content`}>
        <TransitionWrapper
          type="slide"
          direction="left"
          duration={300}
          isVisible={!showFeedback}
        >
          <QuestionRenderer
            question={currentQuestion}
            onAnswer={handleAnswerSubmit}
            disabled={isSubmitting || showFeedback}
            showFeedback={showFeedback}
            isCorrect={lastAnswerResult?.is_correct}
            timeRemaining={timeRemaining}
          />
        </TransitionWrapper>
      </div>

      {/* Feedback Section */}
      {showFeedback && lastAnswerResult && (
        <TransitionWrapper
          type="bounce"
          duration={400}
          isVisible={showFeedback}
        >
          <div className={`${styles.feedbackSection} ${
            lastAnswerResult.is_correct ? styles.correctFeedback : styles.incorrectFeedback
          }`}>
            <div className={styles.feedbackContent}>
              <div className={styles.feedbackIcon}>
                {lastAnswerResult.is_correct ? '🎉' : '💪'}
              </div>
              <div className={styles.feedbackText}>
                {lastAnswerResult.is_correct ? 'Excellent!' : 'Keep trying!'}
              </div>
              {lastAnswerResult.explanation && (
                <div className={styles.explanation}>
                  {lastAnswerResult.explanation}
                </div>
              )}
              <div className={styles.points}>
                +{lastAnswerResult.points} points
              </div>
            </div>
          </div>
        </TransitionWrapper>
      )}

      {/* Reward Animation */}
      <RewardAnimation
        type={rewardAnimationType}
        isVisible={showRewardAnimation}
        onComplete={() => setShowRewardAnimation(false)}
        size="large"
      />

      {/* Loading overlay during submission */}
      {isSubmitting && (
        <div className={styles.submissionOverlay}>
          <LoadingAnimation 
            type="pulse" 
            size="medium" 
            message="Checking your answer..." 
          />
        </div>
      )}
    </div>
  )
}