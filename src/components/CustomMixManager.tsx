import React, { useState, useEffect } from 'react';
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed';
import { SimpleParentalGate } from './SimpleParentalGate';

import { DifficultySelector } from './DifficultySelector';
import type { CustomMix, Subject, UpdateMixRequest, MixConfig, KeyStage } from '../types/api';
import styles from './CustomMixManager.module.css';

interface CustomMixManagerProps {
  onClose?: () => void;
  currentProfileId?: number;
}

export const CustomMixManager: React.FC<CustomMixManagerProps> = ({
  onClose,
  currentProfileId = 1
}) => {
  const [showParentalGate, setShowParentalGate] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingMix, setEditingMix] = useState<CustomMix | null>(null);
  const [mixes, setMixes] = useState<CustomMix[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showParentalGate) {
      loadData();
    }
  }, [showParentalGate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mixList, subjectList] = await Promise.all([
        tauriAPI.getAllCustomMixes(),
        tauriAPI.getSubjects()
      ]);
      setMixes(mixList);
      setSubjects(subjectList);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleParentalAccess = () => {
    setShowParentalGate(false);
  };

  const handleCreateNew = () => {
    setShowCreator(true);
    setEditingMix(null);
  };

  const handleMixCreated = (mix: CustomMix) => {
    setMixes(prev => [mix, ...prev]);
    setShowCreator(false);
  };

  const handleEditMix = (mix: CustomMix) => {
    setEditingMix(mix);
    setShowCreator(true);
  };

  const handleDeleteMix = async (mixId: number) => {
    if (!window.confirm('Are you sure you want to delete this custom mix? This action cannot be undone.')) {
      return;
    }

    try {
      await tauriAPI.deleteCustomMix(mixId);
      setMixes(prev => prev.filter(mix => mix.id !== mixId));
    } catch (err) {
      setError('Failed to delete custom mix');
      console.error('Error deleting custom mix:', err);
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

  const getSubjectDisplayName = (subjectName: string): string => {
    const subject = subjects.find(s => s.name === subjectName);
    return subject?.display_name || subjectName;
  };

  if (showParentalGate) {
    return (
      <SimpleParentalGate
        onSuccess={handleParentalAccess}
        onCancel={onClose}
        title="Manage Custom Mixes"
        message="Parental access required to manage custom quiz mixes."
      />
    );
  }

  if (showCreator) {
    return (
      <CustomMixEditor
        mix={editingMix}
        subjects={subjects}
        onSave={(mix) => {
          if (editingMix) {
            setMixes(prev => prev.map(m => m.id === mix.id ? mix : m));
          } else {
            handleMixCreated(mix);
          }
        }}
        onCancel={() => {
          setShowCreator(false);
          setEditingMix(null);
        }}
        currentProfileId={currentProfileId}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Custom Mixes</h2>
        <div className={styles.headerActions}>
          <button onClick={handleCreateNew} className={styles.createButton}>
            + Create New Mix
          </button>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
          <button onClick={() => setError(null)} className={styles.dismissError}>
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading custom mixes...</p>
        </div>
      ) : mixes.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h3>No Custom Mixes Yet</h3>
          <p>Create custom quiz mixes to combine questions from different subjects and difficulty levels.</p>
          <button onClick={handleCreateNew} className={styles.createFirstButton}>
            Create Your First Mix
          </button>
        </div>
      ) : (
        <div className={styles.mixList}>
          {mixes.map((mix) => (
            <div key={mix.id} className={styles.mixCard}>
              <div className={styles.mixHeader}>
                <h3 className={styles.mixName}>{mix.name}</h3>
                <div className={styles.mixActions}>
                  <button
                    onClick={() => handleEditMix(mix)}
                    className={styles.editButton}
                    title="Edit mix"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteMix(mix.id!)}
                    className={styles.deleteButton}
                    title="Delete mix"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className={styles.mixDetails}>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Questions:</span>
                    <span className={styles.detailValue}>{mix.config.question_count}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Time Limit:</span>
                    <span className={styles.detailValue}>{formatTimeLimit(mix.config.time_limit)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Difficulty:</span>
                    <span className={styles.detailValue}>
                      Level {mix.config.difficulty_range[0]}-{mix.config.difficulty_range[1]}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Key Stages:</span>
                    <span className={styles.detailValue}>{mix.config.key_stages.join(', ')}</span>
                  </div>
                </div>

                <div className={styles.subjectList}>
                  <span className={styles.detailLabel}>Subjects:</span>
                  <div className={styles.subjects}>
                    {mix.config.subjects.map((subject) => (
                      <span key={subject} className={styles.subjectTag}>
                        {getSubjectDisplayName(subject)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.features}>
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
                    Created: {mix.created_at ? new Date(mix.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                  {mix.updated_at && (
                    <span className={styles.updatedDate}>
                      Updated: {new Date(mix.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Mix Editor Component
interface CustomMixEditorProps {
  mix?: CustomMix | null;
  subjects: Subject[];
  onSave: (mix: CustomMix) => void;
  onCancel: () => void;
  currentProfileId: number;
}

const CustomMixEditor: React.FC<CustomMixEditorProps> = ({
  mix,
  subjects,
  onSave,
  onCancel,
  currentProfileId
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<number>(0);
  
  // Form state
  const [mixName, setMixName] = useState(mix?.name || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(mix?.config.subjects || []);
  const [selectedKeyStages, setSelectedKeyStages] = useState<KeyStage[]>(mix?.config.key_stages || []);
  const [questionCount, setQuestionCount] = useState(mix?.config.question_count || 10);
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>(mix?.config.difficulty_range || [1, 5]);
  const [timeLimit, setTimeLimit] = useState<number | null>(mix?.config.time_limit || null);
  const [randomizeOrder, setRandomizeOrder] = useState(mix?.config.randomize_order ?? true);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(mix?.config.show_immediate_feedback ?? true);
  const [allowReview, setAllowReview] = useState(mix?.config.allow_review ?? true);

  useEffect(() => {
    if (selectedSubjects.length > 0 && selectedKeyStages.length > 0) {
      updateAvailableQuestions();
    }
  }, [selectedSubjects, selectedKeyStages, difficultyRange]);

  const updateAvailableQuestions = async () => {
    if (selectedSubjects.length === 0 || selectedKeyStages.length === 0) {
      setAvailableQuestions(0);
      return;
    }

    try {
      const config: MixConfig = {
        subjects: selectedSubjects,
        key_stages: selectedKeyStages,
        question_count: questionCount,
        difficulty_range: difficultyRange,
        randomize_order: randomizeOrder,
        show_immediate_feedback: showImmediateFeedback,
        allow_review: allowReview,
        time_limit: timeLimit || undefined,
      };

      const count = await tauriAPI.getAvailableQuestionCount(config);
      setAvailableQuestions(count);
    } catch (err) {
      console.error('Error getting available question count:', err);
      setAvailableQuestions(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mixName.trim()) {
      setError('Mix name is required');
      return;
    }

    if (selectedSubjects.length === 0) {
      setError('At least one subject must be selected');
      return;
    }

    if (selectedKeyStages.length === 0) {
      setError('At least one key stage must be selected');
      return;
    }

    if (availableQuestions < questionCount) {
      setError(`Not enough questions available. Available: ${availableQuestions}, Requested: ${questionCount}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config: MixConfig = {
        subjects: selectedSubjects,
        key_stages: selectedKeyStages,
        question_count: questionCount,
        difficulty_range: difficultyRange,
        time_limit: timeLimit || undefined,
        randomize_order: randomizeOrder,
        show_immediate_feedback: showImmediateFeedback,
        allow_review: allowReview,
      };

      let savedMix: CustomMix;

      if (mix?.id) {
        // Update existing mix
        const updates: UpdateMixRequest = {
          name: mixName.trim(),
          config,
        };
        savedMix = await tauriAPI.updateCustomMix(mix.id, updates);
      } else {
        // Create new mix
        const request = {
          name: mixName.trim(),
          created_by: currentProfileId,
          config,
        };
        savedMix = await tauriAPI.createCustomMix(request);
      }

      onSave(savedMix);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save custom mix');
      console.error('Error saving custom mix:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <h2>{mix ? 'Edit Custom Mix' : 'Create Custom Mix'}</h2>
        <button onClick={onCancel} className={styles.closeButton}>×</button>
      </div>

      <form onSubmit={handleSubmit} className={styles.editorForm}>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formSection}>
          <label htmlFor="mixName" className={styles.label}>
            Mix Name *
          </label>
          <input
            id="mixName"
            type="text"
            value={mixName}
            onChange={(e) => setMixName(e.target.value)}
            className={styles.input}
            placeholder="Enter a name for your custom mix"
            required
          />
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Subjects *</h3>
          <div className={styles.subjectGrid}>
            {subjects.map((subject) => (
              <label key={subject.name} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.name)}
                  onChange={() => {
                    setSelectedSubjects(prev => 
                      prev.includes(subject.name)
                        ? prev.filter(s => s !== subject.name)
                        : [...prev, subject.name]
                    );
                  }}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  {subject.display_name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Key Stages *</h3>
          <div className={styles.keyStageGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedKeyStages.includes('KS1')}
                onChange={() => {
                  setSelectedKeyStages(prev =>
                    prev.includes('KS1')
                      ? prev.filter(ks => ks !== 'KS1')
                      : [...prev, 'KS1']
                  );
                }}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Key Stage 1 (Ages 5-7)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedKeyStages.includes('KS2')}
                onChange={() => {
                  setSelectedKeyStages(prev =>
                    prev.includes('KS2')
                      ? prev.filter(ks => ks !== 'KS2')
                      : [...prev, 'KS2']
                  );
                }}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Key Stage 2 (Ages 7-11)</span>
            </label>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Difficulty Level</h3>
          <DifficultySelector
            subjectName={selectedSubjects[0] || 'mathematics'}
            keyStage={selectedKeyStages[0] || 'KS1'}
            selectedRange={difficultyRange}
            onRangeChange={(range: [number, number]) => setDifficultyRange(range)}
          />
        </div>

        <div className={styles.formSection}>
          <label htmlFor="questionCount" className={styles.label}>
            Number of Questions *
          </label>
          <input
            id="questionCount"
            type="number"
            min="1"
            max="100"
            value={questionCount}
            onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
            className={styles.input}
          />
          <div className={styles.availableCount}>
            Available questions: {availableQuestions}
          </div>
        </div>

        <div className={styles.formSection}>
          <label htmlFor="timeLimit" className={styles.label}>
            Time Limit (optional)
          </label>
          <select
            id="timeLimit"
            value={timeLimit || ''}
            onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
            className={styles.select}
          >
            <option value="">No time limit</option>
            <option value="300">5 minutes</option>
            <option value="600">10 minutes</option>
            <option value="900">15 minutes</option>
            <option value="1200">20 minutes</option>
            <option value="1800">30 minutes</option>
            <option value="3600">1 hour</option>
          </select>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Quiz Options</h3>
          <div className={styles.optionsGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={randomizeOrder}
                onChange={(e) => setRandomizeOrder(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Randomize question order</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showImmediateFeedback}
                onChange={(e) => setShowImmediateFeedback(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Show immediate feedback</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={allowReview}
                onChange={(e) => setAllowReview(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Allow review after completion</span>
            </label>
          </div>
        </div>

        <div className={styles.editorActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={loading || availableQuestions < questionCount}
          >
            {loading ? 'Saving...' : mix ? 'Update Mix' : 'Create Mix'}
          </button>
        </div>
      </form>
    </div>
  );
};