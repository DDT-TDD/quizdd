/**
 * Offline Verification Utility
 * Verifies that the app works in offline-first mode with proper data privacy
 */

import { offlineService } from '../services/offlineService'
import { dataPrivacyService } from '../services/dataPrivacyService'
import { contentCacheService } from '../services/contentCacheService'
import { offlineErrorHandler } from '../services/offlineErrorHandler'

export interface OfflineVerificationResult {
  passed: boolean
  score: number
  maxScore: number
  results: Array<{
    test: string
    passed: boolean
    message: string
    critical: boolean
  }>
}

/**
 * Run comprehensive offline verification tests
 */
export async function verifyOfflineCapabilities(): Promise<OfflineVerificationResult> {
  const results: OfflineVerificationResult['results'] = []
  let score = 0
  const maxScore = 10

  console.log('🔍 Starting offline capabilities verification...')

  // Test 1: Basic offline service functionality
  try {
    const subjects = await offlineService.getSubjects()
    if (Array.isArray(subjects)) {
      results.push({
        test: 'Offline Service - Get Subjects',
        passed: true,
        message: `Successfully retrieved ${subjects.length} subjects`,
        critical: true
      })
      score++
    } else {
      results.push({
        test: 'Offline Service - Get Subjects',
        passed: false,
        message: 'Failed to retrieve subjects array',
        critical: true
      })
    }
  } catch (error) {
    results.push({
      test: 'Offline Service - Get Subjects',
      passed: false,
      message: `Error: ${error}`,
      critical: true
    })
  }

  // Test 2: Question retrieval with fallback
  try {
    const questions = await offlineService.getQuestions('Mathematics', 'KS1', undefined, 5)
    if (Array.isArray(questions) && questions.length > 0) {
      results.push({
        test: 'Offline Service - Get Questions',
        passed: true,
        message: `Successfully retrieved ${questions.length} questions`,
        critical: true
      })
      score++
    } else {
      results.push({
        test: 'Offline Service - Get Questions',
        passed: false,
        message: 'No questions retrieved',
        critical: true
      })
    }
  } catch (error) {
    results.push({
      test: 'Offline Service - Get Questions',
      passed: false,
      message: `Error: ${error}`,
      critical: true
    })
  }

  // Test 3: Data privacy compliance
  try {
    const privacyReport = await dataPrivacyService.generatePrivacyReport()
    if (privacyReport.isCompliant) {
      results.push({
        test: 'Data Privacy - Compliance Check',
        passed: true,
        message: 'All data stored locally, privacy compliant',
        critical: true
      })
      score++
    } else {
      results.push({
        test: 'Data Privacy - Compliance Check',
        passed: false,
        message: `Privacy violations detected: ${privacyReport.violations.length}`,
        critical: true
      })
    }
  } catch (error) {
    results.push({
      test: 'Data Privacy - Compliance Check',
      passed: false,
      message: `Error: ${error}`,
      critical: true
    })
  }

  // Test 4: Offline-first compliance
  try {
    const compliance = await dataPrivacyService.verifyOfflineFirstCompliance()
    if (compliance.isCompliant) {
      results.push({
        test: 'Offline-First - Core Features',
        passed: true,
        message: 'All core features work offline',
        critical: true
      })
      score++
    } else {
      results.push({
        test: 'Offline-First - Core Features',
        passed: false,
        message: `Issues: ${compliance.issues.join(', ')}`,
        critical: true
      })
    }
  } catch (error) {
    results.push({
      test: 'Offline-First - Core Features',
      passed: false,
      message: `Error: ${error}`,
      critical: true
    })
  }

  // Test 5: Content cache initialization
  try {
    await contentCacheService.initialize()
    if (contentCacheService.isReady()) {
      results.push({
        test: 'Content Cache - Initialization',
        passed: true,
        message: 'Cache service initialized successfully',
        critical: false
      })
      score++
    } else {
      results.push({
        test: 'Content Cache - Initialization',
        passed: false,
        message: 'Cache service failed to initialize',
        critical: false
      })
    }
  } catch (error) {
    results.push({
      test: 'Content Cache - Initialization',
      passed: false,
      message: `Error: ${error}`,
      critical: false
    })
  }

  // Test 6: Cache statistics
  try {
    const stats = contentCacheService.getStats()
    if (typeof stats.totalEntries === 'number' && typeof stats.hitRate === 'number') {
      results.push({
        test: 'Content Cache - Statistics',
        passed: true,
        message: `Cache has ${stats.totalEntries} entries with ${(stats.hitRate * 100).toFixed(1)}% hit rate`,
        critical: false
      })
      score++
    } else {
      results.push({
        test: 'Content Cache - Statistics',
        passed: false,
        message: 'Invalid cache statistics',
        critical: false
      })
    }
  } catch (error) {
    results.push({
      test: 'Content Cache - Statistics',
      passed: false,
      message: `Error: ${error}`,
      critical: false
    })
  }

  // Test 7: Error handler resilience
  try {
    const resilienceTest = await offlineErrorHandler.testOfflineResilience()
    if (resilienceTest.passed) {
      results.push({
        test: 'Error Handler - Resilience',
        passed: true,
        message: 'All fallback strategies working',
        critical: false
      })
      score++
    } else {
      const failedTests = resilienceTest.results.filter(r => !r.success)
      results.push({
        test: 'Error Handler - Resilience',
        passed: false,
        message: `Failed tests: ${failedTests.map(t => t.operation).join(', ')}`,
        critical: false
      })
    }
  } catch (error) {
    results.push({
      test: 'Error Handler - Resilience',
      passed: false,
      message: `Error: ${error}`,
      critical: false
    })
  }

  // Test 8: Network operation restrictions
  try {
    const allowedOperations = [
      dataPrivacyService.isNetworkOperationAllowed('content_updates'),
      dataPrivacyService.isNetworkOperationAllowed('signature_verification')
    ]
    const restrictedOperations = [
      !dataPrivacyService.isNetworkOperationAllowed('user_tracking'),
      !dataPrivacyService.isNetworkOperationAllowed('analytics'),
      !dataPrivacyService.isNetworkOperationAllowed('personal_data_sync')
    ]

    if (allowedOperations.every(Boolean) && restrictedOperations.every(Boolean)) {
      results.push({
        test: 'Data Privacy - Network Restrictions',
        passed: true,
        message: 'Network operations properly restricted',
        critical: true
      })
      score++
    } else {
      results.push({
        test: 'Data Privacy - Network Restrictions',
        passed: false,
        message: 'Network operation restrictions not working properly',
        critical: true
      })
    }
  } catch (error) {
    results.push({
      test: 'Data Privacy - Network Restrictions',
      passed: false,
      message: `Error: ${error}`,
      critical: true
    })
  }

  // Test 9: Offline status reporting
  try {
    const offlineStatus = offlineService.getOfflineStatus()
    if (typeof offlineStatus.isOfflineReady === 'boolean' && 
        typeof offlineStatus.cachedSubjects === 'number') {
      results.push({
        test: 'Offline Service - Status Reporting',
        passed: true,
        message: `Offline ready: ${offlineStatus.isOfflineReady}, ${offlineStatus.cachedSubjects} subjects cached`,
        critical: false
      })
      score++
    } else {
      results.push({
        test: 'Offline Service - Status Reporting',
        passed: false,
        message: 'Invalid offline status format',
        critical: false
      })
    }
  } catch (error) {
    results.push({
      test: 'Offline Service - Status Reporting',
      passed: false,
      message: `Error: ${error}`,
      critical: false
    })
  }

  // Test 10: Data sanitization
  try {
    const testData = {
      profileId: 123,
      name: 'Test User',
      contentId: 456,
      timestamp: '2023-01-01'
    }
    
    const sanitized = dataPrivacyService.sanitizeForNetwork(testData)
    
    if (!sanitized.profileId && !sanitized.name && sanitized.contentId && sanitized.timestamp) {
      results.push({
        test: 'Data Privacy - Sanitization',
        passed: true,
        message: 'Personal data properly removed from network data',
        critical: true
      })
      score++
    } else {
      results.push({
        test: 'Data Privacy - Sanitization',
        passed: false,
        message: 'Personal data not properly sanitized',
        critical: true
      })
    }
  } catch (error) {
    results.push({
      test: 'Data Privacy - Sanitization',
      passed: false,
      message: `Error: ${error}`,
      critical: true
    })
  }

  const passed = results.filter(r => r.passed).length === results.length
  const criticalTests = results.filter(r => r.critical)
  const criticalPassed = criticalTests.filter(r => r.passed).length === criticalTests.length

  console.log(`✅ Offline verification completed: ${score}/${maxScore} tests passed`)
  
  return {
    passed: passed && criticalPassed,
    score,
    maxScore,
    results
  }
}

