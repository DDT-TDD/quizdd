import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'

export interface AppSettings {
  theme: 'default' | 'dark' | 'high-contrast'
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  soundEnabled: boolean
  animationsEnabled: boolean
  highContrastMode: boolean
  reducedMotion: boolean
  autoSave: boolean
  parentalControlsEnabled: boolean
}

export interface BackendSettings {
  theme: string
  font_size: string
  sound_enabled: boolean
  animations_enabled: boolean
  high_contrast_mode: boolean
  reduced_motion: boolean
  auto_save: boolean
  parental_controls_enabled: boolean
}

/**
 * Settings service for managing application settings
 * Handles synchronization between frontend state and backend storage
 */
export class SettingsService {
  private static instance: SettingsService
  private listeners: Set<(settings: AppSettings) => void> = new Set()

  private constructor() {}

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  /**
   * Load settings from backend
   */
  async loadSettings(): Promise<AppSettings> {
    try {
      const backendSettings: BackendSettings = await tauriAPI.loadSettings()
      return this.mapBackendToFrontend(backendSettings)
    } catch (error) {
      console.error('Failed to load settings from backend:', error)
      
      // Fall back to localStorage
      const localSettings = localStorage.getItem('quiz-app-settings')
      if (localSettings) {
        try {
          return JSON.parse(localSettings)
        } catch (parseError) {
          console.error('Failed to parse local settings:', parseError)
        }
      }
      
      // Return default settings if all else fails
      return this.getDefaultSettings()
    }
  }

  /**
   * Save settings to backend
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const backendSettings = this.mapFrontendToBackend(settings)
      await tauriAPI.saveSettings(backendSettings)
      
      // Also save to localStorage as backup
      localStorage.setItem('quiz-app-settings', JSON.stringify(settings))
      
      // Notify listeners
      this.notifyListeners(settings)
    } catch (error) {
      console.error('Failed to save settings to backend:', error)
      
      // Fall back to localStorage only
      localStorage.setItem('quiz-app-settings', JSON.stringify(settings))
      this.notifyListeners(settings)
      
      throw error
    }
  }

  /**
   * Update a specific setting
   */
  async updateSetting(key: keyof AppSettings, value: any): Promise<AppSettings> {
    try {
      const currentSettings = await this.loadSettings()
      const updatedSettings = { ...currentSettings, [key]: value }
      await this.saveSettings(updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error('Failed to update setting:', error)
      throw error
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<AppSettings> {
    try {
      const backendSettings: BackendSettings = await tauriAPI.resetSettings()
      const frontendSettings = this.mapBackendToFrontend(backendSettings)
      
      // Notify listeners
      this.notifyListeners(frontendSettings)
      
      return frontendSettings
    } catch (error) {
      console.error('Failed to reset settings:', error)
      
      // Fall back to local reset
      const defaultSettings = this.getDefaultSettings()
      localStorage.setItem('quiz-app-settings', JSON.stringify(defaultSettings))
      this.notifyListeners(defaultSettings)
      
      return defaultSettings
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings(): AppSettings {
    return {
      theme: 'default',
      fontSize: 'medium',
      soundEnabled: true,
      animationsEnabled: true,
      highContrastMode: false,
      reducedMotion: false,
      autoSave: true,
      parentalControlsEnabled: true
    }
  }

  /**
   * Apply settings to the DOM
   */
  applySettings(settings: AppSettings): void {
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.theme)
    
    // Apply font size
    const sizeMap = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '22px'
    }
    document.documentElement.style.setProperty('--font-size-base', sizeMap[settings.fontSize])
    
    // Apply accessibility settings
    if (settings.highContrastMode) {
      document.documentElement.setAttribute('data-high-contrast', 'true')
    } else {
      document.documentElement.removeAttribute('data-high-contrast')
    }
    
    if (settings.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true')
    } else {
      document.documentElement.removeAttribute('data-reduced-motion')
    }
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Check if parental controls are enabled
   */
  async isParentalControlsEnabled(): Promise<boolean> {
    const settings = await this.loadSettings()
    return settings.parentalControlsEnabled
  }

  /**
   * Check if sound is enabled
   */
  async isSoundEnabled(): Promise<boolean> {
    const settings = await this.loadSettings()
    return settings.soundEnabled
  }

  /**
   * Check if animations are enabled
   */
  async isAnimationsEnabled(): Promise<boolean> {
    const settings = await this.loadSettings()
    return settings.animationsEnabled && !settings.reducedMotion
  }

  private mapBackendToFrontend(backendSettings: BackendSettings): AppSettings {
    return {
      theme: backendSettings.theme as 'default' | 'dark' | 'high-contrast',
      fontSize: backendSettings.font_size as 'small' | 'medium' | 'large' | 'extra-large',
      soundEnabled: backendSettings.sound_enabled,
      animationsEnabled: backendSettings.animations_enabled,
      highContrastMode: backendSettings.high_contrast_mode,
      reducedMotion: backendSettings.reduced_motion,
      autoSave: backendSettings.auto_save,
      parentalControlsEnabled: backendSettings.parental_controls_enabled
    }
  }

  private mapFrontendToBackend(frontendSettings: AppSettings): BackendSettings {
    return {
      theme: frontendSettings.theme,
      font_size: frontendSettings.fontSize,
      sound_enabled: frontendSettings.soundEnabled,
      animations_enabled: frontendSettings.animationsEnabled,
      high_contrast_mode: frontendSettings.highContrastMode,
      reduced_motion: frontendSettings.reducedMotion,
      auto_save: frontendSettings.autoSave,
      parental_controls_enabled: frontendSettings.parentalControlsEnabled
    }
  }

  private notifyListeners(settings: AppSettings): void {
    this.listeners.forEach(listener => {
      try {
        listener(settings)
      } catch (error) {
        console.error('Error in settings listener:', error)
      }
    })
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance()

// Export utility functions
export const applySettingsToDOM = (settings: AppSettings) => {
  settingsService.applySettings(settings)
}

export const loadAndApplySettings = async () => {
  try {
    const settings = await settingsService.loadSettings()
    settingsService.applySettings(settings)
    return settings
  } catch (error) {
    console.error('Failed to load and apply settings:', error)
    const defaultSettings = settingsService.getDefaultSettings()
    settingsService.applySettings(defaultSettings)
    return defaultSettings
  }
}