import { fixedTauriAPI as tauriAPI } from '../api/tauri-fixed'
import type { Question } from '../types/api'

/**
 * Content Seeder Service for populating the database with sample educational content
 * This service creates sample questions for testing and demonstration purposes
 */
export class ContentSeeder {
  
  /**
   * Seed the database with comprehensive educational content using Tauri backend
   */
  async seedAllContent(): Promise<void> {
    try {
      console.log('Starting comprehensive content seeding...')
      
      // Use the Tauri backend seeding functionality
      await tauriAPI.seedAllContent()
      
      console.log('Content seeding completed successfully!')
    } catch (error) {
      console.error('Failed to seed content:', error)
      throw error
    }
  }

  /**
   * Seed Mathematics content
   */
  private async seedMathematicsContent(subjectId: number): Promise<void> {
    const mathQuestions: Omit<Question, 'id' | 'created_at'>[] = [
      // KS1 Mathematics - Basic Addition
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'What is 2 + 3?',
          options: ['4', '5', '6', '7']
        },
        correct_answer: '5',
        difficulty_level: 1,
        tags: ['addition', 'basic_arithmetic']
      },
      
      // KS1 Mathematics - Shape Recognition
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'How many sides does a triangle have?',
          options: ['2', '3', '4', '5']
        },
        correct_answer: '3',
        difficulty_level: 1,
        tags: ['shapes', 'geometry']
      },
      
      // KS1 Mathematics - Counting
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'Count the objects: 🍎🍎🍎🍎🍎',
          options: ['3', '4', '5', '6']
        },
        correct_answer: { Text: '5' },
        difficulty_level: 1,
        tags: ['counting', 'numbers']
      },
      
      // KS2 Mathematics - Multiplication Tables
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'What is 7 × 8?',
          options: ['54', '56', '58', '64']
        },
        correct_answer: { Text: '56' },
        difficulty_level: 3,
        tags: ['multiplication', 'times_tables']
      },
      
      // KS2 Mathematics - Fractions
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'What is 1/2 + 1/4?',
          options: ['1/6', '2/6', '3/4', '2/4']
        },
        correct_answer: { Text: '3/4' },
        difficulty_level: 4,
        tags: ['fractions', 'addition']
      }
    ]

    for (const question of mathQuestions) {
      await tauriAPI.addQuestion(question as Question)
    }
  }

  /**
   * Seed Geography content
   */
  private async seedGeographyContent(subjectId: number): Promise<void> {
    const geographyQuestions: Omit<Question, 'id' | 'created_at'>[] = [
      // KS1 Geography - Basic Countries
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'What is the capital city of England?',
          options: ['Manchester', 'Birmingham', 'London', 'Liverpool']
        },
        correct_answer: { Text: 'London' },
        difficulty_level: 2,
        tags: ['capitals', 'uk', 'cities']
      },
      
      // KS1 Geography - Continents
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'Which continent do we live on?',
          options: ['Asia', 'Africa', 'Europe', 'America']
        },
        correct_answer: { Text: 'Europe' },
        difficulty_level: 2,
        tags: ['continents', 'world_knowledge']
      },
      
      // KS2 Geography - World Capitals
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'What is the capital of France?',
          options: ['Lyon', 'Marseille', 'Paris', 'Nice']
        },
        correct_answer: { Text: 'Paris' },
        difficulty_level: 2,
        tags: ['capitals', 'europe', 'france']
      },
      
      // KS2 Geography - Flags
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'Which country has a flag with a red circle on a white background?',
          options: ['China', 'Japan', 'South Korea', 'Thailand']
        },
        correct_answer: { Text: 'Japan' },
        difficulty_level: 3,
        tags: ['flags', 'countries', 'asia']
      }
    ]

    for (const question of geographyQuestions) {
      await tauriAPI.addQuestion(question as Question)
    }
  }

  /**
   * Seed English content
   */
  private async seedEnglishContent(subjectId: number): Promise<void> {
    const englishQuestions: Omit<Question, 'id' | 'created_at'>[] = [
      // KS1 English - Basic Spelling
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'How do you spell the word for a furry pet that says "meow"?',
          options: ['cat', 'cot', 'cut', 'cart']
        },
        correct_answer: { Text: 'cat' },
        difficulty_level: 1,
        tags: ['spelling', 'animals', 'basic_words']
      },
      
      // KS1 English - Phonics
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'Which word rhymes with "hat"?',
          options: ['hot', 'cat', 'hit', 'hut']
        },
        correct_answer: { Text: 'cat' },
        difficulty_level: 2,
        tags: ['phonics', 'rhyming', 'sounds']
      },
      
      // KS2 English - Grammar
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'What type of word is "quickly"?',
          options: ['Noun', 'Verb', 'Adjective', 'Adverb']
        },
        correct_answer: { Text: 'Adverb' },
        difficulty_level: 3,
        tags: ['grammar', 'parts_of_speech', 'adverbs']
      },
      
      // KS2 English - Vocabulary
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'What does the word "enormous" mean?',
          options: ['Very small', 'Very big', 'Very fast', 'Very slow']
        },
        correct_answer: { Text: 'Very big' },
        difficulty_level: 3,
        tags: ['vocabulary', 'synonyms', 'adjectives']
      }
    ]

    for (const question of englishQuestions) {
      await tauriAPI.addQuestion(question as Question)
    }
  }

  /**
   * Seed Science content
   */
  private async seedScienceContent(subjectId: number): Promise<void> {
    const scienceQuestions: Omit<Question, 'id' | 'created_at'>[] = [
      // KS1 Science - Animals
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'What do bees make?',
          options: ['Milk', 'Honey', 'Eggs', 'Wool']
        },
        correct_answer: { Text: 'Honey' },
        difficulty_level: 1,
        tags: ['animals', 'insects', 'nature']
      },
      
      // KS1 Science - Plants
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'What do plants need to grow?',
          options: ['Only water', 'Only sunlight', 'Water and sunlight', 'Only soil']
        },
        correct_answer: { Text: 'Water and sunlight' },
        difficulty_level: 2,
        tags: ['plants', 'growth', 'nature']
      },
      
      // KS2 Science - Human Body
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'How many bones are there in an adult human body?',
          options: ['106', '206', '306', '406']
        },
        correct_answer: { Text: '206' },
        difficulty_level: 4,
        tags: ['human_body', 'bones', 'anatomy']
      },
      
      // KS2 Science - Environment
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'What gas do plants absorb from the air?',
          options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen']
        },
        correct_answer: { Text: 'Carbon dioxide' },
        difficulty_level: 3,
        tags: ['plants', 'environment', 'gases']
      }
    ]

    for (const question of scienceQuestions) {
      await tauriAPI.addQuestion(question as Question)
    }
  }

  /**
   * Seed General Knowledge content
   */
  private async seedGeneralKnowledgeContent(subjectId: number): Promise<void> {
    const generalQuestions: Omit<Question, 'id' | 'created_at'>[] = [
      // KS1 General Knowledge - Basic Facts
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'How many days are there in a week?',
          options: ['5', '6', '7', '8']
        },
        correct_answer: { Text: '7' },
        difficulty_level: 1,
        tags: ['time', 'calendar', 'basic_facts']
      },
      
      // KS1 General Knowledge - Colors
      {
        subject_id: subjectId,
        key_stage: 'KS1',
        question_type: 'multiple_choice',
        content: {
          text: 'What color do you get when you mix red and yellow?',
          options: ['Purple', 'Green', 'Orange', 'Blue']
        },
        correct_answer: { Text: 'Orange' },
        difficulty_level: 2,
        tags: ['colors', 'art', 'mixing']
      },
      
      // KS2 General Knowledge - History
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'Who was the first person to walk on the moon?',
          options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard']
        },
        correct_answer: { Text: 'Neil Armstrong' },
        difficulty_level: 3,
        tags: ['history', 'space', 'famous_people']
      },
      
      // KS2 General Knowledge - Culture
      {
        subject_id: subjectId,
        key_stage: 'KS2',
        question_type: 'multiple_choice',
        content: {
          text: 'In which country would you find Machu Picchu?',
          options: ['Brazil', 'Peru', 'Chile', 'Argentina']
        },
        correct_answer: { Text: 'Peru' },
        difficulty_level: 4,
        tags: ['culture', 'landmarks', 'south_america']
      }
    ]

    for (const question of generalQuestions) {
      await tauriAPI.addQuestion(question as Question)
    }
  }

  /**
   * Check if content has already been seeded
   */
  async isContentSeeded(): Promise<boolean> {
    try {
      return await tauriAPI.isContentSeeded()
    } catch (error) {
      console.error('Failed to check if content is seeded:', error)
      return false
    }
  }

  /**
   * Seed content only if it hasn't been seeded already
   */
  async seedIfEmpty(): Promise<void> {
    try {
      await tauriAPI.seedIfEmpty()
    } catch (error) {
      console.error('Failed to seed content if empty:', error)
      throw error
    }
  }
}

// Singleton instance
export const contentSeeder = new ContentSeeder()

export default contentSeeder