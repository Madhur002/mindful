import { STORAGE_VERSION } from "@/lib/constants";
import { moodEntrySchema, storagePayloadSchema } from "@/lib/validators";
import { toDateKey } from "@/lib/utils";
import type { StoragePayload } from "@/lib/storagePayload";
import type { MoodEntry } from "@/types";

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
