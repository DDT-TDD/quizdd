import { describe, it, expect } from 'vitest'
import { SecurityUtils } from '../security'

describe('SecurityUtils', () => {
  describe('generateParentalGateProblem', () => {
    it('generates a valid math problem', () => {
      const problem = SecurityUtils.generateParentalGateProblem()
      
      expect(problem.question).toMatch(/What is \d+ \+ \d+\?/)
      expect(typeof problem.answer).toBe('number')
      expect(problem.answer).toBeGreaterThan(0)
      expect(problem.answer).toBeLessThan(20) // Based on implementation
    })

    it('generates different problems on multiple calls', () => {
      const problem1 = SecurityUtils.generateParentalGateProblem()
      const problem2 = SecurityUtils.generateParentalGateProblem()
      
      // Very unlikely to be the same (but possible)
      expect(problem1.question !== problem2.question || problem1.answer !== problem2.answer).toBe(true)
    })
  })

  describe('validateParentalAnswer', () => {
    it('returns true for correct answer', () => {
      const problem = SecurityUtils.generateParentalGateProblem()
      const isValid = SecurityUtils.validateParentalAnswer(problem.answer.toString(), problem.answer)
      
      expect(isValid).toBe(true)
    })

    it('returns false for incorrect answer', () => {
      const problem = SecurityUtils.generateParentalGateProblem()
      const wrongAnswer = problem.answer + 1
      const isValid = SecurityUtils.validateParentalAnswer(wrongAnswer.toString(), problem.answer)
      
      expect(isValid).toBe(false)
    })

    it('handles non-numeric input', () => {
      const isValid = SecurityUtils.validateParentalAnswer('abc', 5)
      expect(isValid).toBe(false)
    })

    it('handles empty input', () => {
      const isValid = SecurityUtils.validateParentalAnswer('', 5)
      expect(isValid).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const sanitized = SecurityUtils.sanitizeInput(input)
      
      expect(sanitized).toBe('Hello')
      expect(sanitized).not.toContain('<script>')
    })

    it('trims whitespace', () => {
      const input = '  Hello World  '
      const sanitized = SecurityUtils.sanitizeInput(input)
      
      expect(sanitized).toBe('Hello World')
    })

    it('handles empty input', () => {
      const sanitized = SecurityUtils.sanitizeInput('')
      expect(sanitized).toBe('')
    })
  })

  describe('isValidProfileName', () => {
    it('accepts valid names', () => {
      expect(SecurityUtils.isValidProfileName('John')).toBe(true)
      expect(SecurityUtils.isValidProfileName('Mary Jane')).toBe(true)
      expect(SecurityUtils.isValidProfileName('Alex123')).toBe(true)
    })

    it('rejects invalid names', () => {
      expect(SecurityUtils.isValidProfileName('')).toBe(false)
      expect(SecurityUtils.isValidProfileName('A')).toBe(false) // Too short
      expect(SecurityUtils.isValidProfileName('A'.repeat(51))).toBe(false) // Too long
      expect(SecurityUtils.isValidProfileName('<script>')).toBe(false) // Contains HTML
    })
  })

  describe('generateSecureId', () => {
    it('generates a string ID', () => {
      const id = SecurityUtils.generateSecureId()
      
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('generates unique IDs', () => {
      const id1 = SecurityUtils.generateSecureId()
      const id2 = SecurityUtils.generateSecureId()
      
      expect(id1).not.toBe(id2)
    })
  })
})