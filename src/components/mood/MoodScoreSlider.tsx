"use client";

import { MOOD_ANCHORS, MOOD_MAX, MOOD_MIN } from "@/lib/constants";

type MoodScoreSliderProps = {
  value: number;
  onChange: (value: number) => void;
  error?: string | undefined;
};

export const MoodScoreSlider = ({
  value,
  onChange,
  error
}: MoodScoreSliderProps): JSX.Element => (
  <div className="space-y-3">
    <label htmlFor="mood-score" className="text-sm font-semibold">
      Mood score: {value}/10
    </label>
    <input
      id="mood-score"
      type="range"
      min={MOOD_MIN}
      max={MOOD_MAX}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      aria-label="Mood score"
      aria-valuemin={MOOD_MIN}
      aria-valuemax={MOOD_MAX}
      aria-valuenow={value}
      aria-describedby={error ? "mood-score-error" : undefined}
      className="h-2 w-full accent-primary"
    />
    <div className="flex justify-between text-xs text-muted-foreground">
      {MOOD_ANCHORS.map((anchor) => (
        <span key={anchor.score}>
          <span aria-hidden="true">{anchor.emoji}</span> {anchor.score}
        </span>
      ))}
    </div>
    {error ? (
      <p id="mood-score-error" role="alert" className="text-sm text-destructive">
        {error}
      </p>
    ) : null}
  </div>
);
