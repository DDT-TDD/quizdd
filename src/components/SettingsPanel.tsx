import { useState, useEffect } from 'react'
import { useAppContext, appActions } from '../contexts/AppContext'
import { ParentalGate } from './ParentalGate'
import { settingsService, AppSettings } from '../services/settingsService'
import { useAudioService } from '../services/audioService'
import styles from './SettingsPanel.module.css'

// Extend window interface for parental callback
declare global {
  interface Window {
    pendingParentalCallback?: (() => void) | null
  }
}

// Use the AppSettings interface from the service
type SettingsData = AppSettings

export function SettingsPanel() {
  const { dispatch } = useAppContext()
  const [showParentalGate, setShowParentalGate] = useState(false)
  const [parentalAccess, setParentalAccess] = useState(false)
  const [settings, setSettings] = useState<SettingsData>(settingsService.getDefaultSettings())
  const audioService = useAudioService()

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await settingsService.loadSettings()
        setSettings(loadedSettings)
        
        // Apply settings to DOM and context
        dispatch(appActions.setTheme(loadedSettings.theme))
        settingsService.applySettings(loadedSettings)
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    loadSettings()
  }, [dispatch])

  // Save settings whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await settingsService.saveSettings(settings)
      } catch (error) {
        console.error('Failed to save settings:', error)
      }
    }

    // Only save if settings have been loaded (not initial default state)
    if (settings !== settingsService.getDefaultSettings()) {
      saveSettings()
    }
  }, [settings])

  // Settings application is now handled by the settings service

  const handleSettingChange = (key: keyof SettingsData, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      
      // Apply changes immediately for certain settings
      if (key === 'theme') {
        dispatch(appActions.setTheme(value))
      }
      
      // Apply all settings to DOM
      settingsService.applySettings(newSettings)
      
      return newSettings
    })
  }

  const requireParentalAccess = (callback: () => void) => {
    if (settings.parentalControlsEnabled && !parentalAccess) {
      // Check if there's already a valid parental session token
      const token = sessionStorage.getItem('parental_session_token')
      if (token) {
        setParentalAccess(true)
        callback()
      } else {
        setShowParentalGate(true)
        // Store the callback to execute after successful verification
        window.pendingParentalCallback = callback
      }
    } else {
      callback()
    }
  }

  // Listen for parental gate success
  useEffect(() => {
    const handleParentalSuccess = () => {
      setParentalAccess(true)
      setShowParentalGate(false)
      
      // Execute pending callback if any
      if (window.pendingParentalCallback) {
        window.pendingParentalCallback()
        window.pendingParentalCallback = null
      }
    }

    // Check for parental session token changes
    const checkParentalAccess = () => {
      const token = sessionStorage.getItem('parental_session_token')
      if (token && !parentalAccess) {
        handleParentalSuccess()
      }
    }

    // Check immediately and set up interval
    checkParentalAccess()
    const interval = setInterval(checkParentalAccess, 1000)

    return () => clearInterval(interval)
  }, [parentalAccess])

  const resetToDefaults = async () => {
    try {
      const defaultSettings = await settingsService.resetSettings()
      setSettings(defaultSettings)
      dispatch(appActions.setTheme(defaultSettings.theme))
      settingsService.applySettings(defaultSettings)
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
  }

  const handleBackToHome = () => {
    dispatch(appActions.setCurrentView('home'))
  }

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={handleBackToHome}
          aria-label="Back to home"
        >
          <span className={styles.backIcon}>←</span>
        </button>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.content}>
        {/* Access Info Banner */}
        {settings.parentalControlsEnabled && !parentalAccess && (
          <div className={styles.infoBanner}>
            <span className={styles.infoIcon}>ℹ️</span>
            <div className={styles.infoText}>
              <strong>Limited Access Mode</strong>
              <p>
                Some settings are protected by parental controls. 
                You can freely change: Theme, Font Size, Sound, and Animations.
                To modify protected settings (marked with 🔒), you'll need to solve a verification challenge.
              </p>
            </div>
          </div>
        )}
        
        {settings.parentalControlsEnabled && parentalAccess && (
          <div className={styles.successBanner}>
            <span className={styles.successIcon}>✅</span>
            <div className={styles.successText}>
              <strong>Full Access Granted</strong>
              <p>You can now modify all settings including parental controls.</p>
            </div>
          </div>
        )}

        {/* Theme Settings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Theme</h2>
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Choose Theme</label>
            <div className={styles.themeOptions}>
              {[
                { value: 'default', label: 'Default', preview: '#4A90E2' },
                { value: 'dark', label: 'Dark', preview: '#2D2D2D' },
                { value: 'high-contrast', label: 'High Contrast', preview: '#000000' }
              ].map(theme => (
                <button
                  key={theme.value}
                  className={`${styles.themeOption} ${settings.theme === theme.value ? styles.active : ''}`}
                  onClick={() => handleSettingChange('theme', theme.value)}
                >
                  <div 
                    className={styles.themePreview}
                    style={{ backgroundColor: theme.preview }}
                  />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Accessibility Settings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Accessibility</h2>
          
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>Font Size</label>
            <div className={styles.fontSizeOptions}>
              {[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'extra-large', label: 'Extra Large' }
              ].map(size => (
                <button
                  key={size.value}
                  className={`${styles.fontSizeOption} ${settings.fontSize === size.value ? styles.active : ''}`}
                  onClick={() => handleSettingChange('fontSize', size.value)}
                  style={{ fontSize: size.value === 'small' ? '14px' : size.value === 'large' ? '18px' : size.value === 'extra-large' ? '22px' : '16px' }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.toggleSetting}>
              <label className={styles.settingLabel}>High Contrast Mode</label>
              <button
                className={`${styles.toggle} ${settings.highContrastMode ? styles.toggleOn : ''}`}
                onClick={() => handleSettingChange('highContrastMode', !settings.highContrastMode)}
                aria-pressed={settings.highContrastMode}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
            <p className={styles.settingDescription}>
              Increases contrast for better visibility
            </p>
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.toggleSetting}>
              <label className={styles.settingLabel}>Reduce Motion</label>
              <button
                className={`${styles.toggle} ${settings.reducedMotion ? styles.toggleOn : ''}`}
                onClick={() => handleSettingChange('reducedMotion', !settings.reducedMotion)}
                aria-pressed={settings.reducedMotion}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
            <p className={styles.settingDescription}>
              Reduces animations and motion effects
            </p>
          </div>
        </section>

        {/* Audio & Visual Settings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Audio & Visual</h2>
          
          <div className={styles.settingGroup}>
            <div className={styles.toggleSetting}>
              <label className={styles.settingLabel}>Sound Effects</label>
              <button
                className={`${styles.toggle} ${settings.soundEnabled ? styles.toggleOn : ''}`}
                onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                aria-pressed={settings.soundEnabled}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
            <p className={styles.settingDescription}>
              Play sounds for correct answers and interactions
            </p>
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.toggleSetting}>
              <label className={styles.settingLabel}>Animations</label>
              <button
                className={`${styles.toggle} ${settings.animationsEnabled ? styles.toggleOn : ''}`}
                onClick={() => handleSettingChange('animationsEnabled', !settings.animationsEnabled)}
                aria-pressed={settings.animationsEnabled}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
            <p className={styles.settingDescription}>
              Show fun animations and visual effects
            </p>
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.toggleSetting}>
              <label className={styles.settingLabel}>Background Music</label>
              <button
                className={`${styles.toggle} ${audioService.settings.backgroundMusicEnabled ? styles.toggleOn : ''}`}
                onClick={() => audioService.toggleBackgroundMusic()}
                aria-pressed={audioService.settings.backgroundMusicEnabled}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
            <p className={styles.settingDescription}>
              Play gentle background music while learning
            </p>
          </div>

          {audioService.settings.backgroundMusicEnabled && (
            <>
              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>Music Volume</label>
                <div className={styles.volumeControl}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioService.settings.masterVolume}
                    onChange={(e) => audioService.setVolume(parseFloat(e.target.value))}
                    className={styles.volumeSlider}
                  />
                  <span className={styles.volumeValue}>
                    {Math.round(audioService.settings.masterVolume * 100)}%
                  </span>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>Music Track</label>
                <div className={styles.trackSelector}>
                  {audioService.tracks.map(track => (
                    <button
                      key={track.id}
                      className={`${styles.trackOption} ${audioService.settings.currentTrack === track.id ? styles.active : ''}`}
                      onClick={() => audioService.playBackgroundMusic(track.id)}
                      title={track.description}
                    >
                      <span className={styles.trackIcon}>🎵</span>
                      <span className={styles.trackName}>{track.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Parental Controls */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Parental Controls {settings.parentalControlsEnabled && !parentalAccess && '🔒'}</h2>
          
          <div className={styles.settingGroup}>
            <div className={styles.toggleSetting}>
              <label className={styles.settingLabel}>
                Enable Parental Controls {settings.parentalControlsEnabled && !parentalAccess && '🔒'}
              </label>
              <button
                className={`${styles.toggle} ${settings.parentalControlsEnabled ? styles.toggleOn : ''}`}
                onClick={() => requireParentalAccess(() => 
                  handleSettingChange('parentalControlsEnabled', !settings.parentalControlsEnabled)
                )}
                aria-pressed={settings.parentalControlsEnabled}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
            <p className={styles.settingDescription}>
              Require parental permission for sensitive settings
              {settings.parentalControlsEnabled && !parentalAccess && ' (Verification required to change)'}
            </p>
          </div>

          <div className={styles.settingGroup}>
            <div className={styles.toggleSetting}>
              <label className={styles.settingLabel}>
                Auto-Save Progress {settings.parentalControlsEnabled && !parentalAccess && '🔒'}
              </label>
              <button
                className={`${styles.toggle} ${settings.autoSave ? styles.toggleOn : ''}`}
                onClick={() => requireParentalAccess(() => 
                  handleSettingChange('autoSave', !settings.autoSave)
                )}
                aria-pressed={settings.autoSave}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
            <p className={styles.settingDescription}>
              Automatically save quiz progress and achievements
              {settings.parentalControlsEnabled && !parentalAccess && ' (Verification required to change)'}
            </p>
          </div>
        </section>

        {/* Reset Settings */}
        <section className={styles.section}>
          <div className={styles.resetSection}>
            <button
              className={styles.resetButton}
              onClick={() => requireParentalAccess(resetToDefaults)}
            >
              {settings.parentalControlsEnabled && !parentalAccess && '🔒 '}
              Reset to Defaults
            </button>
            <p className={styles.settingDescription}>
              Reset all settings to their default values
              {settings.parentalControlsEnabled && !parentalAccess && ' (Requires verification)'}
            </p>
          </div>
        </section>
      </div>

      {/* Parental Gate Modal */}
      {showParentalGate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <ParentalGate onClose={() => setShowParentalGate(false)} />
          </div>
        </div>
      )}
    </div>
  )
}