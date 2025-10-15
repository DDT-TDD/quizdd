import React, { useState, useEffect } from 'react'
import { useAppContext, appActions } from '../contexts/AppContext'
import { Profile } from '../types/api'
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import styles from './UserProfileSelector.module.css'

interface ProfileCardProps {
  profile: Profile
  isSelected: boolean
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

function ProfileCard({ profile, isSelected, onClick, onEdit, onDelete, showActions = false }: ProfileCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div className={`${styles.profileCard} ${isSelected ? styles.selected : ''}`}>
      <button
        className={styles.profileButton}
        onClick={onClick}
        aria-label={`Select profile ${profile.name}`}
      >
        <div className={styles.avatar}>
          <span className={styles.avatarEmoji} role="img" aria-hidden="true">
            {profile.avatar}
          </span>
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{profile.name}</span>
          {isSelected && (
            <span className={styles.selectedIndicator}>
              ✓ Active
            </span>
          )}
        </div>
      </button>
      
      {showActions && (
        <div className={styles.profileActions}>
          <button
            className={styles.actionButton}
            onClick={handleEdit}
            aria-label={`Edit profile ${profile.name}`}
            title="Edit Profile"
          >
            ✏️
          </button>
          <button
            className={styles.actionButton}
            onClick={handleDelete}
            aria-label={`Delete profile ${profile.name}`}
            title="Delete Profile"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

interface CreateProfileFormProps {
  onSubmit: (name: string, avatar: string) => void
  onCancel: () => void
  initialName?: string
  initialAvatar?: string
  isEditing?: boolean
}

function CreateProfileForm({ 
  onSubmit, 
  onCancel, 
  initialName = '', 
  initialAvatar = '😊',
  isEditing = false 
}: CreateProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar)
  
  const avatarOptions = [
    '😊', '😄', '🤗', '😎', '🤓', '🥳', 
    '🦄', '🐱', '🐶', '🐸', '🦊', '🐼',
    '🌟', '🎈', '🎨', '🚀', '⚡', '🌈'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), selectedAvatar)
    }
  }

