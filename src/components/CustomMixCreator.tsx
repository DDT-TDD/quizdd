import React, { useState, useEffect } from 'react';
import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed';
import { SimpleParentalGate } from './SimpleParentalGate';
import { DifficultySelector } from './DifficultySelector';
import type { Subject, MixConfig, KeyStage, CreateMixRequest, CustomMix } from '../types/api';
import styles from './CustomMixCreator.module.css';

interface CustomMixCreatorProps {
  onMixCreated?: (mix: CustomMix) => void;
  onCancel?: () => void;
  currentProfileId?: number;
}

export const CustomMixCreator: React.FC<CustomMixCreatorProps> = ({
  onMixCreated,
  onCancel,
  currentProfileId = 1
}) => {
  const [showParentalGate, setShowParentalGate] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableQuestions, setAvailableQuestions] = useState<number>(0);
  
  // Form state
  const [mixName, setMixName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedKeyStages, setSelectedKeyStages] = useState<KeyStage[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 5]);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [randomizeOrder, setRandomizeOrder] = useState(true);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(true);
  const [allowReview, setAllowReview] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjects.length > 0 && selectedKeyStages.length > 0) {
      updateAvailableQuestions();
    }
  }, [selectedSubjects, selectedKeyStages, difficultyRange]);

  const loadSubjects = async () => {
    try {
      const subjectList = await tauriAPI.getSubjects();
      setSubjects(subjectList);
    } catch (err) {
      setError('Failed to load subjects');
      console.error('Error loading subjects:', err);
    }
  };

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

  const handleParentalAccess = () => {
    setShowParentalGate(false);
  };

  const handleSubjectToggle = (subjectName: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectName)
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleKeyStageToggle = (keyStage: KeyStage) => {
    setSelectedKeyStages(prev =>
      prev.includes(keyStage)
        ? prev.filter(ks => ks !== keyStage)
        : [...prev, keyStage]
    );
  };

  const handleDifficultyChange = (range: [number, number]) => {
    setDifficultyRange(range);
  };

  const validateForm = (): string | null => {
    if (!mixName.trim()) {
      return 'Mix name is required';
    }
    if (selectedSubjects.length === 0) {
      return 'At least one subject must be selected';
    }
    if (selectedKeyStages.length === 0) {
      return 'At least one key stage must be selected';
    }
    if (questionCount < 1 || questionCount > 100) {
      return 'Question count must be between 1 and 100';
    }
    if (availableQuestions < questionCount) {
      return `Not enough questions available. Available: ${availableQuestions}, Requested: ${questionCount}`;
    }
    if (timeLimit !== null && (timeLimit < 60 || timeLimit > 3600)) {
      return 'Time limit must be between 60 seconds and 1 hour';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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

      // Validate feasibility before creating
      await tauriAPI.validateMixFeasibility(config);

      const request: CreateMixRequest = {
        name: mixName.trim(),
        created_by: currentProfileId,
        config,
      };

      const createdMix = await tauriAPI.createCustomMix(request);
      onMixCreated?.(createdMix);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom mix');
      console.error('Error creating custom mix:', err);
    } finally {
      setLoading(false);
    }
  };

  if (showParentalGate) {
    return (
      <SimpleParentalGate
        onSuccess={handleParentalAccess}
        onCancel={onCancel}
        title="Create Custom Mix"
        message="Parental access required to create custom quiz mixes."
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Create Custom Quiz Mix</h2>
        <button 
          type="button" 
          onClick={onCancel}
          className={styles.closeButton}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <div className={styles.section}>
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

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Subjects *</h3>
          <div className={styles.subjectGrid}>
            {subjects.map((subject) => (
              <label key={subject.name} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject.name)}
                  onChange={() => handleSubjectToggle(subject.name)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  {subject.display_name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Key Stages *</h3>
          <div className={styles.keyStageGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedKeyStages.includes('KS1')}
                onChange={() => handleKeyStageToggle('KS1')}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Key Stage 1 (Ages 5-7)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedKeyStages.includes('KS2')}
                onChange={() => handleKeyStageToggle('KS2')}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Key Stage 2 (Ages 7-11)</span>
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Difficulty Level</h3>
          <DifficultySelector
            subjectName={selectedSubjects[0] || 'mathematics'}
            keyStage={selectedKeyStages[0] || 'KS1'}
            selectedRange={difficultyRange}
            onRangeChange={handleDifficultyChange}
          />
        </div>

        <div className={styles.section}>
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

        <div className={styles.section}>
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

        <div className={styles.section}>
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

        <div className={styles.actions}>
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
            className={styles.createButton}
            disabled={loading || availableQuestions < questionCount}
          >
            {loading ? 'Creating...' : 'Create Mix'}
          </button>
        </div>
      </form>
    </div>
  );
};