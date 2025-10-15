import React, { useState, useEffect } from 'react'

// Define Profile type locally to avoid import issues
interface Profile {
  id?: number
  name: string
  avatar: string
  created_at?: Date
  theme_preference: string
}

// Simple Tauri API wrapper with extensive debugging
const simpleTauriAPI = {
  async getProfiles(): Promise<Profile[]> {
    console.log('🔍 simpleTauriAPI: Starting getProfiles...')
    try {
      console.log('🔍 simpleTauriAPI: Checking Tauri environment...')
      
      // Check if we're in a Tauri environment
      if (typeof window === 'undefined' || !(window as any).__TAURI__) {
        throw new Error('Not running in Tauri environment')
      }
      
      console.log('🔍 simpleTauriAPI: Importing Tauri API...')
      
      // Try different import methods for Tauri v2
      let invoke = null;
      try {
        const coreApi = await import('@tauri-apps/api/core')
        if (coreApi.invoke) {
          invoke = coreApi.invoke;
          console.log('✅ Found invoke in @tauri-apps/api/core')
        }
      } catch (e) {
        console.log('❌ Failed to import from core:', e)
      }
      
      if (!invoke) {
        try {
          const mainApi = await import('@tauri-apps/api')
          if (mainApi.invoke) {
            invoke = mainApi.invoke;
            console.log('✅ Found invoke in @tauri-apps/api')
          }
        } catch (e) {
          console.log('❌ Failed to import from main api:', e)
        }
      }
      
      if (!invoke) {
        throw new Error('Tauri invoke function not available in any import')
      }
      
      console.log('✅ simpleTauriAPI: Tauri API imported successfully')
      
      console.log('🔍 simpleTauriAPI: Calling get_all_profiles command...')
      const result = await invoke('get_all_profiles')
      console.log('✅ simpleTauriAPI: get_all_profiles returned:', result)
      return result
    } catch (error) {
      console.error('❌ simpleTauriAPI: getProfiles failed:', error)
      console.error('❌ simpleTauriAPI: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        windowTauri: typeof window !== 'undefined' ? !!(window as any).__TAURI__ : false
      })
      throw error
    }
  },
  
  async createProfile(name: string, avatar: string): Promise<Profile> {
    console.log('🔍 simpleTauriAPI: Starting createProfile...', { name, avatar })
    try {
      // Check if we're in a Tauri environment
      if (typeof window === 'undefined' || !(window as any).__TAURI__) {
        throw new Error('Not running in Tauri environment')
      }
      
      // Try different import methods for Tauri v2
      let invoke = null;
      try {
        const coreApi = await import('@tauri-apps/api/core')
        if (coreApi.invoke) invoke = coreApi.invoke;
      } catch (e) {}
      
      if (!invoke) {
        try {
          const mainApi = await import('@tauri-apps/api')
          if (mainApi.invoke) invoke = mainApi.invoke;
        } catch (e) {}
      }
      
      if (!invoke) {
        throw new Error('Tauri invoke function not available')
      }
      
      const request = { name, avatar, theme_preference: 'default' }
      console.log('🔍 simpleTauriAPI: Calling create_profile command with:', request)
      const result = await invoke('create_profile', { request })
      console.log('✅ simpleTauriAPI: create_profile returned:', result)
      return result
    } catch (error) {
      console.error('❌ simpleTauriAPI: createProfile failed:', error)
      throw error
    }
  }
}

