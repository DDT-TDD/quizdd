// @ts-nocheck
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { contentSeeder } from '../services/contentSeeder'

/**
 * Content Seeding Test Utility
 * 
 * This utility provides functions to test and validate the content seeding process.
 * It can be used during development to ensure the educational content is properly
 * loaded and structured.
 */

interface TestResult {
  success: boolean
  message: string
  data?: any
}

export class ContentSeedingTester {
  
  /**
   * Run comprehensive content seeding tests
   */
  async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = []

    console.log('🧪 Starting comprehensive content seeding tests...')

    // Test 1: Check if subjects exist
    results.push(await this.testSubjectsExist())

    // Test 2: Test content seeding
    results.push(await this.testContentSeeding())

    // Test 3: Validate question structure
    results.push(await this.testQuestionStructure())

    // Test 4: Test content statistics
    results.push(await this.testContentStatistics())

    // Test 5: Test subject distribution
    results.push(await this.testSubjectDistribution())

    // Test 6: Test question types
    results.push(await this.testQuestionTypes())

    // Test 7: Test key stage distribution
    results.push(await this.testKeyStageDistribution())

    console.log('✅ Content seeding tests completed!')
    return results
  }

  /**
   * Test if all required subjects exist
   */
  private async testSubjectsExist(): Promise<TestResult> {
    try {
      const subjects = await tauriAPI.getSubjects()
      const requiredSubjects = ['mathematics', 'geography', 'english', 'science', 'general_knowledge']
      
      const existingSubjectNames = subjects.map(s => s.name)
      const missingSubjects = requiredSubjects.filter(name => !existingSubjectNames.includes(name))

      if (missingSubjects.length > 0) {
        return {
          success: false,
          message: `Missing subjects: ${missingSubjects.join(', ')}`,
          data: { existing: existingSubjectNames, missing: missingSubjects }
        }
      }

      return {
        success: true,
        message: `All ${requiredSubjects.length} required subjects exist`,
        data: { subjects: existingSubjectNames }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to check subjects: ${error}`,
      }
    }
  }

  /**
   * Test the content seeding process
   */
  private async testContentSeeding(): Promise<TestResult> {
    try {
      // Check if content is already seeded
      const isSeeded = await contentSeeder.isContentSeeded()
      
      if (!isSeeded) {
        // Seed content
        await contentSeeder.seedAllContent()
      }

      // Verify seeding was successful
      const stats = await tauriAPI.getContentStatistics()
      
      if (stats.total_questions === 0) {
        return {
          success: false,
          message: 'Content seeding failed - no questions found after seeding'
        }
      }

      return {
        success: true,
        message: `Content seeding successful - ${stats.total_questions} questions loaded`,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        message: `Content seeding failed: ${error}`
      }
    }
  }

  /**
   * Test question structure and validity
   */
  private async testQuestionStructure(): Promise<TestResult> {
    try {
      const subjects = await tauriAPI.getSubjects()
      let totalQuestionsChecked = 0
      let validQuestions = 0

      for (const subject of subjects) {
        // Get questions for each key stage
        for (const keyStage of ['KS1', 'KS2']) {
          try {
            const questions = await tauriAPI.getQuestions(subject.name, keyStage, 10)
            
            for (const question of questions) {
              totalQuestionsChecked++
              
              // Validate question structure
              if (this.isValidQuestion(question)) {
                validQuestions++
              }
            }
          } catch (error) {
            console.warn(`Failed to get questions for ${subject.name} ${keyStage}:`, error)
          }
        }
      }

      const validationRate = totalQuestionsChecked > 0 ? (validQuestions / totalQuestionsChecked) * 100 : 0

      return {
        success: validationRate >= 90, // 90% or higher validation rate
        message: `Question validation: ${validQuestions}/${totalQuestionsChecked} valid (${validationRate.toFixed(1)}%)`,
        data: { totalChecked: totalQuestionsChecked, valid: validQuestions, rate: validationRate }
      }
    } catch (error) {
      return {
        success: false,
        message: `Question structure test failed: ${error}`
      }
    }
  }

  /**
   * Test content statistics
   */
  private async testContentStatistics(): Promise<TestResult> {
    try {
      const stats = await tauriAPI.getContentStatistics()
      
      const issues: string[] = []
      
      if (stats.total_questions < 50) {
        issues.push(`Low question count: ${stats.total_questions} (expected at least 50)`)
      }
      
      if (stats.total_subjects < 5) {
        issues.push(`Low subject count: ${stats.total_subjects} (expected at least 5)`)
      }

      if (Object.keys(stats.questions_by_subject).length !== stats.total_subjects) {
        issues.push('Mismatch between subject count and questions_by_subject data')
      }

      return {
        success: issues.length === 0,
        message: issues.length > 0 ? issues.join('; ') : 'Content statistics look good',
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        message: `Content statistics test failed: ${error}`
      }
    }
  }

  /**
   * Test subject distribution
   */
  private async testSubjectDistribution(): Promise<TestResult> {
    try {
      const stats = await tauriAPI.getContentStatistics()
      const subjectCounts = stats.questions_by_subject
      
      const subjectsWithNoQuestions = Object.entries(subjectCounts)
        .filter(([_, count]) => count === 0)
        .map(([subject, _]) => subject)

      const subjectsWithFewQuestions = Object.entries(subjectCounts)
        .filter(([_, count]) => count > 0 && count < 5)
        .map(([subject, count]) => `${subject} (${count})`)

      const issues: string[] = []
      
      if (subjectsWithNoQuestions.length > 0) {
        issues.push(`Subjects with no questions: ${subjectsWithNoQuestions.join(', ')}`)
      }
      
      if (subjectsWithFewQuestions.length > 0) {
        issues.push(`Subjects with few questions: ${subjectsWithFewQuestions.join(', ')}`)
      }

      return {
        success: issues.length === 0,
        message: issues.length > 0 ? issues.join('; ') : 'Subject distribution looks balanced',
        data: subjectCounts
      }
    } catch (error) {
      return {
        success: false,
        message: `Subject distribution test failed: ${error}`
      }
    }
  }

  /**
   * Test question types distribution
   */
  private async testQuestionTypes(): Promise<TestResult> {
    try {
      const subjects = await tauriAPI.getSubjects()
      const questionTypes = new Set<string>()
      let totalQuestions = 0

      for (const subject of subjects) {
        for (const keyStage of ['KS1', 'KS2']) {
          try {
            const questions = await tauriAPI.getQuestions(subject.name, keyStage, 50)
            
            for (const question of questions) {
              questionTypes.add(question.question_type)
              totalQuestions++
            }
          } catch (error) {
            // Continue with other subjects
          }
        }
      }

      const expectedTypes = ['multiple_choice', 'fill_blank', 'story_quiz']
      const missingTypes = expectedTypes.filter(type => !questionTypes.has(type))

      return {
        success: missingTypes.length === 0,
        message: missingTypes.length > 0 
          ? `Missing question types: ${missingTypes.join(', ')}` 
          : `All question types present: ${Array.from(questionTypes).join(', ')}`,
        data: { 
          found: Array.from(questionTypes), 
          missing: missingTypes,
          totalQuestions 
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Question types test failed: ${error}`
      }
    }
  }

  /**
   * Test key stage distribution
   */
  private async testKeyStageDistribution(): Promise<TestResult> {
    try {
      const subjects = await tauriAPI.getSubjects()
      const keyStageStats = { KS1: 0, KS2: 0 }

      for (const subject of subjects) {
        for (const keyStage of ['KS1', 'KS2'] as const) {
          try {
            const questions = await tauriAPI.getQuestions(subject.name, keyStage, 100)
            keyStageStats[keyStage] += questions.length
          } catch (error) {
            // Continue with other subjects
          }
        }
      }

      const total = keyStageStats.KS1 + keyStageStats.KS2
      const ks1Percentage = total > 0 ? (keyStageStats.KS1 / total) * 100 : 0
      const ks2Percentage = total > 0 ? (keyStageStats.KS2 / total) * 100 : 0

      // Check if distribution is reasonable (both key stages should have content)
      const isBalanced = ks1Percentage >= 20 && ks2Percentage >= 20

      return {
        success: isBalanced,
        message: `Key stage distribution - KS1: ${keyStageStats.KS1} (${ks1Percentage.toFixed(1)}%), KS2: ${keyStageStats.KS2} (${ks2Percentage.toFixed(1)}%)`,
        data: keyStageStats
      }
    } catch (error) {
      return {
        success: false,
        message: `Key stage distribution test failed: ${error}`
      }
    }
  }

  /**
   * Validate individual question structure
   */
  private isValidQuestion(question: any): boolean {
    // Check required fields
    if (!question.id || !question.subject_id || !question.key_stage || !question.question_type) {
      return false
    }

    // Check content structure
    if (!question.content || typeof question.content !== 'object') {
      return false
    }

    if (!question.content.text || typeof question.content.text !== 'string') {
      return false
    }

    // Check correct answer
    if (!question.correct_answer) {
      return false
    }

    // Validate based on question type
    switch (question.question_type) {
      case 'multiple_choice':
        return Array.isArray(question.content.options) && question.content.options.length >= 2
      
      case 'fill_blank':
        return Array.isArray(question.content.blanks) && question.content.blanks.length > 0
      
      case 'story_quiz':
        return typeof question.content.story === 'string' && question.content.story.length > 0
      
      default:
        return true // Other types are valid by default
    }
  }

  /**
   * Generate a test report
   */
  generateReport(results: TestResult[]): string {
    const passed = results.filter(r => r.success).length
    const total = results.length
    
    let report = `📊 Content Seeding Test Report\n`
    report += `${'='.repeat(40)}\n\n`
    report += `Overall: ${passed}/${total} tests passed\n\n`
    
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌'
      report += `${index + 1}. ${status} ${result.message}\n`
      
      if (result.data) {
        report += `   Data: ${JSON.stringify(result.data, null, 2).replace(/\n/g, '\n   ')}\n`
      }
      report += '\n'
    })
    
    return report
  }
}

// Export singleton instance
export const contentSeedingTester = new ContentSeedingTester()

export default contentSeedingTester