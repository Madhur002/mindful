"use client";

import { CalendarCheck } from "lucide-react";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { useStreak } from "@/hooks/useStreak";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { MoodCalendar } from "@/components/mood/MoodCalendar";
import { MoodChart } from "@/components/mood/MoodChart";
import { JournalList } from "@/components/journal/JournalList";

export default function HistoryClient(): JSX.Element {
  const { entries, removeEntry } = useMoodHistory();
  const streak = useStreak(entries);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">History and trends</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Patterns across mood, triggers, and reflections.
            </p>
          </div>
          <Badge tone="success" className="gap-2 text-sm">
            <CalendarCheck aria-hidden="true" className="h-4 w-4" />
            {streak} day streak
          </Badge>
        </div>
      </section>
      <ErrorBoundary fallbackTitle="Mood charts could not load.">
        <MoodChart entries={entries} />
      </ErrorBoundary>
      <MoodCalendar entries={entries} />
      <JournalList entries={entries} onDelete={removeEntry} />
    </div>
  );
}
