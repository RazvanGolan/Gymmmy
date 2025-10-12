# 🏋️‍♂️ Gymmy - Complete Workout Tracking App

A comprehensive React Native fitness tracking application built with Expo that helps users track workouts, monitor progress, and use customizable workout templates. Features a modern UI with Tailwind CSS and cloud-based data storage.

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
- **Body Metrics**: Weight and body composition logging
- **Statistical Analysis**: Workout frequency, volume, and strength trends

### 📈 **Statistics**
- **Comprehensive Analytics**: Total workouts, duration, sets, reps, and volume
- **Streak Tracking**: Current and longest workout streaks
- **Weekly Comparisons**: Compare current vs previous week performance
- **Favorite Exercises**: Most performed exercises ranking

### 👤 **Profile Management**
- **User Settings**: Personal information and fitness goals
- **Preferences**: Notifications, privacy, and app customization
- **Data Export**: Export workout data for backup or analysis

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Navigation**: React Navigation 6 (Bottom Tabs + Stack)
- **Styling**: Tailwind CSS via NativeWind
- **State Management**: Zustand with persistence
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: AsyncStorage for offline caching
- **Date Handling**: date-fns
- **Calendar**: react-native-calendars
- **TypeScript**: Full type safety

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

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup
1. Create a new Supabase project
2. Run the following SQL to create tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  weight DECIMAL,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  instructions TEXT[],
  muscle_groups TEXT[],
  equipment TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout templates table
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  estimated_duration INTEGER,
  exercises JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  sets JSONB NOT NULL,
  template_id UUID REFERENCES workout_templates(id),
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress entries table
CREATE TABLE progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('weight', 'body_measurement', 'fitness_test', 'photo')),
  weight DECIMAL,
  body_fat_percentage DECIMAL,
  muscle_mass DECIMAL,
  measurements JSONB,
  notes TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default exercises
INSERT INTO exercises (name, category, muscle_groups, equipment) VALUES
('Bench Press', 'Chest', '{"Chest","Shoulders","Triceps"}', '{"Barbell","Bench"}'),
('Squat', 'Legs', '{"Quadriceps","Glutes","Hamstrings"}', '{"Barbell","Squat Rack"}'),
('Deadlift', 'Back', '{"Back","Glutes","Hamstrings"}', '{"Barbell"}'),
('Pull-ups', 'Back', '{"Back","Biceps"}', '{"Pull-up Bar"}'),
('Overhead Press', 'Shoulders', '{"Shoulders","Triceps"}', '{"Barbell"}');
```

### 4. Run the App
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
4. **Reuse**: Start workouts from saved templates

### Progress Analytics
1. **Exercise History**: Track performance over time
2. **Body Metrics**: Log weight and measurements
3. **Statistical Analysis**: View trends and patterns
4. **Personal Records**: Automatic PR detection

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.