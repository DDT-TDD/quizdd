/**
 * Offline Verification Panel - Development tool for testing offline capabilities
 */

import { useState, useEffect } from 'react'
import { verifyOfflineCapabilities, displayVerificationResults, quickOfflineCheck, type OfflineVerificationResult } from '../utils/offlineVerification'
import styles from './OfflineVerificationPanel.module.css'

interface OfflineVerificationPanelProps {
  autoRun?: boolean
  compact?: boolean
}

export function OfflineVerificationPanel({ autoRun = false, compact = false }: OfflineVerificationPanelProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<OfflineVerificationResult | null>(null)
  const [quickCheckResult, setQuickCheckResult] = useState<boolean | null>(null)
  const [expanded, setExpanded] = useState(!compact)

  useEffect(() => {
    if (autoRun) {
      runQuickCheck()
    }
  }, [autoRun])

  const runQuickCheck = async () => {
    setIsRunning(true)
    try {
      const isWorking = await quickOfflineCheck()
      setQuickCheckResult(isWorking)
    } catch (error) {
      console.error('Quick check failed:', error)
      setQuickCheckResult(false)
    } finally {
      setIsRunning(false)
    }
  }

  const runFullVerification = async () => {
    setIsRunning(true)
    try {
      const verificationResult = await verifyOfflineCapabilities()
      setResult(verificationResult)
      displayVerificationResults(verificationResult)
    } catch (error) {
      console.error('Full verification failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  if (compact && !expanded) {
    return (
      <div className={styles.compactPanel}>
        <button 
          className={styles.expandButton}
          onClick={() => setExpanded(true)}
          title="Open Offline Verification Panel"
        >
          🔍 Offline Check
        </button>
        {quickCheckResult !== null && (
          <span className={`${styles.quickStatus} ${quickCheckResult ? styles.success : styles.error}`}>
            {quickCheckResult ? '✅' : '❌'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={styles.verificationPanel}>
      <div className={styles.header}>
        <h3>🔍 Offline Verification</h3>
        {compact && (
          <button 
            className={styles.closeButton}
            onClick={() => setExpanded(false)}
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={runQuickCheck}
            disabled={isRunning}
          >
            {isRunning ? '⏳ Running...' : '⚡ Quick Check'}
          </button>
          
          <button 
            className={styles.actionButton}
            onClick={runFullVerification}
            disabled={isRunning}
          >
            {isRunning ? '⏳ Running...' : '🔍 Full Verification'}
          </button>
        </div>

        {quickCheckResult !== null && (
          <div className={`${styles.quickResult} ${quickCheckResult ? styles.success : styles.error}`}>
            <span className={styles.resultIcon}>
              {quickCheckResult ? '✅' : '❌'}
            </span>
            <span>
              Quick Check: {quickCheckResult ? 'All systems working' : 'Issues detected'}
            </span>
          </div>
        )}

        {result && (
          <div className={styles.fullResults}>
            <div className={`${styles.overallResult} ${result.passed ? styles.success : styles.error}`}>
              <h4>
                {result.passed ? '✅ VERIFICATION PASSED' : '❌ VERIFICATION FAILED'}
              </h4>
              <p>Score: {result.score}/{result.maxScore} ({((result.score / result.maxScore) * 100).toFixed(1)}%)</p>
            </div>

            <div className={styles.testResults}>
              <h5>Test Results:</h5>
              {result.results.map((test, index) => (
                <div 
                  key={index} 
                  className={`${styles.testResult} ${test.passed ? styles.passed : styles.failed} ${test.critical ? styles.critical : ''}`}
                >
                  <span className={styles.testIcon}>
                    {test.passed ? '✅' : '❌'}
                  </span>
                  <div className={styles.testInfo}>
                    <strong>{test.test}</strong>
                    {test.critical && <span className={styles.criticalBadge}>CRITICAL</span>}
                    <p>{test.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <h5>Summary:</h5>
              <ul>
                <li>
                  Core offline features: {
                    result.results.filter(r => r.critical && r.passed).length === 
                    result.results.filter(r => r.critical).length ? '✅ Working' : '❌ Issues'
                  }
                </li>
                <li>
                  Data privacy: {
                    result.results.find(r => r.test.includes('Privacy'))?.passed ? '✅ Compliant' : '❌ Issues'
                  }
                </li>
                <li>
                  Error handling: {
                    result.results.find(r => r.test.includes('Resilience'))?.passed ? '✅ Working' : '❌ Issues'
                  }
                </li>
                <li>
                  Content caching: {
                    result.results.find(r => r.test.includes('Cache'))?.passed ? '✅ Active' : '❌ Issues'
                  }
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className={styles.info}>
          <p>
            <strong>Purpose:</strong> Verify that the app works completely offline with proper data privacy.
          </p>
          <p>
            <strong>Quick Check:</strong> Tests basic offline functionality.
          </p>
          <p>
            <strong>Full Verification:</strong> Comprehensive test of all offline features and privacy compliance.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OfflineVerificationPanel