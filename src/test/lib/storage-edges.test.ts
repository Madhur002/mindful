import { STORAGE_KEY } from "@/lib/constants";
import {
  filterMoodEntries,
  getMoodEntryByDate,
  loadMoodEntries,
  migrateMoodPayload,
  saveMoodEntries,
  updateMoodEntry
} from "@/lib/storage";
import { createMemoryStorage, createMoodDraft, createMoodEntry } from "@/test/test-utils";

describe("storage edge cases", () => {
  it("handles unavailable storage and invalid JSON", () => {
    expect(loadMoodEntries(null)).toEqual([]);
    expect(() => saveMoodEntries([], null)).not.toThrow();

    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, "{bad json");
    expect(loadMoodEntries(storage)).toEqual([]);
  });

  it("finds entries by date and returns null for missing updates", () => {
    const storage = createMemoryStorage();
    const entry = createMoodEntry();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, entries: [entry] }));

    expect(getMoodEntryByDate(entry.date, storage)?.id).toBe(entry.id);
    expect(updateMoodEntry("missing", createMoodDraft(), storage)).toBeNull();
  });

  it("filters with open-ended date ranges", () => {
    const entries = [
      createMoodEntry({ date: "2026-06-01" }),
      createMoodEntry({ id: "entry-2", date: "2026-06-10" })
    ];

    expect(filterMoodEntries(entries, { from: "2026-06-05" })).toHaveLength(1);
    expect(filterMoodEntries(entries, { to: "2026-06-05" })).toHaveLength(1);
  });

  it("drops malformed legacy entries during migration", () => {
    expect(migrateMoodPayload([null, createMoodEntry()]).entries).toHaveLength(1);
    expect(migrateMoodPayload({ entries: "bad" }).entries).toEqual([]);
  });
});
