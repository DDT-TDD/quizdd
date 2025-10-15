// @ts-nocheck
// Example usage of the Tauri API bridge
// This file demonstrates how to use the API in React components

import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed';
import type { 
  Profile, 
  CreateProfileRequest, 
  QuizConfig, 
  GetQuestionsRequest,
  KeyStage 
} from '../types/api';

/**
 * Example: Profile Management
 */
export async function exampleProfileManagement() {
  try {
    // Create a new profile
    const createRequest: CreateProfileRequest = {
      name: "Alice",
      avatar: "avatar_girl_1",
      theme_preference: "colorful"
    };
    
    const newProfile = await tauriAPI.createProfile(createRequest);
    console.log('Created profile:', newProfile);
    
    // Get all profiles
    const profiles = await tauriAPI.getAllProfiles();
    console.log('All profiles:', profiles);
    
    // Update profile
    if (newProfile.id) {
      const updatedProfile = await tauriAPI.updateProfile(newProfile.id, {
        theme_preference: "dark"
      });
      console.log('Updated profile:', updatedProfile);
    }
    
    // Get progress for profile
    if (newProfile.id) {
      const progress = await tauriAPI.getProgress(newProfile.id);
      console.log('Profile progress:', progress);
    }
    
  } catch (error) {
    console.error('Profile management error:', error);
  }
}

/**
 * Example: Quiz Operations
 */
export async function exampleQuizOperations() {
  try {
    // Get questions for a quiz
    const questionsRequest: GetQuestionsRequest = {
      subject: "Mathematics",
      key_stage: "KS1" as KeyStage,
      count: 10,
      difficulty_range: [1, 3]
    };
    
    const questions = await tauriAPI.getQuestions(questionsRequest);
    console.log('Retrieved questions:', questions);
    
    // Start a quiz session
    const quizConfig: QuizConfig = {
      subject: "Mathematics",
      key_stage: "KS1" as KeyStage,
      question_count: 10,
      difficulty_range: [1, 3],
      randomize_questions: true,
      randomize_answers: true
    };
    
    const session = await tauriAPI.startQuizSession(1, quizConfig);
    console.log('Started quiz session:', session);
    
    // Submit an answer
    if (session.id && questions.length > 0) {
      const firstQuestion = questions[0];
      console.log('First question:', firstQuestion);
      const answer = AnswerHelpers.text("Sample answer");
      
      const result = await tauriAPI.submitAnswer(session.id, answer, 30);
      console.log('Answer result:', result);
    }
    
    // Calculate final score
    const score = await tauriAPI.calculateScore(session);
    console.log('Quiz score:', score);
    
  } catch (error) {
    console.error('Quiz operations error:', error);
  }
}

/**
 * Example: Content Management
 */
export async function exampleContentManagement() {
  try {
    // Get all subjects
    const subjects = await tauriAPI.getSubjects();
    console.log('Available subjects:', subjects);
    
    // Get questions by subject
    const mathQuestions = await tauriAPI.getQuestionsBySubject(
      "Mathematics",
      "KS1" as KeyStage,
      [1, 2], // difficulty range
      5 // limit
    );
    console.log('Math questions:', mathQuestions);
    
    // Get content statistics
    const stats = await tauriAPI.getContentStatistics();
    console.log('Content statistics:', stats);
    
  } catch (error) {
    console.error('Content management error:', error);
  }
}

/**
 * Example: Security Operations
 */
export async function exampleSecurityOperations() {
  try {
    // Generate parental challenge
    const challenge = await tauriAPI.generateParentalChallenge();
    console.log('Parental challenge:', challenge);
    
    // Validate parental access
    const isValid = await tauriAPI.validateParentalAccess("challenge", "15"); // Example answer
    console.log('Access validation result:', isValid);
    
    // Encrypt sensitive data
    const sensitiveData = new TextEncoder().encode("Secret information");
    const encrypted = await tauriAPI.encryptSensitiveData(sensitiveData);
    console.log('Encrypted data length:', encrypted.length);
    
    // Decrypt the data
    const decrypted = await tauriAPI.decryptSensitiveData(encrypted);
    const decryptedText = new TextDecoder().decode(decrypted);
    console.log('Decrypted text:', decryptedText);
    
  } catch (error) {
    console.error('Security operations error:', error);
  }
}

/**
 * Example: Error Handling
 */
export async function exampleErrorHandling() {
  try {
    // Attempt to get a non-existent profile
    await tauriAPI.getProfileById(99999);
  } catch (error) {
    console.error('Expected error for non-existent profile:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('Profile not found')) {
        console.log('Handling profile not found error');
      } else if (error.message.includes('Database')) {
        console.log('Handling database error');
      } else {
        console.log('Handling generic error');
      }
    }
  }
}

import React from 'react';

/**
 * Example React Hook for using the API
 */
export function useProfiles() {
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const loadProfiles = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const profileList = await tauriAPI.getAllProfiles();
      setProfiles(profileList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const createProfile = React.useCallback(async (request: CreateProfileRequest) => {
    try {
      const newProfile = await tauriAPI.createProfile(request);
      setProfiles(prev => [...prev, newProfile]);
      return newProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);
  
  React.useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);
  
  return {
    profiles,
    loading,
    error,
    loadProfiles,
    createProfile
  };
}

// Note: React import would be needed for the hook example
// import React from 'react';