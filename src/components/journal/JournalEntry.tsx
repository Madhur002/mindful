"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDisplayDate } from "@/lib/utils";
import type { MoodEntry } from "@/types";

type JournalEntryProps = {
  entry: MoodEntry;
  onDelete?: ((id: string) => void) | undefined;
};

export const JournalEntry = React.memo(function JournalEntry({
  entry,
  onDelete
}: JournalEntryProps): JSX.Element {
  const handleDelete = React.useCallback(() => {
    onDelete?.(entry.id);
  }, [entry.id, onDelete]);

  return (
    <article>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{formatDisplayDate(entry.date)}</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="calm">Mood {entry.moodScore}/10</Badge>
                <Badge tone="success">{entry.examType}</Badge>
              </div>
            </div>
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete journal entry for ${formatDisplayDate(entry.date)}`}
                onClick={handleDelete}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {entry.reflectionNote || "No reflection note added."}
          </p>
          {entry.triggers.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Stress triggers">
              {entry.triggers.map((trigger) => (
                <Badge key={trigger}>{trigger}</Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </article>
  );
});
