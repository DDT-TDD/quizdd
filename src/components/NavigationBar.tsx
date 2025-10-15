
import { useAppContext } from '../contexts/AppContext'
import { useNavigation } from './Router'
import styles from './NavigationBar.module.css'

interface NavButtonProps {
  icon: string
  label: string
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}

function NavButton({ icon, label, isActive, onClick, disabled = false }: NavButtonProps) {
  return (
    <button
      className={`${styles.navButton} ${isActive ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={styles.navIcon} role="img" aria-hidden="true">
        {icon}
      </span>
      <span className={styles.navLabel}>{label}</span>
    </button>
  )
}

export function NavigationBar() {
  const { state } = useAppContext()
  const navigation = useNavigation()
  const { currentView, currentProfile } = state

  // Navigation items configuration
  const navItems = [
    {
      icon: '🏠',
      label: 'Home',
      view: 'home',
      action: navigation.goHome,
      requiresProfile: false
    },
    {
      icon: '📚',
      label: 'Subjects',
      view: 'subjects',
      action: navigation.goToSubjects,
      requiresProfile: true
    },
    {
      icon: '👤',
      label: 'Profile',
      view: 'profile',
      action: navigation.goToProfile,
      requiresProfile: true
    },
    {
      icon: '🎨',
      label: 'Custom Mix',
      view: 'custom-mix',
      action: navigation.goToCustomMix,
      requiresProfile: true
    },
    {
      icon: '⚙️',
      label: 'Settings',
      view: 'settings',
      action: navigation.goToSettings,
      requiresProfile: false
    }
  ]

  return (
    <nav className={styles.navigationBar} role="navigation" aria-label="Main navigation">
      <div className={styles.navContent}>
        <div className={styles.navItems}>
          {navItems.map((item) => {
            const isDisabled = item.requiresProfile && !currentProfile
            const isActive = currentView === item.view
            
            return (
              <NavButton
                key={item.view}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                onClick={item.action}
                disabled={isDisabled}
              />
            )
          })}
        </div>

        {/* Home button - always visible and prominent */}
        <div className={styles.homeButtonContainer}>
          <button
            className={`${styles.homeButton} ${currentView === 'home' ? styles.homeActive : ''}`}
            onClick={navigation.goHome}
            aria-label="Go to Home"
          >
            <span className={styles.homeIcon} role="img" aria-hidden="true">
              🏠
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}