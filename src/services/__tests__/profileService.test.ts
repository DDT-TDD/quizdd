import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfileService } from '../profileService'
import { mockTauriApi, mockProfile, mockProgress } from '../../test/mocks'

// Mock Tauri API
vi.mock('../../api/tauri', () => ({
  tauriApi: mockTauriApi,
}))

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createProfile', () => {
    it('creates a new profile', async () => {
      const profileData = {
        name: 'New Child',
        avatar: 'avatar2',
        theme_preference: 'dark'
      }
      
      mockTauriApi.createProfile.mockResolvedValue({ ...mockProfile, ...profileData })
      
      const profile = await ProfileService.createProfile(profileData)
      
      expect(mockTauriApi.createProfile).toHaveBeenCalledWith(profileData)
      expect(profile.name).toBe('New Child')
    })

    it('validates profile name', async () => {
      await expect(
        ProfileService.createProfile({
          name: '',
          avatar: 'avatar1',
          theme_preference: 'default'
        })
      ).rejects.toThrow('Profile name is required')
    })

    it('validates avatar selection', async () => {
      await expect(
        ProfileService.createProfile({
          name: 'Test Child',
          avatar: '',
          theme_preference: 'default'
        })
      ).rejects.toThrow('Avatar is required')
    })
  })

  describe('getAllProfiles', () => {
    it('fetches all profiles', async () => {
      mockTauriApi.getAllProfiles.mockResolvedValue([mockProfile])
      
      const profiles = await ProfileService.getAllProfiles()
      
      expect(mockTauriApi.getAllProfiles).toHaveBeenCalled()
      expect(profiles).toEqual([mockProfile])
    })

    it('handles empty profile list', async () => {
      mockTauriApi.getAllProfiles.mockResolvedValue([])
      
      const profiles = await ProfileService.getAllProfiles()
      
      expect(profiles).toEqual([])
    })
  })

  describe('getProfileById', () => {
    it('fetches profile by ID', async () => {
      mockTauriApi.getProfileById.mockResolvedValue(mockProfile)
      
      const profile = await ProfileService.getProfileById(1)
      
      expect(mockTauriApi.getProfileById).toHaveBeenCalledWith(1)
      expect(profile).toEqual(mockProfile)
    })

    it('validates profile ID', async () => {
      await expect(
        ProfileService.getProfileById(0)
      ).rejects.toThrow('Invalid profile ID')
    })
  })

  describe('updateProfile', () => {
    it('updates profile successfully', async () => {
      const updates = { name: 'Updated Name' }
      const updatedProfile = { ...mockProfile, ...updates }
      
      mockTauriApi.updateProfile.mockResolvedValue(updatedProfile)
      
      const profile = await ProfileService.updateProfile(1, updates)
      
      expect(mockTauriApi.updateProfile).toHaveBeenCalledWith(1, updates)
      expect(profile.name).toBe('Updated Name')
    })

    it('validates update data', async () => {
      await expect(
        ProfileService.updateProfile(1, { name: '' })
      ).rejects.toThrow('Profile name cannot be empty')
    })
  })

  describe('deleteProfile', () => {
    it('deletes profile successfully', async () => {
      mockTauriApi.deleteProfile.mockResolvedValue(undefined)
      
      await ProfileService.deleteProfile(1)
      
      expect(mockTauriApi.deleteProfile).toHaveBeenCalledWith(1)
    })

    it('validates profile ID for deletion', async () => {
      await expect(
        ProfileService.deleteProfile(0)
      ).rejects.toThrow('Invalid profile ID')
    })
  })

  describe('getProgress', () => {
    it('fetches profile progress', async () => {
      mockTauriApi.getProgress.mockResolvedValue(mockProgress)
      
      const progress = await ProfileService.getProgress(1)
      
      expect(mockTauriApi.getProgress).toHaveBeenCalledWith(1)
      expect(progress).toEqual(mockProgress)
    })

    it('handles missing progress data', async () => {
      mockTauriApi.getProgress.mockResolvedValue(null)
      
      const progress = await ProfileService.getProgress(1)
      
      expect(progress).toBeNull()
    })
  })

  describe('updateProgress', () => {
    it('updates progress successfully', async () => {
      const quizResult = {
        subject: 'Mathematics',
        key_stage: 'KS1' as const,
        questions_answered: 5,
        correct_answers: 4,
        time_spent_seconds: 120
      }
      
      mockTauriApi.updateProgress.mockResolvedValue(undefined)
      
      await ProfileService.updateProgress(1, quizResult)
      
      expect(mockTauriApi.updateProgress).toHaveBeenCalledWith(1, quizResult)
    })

    it('validates quiz result data', async () => {
      await expect(
        ProfileService.updateProgress(1, {
          subject: '',
          key_stage: 'KS1',
          questions_answered: 0,
          correct_answers: 0,
          time_spent_seconds: 0
        })
      ).rejects.toThrow('Subject is required')
    })
  })
})