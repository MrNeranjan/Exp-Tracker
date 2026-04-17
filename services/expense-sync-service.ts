import type { ExpenseItem } from '@/components/expense/expense-item-card';
import { getExpenses, saveExpenses } from '@/services/expense-service';
import type { ExpenseSyncOperation, ExpenseSyncQueueItem } from '@/services/models';
import { getSettings } from '@/services/settings-service';
import { STORAGE_KEYS } from '@/services/storage-keys';
import { readJson, writeJson } from '@/services/storage-service';

export async function getExpenseSyncQueue(): Promise<ExpenseSyncQueueItem[]> {
  return readJson<ExpenseSyncQueueItem[]>(STORAGE_KEYS.expenseSyncQueue, []);
}

async function saveExpenseSyncQueue(queue: ExpenseSyncQueueItem[]): Promise<void> {
  await writeJson(STORAGE_KEYS.expenseSyncQueue, queue);
}

type SyncApiResponse = {
  status?: string;
  id?: string;
  message?: string;
};

const toSheetDate = (value?: string): string => {
  const parsed = value ? new Date(value) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveRemoteId = (item: ExpenseSyncQueueItem): string | null => {
  if (item.payload.remoteId) {
    return item.payload.remoteId;
  }

  if (item.previousPayload?.remoteId) {
    return item.previousPayload.remoteId;
  }

  return null;
};

async function attachRemoteIdToExpense(localId: string, remoteId: string): Promise<void> {
  const expenses = await getExpenses();
  let changed = false;

  const next = expenses.map((expense) => {
    if (expense.id !== localId || expense.remoteId === remoteId) {
      return expense;
    }

    changed = true;
    return {
      ...expense,
      remoteId,
    };
  });

  if (changed) {
    await saveExpenses(next);
  }
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

async function sendQueueItem(item: ExpenseSyncQueueItem, endpoint: string): Promise<SyncApiResponse> {
  let requestBody: Record<string, string | number | undefined>;

  if (item.operation === 'create') {
    requestBody = {
      action: 'create',
      date: toSheetDate(item.payload.createdAt),
      amount: item.payload.amount,
      category: item.payload.category,
      note: item.payload.note ?? '',
    };
  } else {
    const remoteId = resolveRemoteId(item);
    if (!remoteId) {
      throw new Error('Missing remote expense ID for update/delete sync');
    }

    if (item.operation === 'update') {
      requestBody = {
        action: 'update',
        id: remoteId,
        date: toSheetDate(item.payload.createdAt),
        amount: item.payload.amount,
        category: item.payload.category,
        note: item.payload.note ?? '',
      };
    } else {
      requestBody = {
        action: 'delete',
        id: remoteId,
      };
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Expense sync failed (${response.status}): ${responseText}`);
  }

  const data = (await response.json()) as SyncApiResponse;
  if (data.status !== 'success') {
    throw new Error(`Expense sync returned non-success status: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function processExpenseSyncQueue(): Promise<void> {
  const queue = await getExpenseSyncQueue();
  if (!queue.length) {
    return;
  }

  const settings = await getSettings();
  const endpoint = settings.sheetUrl.trim();
  if (!endpoint) {
    return;
  }

  const workingQueue = [...queue];

  const remaining: ExpenseSyncQueueItem[] = [];

  for (let i = 0; i < workingQueue.length; i += 1) {
    const item = workingQueue[i];

    try {
      const result = await sendQueueItem(item, endpoint);

      if (item.operation === 'create' && result.id) {
        await attachRemoteIdToExpense(item.payload.id, result.id);

        for (let j = i + 1; j < workingQueue.length; j += 1) {
          const queued = workingQueue[j];
          if (queued.payload.id !== item.payload.id) {
            continue;
          }

          workingQueue[j] = {
            ...queued,
            payload: {
              ...queued.payload,
              remoteId: queued.payload.remoteId ?? result.id,
            },
            previousPayload: queued.previousPayload
              ? {
                  ...queued.previousPayload,
                  remoteId: queued.previousPayload.remoteId ?? result.id,
                }
              : queued.previousPayload,
          };
        }
      }
    } catch {
      remaining.push(item);
    }
  }

  await saveExpenseSyncQueue(remaining);
}
