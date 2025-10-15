/**
 * Audio Service for managing background music and sound effects
 * Provides kid-friendly, non-intrusive background music options
 */

import React from 'react'

export interface AudioTrack {
  id: string
  name: string
  file: string
  description: string
  volume: number
}

export interface AudioSettings {
  backgroundMusicEnabled: boolean
  soundEffectsEnabled: boolean
  masterVolume: number
  currentTrack: string | null
}

class AudioService {
  private audio: HTMLAudioElement | null = null
  private settings: AudioSettings = {
    backgroundMusicEnabled: true,
    soundEffectsEnabled: true,
    masterVolume: 0.3, // 30% volume by default
    currentTrack: null
  }

  // Kid-friendly background music tracks from freepd.com
  private tracks: AudioTrack[] = [
    {
      id: 'natural-vibes',
      name: 'Natural Vibes',
      file: '/audio/Natural Vibes.mp3',
      description: 'Relaxing natural sounds perfect for concentration',
      volume: 0.25
    },
    {
      id: 'funshine',
      name: 'Funshine',
      file: '/audio/Funshine.mp3', 
      description: 'Bright and cheerful melody to keep spirits up',
      volume: 0.3
    },
    {
      id: 'pickled-pink',
      name: 'Pickled Pink',
      file: '/audio/Pickled Pink.mp3',
      description: 'Playful and upbeat tune for positive energy',
      volume: 0.3
    },
    {
      id: 'city-sunshine',
      name: 'City Sunshine',
      file: '/audio/City Sunshine.mp3',
      description: 'Urban-inspired uplifting background music',
      volume: 0.25
    },
    {
      id: 'motions',
      name: 'Motions',
      file: '/audio/Motions.mp3',
      description: 'Dynamic and engaging instrumental track',
      volume: 0.3
    },
    {
      id: 'happy-whistling-ukulele',
      name: 'Happy Whistling Ukulele',
      file: '/audio/Happy Whistling Ukulele.mp3',
      description: 'Cheerful ukulele with whistling melody',
      volume: 0.25
    },
    {
      id: 'ukulele-song',
      name: 'Ukulele Song',
      file: '/audio/Ukulele Song.mp3',
      description: 'Simple and pleasant ukulele composition',
      volume: 0.25
    },
    {
      id: 'inspiration',
      name: 'Inspiration',
      file: '/audio/Inspiration.mp3',
      description: 'Motivational and uplifting background music',
      volume: 0.3
    }
  ]

  constructor() {
    this.loadSettings()
    this.initializeAudio()
  }

  /**
   * Initialize audio system
   */
  private initializeAudio(): void {
    try {
      // Create audio element
      this.audio = new Audio()
      this.audio.loop = true
      this.audio.preload = 'metadata'
      
      // Set initial volume
      this.audio.volume = this.settings.masterVolume

      // Handle audio events with robust error handling
      this.audio.addEventListener('error', () => {
        // Silently handle missing audio files - don't crash the app
        if (this.audio) {
          this.audio.src = ''
        }
        console.log('Audio file not found - continuing without background music')
      })

      this.audio.addEventListener('canplaythrough', () => {
        // Audio loaded successfully - no logging needed
      })

      // Add additional error handling for network issues
      this.audio.addEventListener('stalled', () => {
        // Silently handle stalled audio - don't disable the setting
      })

      this.audio.addEventListener('suspend', () => {
        // Silently handle suspended audio - don't disable the setting
      })
    } catch (error) {
      console.warn('Failed to initialize audio system:', error)
      this.audio = null
      this.settings.backgroundMusicEnabled = false
      this.saveSettings()
    }
  }