  return (
    <div className={styles.createProfileForm}>
      <h3 className={styles.formTitle}>
        {isEditing ? 'Edit Profile' : 'Create New Profile'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="profileName" className={styles.label}>
            What's your name?
          </label>
          <input
            id="profileName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.nameInput}
            placeholder="Enter your name"
            maxLength={20}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Choose your avatar:</label>
          <div className={styles.avatarGrid}>
            {avatarOptions.map((avatar) => (
              <button
                key={avatar}
                type="button"
                className={`${styles.avatarOption} ${selectedAvatar === avatar ? styles.selectedAvatar : ''}`}
                onClick={() => setSelectedAvatar(avatar)}
                aria-label={`Select avatar ${avatar}`}
              >
                <span role="img" aria-hidden="true">{avatar}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.createButton}
            disabled={!name.trim()}
          >
            {isEditing ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function UserProfileSelector() {
  const { state, dispatch } = useAppContext()
  const { currentProfile, profiles } = state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showManageMode, setShowManageMode] = useState(false)

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      console.log('🔍 UserProfileSelector: Starting to load profiles...')
      setIsLoading(true)
      const loadedProfiles = await tauriAPI.getProfiles()
      console.log('✅ UserProfileSelector: Loaded profiles:', loadedProfiles)
      dispatch(appActions.setProfiles(loadedProfiles))
      
      // If no current profile but profiles exist, select the first one
      if (!currentProfile && loadedProfiles.length > 0) {
        console.log('🔍 UserProfileSelector: Setting first profile as current:', loadedProfiles[0])
        dispatch(appActions.setCurrentProfile(loadedProfiles[0]))
      }
    } catch (error) {
      console.error('❌ UserProfileSelector: Failed to load profiles:', error)
      dispatch(appActions.setError('Failed to load profiles'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileSelect = (profile: Profile) => {
    dispatch(appActions.setCurrentProfile(profile))
    setIsDropdownOpen(false)
  }

  const handleCreateProfile = async (name: string, avatar: string) => {
    try {
      console.log('🔍 UserProfileSelector: Creating profile:', { name, avatar })
      setIsLoading(true)
      const newProfile = await tauriAPI.createProfile(name, avatar)
      console.log('✅ UserProfileSelector: Profile created:', newProfile)
      
      // Reload profiles to get the updated list
      await loadProfiles()
      
      // Select the new profile
      dispatch(appActions.setCurrentProfile(newProfile))
      setIsCreatingProfile(false)
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('❌ UserProfileSelector: Failed to create profile:', error)
      dispatch(appActions.setError('Failed to create profile'))
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
    setIsCreatingProfile(false)
  }

  const handleAddProfile = () => {
    setIsCreatingProfile(true)
    setIsEditingProfile(null)
    setShowManageMode(false)
    setIsDropdownOpen(true)
  }

  const handleEditProfile = (profile: Profile) => {
    setIsEditingProfile(profile)
    setIsCreatingProfile(false)
    setShowManageMode(false)
    setIsDropdownOpen(true)
  }

  const handleDeleteProfile = async (profile: Profile) => {
    if (!profile.id) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${profile.name}'s profile? This will remove all progress data.`
    )

    if (!confirmDelete) return

    try {
      setIsLoading(true)
      await tauriAPI.deleteProfile(profile.id)
      
      // Reload profiles
      await loadProfiles()
      
      // If we deleted the current profile, clear it
      if (currentProfile?.id === profile.id) {
        dispatch(appActions.setCurrentProfile(null))
      }
      
      setShowManageMode(false)
    } catch (error) {
      console.error('Failed to delete profile:', error)
      dispatch(appActions.setError('Failed to delete profile'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (name: string, avatar: string) => {
    if (!isEditingProfile?.id) return

    try {
      setIsLoading(true)
      const updatedProfile = await tauriAPI.updateProfile(isEditingProfile.id, {
        name,
        avatar
      })
      
      // Reload profiles to get the updated list
      await loadProfiles()
      
      // Update current profile if it was the one being edited
      if (currentProfile?.id === isEditingProfile.id) {
        dispatch(appActions.setCurrentProfile(updatedProfile))
      }
      
      setIsEditingProfile(null)
      setIsDropdownOpen(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      dispatch(appActions.setError('Failed to update profile'))
    } finally {
      setIsLoading(false)
    }
  }

  const toggleManageMode = () => {
    setShowManageMode(!showManageMode)
    setIsCreatingProfile(false)
    setIsEditingProfile(null)
  }

  if (isLoading) {
    return (
      <div className={styles.profileSelector}>
        <div className={styles.loadingState}>
          <span className={styles.loadingSpinner}>⏳</span>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.profileSelector}>
      {/* Current Profile Display */}
      <button
        className={styles.currentProfile}
        onClick={toggleDropdown}
        aria-label={currentProfile ? `Current profile: ${currentProfile.name}` : 'Select a profile'}
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox"
      >
        {currentProfile ? (
          <>
            <span className={styles.currentAvatar} role="img" aria-hidden="true">
              {currentProfile.avatar}
            </span>
            <span className={styles.currentName}>{currentProfile.name}</span>
          </>
        ) : (
          <>
            <span className={styles.currentAvatar} role="img" aria-hidden="true">
              👤
            </span>
            <span className={styles.currentName}>Select Profile</span>
          </>
        )}
        <span className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.open : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className={styles.dropdown} role="listbox">
          {isCreatingProfile ? (
            <CreateProfileForm
              onSubmit={handleCreateProfile}
              onCancel={() => setIsCreatingProfile(false)}
            />
          ) : isEditingProfile ? (
            <CreateProfileForm
              onSubmit={handleUpdateProfile}
              onCancel={() => setIsEditingProfile(null)}
              initialName={isEditingProfile.name}
              initialAvatar={isEditingProfile.avatar}
              isEditing={true}
            />
          ) : (
            <>
              {/* Existing Profiles */}
              {profiles.length > 0 && (
                <div className={styles.profileList}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>Choose Profile:</div>
                    <button
                      className={styles.manageButton}
                      onClick={toggleManageMode}
                      aria-label={showManageMode ? "Exit manage mode" : "Manage profiles"}
                    >
                      {showManageMode ? "Done" : "Manage"}
                    </button>
                  </div>
                  {profiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      isSelected={currentProfile?.id === profile.id}
                      onClick={() => handleProfileSelect(profile)}
                      onEdit={() => handleEditProfile(profile)}
                      onDelete={() => handleDeleteProfile(profile)}
                      showActions={showManageMode}
                    />
                  ))}
                </div>
              )}

              {/* Add New Profile Button */}
              <div className={styles.addProfileSection}>
                <button
                  className={styles.addProfileButton}
                  onClick={handleAddProfile}
                  aria-label="Create new profile"
                >
                  <span className={styles.addIcon} role="img" aria-hidden="true">
                    ➕
                  </span>
                  <span>Add New Profile</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsDropdownOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}