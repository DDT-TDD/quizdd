/**
 * Offline Status Component - Shows offline capabilities and data privacy status
 */

import React from 'react'
import { useOfflineService } from '../services/offlineService'
import { useDataPrivacy } from '../services/dataPrivacyService'
import { useContentCache } from '../services/contentCacheService'
import { useOfflineErrorHandler } from '../services/offlineErrorHandler'
import styles from './OfflineStatus.module.css'

interface OfflineStatusProps {
  showDetails?: boolean
  compact?: boolean
}

export function OfflineStatus({ showDetails = false, compact = false }: OfflineStatusProps) {
  const { getOfflineStatus } = useOfflineService()
  const { privacyReport, isCompliant } = useDataPrivacy()
  const { stats: cacheStats, getOfflineAvailability } = useContentCache()
  const { unresolvedErrors } = useOfflineErrorHandler()

  const [expanded, setExpanded] = React.useState(false)
  const [offlineStatus, setOfflineStatus] = React.useState(getOfflineStatus())
  const [availability, setAvailability] = React.useState(getOfflineAvailability())

  React.useEffect(() => {
    const updateStatus = () => {
      setOfflineStatus(getOfflineStatus())
      setAvailability(getOfflineAvailability())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, []) // Remove function dependencies to prevent infinite re-renders

  if (compact) {
    return (
      <div className={styles.compactStatus}>
        <div className={`${styles.indicator} ${offlineStatus.isOfflineReady ? styles.ready : styles.notReady}`}>
          <span className={styles.dot}></span>
          <span className={styles.label}>
            {offlineStatus.isOfflineReady ? 'Offline Ready' : 'Loading...'}
          </span>
        </div>
        {!isCompliant && (
          <div className={styles.privacyWarning}>
            <span className={styles.warningIcon}>⚠️</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.offlineStatus}>
      <div className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.mainStatus}>
          <div className={`${styles.statusIndicator} ${offlineStatus.isOfflineReady ? styles.ready : styles.loading}`}>
            <span className={styles.statusIcon}>
              {offlineStatus.isOfflineReady ? '✅' : '⏳'}
            </span>
            <div className={styles.statusText}>
              <h3>{offlineStatus.isOfflineReady ? 'Offline Ready' : 'Preparing Offline Mode'}</h3>
              <p>All data stored locally • No internet required</p>
            </div>
          </div>
          <button className={`${styles.expandButton} ${expanded ? styles.expanded : ''}`}>
            <span className={styles.chevron}>▼</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className={styles.details}>
          {/* Privacy Status */}
          <div className={styles.section}>
            <h4>🔒 Data Privacy</h4>
            <div className={`${styles.privacyStatus} ${isCompliant ? styles.compliant : styles.warning}`}>
              <span className={styles.privacyIcon}>
                {isCompliant ? '✅' : '⚠️'}
              </span>
              <span>
                {isCompliant ? 'All data stored locally' : 'Privacy check in progress'}
              </span>
            </div>
            {privacyReport && (
              <div className={styles.privacyDetails}>
                <div className={styles.dataTypes}>
                  <div className={styles.dataType}>
                    <span>Profiles:</span>
                    <span>{privacyReport.dataTypes.profiles.count} (Local)</span>
                  </div>
                  <div className={styles.dataType}>
                    <span>Custom Mixes:</span>
                    <span>{privacyReport.dataTypes.customMixes.count} (Local)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Offline Capabilities */}
          <div className={styles.section}>
            <h4>📱 Offline Capabilities</h4>
            <div className={styles.capabilities}>
              <div className={styles.capability}>
                <span className={styles.capabilityIcon}>📚</span>
                <div>
                  <strong>Subjects Available:</strong>
                  <span>{offlineStatus.cachedSubjects}</span>
                </div>
              </div>
              <div className={styles.capability}>
                <span className={styles.capabilityIcon}>❓</span>
                <div>
                  <strong>Questions Cached:</strong>
                  <span>{offlineStatus.cachedQuestions}</span>
                </div>
              </div>
              <div className={styles.capability}>
                <span className={styles.capabilityIcon}>👤</span>
                <div>
                  <strong>User Profiles:</strong>
                  <span>{offlineStatus.cachedProfiles}</span>
                </div>
              </div>
              <div className={styles.capability}>
                <span className={styles.capabilityIcon}>🎯</span>
                <div>
                  <strong>Custom Mixes:</strong>
                  <span>{offlineStatus.cachedMixes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cache Performance */}
          {cacheStats && (
            <div className={styles.section}>
              <h4>⚡ Cache Performance</h4>
              <div className={styles.cacheStats}>
                <div className={styles.stat}>
                  <span>Hit Rate:</span>
                  <span>{(cacheStats.hitRate * 100).toFixed(1)}%</span>
                </div>
                <div className={styles.stat}>
                  <span>Total Entries:</span>
                  <span>{cacheStats.totalEntries}</span>
                </div>
                <div className={styles.stat}>
                  <span>Cache Size:</span>
                  <span>{(cacheStats.totalSize / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Status */}
          {unresolvedErrors.length > 0 && (
            <div className={styles.section}>
              <h4>⚠️ Issues</h4>
              <div className={styles.errors}>
                {unresolvedErrors.slice(0, 3).map(error => (
                  <div key={error.id} className={styles.error}>
                    <span className={styles.errorType}>{error.type}</span>
                    <span className={styles.errorMessage}>{error.message}</span>
                    {error.fallbackUsed && (
                      <span className={styles.fallback}>Using: {error.fallbackUsed}</span>
                    )}
                  </div>
                ))}
                {unresolvedErrors.length > 3 && (
                  <div className={styles.moreErrors}>
                    +{unresolvedErrors.length - 3} more issues
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Offline Availability by Subject */}
          {availability.subjects.length > 0 && (
            <div className={styles.section}>
              <h4>📖 Available Subjects</h4>
              <div className={styles.subjects}>
                {availability.subjects.map(subject => (
                  <div key={subject} className={styles.subject}>
                    <span className={styles.subjectIcon}>✅</span>
                    <span>{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button 
              className={styles.actionButton}
              onClick={() => window.location.reload()}
            >
              Refresh Cache
            </button>
            {showDetails && (
              <button 
                className={styles.actionButton}
                onClick={() => console.log('Offline Status:', { offlineStatus, privacyReport, cacheStats })}
              >
                View Details
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OfflineStatus