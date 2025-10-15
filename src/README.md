# QuiZDD React Frontend Foundation

This directory contains the React frontend foundation for the QuiZDD educational quiz application.

## 🏗️ Architecture Overview

### Core Components Implemented

1. **Global State Management** (`src/contexts/AppContext.tsx`)
   - Centralized state management using React Context API
   - Handles user profiles, quiz state, navigation, and UI preferences
   - Type-safe actions and state updates

2. **Error Boundaries** (`src/components/ErrorBoundary.tsx`)
   - Global error boundary for graceful error handling
   - Specialized quiz error boundary for quiz-specific errors
   - Child-friendly error messages and recovery options

3. **Routing System** (`src/components/Router.tsx`)
   - Simple view-based routing without external dependencies
   - Navigation helpers for different app sections
   - Error boundary integration for each route

4. **Theming System** (`src/styles/globals.css`)
   - CSS custom properties for comprehensive theming
   - Child-friendly color schemes and typography
   - Support for dark mode and high contrast themes
   - Anti-cheating styles (disabled text selection, context menus)

5. **Main App Structure** (`src/App.tsx`)
   - Root application component with error boundaries
   - Theme management integration
   - Loading states and error fallbacks

## 🎨 Theming Features

### CSS Custom Properties
- Comprehensive color palette with subject-specific colors
- Typography scale optimized for children (Comic Neue, Fredoka One)
- Spacing, border radius, and shadow systems
- Transition and animation preferences

### Theme Variants
- **Default**: Bright, colorful theme for children
- **Dark**: Dark mode for low-light environments
- **High Contrast**: Accessibility-focused high contrast mode

### Child-Friendly Design
- Large, easy-to-read fonts
- Vibrant colors and engaging visual elements
- Clear visual hierarchy and spacing
- Accessibility considerations built-in

## 🛡️ Security Features

### Anti-Cheating Measures
- Disabled text selection in quiz areas
- Disabled right-click context menus
- CSS classes for preventing text copying
- Graceful handling of unexpected user behavior

### Error Handling
- Comprehensive error boundaries at multiple levels
- Child-friendly error messages
- Automatic error recovery mechanisms
- Development-only error details

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Building
```bash
npm run build
```

## 📁 File Structure

```
src/
├── components/           # Reusable UI components
│   ├── ErrorBoundary.tsx
│   ├── ErrorBoundary.module.css
│   └── Router.tsx
├── contexts/            # React Context providers
│   └── AppContext.tsx
├── styles/              # Global styles and themes
│   └── globals.css
├── types/               # TypeScript type definitions
│   ├── api.ts          # API types (from previous tasks)
│   └── css-modules.d.ts # CSS module declarations
├── App.tsx             # Root application component
├── App.module.css      # App-specific styles
├── main.tsx           # React application entry point
└── index.html         # HTML template
```

## 🎯 Next Steps

This foundation provides the base structure for:
- Navigation between app sections
- User profile management
- Quiz state management
- Theme customization
- Error handling

The next tasks will build upon this foundation to implement:
- UI components and navigation (Task 6)
- Question type components (Task 7)
- Quiz interface (Task 8)
- And more...

## 🔧 Configuration

### Vite Configuration
- Optimized for Tauri development
- CSS Modules support with camelCase conversion
- Development server on port 1420 (Tauri requirement)

### TypeScript Configuration
- Strict type checking enabled
- Path mapping for clean imports
- JSX support with React 18+ transform

### ESLint Configuration
- React-specific linting rules
- TypeScript integration
- Accessibility and best practices enforcement