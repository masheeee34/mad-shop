import "server-only";
import { readJSON, writeJSON } from "./store";

const FILE = "settings.json";

export type StoreSettings = {
  testMode: boolean;
};

const DEFAULT_SETTINGS: StoreSettings = {
  testMode: false,
};

export async function getSettings(): Promise<StoreSettings> {
  return readJSON<StoreSettings>(FILE, DEFAULT_SETTINGS);
}

export async function setSettings(settings: StoreSettings): Promise<void> {
  await writeJSON(FILE, settings);
}
