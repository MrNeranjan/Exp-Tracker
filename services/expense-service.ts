import type { ExpenseItem } from '@/components/expense/expense-item-card';
import { STORAGE_KEYS } from '@/services/storage-keys';
import { readJson, writeJson } from '@/services/storage-service';

export async function getExpenses(): Promise<ExpenseItem[]> {
  return readJson<ExpenseItem[]>(STORAGE_KEYS.expenses, []);
}

export async function saveExpenses(expenses: ExpenseItem[]): Promise<void> {
  await writeJson(STORAGE_KEYS.expenses, expenses);
}

export async function addExpense(expense: ExpenseItem): Promise<ExpenseItem[]> {
  const current = await getExpenses();
  const next = [expense, ...current.filter((item) => item.id !== expense.id)];
  await saveExpenses(next);
  return next;
}

export async function updateExpense(updated: ExpenseItem): Promise<ExpenseItem[]> {
  const current = await getExpenses();
  const next = current.map((entry) => (entry.id === updated.id ? updated : entry));
  await saveExpenses(next);
  return next;
}

export async function deleteExpense(id: string): Promise<ExpenseItem[]> {
  const current = await getExpenses();
  const next = current.filter((entry) => entry.id !== id);
  await saveExpenses(next);
  return next;
}
