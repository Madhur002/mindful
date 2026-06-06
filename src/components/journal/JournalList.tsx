"use client";

import * as React from "react";
import { EXAM_TYPES, STRESS_TRIGGERS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { JournalEntry } from "@/components/journal/JournalEntry";
import type { ExamType, MoodEntry, StressTrigger } from "@/types";

type JournalListProps = {
  entries: readonly MoodEntry[];
  onDelete?: (id: string) => void;
};

export const JournalList = ({ entries, onDelete }: JournalListProps): JSX.Element => {
  const [query, setQuery] = React.useState("");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [examType, setExamType] = React.useState<ExamType | "all">("all");
  const [trigger, setTrigger] = React.useState<StressTrigger | "all">("all");

  const filteredEntries = React.useMemo(
    () =>
      entries.filter((entry) => {
        const matchesQuery = entry.reflectionNote
          .toLowerCase()
          .includes(query.toLowerCase().trim());
        const matchesFrom = fromDate ? entry.date >= fromDate : true;
        const matchesTo = toDate ? entry.date <= toDate : true;
        const matchesExam = examType === "all" ? true : entry.examType === examType;
        const matchesTrigger =
          trigger === "all" ? true : entry.triggers.includes(trigger);
        return matchesQuery && matchesFrom && matchesTo && matchesExam && matchesTrigger;
      }),
    [entries, examType, fromDate, query, toDate, trigger]
  );

  return (
    <section aria-labelledby="journal-heading" className="space-y-4">
      <div>
        <h2 id="journal-heading" className="text-lg font-semibold">Emotion journal</h2>
        <p className="text-sm text-muted-foreground">
          Search and filter past reflections stored on this device.
        </p>
      </div>
      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-5">
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="journal-search" className="text-sm font-semibold">Search</label>
          <Input
            id="journal-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reflection text"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="journal-from" className="text-sm font-semibold">From</label>
          <Input id="journal-from" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="journal-to" className="text-sm font-semibold">To</label>
          <Input id="journal-to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="journal-exam" className="text-sm font-semibold">Exam</label>
          <select
            id="journal-exam"
            value={examType}
            onChange={(event) => setExamType(event.target.value as ExamType | "all")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All exams</option>
            {EXAM_TYPES.map((exam) => <option key={exam} value={exam}>{exam}</option>)}
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="journal-trigger" className="text-sm font-semibold">Trigger</label>
          <select
            id="journal-trigger"
            value={trigger}
            onChange={(event) => setTrigger(event.target.value as StressTrigger | "all")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All triggers</option>
            {STRESS_TRIGGERS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      {filteredEntries.length > 0 ? (
        <div className="grid gap-3" aria-live="polite">
          {filteredEntries.map((entry) => (
            <JournalEntry key={entry.id} entry={entry} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No journal entries match"
          description="Try changing the date range, exam, trigger, or search text."
        />
      )}
    </section>
  );
};
