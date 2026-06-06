"use client";

import * as React from "react";
import { HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { AsyncStatus, WellnessResponse as WellnessResponseType } from "@/types";

type WellnessResponseProps = {
  status: AsyncStatus;
  response: WellnessResponseType | null;
  error: string | null;
  fallback: boolean;
};

const responseSections = [
  ["Coping strategy", "copingStrategy"],
  ["Motivation", "motivation"],
  ["Mindfulness exercise", "mindfulnessExercise"],
  ["Study-balance tip", "studyTip"]
] as const;

export const WellnessResponse = React.memo(
  React.forwardRef<HTMLElement, WellnessResponseProps>(function WellnessResponse(
    { status, response, error, fallback },
    ref
  ): JSX.Element {
    if (status === "loading") {
      return (
        <section ref={ref} tabIndex={-1} aria-live="polite" aria-busy="true">
          <LoadingSkeleton label="Generating wellness support" />
        </section>
      );
    }

    if (!response) {
      return (
        <section ref={ref} tabIndex={-1} aria-live="polite">
          <EmptyState
            title="AI support appears after your check-in"
            description="Your coping strategy, motivation, breathing exercise, and study tip will show here."
          />
        </section>
      );
    }

    return (
      <section
        ref={ref}
        tabIndex={-1}
        aria-live="polite"
      >
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <HeartHandshake aria-hidden="true" className="h-5 w-5 text-primary" />
              <CardTitle>Personal wellness support</CardTitle>
              {fallback ? <Badge tone="warning">Fallback</Badge> : null}
            </div>
            <CardDescription>
              Warm, non-clinical support tailored to today&apos;s check-in.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {error ? <p role="status" className="sm:col-span-2 text-sm text-muted-foreground">{error}</p> : null}
            {responseSections.map(([title, key]) => (
              <article key={key} className="rounded-md border bg-background p-4">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {response[key]}
                </p>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>
    );
  })
);
