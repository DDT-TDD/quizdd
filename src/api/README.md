# Tauri API Bridge

This directory contains the implementation of the Tauri API bridge that enables communication between the React frontend and Rust backend.

## Overview

The API bridge consists of:

1. **TypeScript Type Definitions** (`../types/api.ts`) - Complete type definitions matching Rust structs
2. **Tauri API Implementation** (`tauri.ts`) - Implementation using Tauri's `invoke` function
3. **Usage Examples** (`../examples/api-usage.ts`) - Practical examples of API usage

## Architecture

```
Frontend (React/TypeScript)
    ↓ invoke()
Tauri API Bridge
    ↓ #[tauri::command]
Backend Services (Rust)
    ↓
Database (SQLite)
```

## Available Operations

### Quiz Engine Operations
- `getQuestions()` - Retrieve randomized questions for a quiz
- `validateAnswer()` - Validate a submitted answer
- `startQuizSession()` - Start a new quiz session
- `submitAnswer()` - Submit an answer during a quiz
- `getCurrentQuestion()` - Get the current question in a session
- `calculateScore()` - Calculate final quiz score
- `pauseQuiz()` / `resumeQuiz()` - Pause/resume quiz sessions

### Profile Management Operations
- `createProfile()` - Create a new user profile
- `getProfileById()` - Get profile by ID
- `getAllProfiles()` - Get all profiles
- `updateProfile()` - Update profile information
- `deleteProfile()` - Delete a profile
- `getProgress()` - Get progress for a profile
- `updateProgress()` - Update progress after quiz completion

### Content Management Operations
- `getSubjects()` - Get all available subjects
- `getQuestionsBySubject()` - Get questions filtered by subject/difficulty
- `getQuestionById()` - Get a specific question
- `addQuestion()` - Add a new question (admin)
- `updateQuestion()` - Update existing question (admin)
- `deleteQuestion()` - Delete a question (admin)
- `getContentStatistics()` - Get content statistics
- `loadContentPack()` - Load new content from file
- `verifyContentSignature()` - Verify content package signature

### Custom Mix Operations
- `createCustomMix()` - Create a custom question mix
- `getCustomMixById()` - Get custom mix by ID
- `getAllCustomMixes()` - Get all custom mixes
- `getCustomMixesByProfile()` - Get mixes created by a profile
- `updateCustomMix()` - Update custom mix configuration
- `deleteCustomMix()` - Delete a custom mix

### Security Operations
- `validateParentalAccess()` - Validate parental gate input
- `generateParentalChallenge()` - Generate math challenge for parents
- `verifyUpdateSignature()` - Verify content update signatures
- `encryptSensitiveData()` - Encrypt sensitive data locally
- `decryptSensitiveData()` - Decrypt sensitive data
- `verifyContentPackage()` - Verify content package integrity

## Type System

The API uses a comprehensive type system that ensures type safety between frontend and backend:

### Core Types
- `KeyStage` - 'KS1' | 'KS2'
- `QuestionType` - Multiple choice, drag-drop, hotspot, fill-blank, story quiz
- `Answer` - Union type for different answer formats
- `Question` - Complete question structure with content and metadata

### Request/Response Types
- All operations use strongly typed request and response objects
- Error handling is consistent across all operations
- Optional parameters are properly typed

## Error Handling

The API provides consistent error handling:

```typescript
try {
  const profile = await tauriAPI.getProfileById(1);
} catch (error) {
  // Error is always a string with descriptive message
  console.error('API Error:', error);
}
```

## Usage Patterns

### Basic Usage
```typescript
import { tauriAPI } from '../api/tauri';

// Simple operation
const profiles = await tauriAPI.getAllProfiles();
```

### With React Hooks
```typescript
function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  
  useEffect(() => {
    tauriAPI.getAllProfiles()
      .then(setProfiles)
      .catch(console.error);
  }, []);
  
  return profiles;
}
```

### Answer Helpers
```typescript
import { AnswerHelpers } from '../api/tauri';

// Create different answer types
const textAnswer = AnswerHelpers.text("Paris");
const multipleAnswer = AnswerHelpers.multiple(["A", "C"]);
const coordinateAnswer = AnswerHelpers.coordinates([{x: 100, y: 200}]);
```

## Security Considerations

- All data transmission uses Tauri's secure IPC mechanism
- Sensitive data is encrypted before storage
- Content packages are cryptographically verified
- Parental access uses challenge-response authentication

## Performance

- Operations are asynchronous and non-blocking
- Database operations use connection pooling
- Large data transfers are optimized
- Error recovery is built-in for transient failures

## Development

### Adding New Operations

1. Add Rust command function in `src-tauri/src/main.rs`
2. Add TypeScript interface in `src/types/api.ts`
3. Implement in `src/api/tauri.ts`
4. Register command in main function
5. Add usage example

### Testing

- Backend operations have unit tests in Rust
- Frontend API calls can be mocked for testing
- Integration tests verify end-to-end functionality

## Future Enhancements

- Real-time updates using Tauri events
- Batch operations for better performance
- Offline synchronization capabilities
- Enhanced error recovery mechanisms