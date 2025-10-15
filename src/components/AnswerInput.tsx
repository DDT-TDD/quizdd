import React from 'react'
import styles from './AnswerInput.module.css'

// This file contains reusable answer input components used by question types

// Helper component for submit buttons used across question types
interface SubmitButtonProps {
  onSubmit: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onSubmit,
  disabled = false,
  children,
  variant = 'primary'
}) => {
  return (
    <button
      className={`${styles.submitButton} ${styles[variant]} ${
        disabled ? styles.disabled : ''
      }`}
      onClick={onSubmit}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  )
}

// Helper component for answer option buttons
interface AnswerOptionProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  selected?: boolean
  correct?: boolean
  incorrect?: boolean
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  children,
  onClick,
  disabled = false,
  selected = false,
  correct = false,
  incorrect = false
}) => {
  return (
    <button
      className={`${styles.answerOption} ${
        selected ? styles.selected : ''
      } ${
        correct ? styles.correctOption : ''
      } ${
        incorrect ? styles.incorrectOption : ''
      } ${
        disabled ? styles.disabled : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  )
}