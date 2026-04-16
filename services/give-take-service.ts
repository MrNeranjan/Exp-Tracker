import type { LiabilityEntry } from '@/services/models';
import { STORAGE_KEYS } from '@/services/storage-keys';
import { readJson, writeJson } from '@/services/storage-service';

export async function getGiveTakeEntries(): Promise<LiabilityEntry[]> {
  return readJson<LiabilityEntry[]>(STORAGE_KEYS.giveTake, []);
}

export async function saveGiveTakeEntries(entries: LiabilityEntry[]): Promise<void> {
  await writeJson(STORAGE_KEYS.giveTake, entries);
}

export async function addGiveTakeEntry(entry: LiabilityEntry): Promise<LiabilityEntry[]> {
  const current = await getGiveTakeEntries();
  const next = [entry, ...current.filter((item) => item.id !== entry.id)];
  await saveGiveTakeEntries(next);
  return next;
}

export async function updateGiveTakeEntry(updated: LiabilityEntry): Promise<LiabilityEntry[]> {
  const current = await getGiveTakeEntries();
  const next = current.map((entry) => (entry.id === updated.id ? updated : entry));
  await saveGiveTakeEntries(next);
  return next;
}

export async function deleteGiveTakeEntry(id: string): Promise<LiabilityEntry[]> {
  const current = await getGiveTakeEntries();
  const next = current.filter((entry) => entry.id !== id);
  await saveGiveTakeEntries(next);
  return next;
}
