"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  buildMoodTrend,
  calculateTriggerFrequency,
  detectMoodInsight
} from "@/lib/analytics";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MoodEntry } from "@/types";

type MoodChartProps = {
  entries: readonly MoodEntry[];
};

const chartMargin = { top: 10, right: 12, left: -18, bottom: 0 };
const gridColor = "hsl(190 16% 82%)";
const moodColor = "hsl(183 82% 25%)";
const triggerColor = "hsl(350 84% 60%)";

export const MoodChart = React.memo(function MoodChart({
  entries
}: MoodChartProps): JSX.Element {
  const sevenDayTrend = React.useMemo(() => buildMoodTrend(entries, 7), [entries]);
  const thirtyDayTrend = React.useMemo(() => buildMoodTrend(entries, 30), [entries]);
  const triggerFrequency = React.useMemo(
    () => calculateTriggerFrequency(entries),
    [entries]
  );
  const insight = React.useMemo(() => detectMoodInsight(entries), [entries]);

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No trend data yet"
        description="Add your first check-in to unlock 7-day and 30-day mood patterns."
      />
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="mood-trends-heading">
      <div>
        <h2 id="mood-trends-heading" className="text-lg font-semibold">Mood trends</h2>
        <p className="text-sm text-muted-foreground">{insight}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">7-day mood</h3>
          <div className="mt-3 h-56" aria-label="7-day mood trend chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sevenDayTrend} margin={chartMargin}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="moodScore" stroke={moodColor} strokeWidth={3} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">30-day mood</h3>
          <div className="mt-3 h-56" aria-label="30-day mood trend chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={thirtyDayTrend} margin={chartMargin}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={6} />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="moodScore" stroke={moodColor} strokeWidth={3} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
      <article className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold">Most frequent triggers</h3>
        {triggerFrequency.length > 0 ? (
          <div className="mt-3 h-60" aria-label="Stress trigger frequency chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={triggerFrequency} margin={chartMargin}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="trigger" tick={{ fontSize: 10 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill={triggerColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="mt-3 text-sm text-muted-foreground">No triggers selected yet.</p>}
      </article>
    </section>
  );
});
