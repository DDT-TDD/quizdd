import React, { useState, useEffect } from 'react';
import { UpdateService, UpdateInfo } from '../services/updateService';
import { SecurityService } from '../services/securityService';
import styles from './UpdateManager.module.css';

interface UpdateManagerProps {
  onUpdateComplete?: () => void;
  onUpdateError?: (error: string) => void;
}

interface UpdateState {
  isChecking: boolean;
  isUpdating: boolean;
  availableUpdates: UpdateInfo[];
  currentVersion: string;
  error: string | null;
  showParentalGate: boolean;
  updateProgress: number;
  pendingAction: 'update' | 'rollback' | null;
}

export const UpdateManager: React.FC<UpdateManagerProps> = ({
  onUpdateComplete,
  onUpdateError,
}) => {
  const [state, setState] = useState<UpdateState>({
    isChecking: false,
    isUpdating: false,
    availableUpdates: [],
    currentVersion: '1.0.0',
    error: null,
    showParentalGate: false,
    updateProgress: 0,
    pendingAction: null,
  });

  const [parentalChallenge, setParentalChallenge] = useState<{
    question: string;
    answer: string;
  } | null>(null);

  useEffect(() => {
    loadCurrentVersion();
  }, []);

  const loadCurrentVersion = async () => {
    try {
      const version = await UpdateService.getCurrentVersion();
      setState(prev => ({ ...prev, currentVersion: version }));
    } catch (error) {
      console.error('Failed to load current version:', error);
    }
  };

  const checkForUpdates = async () => {
    setState(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      const updates = await UpdateService.checkForUpdates();
      setState(prev => ({
        ...prev,
        availableUpdates: updates,
        isChecking: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isChecking: false,
      }));
      onUpdateError?.(errorMessage);
    }
  };

  const initiateUpdate = async (_updateInfo: UpdateInfo) => {
    // Show parental gate for update operations
    setState(prev => ({ ...prev, showParentalGate: true, pendingAction: 'update' }));
    
    try {
      const challenge = await SecurityService.generateParentalChallenge();
      setParentalChallenge({
        question: challenge.question,
        answer: '', // User will fill this
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to generate parental challenge',
        showParentalGate: false,
        pendingAction: null,
      }));
    }
  };

  const validateParentalAccess = async (answer: string) => {
    if (!parentalChallenge) return;

    try {
      const isValid = await SecurityService.validateParentalAccess(
        parentalChallenge.question,
        answer
      );

      if (isValid) {
        setState(prev => ({ ...prev, showParentalGate: false }));
        setParentalChallenge(null);
        
        // Execute the pending action
        if (state.pendingAction === 'rollback') {
          await performRollback();
        } else if (state.pendingAction === 'update') {
          // Proceed with update
          const updateToInstall = state.availableUpdates[0]; // For simplicity, update the first available
          if (updateToInstall) {
            await performUpdate(updateToInstall);
          }
        }
        
        setState(prev => ({ ...prev, pendingAction: null }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Incorrect answer. Please try again.',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to validate parental access',
      }));
    }
  };

  const performUpdate = async (updateInfo: UpdateInfo) => {
    setState(prev => ({
      ...prev,
      isUpdating: true,
      error: null,
      updateProgress: 0,
    }));

    try {
      // Simulate progress updates (in a real implementation, this would come from the backend)
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          updateProgress: Math.min(prev.updateProgress + 10, 90),
        }));
      }, 500);

      await UpdateService.downloadAndInstallUpdate(updateInfo);
      
      clearInterval(progressInterval);
      
      setState(prev => ({
        ...prev,
        isUpdating: false,
        updateProgress: 100,
        availableUpdates: [],
      }));

      // Reload current version
      await loadCurrentVersion();
      
      onUpdateComplete?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: errorMessage,
        updateProgress: 0,
      }));
      onUpdateError?.(errorMessage);
    }
  };

  const rollbackUpdate = async () => {
    setState(prev => ({ ...prev, showParentalGate: true, pendingAction: 'rollback' }));
    
    try {
      const challenge = await SecurityService.generateParentalChallenge();
      setParentalChallenge({
        question: challenge.question,
        answer: '',
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to generate parental challenge for rollback',
        showParentalGate: false,
        pendingAction: null,
      }));
    }
  };

  const performRollback = async () => {
    try {
      await UpdateService.rollbackToBackup();
      await loadCurrentVersion();
      setState(prev => ({
        ...prev,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rollback failed';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
    }
  };

  const dismissError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const cancelParentalGate = () => {
    setState(prev => ({ ...prev, showParentalGate: false, pendingAction: null }));
    setParentalChallenge(null);
  };

  return (
    <div className={styles.updateManager}>
      <div className={styles.header}>
        <h2>Content Updates</h2>
        <div className={styles.versionInfo}>
          Current Version: <span className={styles.version}>{state.currentVersion}</span>
        </div>
      </div>

      {state.error && (
        <div className={styles.errorBanner}>
          <span className={styles.errorMessage}>{state.error}</span>
          <button onClick={dismissError} className={styles.dismissButton}>
            ×
          </button>
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={checkForUpdates}
          disabled={state.isChecking || state.isUpdating}
          className={styles.checkButton}
        >
          {state.isChecking ? 'Checking...' : 'Check for Updates'}
        </button>

        {state.availableUpdates.length > 0 && (
          <button
            onClick={() => rollbackUpdate()}
            disabled={state.isUpdating}
            className={styles.rollbackButton}
          >
            Rollback to Previous Version
          </button>
        )}
      </div>

      {state.isUpdating && (
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>Installing update...</div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${state.updateProgress}%` }}
            />
          </div>
          <div className={styles.progressText}>{state.updateProgress}%</div>
        </div>
      )}

      {state.availableUpdates.length > 0 && !state.isUpdating && (
        <div className={styles.updatesContainer}>
          <h3>Available Updates</h3>
          {state.availableUpdates.map((update, index) => (
            <div key={index} className={styles.updateItem}>
              <div className={styles.updateHeader}>
                <span className={styles.updateVersion}>Version {update.version}</span>
                {update.required && (
                  <span className={styles.requiredBadge}>Required</span>
                )}
              </div>
              <div className={styles.updateDescription}>{update.description}</div>
              <div className={styles.updateMeta}>
                <span>Size: {UpdateService.formatUpdateSize(update.size)}</span>
              </div>
              <button
                onClick={() => initiateUpdate(update)}
                className={`${styles.installButton} ${
                  update.required ? styles.requiredUpdate : ''
                }`}
              >
                Install Update
              </button>
            </div>
          ))}
        </div>
      )}

      {state.availableUpdates.length === 0 && !state.isChecking && !state.error && (
        <div className={styles.noUpdates}>
          <p>No updates available. Your content is up to date!</p>
        </div>
      )}

      {state.showParentalGate && parentalChallenge && (
        <div className={styles.parentalGateOverlay}>
          <div className={styles.parentalGateModal}>
            <h3>Parental Verification Required</h3>
            <p>To proceed with the update, please solve this math problem:</p>
            <div className={styles.challengeQuestion}>
              {parentalChallenge.question}
            </div>
            <input
              type="number"
              placeholder="Enter your answer"
              className={styles.challengeInput}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  validateParentalAccess((e.target as HTMLInputElement).value);
                }
              }}
            />
            <div className={styles.parentalGateActions}>
              <button
                onClick={() => {
                  const input = document.querySelector(`.${styles.challengeInput}`) as HTMLInputElement;
                  if (input) {
                    validateParentalAccess(input.value);
                  }
                }}
                className={styles.verifyButton}
              >
                Verify
              </button>
              <button
                onClick={cancelParentalGate}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateManager;