import type { AppSettings } from '@/services/models';
import { STORAGE_KEYS } from '@/services/storage-keys';
import { readJson, writeJson } from '@/services/storage-service';

const defaultSettings: AppSettings = {
  sheetUrl: process.env.EXPO_PUBLIC_GOOGLE_SHEETS_ENDPOINT ?? '',
  monthlyBudget: 0,
};

export async function getSettings(): Promise<AppSettings> {
  return readJson<AppSettings>(STORAGE_KEYS.settings, defaultSettings);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeJson(STORAGE_KEYS.settings, settings);
}
