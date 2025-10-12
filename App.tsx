import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-gray-50">
        <HomeScreen />
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}
