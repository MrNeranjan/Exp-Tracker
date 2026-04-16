import { registerExpenseSyncBackgroundTask } from '@/services/background-sync-service';
import { processExpenseSyncQueue } from '@/services/expense-sync-service';
import { subscribeNetworkChange } from '@/services/network-service';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

export default function RootLayout() {
  useEffect(() => {
    void registerExpenseSyncBackgroundTask();
    void processExpenseSyncQueue();

    const unsubscribe = subscribeNetworkChange((online) => {
      if (online) {
        void processExpenseSyncQueue();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
        <Stack.Screen
          name="add-liability"
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
