import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/constants";
import { filterMoodEntries } from "@/lib/storageFilters";
import { migrateMoodPayload, sortMoodEntries } from "@/lib/storageMigration";
import {
  getBrowserStorage,
  readRawPayload,
  type MoodStorage,
  type StoragePayload
} from "@/lib/storagePayload";
import { moodEntrySchema, moodFormSchema, storagePayloadSchema } from "@/lib/validators";
import { toDateKey } from "@/lib/utils";
import type { MoodEntry, MoodEntryDraft } from "@/types";

const createEntryId = (dateKey: string): string =>
  `mood-${dateKey}-${Math.random().toString(36).slice(2, 10)}`;

export { filterMoodEntries, migrateMoodPayload, sortMoodEntries };
export type { MoodStorage };

export const saveMoodEntries = (
  entries: readonly MoodEntry[],
  storage: MoodStorage | null = getBrowserStorage()
): void => {
  if (storage === null) {
    return;
  }

  const payload: StoragePayload = {
    version: STORAGE_VERSION,
    entries: sortMoodEntries(entries)
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const loadMoodEntries = (
  storage: MoodStorage | null = getBrowserStorage()
): MoodEntry[] => {
  const rawPayload = readRawPayload(storage);
  const payload = migrateMoodPayload(rawPayload);
  const wasCurrent = storagePayloadSchema.safeParse(rawPayload).success;

  if (storage !== null && !wasCurrent) {
    saveMoodEntries(payload.entries, storage);
  }

  return payload.entries;
};

export const clearMoodEntries = (storage: MoodStorage | null = getBrowserStorage()): void =>
  storage?.removeItem(STORAGE_KEY);

export const getMoodEntryByDate = (
  dateKey: string,
  storage: MoodStorage | null = getBrowserStorage()
): MoodEntry | null =>
  loadMoodEntries(storage).find((entry) => entry.date === dateKey) ?? null;

export const upsertMoodEntryForDate = (
  draft: MoodEntryDraft,
  dateKey = toDateKey(),
  storage: MoodStorage | null = getBrowserStorage()
): MoodEntry => {
  const { wellnessResponse: draftWellnessResponse, ...moodDraft } = draft;
  const parsedDraft = moodFormSchema.parse(moodDraft);
  const entries = loadMoodEntries(storage);
  const existing = entries.find((entry) => entry.date === dateKey);
  const now = new Date().toISOString();
  const wellnessResponse =
    draftWellnessResponse ?? existing?.wellnessResponse ?? undefined;
  const candidate = {
    ...parsedDraft,
    id: existing?.id ?? createEntryId(dateKey),
    date: dateKey,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    ...(wellnessResponse ? { wellnessResponse } : {})
  };
  const saved = moodEntrySchema.parse(candidate);
  const nextEntries = existing
    ? entries.map((entry) => (entry.id === existing.id ? saved : entry))
    : [saved, ...entries];

  saveMoodEntries(nextEntries, storage);
  return saved;
};

export const updateMoodEntry = (
  id: string,
  draft: MoodEntryDraft,
  storage: MoodStorage | null = getBrowserStorage()
): MoodEntry | null => {
  const entries = loadMoodEntries(storage);
  const existing = entries.find((entry) => entry.id === id);
  if (!existing) {
    return null;
  }

  const { wellnessResponse: draftWellnessResponse, ...moodDraft } = draft;
  const parsedDraft = moodFormSchema.parse(moodDraft);
  const wellnessResponse =
    draftWellnessResponse ?? existing.wellnessResponse ?? undefined;
  const candidate = {
    ...existing,
    ...parsedDraft,
    updatedAt: new Date().toISOString(),
    ...(wellnessResponse ? { wellnessResponse } : {})
  };
  const saved = moodEntrySchema.parse(candidate);
  saveMoodEntries(
    entries.map((entry) => (entry.id === id ? saved : entry)),
    storage
  );

  return saved;
};

export const deleteMoodEntry = (
  id: string,
  storage: MoodStorage | null = getBrowserStorage()
): void =>
  saveMoodEntries(
    loadMoodEntries(storage).filter((entry) => entry.id !== id),
    storage
  );
