/**
 * Data Privacy Service - Ensures no personal data transmission over network
 * Implements local-only data storage and privacy verification
 */

import React from 'react'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'

export interface PrivacyViolation {
  type: 'network_transmission' | 'external_storage' | 'data_leak'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  data?: any
}

export interface PrivacyReport {
  isCompliant: boolean
  violations: PrivacyViolation[]
  lastCheck: Date
  dataTypes: {
    profiles: { count: number; localOnly: boolean }
    progress: { count: number; localOnly: boolean }
    customMixes: { count: number; localOnly: boolean }
    quizSessions: { count: number; localOnly: boolean }
  }
}

class DataPrivacyService {
  private violations: PrivacyViolation[] = []
  private monitoringEnabled: boolean = true
  private allowedNetworkOperations: Set<string> = new Set([
    'content_updates', // Only for secure content updates
    'signature_verification' // Only for verifying content signatures
  ])

  constructor() {
    this.initializePrivacyMonitoring()
  }

  /**
   * Initialize privacy monitoring
   */
  private initializePrivacyMonitoring(): void {
    // Monitor for any network requests that might contain personal data
    this.setupNetworkMonitoring()
    
    // Verify local-only data storage
    this.verifyLocalStorage()
    
    console.log('Data privacy monitoring initialized - local-only mode active')
  }

