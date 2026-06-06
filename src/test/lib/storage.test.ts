import { STORAGE_KEY, STORAGE_VERSION } from "@/lib/constants";
import {
  clearMoodEntries,
  deleteMoodEntry,
  loadMoodEntries,
  saveMoodEntries,
  updateMoodEntry,
  upsertMoodEntryForDate
} from "@/lib/storage";
import { createMemoryStorage, createMoodDraft, createMoodEntry } from "@/test/test-utils";

describe("storage", () => {
  it("saves and retrieves entries", () => {
    const storage = createMemoryStorage();
    const entry = createMoodEntry();

    saveMoodEntries([entry], storage);

    expect(loadMoodEntries(storage)).toEqual([entry]);
  });

  it("creates and updates one entry for the same date", () => {
    const storage = createMemoryStorage();
    const first = upsertMoodEntryForDate(createMoodDraft(), "2026-06-06", storage);
    const updated = upsertMoodEntryForDate(
      createMoodDraft({ moodScore: 4, reflectionNote: "Updated note" }),
      "2026-06-06",
      storage
    );

    expect(updated.id).toBe(first.id);
    expect(loadMoodEntries(storage)).toHaveLength(1);
    expect(loadMoodEntries(storage)[0]?.moodScore).toBe(4);
  });

  it("updates and deletes by id", () => {
    const storage = createMemoryStorage();
    const entry = upsertMoodEntryForDate(createMoodDraft(), "2026-06-06", storage);

    const updated = updateMoodEntry(
      entry.id,
      createMoodDraft({ examType: "CAT" }),
      storage
    );
    deleteMoodEntry(entry.id, storage);

    expect(updated?.examType).toBe("CAT");
    expect(loadMoodEntries(storage)).toEqual([]);
  });

  it("migrates legacy array payloads", () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify([createMoodEntry()]));

    const entries = loadMoodEntries(storage);
    const payload = JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}") as {
      version?: number;
    };

    expect(entries).toHaveLength(1);
    expect(payload.version).toBe(STORAGE_VERSION);
  });

  it("clears entries", () => {
    const storage = createMemoryStorage();
    saveMoodEntries([createMoodEntry()], storage);
    clearMoodEntries(storage);

    expect(loadMoodEntries(storage)).toEqual([]);
  });
});
