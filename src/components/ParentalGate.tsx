import React, { useState, useEffect } from 'react'
import { useAppContext, appActions } from '../contexts/AppContext'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { ParentalChallenge } from '../types/api'
import styles from './ParentalGate.module.css'

export function ParentalGate() {
  const { dispatch } = useAppContext()
  const [challenge, setChallenge] = useState<ParentalChallenge | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [_sessionToken, setSessionToken] = useState<string | null>(null)
  const maxAttempts = 3

  // Generate a new challenge from the backend
  const generateNewChallenge = async () => {
    try {
      setIsLoading(true)
      const newChallenge = await tauriAPI.generateParentalChallenge()
      setChallenge(newChallenge)
      setUserAnswer('')
      setError('')
    } catch (error) {
      console.error('Failed to generate challenge:', error)
      setError('Failed to generate verification challenge')
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize challenge on component mount
  useEffect(() => {
    generateNewChallenge()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!challenge || !userAnswer.trim()) {
      setError('Please enter an answer')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const numericAnswer = parseInt(userAnswer.trim(), 10)
      
      if (isNaN(numericAnswer)) {
        setError('Please enter a valid number')
        setIsLoading(false)
        return
      }

      // Check if challenge has expired
      const currentTime = Math.floor(Date.now() / 1000)
      if (currentTime > challenge.expires_at) {
        setError('Challenge expired. Generating new one...')
        await generateNewChallenge()
        return
      }

      // Validate with backend security service
      const isValid = await tauriAPI.validateParentalAccess(challenge.question, userAnswer)
      
      if (isValid) {
        // Generate session token for authenticated access
        const token = await tauriAPI.generateParentalSessionToken()
        setSessionToken(token)
        
        // Store token in session storage for this session
        sessionStorage.setItem('parental_session_token', token)
        
        // Access granted
        dispatch(appActions.toggleParentalGate(false))
      } else {
        setAttempts(prev => prev + 1)
        
        if (attempts + 1 >= maxAttempts) {
          setError('Too many incorrect attempts. Access blocked.')
          // Auto-close after max attempts
          setTimeout(() => {
            dispatch(appActions.toggleParentalGate(false))
          }, 3000)
        } else {
          setError(`Incorrect answer. ${maxAttempts - attempts - 1} attempts remaining.`)
          // Generate new challenge
          await generateNewChallenge()
        }
      }
    } catch (error) {
      console.error('Parental gate validation error:', error)
      setError('Access verification failed. Please try again.')
      setAttempts(prev => prev + 1)
      
      if (attempts + 1 >= maxAttempts) {
        setTimeout(() => {
          dispatch(appActions.toggleParentalGate(false))
        }, 3000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    dispatch(appActions.toggleParentalGate(false))
  }

  const handleNewProblem = () => {
    generateNewChallenge()
  }

  if (!challenge) {
    return (
      <div className={styles.parentalGate}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <span className={styles.loadingSpinner}>⏳</span>
            <p>Loading verification...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.parentalGate}>
      <div className={styles.overlay} onClick={handleCancel} />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.lockIcon} role="img" aria-label="Lock">🔒</span>
            Parental Verification
          </h2>
          <p className={styles.subtitle}>
            This area requires adult supervision. Please solve the math problem below:
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.mathProblem}>
            <div className={styles.problemDisplay}>
              <span className={styles.equation}>{challenge.question}</span>
            </div>
            
            <button
              type="button"
              onClick={handleNewProblem}
              className={styles.newProblemButton}
              aria-label="Generate new math problem"
            >
              🔄 New Problem
            </button>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="mathAnswer" className={styles.label}>
              Your Answer:
            </label>
            <input
              id="mathAnswer"
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={styles.answerInput}
              placeholder="Enter the answer"
              disabled={isLoading}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className={styles.errorMessage} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || !userAnswer.trim()}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}>⏳</span>
                  Verifying...
                </>
              ) : (
                'Verify Access'
              )}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            This verification helps ensure that only adults can access certain features.
          </p>
          <p className={styles.attemptsInfo}>
            Attempts: {attempts}/{maxAttempts}
          </p>
        </div>
      </div>
    </div>
  )
}