# Gymmy - Your Fitness Companion 🏋️‍♀️

A modern React Native fitness tracking app built with Expo and styled with Tailwind CSS (NativeWind).

## 📱 Features

- **Workout Tracking**: Log your exercises, sets, reps, and weights
- **Progress Monitoring**: Track your fitness journey with detailed analytics
- **User-Friendly Interface**: Clean, modern design with Tailwind CSS
- **Cross-Platform**: Runs on iOS, Android, and Web

## 🛠️ Tech Stack

- **React Native** with **Expo** for cross-platform development
- **TypeScript** for type safety
- **NativeWind** for Tailwind CSS styling
- **React Native Reanimated** for smooth animations
- **Safe Area Context** for proper device handling

## 🚀 Getting Started

### Prerequisites

- Node.js (v20.19.4 or higher recommended)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RazvanGolan/Gymmmy.git
   cd Gymmmy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   - **iOS**: `npm run ios`
   - **Android**: `npm run android`
   - **Web**: `npm run web`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── WelcomeCard.tsx
│   └── QuickActions.tsx
├── screens/             # App screens
│   ├── HomeScreen.tsx
│   ├── WorkoutScreen.tsx
│   └── ProgressScreen.tsx
├── types/               # TypeScript type definitions
│   └── index.ts
```

## 🎨 Styling

This project uses NativeWind, which brings the power of Tailwind CSS to React Native. You can use all your favorite Tailwind utilities:

```tsx
<View className="flex-1 bg-gray-50 p-4">
  <Text className="text-xl font-bold text-gray-900">
    Hello World!
  </Text>
</View>
```

## 🔧 Configuration

The project includes:
- **Tailwind CSS** configuration in `tailwind.config.js`
- **Metro** configuration for NativeWind in `metro.config.js`
- **Babel** configuration for plugins in `babel.config.js`
- **TypeScript** configuration in `tsconfig.json`

## 📦 Dependencies

### Main Dependencies
- `expo`: Expo SDK
- `react-native`: React Native framework
- `nativewind`: Tailwind CSS for React Native
- `react-native-reanimated`: Animation library
- `react-native-safe-area-context`: Safe area handling

### Dev Dependencies
- `typescript`: TypeScript support
- `tailwindcss`: Tailwind CSS core
- `@types/react`: React type definitions

## 🚧 Development Status

This is currently a skeleton/starter project with:
- ✅ Basic app structure
- ✅ Tailwind CSS setup
- ✅ TypeScript configuration
- ✅ Component architecture
- 🔄 Workout tracking (coming soon)
- 🔄 Progress analytics (coming soon)
- 🔄 User authentication (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using React Native and Expo