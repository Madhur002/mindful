"use client";

import * as React from "react";
import { MOOD_HEAT_CLASSES } from "@/lib/constants";
import { cn, formatDisplayDate, getLastDateKeys, getMoodBandIndex } from "@/lib/utils";
import type { MoodEntry } from "@/types";

type MoodCalendarProps = {
  entries: readonly MoodEntry[];
};

export const MoodCalendar = React.memo(function MoodCalendar({
  entries
}: MoodCalendarProps): JSX.Element {
  const days = React.useMemo(() => getLastDateKeys(30), []);
  const entriesByDate = React.useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry] as const)),
    [entries]
  );

  return (
    <section className="rounded-[28px] border border-white/55 bg-white/34 p-5 backdrop-blur-xl" aria-labelledby="calendar-heading">
      <h2 id="calendar-heading" className="text-xl font-bold text-[#2b2426]">Mood calendar</h2>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10" role="list">
        {days.map((date) => {
          const entry = entriesByDate.get(date);
          const moodClass = entry
            ? MOOD_HEAT_CLASSES[getMoodBandIndex(entry.moodScore)]
            : "border-muted bg-muted text-muted-foreground";
          return (
            <div
              key={date}
              role="listitem"
              aria-label={
                entry
                  ? `${formatDisplayDate(date)} mood ${entry.moodScore} out of 10`
                  : `${formatDisplayDate(date)} no check-in`
              }
              className={cn(
                "flex aspect-square min-h-10 items-center justify-center rounded-2xl border text-xs font-bold shadow-sm",
                moodClass
              )}
              title={formatDisplayDate(date)}
            >
              {entry?.moodScore ?? "-"}
            </div>
          );
        })}
      </div>
    </section>
  );
});