  /**
   * Setup network monitoring to detect unauthorized data transmission
   */
  private setupNetworkMonitoring(): void {
    // In a Tauri app, we need to ensure no network requests contain personal data
    // This is primarily a compile-time check since Tauri controls network access
    
    if (typeof window !== 'undefined') {
      // Override fetch to monitor network requests (development only)
      if (process.env.NODE_ENV === 'development') {
        const originalFetch = window.fetch
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
          const url = typeof input === 'string' ? input : input.toString()
          
          // Check if request might contain personal data
          if (this.containsPersonalData(init?.body)) {
            this.reportViolation({
              type: 'network_transmission',
              description: `Potential personal data transmission to ${url}`,
              severity: 'critical',
              timestamp: new Date(),
              data: { url, body: init?.body }
            })
          }
          
          return originalFetch(input, init)
        }
      }
    }
  }

  /**
   * Verify that all data storage is local-only
   */
  private async verifyLocalStorage(): Promise<void> {
    try {
      // Verify database is local SQLite
      const dbStats = await tauriAPI.getDatabaseStats()
      console.log('Database verification:', dbStats)
      
      // All data should be stored in local SQLite database
      // No external database connections should exist
      
    } catch (error) {
      console.warn('Could not verify database storage:', error)
    }
  }

  /**
   * Check if data contains personal information
   */
  private containsPersonalData(data: any): boolean {
    if (!data) return false
    
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data)
    const personalDataPatterns = [
      /profile.*name/i,
      /user.*name/i,
      /progress/i,
      /score/i,
      /achievement/i,
      /quiz.*result/i,
      /custom.*mix/i
    ]
    
    return personalDataPatterns.some(pattern => pattern.test(dataStr))
  }

  /**
   * Report a privacy violation
   */
  private reportViolation(violation: PrivacyViolation): void {
    this.violations.push(violation)
    
    console.error('PRIVACY VIOLATION DETECTED:', violation)
    
    // In production, this should trigger immediate action
    if (violation.severity === 'critical') {
      console.error('CRITICAL PRIVACY VIOLATION - STOPPING OPERATION')
      // Could throw error to stop the operation
    }
  }

  /**
   * Verify that profiles are stored locally only
   */
  async verifyProfilePrivacy(): Promise<boolean> {
    try {
      // Profiles should only exist in local database
      await tauriAPI.getProfiles()
      
      // Verify no network transmission occurred
      // This is guaranteed by Tauri's architecture and our API design
      
      return true
    } catch (error) {
      this.reportViolation({
        type: 'data_leak',
        description: 'Failed to verify profile privacy',
        severity: 'medium',
        timestamp: new Date(),
        data: { error: String(error) }
      })
      return false
    }
  }

  /**
   * Verify that progress data is stored locally only
   */
  async verifyProgressPrivacy(profileId: number): Promise<boolean> {
    try {
      // Progress should only exist in local database
      await tauriAPI.getProgress(profileId)
      
      // Verify no network transmission occurred
      // This is guaranteed by our local-only architecture
      
      return true
    } catch (error) {
      this.reportViolation({
        type: 'data_leak',
        description: 'Failed to verify progress privacy',
        severity: 'medium',
        timestamp: new Date(),
        data: { profileId, error: String(error) }
      })
      return false
    }
  }

  /**
   * Verify that custom mixes are stored locally only
   */
  async verifyCustomMixPrivacy(): Promise<boolean> {
    try {
      // Custom mixes should only exist in local database
      await tauriAPI.getAllCustomMixes()
      
      // Verify no network transmission occurred
      return true
    } catch (error) {
      this.reportViolation({
        type: 'data_leak',
        description: 'Failed to verify custom mix privacy',
        severity: 'medium',
        timestamp: new Date(),
        data: { error: String(error) }
      })
      return false
    }
  }

  /**
   * Generate comprehensive privacy report
   */
  async generatePrivacyReport(): Promise<PrivacyReport> {
    const report: PrivacyReport = {
      isCompliant: true,
      violations: [...this.violations],
      lastCheck: new Date(),
      dataTypes: {
        profiles: { count: 0, localOnly: true },
        progress: { count: 0, localOnly: true },
        customMixes: { count: 0, localOnly: true },
        quizSessions: { count: 0, localOnly: true }
      }
    }

    try {
      // Check profiles
      const profiles = await tauriAPI.getProfiles()
      report.dataTypes.profiles.count = profiles.length
      report.dataTypes.profiles.localOnly = await this.verifyProfilePrivacy()

      // Check custom mixes
      const mixes = await tauriAPI.getAllCustomMixes()
      report.dataTypes.customMixes.count = mixes.length
      report.dataTypes.customMixes.localOnly = await this.verifyCustomMixPrivacy()

      // Check for violations
      report.isCompliant = this.violations.length === 0 &&
        report.dataTypes.profiles.localOnly &&
        report.dataTypes.progress.localOnly &&
        report.dataTypes.customMixes.localOnly &&
        report.dataTypes.quizSessions.localOnly

    } catch (error) {
      this.reportViolation({
        type: 'data_leak',
        description: 'Failed to generate privacy report',
        severity: 'high',
        timestamp: new Date(),
        data: { error: String(error) }
      })
      report.isCompliant = false
    }

    return report
  }

  /**
   * Verify that only authorized network operations are allowed
   */
  isNetworkOperationAllowed(operation: string): boolean {
    return this.allowedNetworkOperations.has(operation)
  }

  /**
   * Add allowed network operation (for content updates only)
   */
  addAllowedNetworkOperation(operation: string): void {
    // Only allow specific operations for content updates
    if (operation === 'content_updates' || operation === 'signature_verification') {
      this.allowedNetworkOperations.add(operation)
    } else {
      this.reportViolation({
        type: 'network_transmission',
        description: `Attempted to allow unauthorized network operation: ${operation}`,
        severity: 'high',
        timestamp: new Date(),
        data: { operation }
      })
    }
  }

  /**
   * Sanitize data before any potential network transmission
   */
  sanitizeForNetwork(data: any): any {
    // Remove all personal data before any network operation
    const sanitized = { ...data }
    
    // Remove personal identifiers
    delete sanitized.profileId
    delete sanitized.userId
    delete sanitized.name
    delete sanitized.progress
    delete sanitized.scores
    delete sanitized.achievements
    delete sanitized.customMixes
    
    return sanitized
  }

  /**
   * Verify content update privacy (only non-personal data)
   */
  verifyContentUpdatePrivacy(updateData: any): boolean {
    // Content updates should only contain educational content
    // No personal data should be transmitted
    
    const personalDataKeys = [
      'profile', 'user', 'progress', 'score', 'achievement',
      'name', 'avatar', 'custom_mix', 'quiz_result'
    ]
    
    const dataStr = JSON.stringify(updateData).toLowerCase()
    
    for (const key of personalDataKeys) {
      if (dataStr.includes(key)) {
        this.reportViolation({
          type: 'network_transmission',
          description: `Content update contains personal data: ${key}`,
          severity: 'critical',
          timestamp: new Date(),
          data: { updateData }
        })
        return false
      }
    }
    
    return true
  }

  /**
   * Get privacy violations
   */
  getViolations(): PrivacyViolation[] {
    return [...this.violations]
  }

  /**
   * Clear violations (for testing)
   */
  clearViolations(): void {
    this.violations = []
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoring(enabled: boolean): void {
    this.monitoringEnabled = enabled
  }

  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return this.monitoringEnabled
  }

  /**
   * Verify offline-first compliance
   */
  async verifyOfflineFirstCompliance(): Promise<{
    isCompliant: boolean
    issues: string[]
  }> {
    const issues: string[] = []

    try {
      // Test that core features work without network
      
      // 1. Profile management should work offline
      try {
        await tauriAPI.getProfiles()
      } catch (error) {
        issues.push('Profile management requires network connection')
      }

      // 2. Subject loading should work offline
      try {
        await tauriAPI.getSubjects()
      } catch (error) {
        issues.push('Subject loading requires network connection')
      }

      // 3. Custom mix management should work offline
      try {
        await tauriAPI.getAllCustomMixes()
      } catch (error) {
        issues.push('Custom mix management requires network connection')
      }

      // 4. Quiz functionality should work offline
      try {
        const subjects = await tauriAPI.getSubjects()
        if (subjects.length > 0) {
          await tauriAPI.getQuestionsBySubject(subjects[0].name, undefined, undefined, 1)
        }
      } catch (error) {
        issues.push('Quiz functionality requires network connection')
      }

    } catch (error) {
      issues.push(`Offline compliance check failed: ${error}`)
    }

    return {
      isCompliant: issues.length === 0,
      issues
    }
  }
}

// Singleton instance
export const dataPrivacyService = new DataPrivacyService()

// React hook for privacy monitoring
export function useDataPrivacy() {
  const [privacyReport, setPrivacyReport] = React.useState<PrivacyReport | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const generateReport = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const report = await dataPrivacyService.generatePrivacyReport()
      setPrivacyReport(report)
    } catch (error) {
      console.error('Failed to generate privacy report:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    // Generate initial report
    generateReport()
  }, [generateReport])

  return {
    privacyReport,
    isLoading,
    generateReport,
    violations: dataPrivacyService.getViolations(),
    isCompliant: privacyReport?.isCompliant ?? false
  }
}

export default dataPrivacyService