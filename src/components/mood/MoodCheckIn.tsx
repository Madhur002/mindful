"use client";

import * as React from "react";
import type { ZodError } from "zod";
import { Send } from "lucide-react";
import { moodFormSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamSelect } from "@/components/mood/ExamSelect";
import { MoodScoreSlider } from "@/components/mood/MoodScoreSlider";
import { ReflectionTextarea } from "@/components/mood/ReflectionTextarea";
import { TriggerSelector } from "@/components/mood/TriggerSelector";
import type { ExamType, MoodEntry, MoodFormValues, StressTrigger } from "@/types";

type MoodCheckInProps = {
  todayEntry: MoodEntry | null;
  isSubmitting: boolean;
  onSubmit: (values: MoodFormValues) => Promise<void>;
};

type FieldErrors = Partial<Record<keyof MoodFormValues, string>>;

const initialExamType: ExamType = "NEET";

const getFieldErrors = (error: ZodError): FieldErrors => {
  const flattened = error.flatten().fieldErrors;
  const nextErrors: FieldErrors = {};
  const moodError = flattened.moodScore?.at(0);
  const examError = flattened.examType?.at(0);
  const triggerError = flattened.triggers?.at(0);
  const noteError = flattened.reflectionNote?.at(0);

  if (moodError) nextErrors.moodScore = moodError;
  if (examError) nextErrors.examType = examError;
  if (triggerError) nextErrors.triggers = triggerError;
  if (noteError) nextErrors.reflectionNote = noteError;
  return nextErrors;
};

export const MoodCheckIn = ({
  todayEntry,
  isSubmitting,
  onSubmit
}: MoodCheckInProps): JSX.Element => {
  const [moodScore, setMoodScore] = React.useState(todayEntry?.moodScore ?? 5);
  const [examType, setExamType] = React.useState<ExamType>(
    todayEntry?.examType ?? initialExamType
  );
  const [triggers, setTriggers] = React.useState<StressTrigger[]>(
    todayEntry?.triggers ?? []
  );
  const [reflectionNote, setReflectionNote] = React.useState(
    todayEntry?.reflectionNote ?? ""
  );
  const [errors, setErrors] = React.useState<FieldErrors>({});

  React.useEffect(() => {
    if (!todayEntry) return;
    setMoodScore(todayEntry.moodScore);
    setExamType(todayEntry.examType);
    setTriggers(todayEntry.triggers);
    setReflectionNote(todayEntry.reflectionNote);
  }, [todayEntry]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) return;
      const parsed = moodFormSchema.safeParse({
        moodScore,
        examType,
        triggers,
        reflectionNote
      });

      if (!parsed.success) {
        setErrors(getFieldErrors(parsed.error));
        return;
      }

      setErrors({});
      await onSubmit(parsed.data);
    },
    [examType, isSubmitting, moodScore, onSubmit, reflectionNote, triggers]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s check-in</CardTitle>
        <CardDescription>
          {todayEntry ? "Edit your entry until midnight." : "Start with how today feels."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <MoodScoreSlider value={moodScore} onChange={setMoodScore} error={errors.moodScore} />
          <ExamSelect value={examType} onChange={setExamType} error={errors.examType} />
          <TriggerSelector selectedTriggers={triggers} onChange={setTriggers} error={errors.triggers} />
          <ReflectionTextarea
            value={reflectionNote}
            onChange={setReflectionNote}
            error={errors.reflectionNote}
          />
          <Button type="submit" disabled={isSubmitting}>
            <Send aria-hidden="true" className="h-4 w-4" />
            {todayEntry ? "Update check-in" : "Save check-in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
