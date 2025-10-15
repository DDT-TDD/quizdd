import React, { useState, useEffect } from 'react';

import styles from './ParentalGate.module.css';

interface MathProblem {
  question: string;
  answer: number;
}

interface SimpleParentalGateProps {
  onSuccess: () => void;
  onCancel?: () => void;
  title?: string;
  message?: string;
}

export const SimpleParentalGate: React.FC<SimpleParentalGateProps> = ({
  onSuccess,
  onCancel,
  title = "Parental Verification",
  message = "This area requires adult supervision. Please solve the math problem below:"
}) => {
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Generate a simple math problem for parental verification
  const generateMathProblem = (): MathProblem => {
    const num1 = Math.floor(Math.random() * 20) + 10; // 10-29
    const num2 = Math.floor(Math.random() * 20) + 10; // 10-29
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let question: string;
    let answer: number;
    
    switch (operation) {
      case '+':
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        question = `${larger} - ${smaller}`;
        answer = larger - smaller;
        break;
      case '×':
        // Use smaller numbers for multiplication
        const small1 = Math.floor(Math.random() * 10) + 2; // 2-11
        const small2 = Math.floor(Math.random() * 10) + 2; // 2-11
        question = `${small1} × ${small2}`;
        answer = small1 * small2;
        break;
      default:
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
    }
    
    return { question, answer };
  };

  // Initialize math problem on component mount
  useEffect(() => {
    setMathProblem(generateMathProblem());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mathProblem || !userAnswer.trim()) {
      setError('Please enter an answer');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const numericAnswer = parseInt(userAnswer.trim(), 10);
      
      if (isNaN(numericAnswer)) {
        setError('Please enter a valid number');
        setIsLoading(false);
        return;
      }

      // Check if the math answer is correct
      if (numericAnswer === mathProblem.answer) {
        // Access granted
        onSuccess();
      } else {
        setAttempts(prev => prev + 1);
        
        if (attempts + 1 >= maxAttempts) {
          setError('Too many incorrect attempts. Please try again later.');
          // Auto-close after max attempts
          setTimeout(() => {
            onCancel?.();
          }, 3000);
        } else {
          setError(`Incorrect answer. ${maxAttempts - attempts - 1} attempts remaining.`);
          // Generate new problem
          setMathProblem(generateMathProblem());
          setUserAnswer('');
        }
      }
    } catch (error) {
      console.error('Parental gate validation error:', error);
      setError('Access verification failed. Please try again.');
      setAttempts(prev => prev + 1);
      
      if (attempts + 1 >= maxAttempts) {
        setTimeout(() => {
          onCancel?.();
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProblem = () => {
    setMathProblem(generateMathProblem());
    setUserAnswer('');
    setError('');
  };

  if (!mathProblem) {
    return (
      <div className={styles.parentalGate}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <span className={styles.loadingSpinner}>⏳</span>
            <p>Loading verification...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.parentalGate}>
      <div className={styles.overlay} onClick={onCancel} />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.lockIcon} role="img" aria-label="Lock">🔒</span>
            {title}
          </h2>
          <p className={styles.subtitle}>
            {message}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.mathProblem}>
            <div className={styles.problemDisplay}>
              <span className={styles.equation}>{mathProblem.question} = ?</span>
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
              onClick={onCancel}
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
  );
};