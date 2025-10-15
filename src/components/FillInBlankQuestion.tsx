import React, { useState, useCallback, useEffect } from 'react'
import { Question, Answer } from '../types/api'
import styles from './FillInBlankQuestion.module.css'

interface FillInBlankQuestionProps {
  question: Question
  onAnswer: (answer: Answer) => void
  disabled?: boolean
  showFeedback?: boolean
  isCorrect?: boolean
}

export const FillInBlankQuestion: React.FC<FillInBlankQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  isCorrect
}) => {
  const blanks = question.content.blanks || []
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})

  // Initialize answers state
  useEffect(() => {
    const initialAnswers: Record<number, string> = {}
    blanks.forEach((blank) => {
      initialAnswers[blank.position] = ''
    })
    setAnswers(initialAnswers)
  }, [blanks])

  const handleInputChange = useCallback((position: number, value: string) => {
    if (disabled) return

    setAnswers(prev => ({
      ...prev,
      [position]: value
    }))

    // Clear validation error when user starts typing
    if (validationErrors[position]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[position]
        return newErrors
      })
    }
  }, [disabled, validationErrors])

  const validateAnswer = useCallback((position: number, value: string): string | null => {
    const blank = blanks.find(b => b.position === position)
    if (!blank) return null

    const trimmedValue = value.trim()
    if (trimmedValue === '') {
      return 'This field is required'
    }

    // Check if answer matches expected answer or alternatives
    const expectedAnswer = blank.expected_answer
    const alternatives = blank.accept_alternatives || []
    const allValidAnswers = [expectedAnswer, ...alternatives]

    const isValid = allValidAnswers.some(validAnswer => 
      blank.case_sensitive 
        ? validAnswer === trimmedValue
        : validAnswer.toLowerCase() === trimmedValue.toLowerCase()
    )

    if (!isValid && showFeedback) {
      return `Expected: ${expectedAnswer}`
    }

    return null
  }, [blanks, showFeedback])

  const handleSubmit = useCallback(() => {
    if (disabled) return

    // Validate all answers
    const errors: Record<number, string> = {}
    let hasErrors = false

    blanks.forEach(blank => {
      const answer = answers[blank.position] || ''
      const error = validateAnswer(blank.position, answer)
      if (error) {
        errors[blank.position] = error
        hasErrors = true
      }
    })

    setValidationErrors(errors)

    if (!hasErrors) {

      const orderedBlanks = [...blanks].sort((a, b) => a.position - b.position)
      const orderedAnswers = orderedBlanks.map(blank => answers[blank.position] || '')

      if (orderedAnswers.length === 1) {
        onAnswer(orderedAnswers[0])
      } else {
        onAnswer(orderedAnswers)
      }
    }
  }, [disabled, blanks, answers, validateAnswer, onAnswer])

  const renderTextWithBlanks = () => {
    const text = question.content.text
    const parts: React.ReactNode[] = []
    let lastIndex = 0

    // Sort blanks by position to process them in order
    const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position)

    sortedBlanks.forEach((blank, blankIndex) => {
      // Add text before the blank
      if (blank.position > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex, blank.position)}
          </span>
        )
      }

      // Add the input field for the blank
      const hasError = validationErrors[blank.position]
      const inputValue = answers[blank.position] || ''
      
      parts.push(
        <span key={`blank-${blank.position}`} className={styles.blankContainer}>
          <input
            type="text"
            className={`${styles.blankInput} ${hasError ? styles.errorInput : ''} ${
              showFeedback && !hasError && inputValue ? styles.correctInput : ''
            }`}
            value={inputValue}
            onChange={(e) => handleInputChange(blank.position, e.target.value)}
            disabled={disabled}
            placeholder={`Blank ${blankIndex + 1}`}
            autoComplete="off"
          />
          {hasError && (
            <div className={styles.errorMessage}>
              {hasError}
            </div>
          )}
        </span>
      )

      lastIndex = blank.position
    })

    // Add remaining text after the last blank
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      )
    }

    return parts
  }

  const allFieldsFilled = blanks.every(blank => 
    answers[blank.position] && answers[blank.position].trim() !== ''
  )

  return (
    <div className={styles.container}>
      <div className={styles.questionText}>
        <h2>Fill in the blanks:</h2>
      </div>

      {question.content.image_url && (
        <div className={styles.imageContainer}>
          <img 
            src={question.content.image_url} 
            alt="Question illustration"
            className={styles.questionImage}
          />
        </div>
      )}

      <div className={styles.textContainer}>
        <div className={styles.textWithBlanks}>
          {renderTextWithBlanks()}
        </div>
      </div>

      <div className={styles.instructions}>
        <p>Fill in all the blanks and click submit when ready.</p>
        {blanks.length > 0 && (
          <p className={styles.blankCount}>
            Blanks filled: {Object.values(answers).filter(a => a.trim() !== '').length} / {blanks.length}
          </p>
        )}
      </div>

      <div className={styles.controls}>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={disabled || !allFieldsFilled}
          type="button"
        >
          Submit Answer
        </button>
      </div>

      {showFeedback && (
        <div className={styles.feedbackContainer}>
          <div className={isCorrect ? styles.correctFeedback : styles.incorrectFeedback}>
            {isCorrect ? (
              <>
                <span className={styles.feedbackIcon}>✓</span>
                <span>Excellent! All blanks filled correctly!</span>
              </>
            ) : (
              <>
                <span className={styles.feedbackIcon}>✗</span>
                <span>Some answers need correction. Check the hints above!</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}