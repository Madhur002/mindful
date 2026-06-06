"use client";

import { useCallback, useMemo, useState } from "react";
import {
  deleteMoodEntry,
  filterMoodEntries,
  loadMoodEntries,
  updateMoodEntry,
  upsertMoodEntryForDate
} from "@/lib/storage";
import { toDateKey } from "@/lib/utils";
import type { DateRangeFilter, MoodEntry, MoodEntryDraft } from "@/types";

type MoodHistoryApi = {
  entries: MoodEntry[];
  todayEntry: MoodEntry | null;
  upsertToday: (draft: MoodEntryDraft, dateKey?: string) => MoodEntry;
  updateEntry: (id: string, draft: MoodEntryDraft) => MoodEntry | null;
  removeEntry: (id: string) => void;
  getByDateRange: (range: DateRangeFilter) => MoodEntry[];
  refresh: () => void;
};

export const useMoodHistory = (): MoodHistoryApi => {
  const [entries, setEntries] = useState<MoodEntry[]>(() => loadMoodEntries());
  const todayKey = toDateKey();

  const refresh = useCallback(() => {
    setEntries(loadMoodEntries());
  }, []);

  const upsertToday = useCallback(
    (draft: MoodEntryDraft, dateKey = toDateKey()) => {
      const saved = upsertMoodEntryForDate(draft, dateKey);
      refresh();
      return saved;
    },
    [refresh]
  );

  const updateEntry = useCallback(
    (id: string, draft: MoodEntryDraft) => {
      const saved = updateMoodEntry(id, draft);
      refresh();
      return saved;
    },
    [refresh]
  );

  const removeEntry = useCallback(
    (id: string) => {
      deleteMoodEntry(id);
      refresh();
    },
    [refresh]
  );

  const getByDateRange = useCallback(
    (range: DateRangeFilter) => filterMoodEntries(entries, range),
    [entries]
  );

  const todayEntry = useMemo(
    () => entries.find((entry) => entry.date === todayKey) ?? null,
    [entries, todayKey]
  );

  return {
    entries,
    todayEntry,
    upsertToday,
    updateEntry,
    removeEntry,
    getByDateRange,
    refresh
  };
};
