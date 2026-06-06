import { STRESS_TRIGGERS } from "@/lib/constants";
import { getLastDateKeys } from "@/lib/utils";
import type { MoodEntry, StressTrigger, TrendPoint, TriggerFrequency } from "@/types";

export const buildMoodTrend = (
  entries: readonly MoodEntry[],
  days: number
): TrendPoint[] => {
  const byDate = new Map(entries.map((entry) => [entry.date, entry.moodScore] as const));
  return getLastDateKeys(days).map((date) => ({
    date,
    moodScore: byDate.get(date) ?? null
  }));
};

export const averageMood = (entries: readonly MoodEntry[]): number | null => {
  if (entries.length === 0) return null;
  return entries.reduce((sum, entry) => sum + entry.moodScore, 0) / entries.length;
};

export const calculateTriggerFrequency = (
  entries: readonly MoodEntry[]
): TriggerFrequency[] => {
  const counts = new Map<StressTrigger, number>();
  STRESS_TRIGGERS.forEach((trigger) => counts.set(trigger, 0));
  entries.forEach((entry) => {
    entry.triggers.forEach((trigger) =>
      counts.set(trigger, (counts.get(trigger) ?? 0) + 1)
    );
  });

  return STRESS_TRIGGERS.map((trigger) => ({
    trigger,
    count: counts.get(trigger) ?? 0
  })).filter((item) => item.count > 0);
};

export const detectMoodInsight = (entries: readonly MoodEntry[]): string => {
  const overall = averageMood(entries);
  const mockEntries = entries.filter((entry) =>
    entry.triggers.includes("Mock test results")
  );
  const mockAverage = averageMood(mockEntries);

  if (overall !== null && mockAverage !== null && overall - mockAverage >= 1) {
    return "Your mood tends to drop before mock tests.";
  }

  return "Keep tracking for a few more days to reveal stronger stress patterns.";
};
