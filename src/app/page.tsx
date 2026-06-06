"use client";

import * as React from "react";
import { CalendarCheck } from "lucide-react";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { useStreak } from "@/hooks/useStreak";
import { useWellnessAI } from "@/hooks/useWellnessAI";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { MoodCheckIn } from "@/components/mood/MoodCheckIn";
import { MoodChart } from "@/components/mood/MoodChart";
import { WellnessResponse } from "@/components/ai/WellnessResponse";
import type { AsyncStatus, MoodFormValues, WellnessResponse as WellnessResponseType } from "@/types";

export default function DashboardPage(): JSX.Element {
  const { entries, todayEntry, upsertToday, updateEntry } = useMoodHistory();
  const ai = useWellnessAI();
  const streak = useStreak(entries);
  const responseRef = React.useRef<HTMLElement | null>(null);

  const handleCheckIn = React.useCallback(
    async (values: MoodFormValues) => {
      const saved = upsertToday(values);
      const supportPromise = ai.requestSupport(values);

      window.requestAnimationFrame(() => responseRef.current?.focus());
      const response = await supportPromise;
      updateEntry(saved.id, { ...values, wellnessResponse: response });
      window.requestAnimationFrame(() => responseRef.current?.focus());
    },
    [ai, updateEntry, upsertToday]
  );

  const storedResponse = todayEntry?.wellnessResponse ?? null;
  const displayedResponse: WellnessResponseType | null = ai.response ?? storedResponse;
  const displayedStatus: AsyncStatus =
    ai.status === "idle" && displayedResponse ? "success" : ai.status;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-5">
        <div>
          <h1 className="text-2xl font-bold">Daily mood check-in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track mood, triggers, reflection, and exam-specific wellness support.
          </p>
        </div>
        <Badge tone="success" className="gap-2 text-sm">
          <CalendarCheck aria-hidden="true" className="h-4 w-4" />
          {streak} day streak
        </Badge>
      </section>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <ErrorBoundary fallbackTitle="Mood check-in could not load.">
          <MoodCheckIn
            todayEntry={todayEntry}
            isSubmitting={ai.status === "loading"}
            onSubmit={handleCheckIn}
          />
        </ErrorBoundary>
        <ErrorBoundary fallbackTitle="Wellness support could not load.">
          <WellnessResponse
            ref={responseRef}
            status={displayedStatus}
            response={displayedResponse}
            error={ai.error}
            fallback={ai.fallback}
          />
        </ErrorBoundary>
      </div>
      <ErrorBoundary fallbackTitle="Mood chart could not load.">
        <MoodChart entries={entries} />
      </ErrorBoundary>
    </div>
  );
}
