import type { ExpenseItem } from '@/components/expense/expense-item-card';
import type { ExpenseSyncOperation, ExpenseSyncQueueItem } from '@/services/models';
import { STORAGE_KEYS } from '@/services/storage-keys';
import { readJson, writeJson } from '@/services/storage-service';

const endpoint = process.env.EXPO_PUBLIC_GOOGLE_SHEETS_ENDPOINT;

export async function getExpenseSyncQueue(): Promise<ExpenseSyncQueueItem[]> {
  return readJson<ExpenseSyncQueueItem[]>(STORAGE_KEYS.expenseSyncQueue, []);
}

async function saveExpenseSyncQueue(queue: ExpenseSyncQueueItem[]): Promise<void> {
  await writeJson(STORAGE_KEYS.expenseSyncQueue, queue);
}

export async function enqueueExpenseSync(
  operation: ExpenseSyncOperation,
  payload: ExpenseItem,
  previousPayload?: ExpenseItem
): Promise<void> {
  const queue = await getExpenseSyncQueue();

  queue.push({
    id: `sync-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    operation,
    payload,
    previousPayload,
    createdAt: new Date().toISOString(),
  });

  await saveExpenseSyncQueue(queue);
}

async function sendQueueItem(item: ExpenseSyncQueueItem): Promise<void> {
  if (!endpoint) {
    return;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entity: 'expense',
      operation: item.operation,
      payload: item.payload,
      previousPayload: item.previousPayload,
      sentAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Expense sync failed (${response.status}): ${responseText}`);
  }
}

export async function processExpenseSyncQueue(): Promise<void> {
  const queue = await getExpenseSyncQueue();
  if (!queue.length) {
    return;
  }

  const remaining: ExpenseSyncQueueItem[] = [];

  for (const item of queue) {
    try {
      await sendQueueItem(item);
    } catch {
      remaining.push(item);
    }
  }

  await saveExpenseSyncQueue(remaining);
}
