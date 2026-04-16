import { processExpenseSyncQueue } from '@/services/expense-sync-service';
import { isNetworkAvailable } from '@/services/network-service';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const EXPENSE_SYNC_TASK = 'expense-sync-background-task';

TaskManager.defineTask(EXPENSE_SYNC_TASK, async () => {
  try {
    const online = await isNetworkAvailable();
    if (!online) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await processExpenseSyncQueue();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerExpenseSyncBackgroundTask(): Promise<void> {
  const alreadyRegistered = await TaskManager.isTaskRegisteredAsync(EXPENSE_SYNC_TASK);
  if (alreadyRegistered) {
    return;
  }

  await BackgroundFetch.registerTaskAsync(EXPENSE_SYNC_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