/**
 * Display verification results in console
 */
export function displayVerificationResults(result: OfflineVerificationResult): void {
  console.log('\n📊 OFFLINE CAPABILITIES VERIFICATION REPORT')
  console.log('=' .repeat(50))
  console.log(`Overall Score: ${result.score}/${result.maxScore} (${((result.score / result.maxScore) * 100).toFixed(1)}%)`)
  console.log(`Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log('')

  const criticalTests = result.results.filter(r => r.critical)
  const nonCriticalTests = result.results.filter(r => !r.critical)

  if (criticalTests.length > 0) {
    console.log('🔴 CRITICAL TESTS:')
    criticalTests.forEach(test => {
      const icon = test.passed ? '✅' : '❌'
      console.log(`  ${icon} ${test.test}: ${test.message}`)
    })
    console.log('')
  }

  if (nonCriticalTests.length > 0) {
    console.log('🟡 ADDITIONAL TESTS:')
    nonCriticalTests.forEach(test => {
      const icon = test.passed ? '✅' : '❌'
      console.log(`  ${icon} ${test.test}: ${test.message}`)
    })
    console.log('')
  }

  if (!result.passed) {
    const failedCritical = criticalTests.filter(t => !t.passed)
    if (failedCritical.length > 0) {
      console.log('⚠️  CRITICAL ISSUES DETECTED:')
      failedCritical.forEach(test => {
        console.log(`  - ${test.test}: ${test.message}`)
      })
      console.log('')
    }
  }

  console.log('📋 SUMMARY:')
  console.log(`  • All core features work offline: ${criticalTests.filter(t => t.passed).length === criticalTests.length ? 'YES' : 'NO'}`)
  console.log(`  • Data privacy compliant: ${result.results.find(r => r.test.includes('Privacy'))?.passed ? 'YES' : 'NO'}`)
  console.log(`  • Fallback mechanisms working: ${result.results.find(r => r.test.includes('Resilience'))?.passed ? 'YES' : 'NO'}`)
  console.log(`  • Content caching active: ${result.results.find(r => r.test.includes('Cache'))?.passed ? 'YES' : 'NO'}`)
}

/**
 * Quick verification for development
 */
export async function quickOfflineCheck(): Promise<boolean> {
  try {
    // Test basic offline functionality
    const subjects = await offlineService.getSubjects()
    const questions = await offlineService.getQuestions('Mathematics', 'KS1', undefined, 1)
    const privacyReport = await dataPrivacyService.generatePrivacyReport()
    
    const isWorking = Array.isArray(subjects) && 
                     Array.isArray(questions) && 
                     privacyReport.isCompliant

    console.log(`🔍 Quick offline check: ${isWorking ? '✅ WORKING' : '❌ ISSUES DETECTED'}`)
    
    return isWorking
  } catch (error) {
    console.error('❌ Quick offline check failed:', error)
    return false
  }
}

export default {
  verifyOfflineCapabilities,
  displayVerificationResults,
  quickOfflineCheck
}