import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import { Profile, CreateProfileRequest, ProfileUpdateRequest, Progress, QuizResult } from '../types/api'

export class ProfileService {
  static async createProfile(profileData: CreateProfileRequest): Promise<Profile> {
    if (!profileData.name.trim()) {
      throw new Error('Profile name is required')
    }
    
    if (!profileData.avatar.trim()) {
      throw new Error('Avatar is required')
    }
    
    return await tauriAPI.createProfile(profileData)
  }

  static async getAllProfiles(): Promise<Profile[]> {
    return await tauriAPI.getAllProfiles()
  }

  static async getProfileById(profileId: number): Promise<Profile> {
    if (profileId <= 0) {
      throw new Error('Invalid profile ID')
    }
    
    return await tauriAPI.getProfileById(profileId)
  }

  static async updateProfile(profileId: number, updates: ProfileUpdateRequest): Promise<Profile> {
    if (profileId <= 0) {
      throw new Error('Invalid profile ID')
    }
    
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error('Profile name cannot be empty')
    }
    
    return await tauriAPI.updateProfile(profileId, updates)
  }

  static async deleteProfile(profileId: number): Promise<void> {
    if (profileId <= 0) {
      throw new Error('Invalid profile ID')
    }
    
    return await tauriAPI.deleteProfile(profileId)
  }

  static async getProgress(profileId: number): Promise<Progress | null> {
    if (profileId <= 0) {
      throw new Error('Invalid profile ID')
    }
    
    return await tauriAPI.getProgress(profileId)
  }

  static async updateProgress(profileId: number, quizResult: QuizResult): Promise<void> {
    if (profileId <= 0) {
      throw new Error('Invalid profile ID')
    }
    
    if (!quizResult.subject.trim()) {
      throw new Error('Subject is required')
    }
    
    return await tauriAPI.updateProgress(profileId, quizResult)
  }
}