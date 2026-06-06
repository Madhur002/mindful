import { sortMoodEntries } from "@/lib/storageMigration";
import type { DateRangeFilter, MoodEntry } from "@/types";

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
