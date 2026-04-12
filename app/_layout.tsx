import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Exp-Tracker' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
