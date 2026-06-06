"use client";

import * as React from "react";
import { STRESS_TRIGGERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { StressTrigger } from "@/types";

type TriggerSelectorProps = {
  selectedTriggers: readonly StressTrigger[];
  onChange: (triggers: StressTrigger[]) => void;
  error?: string | undefined;
};

const legendId = "stress-trigger-legend";
const descriptionId = "stress-trigger-description";

export const TriggerSelector = React.memo(function TriggerSelector({
  selectedTriggers,
  onChange,
  error
}: TriggerSelectorProps): JSX.Element {
  const toggleTrigger = React.useCallback(
    (trigger: StressTrigger) => {
      const next = selectedTriggers.includes(trigger)
        ? selectedTriggers.filter((item) => item !== trigger)
        : [...selectedTriggers, trigger];
      onChange(next);
    },
    [onChange, selectedTriggers]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, trigger: StressTrigger) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleTrigger(trigger);
      }
    },
    [toggleTrigger]
  );

  return (
    <fieldset
      role="group"
      aria-labelledby={legendId}
      aria-describedby={error ? "stress-trigger-error" : descriptionId}
      className="space-y-3"
    >
      <legend id={legendId} className="text-sm font-semibold">
        Stress triggers
      </legend>
      <p id={descriptionId} className="text-xs text-muted-foreground">
        Select every trigger that shaped today.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {STRESS_TRIGGERS.map((trigger) => {
          const selected = selectedTriggers.includes(trigger);
          return (
            <button
              key={trigger}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggleTrigger(trigger)}
              onKeyDown={(event) => handleKeyDown(event, trigger)}
              className={cn(
                "min-h-11 rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent"
              )}
            >
              {trigger}
            </button>
          );
        })}
      </div>
      {error ? (
        <p id="stress-trigger-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
});
