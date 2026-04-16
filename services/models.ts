import type { ExpenseItem } from '@/components/expense/expense-item-card';

export type LiabilityType = 'i-gave' | 'i-owe';

export type LiabilityEntry = {
  id: string;
  person: string;
  amount: number;
  type: LiabilityType;
  dateLabel: string;
  note?: string;
  createdAt: string;
};

export type AppSettings = {
  sheetUrl: string;
  monthlyBudget: number;
};

export type ExpenseSyncOperation = 'create' | 'update' | 'delete';

export type ExpenseSyncQueueItem = {
  id: string;
  operation: ExpenseSyncOperation;
  payload: ExpenseItem;
  previousPayload?: ExpenseItem;
  createdAt: string;
};
