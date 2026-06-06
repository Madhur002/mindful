"use client";

import { REFLECTION_MAX_LENGTH } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";

type ReflectionTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
};

export const ReflectionTextarea = ({
  value,
  onChange,
  error
}: ReflectionTextareaProps): JSX.Element => (
  <div className="space-y-2">
    <label htmlFor="reflection-note" className="text-sm font-semibold">
      Reflection note
    </label>
    <Textarea
      id="reflection-note"
      maxLength={REFLECTION_MAX_LENGTH}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-describedby={error ? "reflection-counter reflection-error" : "reflection-counter"}
      placeholder="What felt difficult, steady, or hopeful today?"
    />
    <p id="reflection-counter" className="text-right text-xs text-muted-foreground">
      {value.length}/{REFLECTION_MAX_LENGTH}
    </p>
    {error ? (
      <p id="reflection-error" role="alert" className="text-sm text-destructive">
        {error}
      </p>
    ) : null}
  </div>
);
