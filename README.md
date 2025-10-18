# 🏋️‍♂️ Gymmy - Complete Workout Tracking App

A comprehensive React Native fitness tracking application built with Expo that helps users track workouts, monitor progress, and use customizable workout templates. Features a modern UI with Tailwind CSS and local SQLite database storage for a single-user experience.

## ✨ Features
### 🏠 **Home/Calendar View**
- **Monthly Calendar**: Visual representation of workout history with color-coded completion status
- **Daily Workout Overview**: View and manage workouts for any selected date
- **Quick Stats**: Display total workouts, current streak, and weekly progress
- **Quick Actions**: Start free workouts or choose from favorite templates

### 🏋️ **Workout Session**
- **Interactive Workout Tracking**: Real-time set, rep, and weight logging
- **Exercise Management**: Add/remove exercises during workout
- **Progress Tracking**: Visual completion indicators for each set
- **Workout Notes**: Add personal notes and observations
- **Template Integration**: Start workouts from saved templates

### 📋 **Workout Templates**
- **Template Creation**: Build reusable workout routines
- **Exercise Library**: Comprehensive database of exercises with categories
- **Template Management**: Edit, duplicate, and organize templates
- **Usage Analytics**: Track which templates are used most frequently

### 📊 **Progress Tracking**
- **Exercise History**: Detailed progression tracking for each exercise
- **Personal Records**: Automatic PR detection and tracking
- **Body Metrics**: Weight and body composition logging with target weight goals
- **Statistical Analysis**: Workout frequency, volume, and strength trends
- **Progress Charts**: Visual representation of weight progress towards goals

### 📈 **Statistics**
- **Comprehensive Analytics**: Total workouts, duration, sets, reps, and volume
- **Streak Tracking**: Current and longest workout streaks
- **Weekly Comparisons**: Compare current vs previous week performance
- **Exercise Frequency**: Most performed exercises ranking with usage analytics

### 👤 **Profile & Settings**
- **Target Weight Goals**: Set and track progress towards weight goals
- **App Settings**: Customize app behavior and preferences
- **Data Management**: Local data storage with reset capabilities

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Navigation**: React Navigation 6 (Bottom Tabs + Stack)
- **Styling**: Tailwind CSS via NativeWind
- **State Management**: Zustand with optimized hook architecture
- **Database**: SQLite (expo-sqlite) for local storage
- **Storage**: Local SQLite database with persistent data
- **Date Handling**: date-fns
- **Calendar**: react-native-calendars
- **TypeScript**: Full type safety
- **Architecture**: Single-user local-first application

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator or physical device

### 1. Clone and Install
```bash
git clone <repository-url>
cd Gymmy
npm install
```

### 2. Run the App
```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🚀 Key Functionalities

### Workout Flow
1. **Select Date**: Choose workout date from calendar
2. **Choose Method**: Start custom workout or select template
3. **Track Session**: Log exercises, sets, reps, and weights
4. **Complete**: Save workout with notes and duration

### Template System
1. **Create Template**: Build custom workout routines
2. **Exercise Selection**: Choose from comprehensive exercise database
3. **Configure Details**: Set target sets, reps, and weights
4. **Reuse**: Start workouts from saved templates with usage tracking

### Progress Analytics
1. **Exercise History**: Track performance over time
2. **Body Metrics**: Log weight, measurements, and track towards target goals
3. **Statistical Analysis**: View trends and patterns with real-time calculations
4. **Progress Charts**: Visual weight tracking with target goal visualization

### Data Management
- **Local Storage**: All data stored locally in SQLite database
- **Single User**: Designed for individual use without authentication
- **Performance Optimized**: Separated hooks architecture for efficient rendering
- **Real-time Stats**: Live calculations from actual workout data

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.