import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/constants";
import { moodEntrySchema, moodFormSchema, storagePayloadSchema } from "@/lib/validators";
import { toDateKey } from "@/lib/utils";
import type { DateRangeFilter, MoodEntry, MoodEntryDraft } from "@/types";

export type MoodStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type StoragePayload = {
  version: typeof STORAGE_VERSION;
  entries: MoodEntry[];
};

const getBrowserStorage = (): MoodStorage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const sortMoodEntries = (entries: readonly MoodEntry[]): MoodEntry[] =>
  [...entries].sort((first, second) => second.date.localeCompare(first.date));

const createEntryId = (dateKey: string): string =>
  `mood-${dateKey}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeLegacyEntry = (
  value: unknown,
  index: number
): MoodEntry | null => {
  if (!isRecord(value)) {
    return null;
  }

  const date = typeof value.date === "string" ? value.date : toDateKey();
  const now = new Date().toISOString();
  const candidate = {
    ...value,
    id: typeof value.id === "string" ? value.id : createEntryId(`${date}-${index}`),
    date,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
    reflectionNote:
      typeof value.reflectionNote === "string" ? value.reflectionNote : ""
  };
  const parsed = moodEntrySchema.safeParse(candidate);

  return parsed.success ? parsed.data : null;
};

export const migrateMoodPayload = (input: unknown): StoragePayload => {
  const current = storagePayloadSchema.safeParse(input);
  if (current.success) {
    return { version: STORAGE_VERSION, entries: sortMoodEntries(current.data.entries) };
  }

  const legacyEntries = Array.isArray(input)
    ? input
    : isRecord(input) && Array.isArray(input.entries)
      ? input.entries
      : [];
  const migrated = legacyEntries
    .map((entry, index) => normalizeLegacyEntry(entry, index))
    .filter((entry): entry is MoodEntry => entry !== null);

  return { version: STORAGE_VERSION, entries: sortMoodEntries(migrated) };
};

const readRawPayload = (storage: MoodStorage | null): unknown => {
  if (storage === null) {
    return { version: STORAGE_VERSION, entries: [] };
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    return { version: STORAGE_VERSION, entries: [] };
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { version: STORAGE_VERSION, entries: [] };
  }
};

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

export const clearMoodEntries = (
  storage: MoodStorage | null = getBrowserStorage()
): void => {
  storage?.removeItem(STORAGE_KEY);
};

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
): void => {
  saveMoodEntries(
    loadMoodEntries(storage).filter((entry) => entry.id !== id),
    storage
  );
};

export const filterMoodEntries = (
  entries: readonly MoodEntry[],
  range: DateRangeFilter
): MoodEntry[] =>
  sortMoodEntries(
    entries.filter((entry) => {
      const afterFrom = range.from ? entry.date >= range.from : true;
      const beforeTo = range.to ? entry.date <= range.to : true;
      return afterFrom && beforeTo;
    })
  );