// Simple, minimal app to test profile functionality
export function SimpleApp() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileAvatar, setNewProfileAvatar] = useState('😊')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  console.log('🔍 SimpleApp: Component rendered, current state:', {
    profilesCount: profiles.length,
    currentProfile: currentProfile?.name,
    loading,
    error,
    showCreateForm
  })

  const avatarOptions = ['😊', '😄', '🤗', '😎', '🤓', '🥳', '🦄', '🐱', '🐶', '🐸']

  useEffect(() => {
    console.log('🔍 SimpleApp: useEffect triggered, starting initialization...')
    
    // Add a small delay to ensure Tauri is ready
    const initializeApp = async () => {
      try {
        console.log('🔍 SimpleApp: Waiting for Tauri to be ready...')
        setDebugInfo(prev => [...prev, 'Starting initialization...'])
        
        // Check if we're in Tauri environment
        console.log('🔍 SimpleApp: Checking environment details...')
        console.log('🔍 SimpleApp: window.__TAURI__:', typeof window !== 'undefined' ? !!(window as any).__TAURI__ : 'window undefined')
        console.log('🔍 SimpleApp: navigator.userAgent:', typeof navigator !== 'undefined' ? navigator.userAgent : 'navigator undefined')
        
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
          console.log('✅ SimpleApp: Tauri environment detected')
          setDebugInfo(prev => [...prev, '✅ Tauri environment detected'])
          
          // Try to access Tauri API
          try {
            const tauriApi = await import('@tauri-apps/api/core')
            console.log('✅ SimpleApp: Tauri API imported:', !!tauriApi.invoke)
            setDebugInfo(prev => [...prev, `✅ Tauri API available: ${!!tauriApi.invoke}`])
          } catch (apiError) {
            console.error('❌ SimpleApp: Failed to import Tauri API:', apiError)
            setDebugInfo(prev => [...prev, `❌ Tauri API import failed: ${apiError}`])
          }
        } else {
          console.log('⚠️ SimpleApp: Tauri environment not detected')
          setDebugInfo(prev => [...prev, '⚠️ Tauri environment not detected'])
          setDebugInfo(prev => [...prev, `Window: ${typeof window}, __TAURI__: ${typeof window !== 'undefined' ? typeof (window as any).__TAURI__ : 'N/A'}`])
        }
        
        // Wait a bit for Tauri to initialize
        console.log('🔍 SimpleApp: Waiting 2 seconds for Tauri initialization...')
        setDebugInfo(prev => [...prev, 'Waiting for Tauri initialization...'])
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Only try to load profiles if Tauri is available
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
          console.log('🔍 SimpleApp: Starting profile loading...')
          setDebugInfo(prev => [...prev, 'Starting profile loading...'])
          await loadProfiles()
        } else {
          console.log('⚠️ SimpleApp: Skipping profile loading - not in Tauri environment')
          setDebugInfo(prev => [...prev, '⚠️ Skipping profile loading - not in Tauri environment'])
          setError('This app needs to run in the Tauri desktop environment')
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ SimpleApp: Initialization failed:', error)
        setDebugInfo(prev => [...prev, `❌ Initialization failed: ${error}`])
        setError(`Initialization failed: ${error}`)
        setLoading(false)
      }
    }
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.error('❌ SimpleApp: Initialization timeout after 10 seconds')
      setDebugInfo(prev => [...prev, '❌ Initialization timeout after 10 seconds'])
      setError('Initialization timed out. Please check the console for details.')
      setLoading(false)
    }, 10000)
    
    initializeApp().finally(() => {
      clearTimeout(timeoutId)
    })
  }, [])

  const loadProfiles = async () => {
    try {
      console.log('🔍 SimpleApp: Starting loadProfiles function...')
      setDebugInfo(prev => [...prev, 'Starting loadProfiles function...'])
      setLoading(true)
      setError(null)
      
      console.log('🔍 SimpleApp: Calling simpleTauriAPI.getProfiles()...')
      setDebugInfo(prev => [...prev, 'Calling Tauri API getProfiles...'])
      const loadedProfiles = await simpleTauriAPI.getProfiles()
      console.log('✅ SimpleApp: Profiles loaded successfully:', loadedProfiles)
      console.log('✅ SimpleApp: Profile count:', loadedProfiles.length)
      setDebugInfo(prev => [...prev, `✅ Profiles loaded: ${loadedProfiles.length} found`])
      
      setProfiles(loadedProfiles)
      console.log('✅ SimpleApp: Profiles state updated')
      setDebugInfo(prev => [...prev, 'Profiles state updated'])
      
      if (loadedProfiles.length > 0 && !currentProfile) {
        console.log('🔍 SimpleApp: Setting first profile as current:', loadedProfiles[0])
        setCurrentProfile(loadedProfiles[0])
        console.log('✅ SimpleApp: Current profile set to:', loadedProfiles[0].name)
        setDebugInfo(prev => [...prev, `Current profile set: ${loadedProfiles[0].name}`])
      } else if (loadedProfiles.length === 0) {
        console.log('ℹ️ SimpleApp: No profiles found, user will need to create one')
        setDebugInfo(prev => [...prev, 'No profiles found - ready for creation'])
      }
      
      console.log('✅ SimpleApp: Profile loading completed successfully')
      setDebugInfo(prev => [...prev, '✅ Profile loading completed successfully'])
    } catch (err) {
      console.error('❌ SimpleApp: Failed to load profiles:', err)
      console.error('❌ SimpleApp: Error details:', err)
      setDebugInfo(prev => [...prev, `❌ Profile loading failed: ${err}`])
      setError(`Failed to load profiles: ${err}`)
    } finally {
      console.log('🔍 SimpleApp: Setting loading to false...')
      setDebugInfo(prev => [...prev, 'Setting loading to false...'])
      setLoading(false)
      console.log('✅ SimpleApp: Loading state updated to false')
    }
  }

  const createProfile = async () => {
    if (!newProfileName.trim()) return

    try {
      console.log('🔍 SimpleApp: Creating profile:', { name: newProfileName, avatar: newProfileAvatar })
      setLoading(true)
      setError(null)

      const newProfile = await simpleTauriAPI.createProfile(newProfileName.trim(), newProfileAvatar)
      console.log('✅ SimpleApp: Profile created:', newProfile)

      // Reload profiles
      await loadProfiles()
      
      // Select the new profile
      setCurrentProfile(newProfile)
      
      // Reset form
      setNewProfileName('')
      setNewProfileAvatar('😊')
      setShowCreateForm(false)
    } catch (err) {
      console.error('❌ SimpleApp: Failed to create profile:', err)
      setError(`Failed to create profile: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #4A90E2 0%, #F5A623 100%)',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '3em', margin: '0 0 20px 0' }}>🎯 QuiZDD</h1>
        <p style={{ fontSize: '1.2em' }}>Loading profiles...</p>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginTop: '20px'
        }}></div>
        
        {/* Debug Information */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          textAlign: 'left',
          maxWidth: '500px',
          fontSize: '0.9em'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Debug Information:</h3>
          {debugInfo.map((info, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>{info}</div>
          ))}
          {debugInfo.length === 0 && <div>No debug info yet...</div>}
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h1>Educational Quiz App</h1>
        <h2>⚠️ Initialization Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Restart App</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Educational Quiz App</h1>
      
      {/* Current Profile Display */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Current Profile</h2>
        {currentProfile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2em' }}>{currentProfile.avatar}</span>
            <div>
              <strong>{currentProfile.name}</strong>
              <br />
              <small>ID: {currentProfile.id}</small>
            </div>
          </div>
        ) : (
          <p>No profile selected</p>
        )}
      </div>

      {/* Profiles List */}
      <div style={{ marginBottom: '20px' }}>
        <h2>All Profiles ({profiles.length})</h2>
        {profiles.length === 0 ? (
          <p>No profiles found. Create your first profile below!</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {profiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  padding: '10px',
                  border: currentProfile?.id === profile.id ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onClick={() => setCurrentProfile(profile)}
              >
                <span style={{ fontSize: '1.5em' }}>{profile.avatar}</span>
                <div>
                  <strong>{profile.name}</strong>
                  {currentProfile?.id === profile.id && <span style={{ color: '#007bff' }}> ✓ Active</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Profile Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Create New Profile</h2>
        {!showCreateForm ? (
          <button onClick={() => setShowCreateForm(true)}>Add New Profile</button>
        ) : (
          <div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                Name:
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Enter name"
                  style={{ marginLeft: '10px', padding: '5px' }}
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Avatar:</label>
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setNewProfileAvatar(avatar)}
                    style={{
                      fontSize: '1.5em',
                      padding: '5px',
                      border: newProfileAvatar === avatar ? '2px solid #007bff' : '1px solid #ddd',
                      borderRadius: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <button onClick={createProfile} disabled={!newProfileName.trim()}>
                Create Profile
              </button>
              <button onClick={() => setShowCreateForm(false)} style={{ marginLeft: '10px' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Section */}
      {currentProfile && (
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Ready to Quiz!</h2>
          <p>Welcome, {currentProfile.name}! 🎉</p>
          <p>The quiz functionality will be available once profiles are working correctly.</p>
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>
            Start Quiz (Coming Soon)
          </button>
        </div>
      )}
    </div>
  )
}