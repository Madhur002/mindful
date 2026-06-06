"use client";

import { EXAM_TYPES } from "@/lib/constants";
import type { ExamType } from "@/types";

type ExamSelectProps = {
  value: ExamType;
  onChange: (value: ExamType) => void;
  error?: string | undefined;
};

export const ExamSelect = ({
  value,
  onChange,
  error
}: ExamSelectProps): JSX.Element => (
  <div className="space-y-2">
    <label htmlFor="exam-type" className="text-sm font-semibold">
      Exam type
    </label>
    <select
      id="exam-type"
      value={value}
      onChange={(event) => onChange(event.target.value as ExamType)}
      aria-describedby={error ? "exam-type-error" : undefined}
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
    >
      {EXAM_TYPES.map((exam) => (
        <option key={exam} value={exam}>
          {exam}
        </option>
      ))}
    </select>
    {error ? (
      <p id="exam-type-error" role="alert" className="text-sm text-destructive">
        {error}
      </p>
    ) : null}
  </div>
);
