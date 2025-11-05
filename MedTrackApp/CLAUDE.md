# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MedTrackApp is a React Native mobile application for medication tracking, nutrition monitoring, and health management. The app supports both iOS and Android platforms and uses AsyncStorage for local data persistence.

## Development Commands

### Running the App
```bash
cd MedTrackApp
npx react-native run-ios --list-devices # Run on iOS simulator
npm react-native run-android            # Run on Android emulator
```

### Dependencies
```bash
npm install                  # Install all dependencies
```

## Architecture

### Provider Hierarchy

The app uses a nested provider structure defined in [App.tsx](MedTrackApp/App.tsx):

```
SafeAreaProvider
  └─ MedicationsProvider
     └─ CoursesProvider
        └─ AuthProvider
           └─ AppNavigator
```

This hierarchy is critical - providers must remain in this order as inner providers may depend on outer ones.

### Navigation Structure

The app uses React Navigation with a bottom tab navigator as the root:

- **MainStack**: Home screen, account settings, body diary
- **MedCalendarStack**: Medication calendar, reminder add/edit, medications list
- **ProfileStack**: Profile and statistics
- **DietStack**: Diet tracking, food editing, nutrition statistics
- **TrainingScreen**: Standalone training screen
- **AuthStack**: Login, register, email verification (rendered conditionally)

**iOS vs Android**: The app uses a custom tab bar (`CustomTabBar.tsx`) on iOS with a capsule design, while Android uses the standard React Navigation tab bar. Platform-specific rendering is handled in [AppNavigator.tsx](MedTrackApp/src/navigation/AppNavigator.tsx:92-113).

### State Management

The app uses Context API for global state management with three main contexts:

1. **AuthContext** ([src/auth/AuthContext.tsx](MedTrackApp/src/auth/AuthContext.tsx)): Mock authentication system that persists user state to AsyncStorage. Currently uses simulated delays and fake verification.

2. **MedicationsProvider** ([src/hooks/useMedications.tsx](MedTrackApp/src/hooks/useMedications.tsx)): Manages medication CRUD operations with AsyncStorage persistence.

3. **CoursesProvider** ([src/hooks/useCourses.tsx](MedTrackApp/src/hooks/useCourses.tsx)): Manages medication courses (repeated medication schedules). When deleting a course, it atomically removes associated reminders using `AsyncStorage.multiGet` and `multiSet`.

### Data Model

Key types are defined in [src/types.ts](MedTrackApp/src/types.ts):

- **Reminder**: Individual medication reminder with status ('taken' | 'pending' | 'missed')
- **Medication**: Basic medication info (name, dosage, description)
- **MedicationCourse**: Scheduled medication with repeat patterns ('once' | 'daily' | 'alternate' | 'weekdays')
- **MedicationType**: Visual representation ('tablet', 'capsule', 'liquid', 'injection', 'other')

### Storage Keys

All AsyncStorage keys are centralized in [src/constants/storageKeys.ts](MedTrackApp/src/constants/storageKeys.ts). Always use these constants instead of hardcoded strings.

### Metro Configuration

The app uses a custom Metro config ([metro.config.js](MedTrackApp/metro.config.js)) to support SVG imports via `react-native-svg-transformer`. SVGs are imported as React components, not as image assets.

### Testing

Jest is configured with several mocks for React Native modules. The config ([jest.config.js](MedTrackApp/jest.config.js)) includes:
- Image file mocks
- Notifee mock
- react-native-image-picker mock
- Transform ignore patterns for React Native libraries

## Common Patterns

### AsyncStorage Operations

Use the utility functions in [src/utils/asyncStorageUtils.ts](MedTrackApp/src/utils/asyncStorageUtils.ts) for type-safe storage operations, especially `loadArrayFromStorage<T>`.

### Context Usage

All contexts follow the same pattern:
1. Create context with `createContext<ValueType | undefined>(undefined)`
2. Export a custom hook (e.g., `useAuth`, `useMedications`) that throws if used outside provider
3. Provider manages state and persists to AsyncStorage

### Platform-Specific Code

Use `Platform.OS === 'ios'` for platform checks. The codebase has significant iOS-specific UI customization, particularly in navigation.

## Key Dependencies

- **Navigation**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`
- **UI Components**: `react-native-vector-icons` (MaterialCommunityIcons)
- **Health Integration**: `@kingstinct/react-native-healthkit` (iOS), `react-native-health-connect` (Android)
- **Storage**: `@react-native-async-storage/async-storage`
- **Notifications**: `@notifee/react-native`
- **Charts**: `react-native-chart-kit`
- **Calendar**: `react-native-calendars`

## Code Organization

```
src/
├── auth/              # Authentication context and screens
├── components/        # Reusable UI components
├── constants/         # App-wide constants (storage keys, nutrition defaults)
├── hooks/             # Custom hooks and context providers
├── navigation/        # Navigation configuration and custom tab bar
├── nutrition/         # Nutrition tracking logic (storage, aggregation, types)
├── screens/           # Screen components organized by feature
├── utils/             # Utility functions (storage, notifications, etc.)
└── types.ts           # Shared TypeScript types
```

## Important Notes

- The authentication system is currently mock/local only - there's no backend integration
- All data is stored locally in AsyncStorage
- The app uses React 19.0.0 and React Native 0.78.0
- TypeScript strict mode is not enabled (extends from React Native default config)
