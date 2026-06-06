"use client";

import { useMemo } from "react";
import { addDays, parseDateKey, toDateKey } from "@/lib/utils";
import type { MoodEntry } from "@/types";

export const calculateStreak = (
  entries: readonly MoodEntry[],
  todayKey = toDateKey()
): number => {
  const checkedDates = new Set(entries.map((entry) => entry.date));
  let cursor = parseDateKey(todayKey);
  let streak = 0;

  while (checkedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
};

export const useStreak = (entries: readonly MoodEntry[]): number =>
  useMemo(() => calculateStreak(entries), [entries]);
