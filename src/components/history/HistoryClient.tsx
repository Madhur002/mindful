"use client";

import { useMoodHistory } from "@/hooks/useMoodHistory";
import { useStreak } from "@/hooks/useStreak";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SanctuaryFrame } from "@/components/layout/SanctuaryFrame";
import { MoodCalendar } from "@/components/mood/MoodCalendar";
import { MoodChart } from "@/components/mood/MoodChart";
import { JournalList } from "@/components/journal/JournalList";

export default function HistoryClient(): JSX.Element {
  const { entries, removeEntry } = useMoodHistory();
  const streak = useStreak(entries);

  return (
    <SanctuaryFrame
      eyebrow="Mood memory"
      title="History and trends"
      description="A softer archive of your preparation days: mood signals, recurring pressure, and the reflections that show how you kept going."
      streak={streak}
    >
      <div className="grid gap-5">
        <ErrorBoundary fallbackTitle="Mood charts could not load.">
          <MoodChart entries={entries} />
        </ErrorBoundary>
        <MoodCalendar entries={entries} />
        <JournalList entries={entries} onDelete={removeEntry} />
      </div>
    </SanctuaryFrame>
  );
}
