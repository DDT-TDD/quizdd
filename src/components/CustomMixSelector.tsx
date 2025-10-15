import React, { useState, useEffect } from 'react';
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed';
import type { CustomMix } from '../types/api';
import styles from './CustomMixSelector.module.css';

interface CustomMixSelectorProps {
  onMixSelected?: (mix: CustomMix) => void;
  onCreateNew?: () => void;
  currentProfileId?: number;
  showCreateButton?: boolean;
}

export const CustomMixSelector: React.FC<CustomMixSelectorProps> = ({
  onMixSelected,
  onCreateNew,
  currentProfileId = 1,
  showCreateButton = true
}) => {
  const [mixes, setMixes] = useState<CustomMix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomMixes();
  }, [currentProfileId]);

  const loadCustomMixes = async () => {
    setLoading(true);
    setError(null);

    try {
      const allMixes = await tauriAPI.getAllCustomMixes();
      setMixes(allMixes);
    } catch (err) {
      setError('Failed to load custom mixes');
      console.error('Error loading custom mixes:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLimit = (seconds?: number): string => {
    if (!seconds) return 'No time limit';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatSubjects = (subjects: string[]): string => {
    if (subjects.length <= 2) {
      return subjects.join(' & ');
    }
    return `${subjects.slice(0, 2).join(', ')} +${subjects.length - 2} more`;
  };

  const formatKeyStages = (keyStages: string[]): string => {
    return keyStages.join(', ');
  };

  const getDifficultyLabel = (range: [number, number]): string => {
    const [min, max] = range;
    if (min === max) {
      const levels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
      return levels[min] || 'Unknown';
    }
    return `Level ${min}-${max}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading custom mixes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadCustomMixes} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Custom Quiz Mixes</h2>
        {showCreateButton && (
          <button onClick={onCreateNew} className={styles.createButton}>
            + Create New Mix
          </button>
        )}
      </div>

      {mixes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h3>No Custom Mixes Yet</h3>
          <p>
            Custom mixes let you combine questions from different subjects and difficulty levels.
            {showCreateButton && ' Ask a parent to create one for you!'}
          </p>
          {showCreateButton && (
            <button onClick={onCreateNew} className={styles.createFirstButton}>
              Create Your First Mix
            </button>
          )}
        </div>
      ) : (
        <div className={styles.mixGrid}>
          {mixes.map((mix) => (
            <div
              key={mix.id}
              className={styles.mixCard}
              onClick={() => onMixSelected?.(mix)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMixSelected?.(mix);
                }
              }}
            >
              <div className={styles.mixHeader}>
                <h3 className={styles.mixName}>{mix.name}</h3>
                <div className={styles.questionCount}>
                  {mix.config.question_count} questions
                </div>
              </div>

              <div className={styles.mixDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Subjects:</span>
                  <span className={styles.detailValue}>
                    {formatSubjects(mix.config.subjects)}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Key Stages:</span>
                  <span className={styles.detailValue}>
                    {formatKeyStages(mix.config.key_stages)}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Difficulty:</span>
                  <span className={styles.detailValue}>
                    {getDifficultyLabel(mix.config.difficulty_range)}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Time Limit:</span>
                  <span className={styles.detailValue}>
                    {formatTimeLimit(mix.config.time_limit)}
                  </span>
                </div>
              </div>

              <div className={styles.mixFeatures}>
                {mix.config.randomize_order && (
                  <span className={styles.feature}>🔀 Random Order</span>
                )}
                {mix.config.show_immediate_feedback && (
                  <span className={styles.feature}>💡 Instant Feedback</span>
                )}
                {mix.config.allow_review && (
                  <span className={styles.feature}>📝 Review Mode</span>
                )}
              </div>

              <div className={styles.mixFooter}>
                <span className={styles.createdDate}>
                  Created {mix.created_at ? new Date(mix.created_at).toLocaleDateString() : 'Unknown'}
                </span>
                <div className={styles.playButton}>
                  <span>Play →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};