  /**
   * Get available music tracks
   */
  getTracks(): AudioTrack[] {
    return [...this.tracks]
  }

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    this.applySettings()
  }

  /**
   * Play background music
   */
  async playBackgroundMusic(trackId?: string): Promise<void> {
    if (!this.settings.backgroundMusicEnabled || !this.audio) return

    try {
      // Use provided track or current track or first available
      const targetTrackId = trackId || this.settings.currentTrack || this.tracks[0]?.id
      if (!targetTrackId) return

      const track = this.tracks.find(t => t.id === targetTrackId)
      if (!track) return

      // Stop current audio
      this.stopBackgroundMusic()

      // Set new track with error handling
      this.audio.src = track.file
      this.audio.volume = this.settings.masterVolume * track.volume
      this.settings.currentTrack = trackId || targetTrackId
      
      // Play audio with comprehensive error handling
      await this.audio.play()
      console.log(`Playing background music: ${track.name}`)
      
      this.saveSettings()
    } catch (error) {
      console.warn('Failed to play background music:', error)
      
      // Graceful fallback: don't disable the setting, just clear the source
      if (error instanceof Error && (
        error.name === 'NotSupportedError' || 
        error.name === 'NotAllowedError' ||
        error.message.includes('network') ||
        error.message.includes('404')
      )) {
        // Clear audio source to prevent further errors, but keep the setting enabled
        if (this.audio) {
          this.audio.src = ''
        }
      }
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  /**
   * Pause background music
   */
  pauseBackgroundMusic(): void {
    if (this.audio) {
      this.audio.pause()
    }
  }

  /**
   * Resume background music
   */
  resumeBackgroundMusic(): void {
    if (this.audio && this.settings.backgroundMusicEnabled) {
      this.audio.play().catch(e => {
        console.warn('Failed to resume audio:', e)
        // Don't crash the app - just disable background music
        this.settings.backgroundMusicEnabled = false
        this.saveSettings()
      })
    }
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.settings.masterVolume = clampedVolume
    
    if (this.audio && this.settings.currentTrack) {
      const track = this.tracks.find(t => t.id === this.settings.currentTrack)
      if (track) {
        this.audio.volume = clampedVolume * track.volume
      }
    }
    
    this.saveSettings()
  }

  /**
   * Toggle background music on/off
   */
  toggleBackgroundMusic(): void {
    console.log('🎵 AUDIO: Toggle called, current state:', this.settings.backgroundMusicEnabled)
    this.settings.backgroundMusicEnabled = !this.settings.backgroundMusicEnabled
    console.log('🎵 AUDIO: New state:', this.settings.backgroundMusicEnabled)
    
    if (this.settings.backgroundMusicEnabled) {
      this.playBackgroundMusic()
    } else {
      this.stopBackgroundMusic()
    }
    
    this.saveSettings()
  }

  /**
   * Apply current settings to audio
   */
  private applySettings(): void {
    if (!this.audio) return

    try {
      if (this.settings.backgroundMusicEnabled && this.settings.currentTrack) {
        this.playBackgroundMusic(this.settings.currentTrack).catch(e => {
          console.warn('Failed to apply audio settings:', e)
          // Don't crash - just disable background music
          this.settings.backgroundMusicEnabled = false
          this.saveSettings()
        })
      } else {
        this.stopBackgroundMusic()
      }
    } catch (error) {
      console.warn('Error applying audio settings:', error)
      this.settings.backgroundMusicEnabled = false
      this.saveSettings()
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('quizdd-audio-settings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error)
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('quizdd-audio-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Failed to save audio settings:', error)
    }
  }

  /**
   * Cleanup audio resources
   */
  cleanup(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
      this.audio = null
    }
  }
}

// Singleton instance
export const audioService = new AudioService()

// React hook for using audio service
export function useAudioService() {
  const [settings, setSettings] = React.useState(audioService.getSettings())

  React.useEffect(() => {
    // Update settings when they change
    const updateSettings = () => {
      setSettings(audioService.getSettings())
    }

    // Listen for settings changes (simple polling approach)
    const interval = setInterval(updateSettings, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    settings,
    tracks: audioService.getTracks(),
    playBackgroundMusic: (trackId?: string) => audioService.playBackgroundMusic(trackId),
    stopBackgroundMusic: () => audioService.stopBackgroundMusic(),
    pauseBackgroundMusic: () => audioService.pauseBackgroundMusic(),
    resumeBackgroundMusic: () => audioService.resumeBackgroundMusic(),
    setVolume: (volume: number) => audioService.setVolume(volume),
    toggleBackgroundMusic: () => audioService.toggleBackgroundMusic(),
    updateSettings: (newSettings: Partial<AudioSettings>) => audioService.updateSettings(newSettings)
  }
}

export default audioService