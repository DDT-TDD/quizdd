/**
 * Security utilities for parental controls and input validation
 */

export interface ParentalGateProblem {
  question: string
  answer: number
  id: string
}

export class SecurityUtils {
  /**
   * Generate a random math problem for parental gate
   */
  static generateParentalGateProblem(): ParentalGateProblem {
    const operations = ['+', '-', '×']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    let num1: number, num2: number, answer: number, question: string
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1
        num2 = Math.floor(Math.random() * 20) + 1
        answer = num1 + num2
        question = `What is ${num1} + ${num2}?`
        break
      case '-':
        num1 = Math.floor(Math.random() * 30) + 10
        num2 = Math.floor(Math.random() * num1) + 1
        answer = num1 - num2
        question = `What is ${num1} - ${num2}?`
        break
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        answer = num1 * num2
        question = `What is ${num1} × ${num2}?`
        break
      default:
        num1 = 5
        num2 = 3
        answer = 8
        question = 'What is 5 + 3?'
    }
    
    return {
      question,
      answer,
      id: this.generateSecureId()
    }
  }

  /**
   * Validate parental gate answer
   */
  static validateParentalAnswer(userAnswer: string | number, correctAnswer?: number): boolean {
    if (correctAnswer === undefined) {
      // If no correct answer provided, assume it's a standalone validation
      return false
    }
    
    const numericAnswer = typeof userAnswer === 'string' ? parseInt(userAnswer, 10) : userAnswer
    
    if (isNaN(numericAnswer)) {
      return false
    }
    
    return numericAnswer === correctAnswer
  }

  /**
   * Sanitize user input to prevent XSS and other attacks
   */
  static sanitizeInput(input: string): string {
    if (!input) return ''
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
  }

  /**
   * Validate profile name according to security rules
   */
  static isValidProfileName(name: string): boolean {
    if (!name || typeof name !== 'string') return false
    
    const trimmed = name.trim()
    
    // Check length (2-50 characters)
    if (trimmed.length < 2 || trimmed.length > 50) return false
    
    // Check for valid characters (letters, numbers, spaces, hyphens)
    const validPattern = /^[a-zA-Z0-9\s\-]+$/
    if (!validPattern.test(trimmed)) return false
    
    // Check for consecutive spaces or special characters
    if (/\s{2,}/.test(trimmed) || /\-{2,}/.test(trimmed)) return false
    
    return true
  }

  /**
   * Generate a secure random ID
   */
  static generateSecureId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result + Date.now().toString(36)
  }

  /**
   * Hash sensitive data (simple implementation for client-side)
   */
  static async hashData(data: string): Promise<string> {
    if (!crypto.subtle) {
      // Fallback for environments without crypto.subtle
      return btoa(data).split('').reverse().join('')
    }
    
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Validate password strength (for admin features)
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0
    
    if (password.length >= 8) score += 1
    else feedback.push('Password must be at least 8 characters long')
    
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Password must contain lowercase letters')
    
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Password must contain uppercase letters')
    
    if (/\d/.test(password)) score += 1
    else feedback.push('Password must contain numbers')
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else feedback.push('Password must contain special characters')
    
    return {
      isValid: score >= 4,
      score,
      feedback
    }
  }

  /**
   * Rate limiting for security-sensitive operations
   */
  private static attemptCounts = new Map<string, { count: number; lastAttempt: number }>()
  
  static checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 300000): boolean {
    const now = Date.now()
    const attempts = this.attemptCounts.get(identifier)
    
    if (!attempts) {
      this.attemptCounts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // Reset if window has passed
    if (now - attempts.lastAttempt > windowMs) {
      this.attemptCounts.set(identifier, { count: 1, lastAttempt: now })
      return true
    }
    
    // Check if limit exceeded
    if (attempts.count >= maxAttempts) {
      return false
    }
    
    // Increment count
    attempts.count++
    attempts.lastAttempt = now
    
    return true
  }

  /**
   * Clear rate limit for an identifier
   */
  static clearRateLimit(identifier: string): void {
    this.attemptCounts.delete(identifier)
  }

  /**
   * Validate file upload security
   */
  static validateFileUpload(file: File, allowedTypes: string[], maxSizeMB: number): {
    isValid: boolean
    error?: string
  } {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`
      }
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      }
    }
    
    // Check file name
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      return {
        isValid: false,
        error: 'File name contains invalid characters'
      }
    }
    
    return { isValid: true }
  }
}