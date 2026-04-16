import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-expense"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
