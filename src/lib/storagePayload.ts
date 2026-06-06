import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/constants";
import type { MoodEntry } from "@/types";

export type MoodStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type StoragePayload = {
  version: typeof STORAGE_VERSION;
  entries: MoodEntry[];
};

export const emptyStoragePayload = (): StoragePayload => ({
  version: STORAGE_VERSION,
  entries: []
});

export const getBrowserStorage = (): MoodStorage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const readRawPayload = (storage: MoodStorage | null): unknown => {
  if (storage === null) {
    return emptyStoragePayload();
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    return emptyStoragePayload();
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return emptyStoragePayload();
  }
};
