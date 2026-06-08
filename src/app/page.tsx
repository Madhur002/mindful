"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CalendarCheck,
  Check,
  Clock3,
  HeartPulse,
  Leaf,
  Moon,
  Send,
  Sparkles,
  Wind
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EXAM_TYPES, MOOD_ANCHORS, STRESS_TRIGGERS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { useStreak } from "@/hooks/useStreak";
import { useWellnessAI } from "@/hooks/useWellnessAI";
import type {
  AsyncStatus,
  ExamType,
  MoodFormValues,
  StressTrigger,
  WellnessResponse as WellnessResponseType
} from "@/types";

type JourneyStep = "intro" | "exam" | "mood" | "frustration" | "reflection" | "support";

const journeySteps: JourneyStep[] = ["intro", "exam", "mood", "frustration", "reflection", "support"];
const navLinks = [
  { label: "Today", href: "/" },
  { label: "History", href: "/history" },
  { label: "Resources", href: "/resources" }
] as const;

const stepCopy: Record<JourneyStep, { eyebrow: string; title: string; note: string }> = {
  intro: {
    eyebrow: "Mindful Prep",
    title: "Preparation with a calmer nervous system.",
    note: "A gentle check-in for students who want structure, support, and a kinder next study block."
  },
  exam: {
    eyebrow: "Step 01",
    title: "Choose the exam shaping today.",
    note: "Your plan should respond to the pressure you are actually carrying."
  },
  mood: {
    eyebrow: "Step 02",
    title: "Set the emotional weather.",
    note: "The sticker changes with your mood so the journey feels alive, not clinical."
  },
  frustration: {
    eyebrow: "Step 03",
    title: "Name the study friction.",
    note: "Pick the pressure points that made preparation heavier today."
  },
  reflection: {
    eyebrow: "Step 04",
    title: "Write one honest sentence.",
    note: "This gives your support a little context and a human center."
  },
  support: {
    eyebrow: "Step 05",
    title: "Receive your next reset.",
    note: "Save the journey to generate a focused wellness response."
  }
};

const moodStickers = [
  {
    max: 2,
    emoji: "😮‍💨",
    title: "Heavy mind",
    note: "Start tiny. One breath, one page, one pause.",
    glow: "from-[#b7c7e6] to-[#f2d8df]"
  },
  {
    max: 4,
    emoji: "🌧️",
    title: "Tender day",
    note: "Lower the noise before raising the effort.",
    glow: "from-[#b9c5d8] to-[#e8d3db]"
  },
  {
    max: 6,
    emoji: "🌤️",
    title: "Finding steadiness",
    note: "You can build momentum gently.",
    glow: "from-[#f5d7a7] to-[#e5c8d8]"
  },
  {
    max: 8,
    emoji: "🙂",
    title: "Clear enough",
    note: "Protect this rhythm with real breaks.",
    glow: "from-[#c8e3cf] to-[#efd1c2]"
  },
  {
    max: 10,
    emoji: "✨",
    title: "Bright focus",
    note: "Use the energy without spending all of it.",
    glow: "from-[#f7de9d] to-[#cfe6da]"
  }
] as const;

const responseSections = [
  ["Coping", "copingStrategy"],
  ["Motivation", "motivation"],
  ["Mindfulness", "mindfulnessExercise"],
  ["Study tip", "studyTip"]
] as const;

export default function DashboardPage(): JSX.Element {
  const { entries, todayEntry, upsertToday, updateEntry } = useMoodHistory();
  const ai = useWellnessAI();
  const streak = useStreak(entries);
  const responseRef = React.useRef<HTMLElement | null>(null);

  const [stepIndex, setStepIndex] = React.useState(0);
  const [moodScore, setMoodScore] = React.useState(todayEntry?.moodScore ?? 5);
  const [examType, setExamType] = React.useState<ExamType>(todayEntry?.examType ?? "NEET");
  const [triggers, setTriggers] = React.useState<StressTrigger[]>(todayEntry?.triggers ?? []);
  const [reflectionNote, setReflectionNote] = React.useState(todayEntry?.reflectionNote ?? "");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!todayEntry) return;
    setMoodScore(todayEntry.moodScore);
    setExamType(todayEntry.examType);
    setTriggers(todayEntry.triggers);
    setReflectionNote(todayEntry.reflectionNote);
  }, [todayEntry]);

  const currentStep = journeySteps[stepIndex] ?? "intro";
  const activeSticker = moodStickers.find((sticker) => moodScore <= sticker.max) ?? moodStickers[2];
  const storedResponse = todayEntry?.wellnessResponse ?? null;
  const displayedResponse: WellnessResponseType | null = ai.response ?? storedResponse;
  const displayedStatus: AsyncStatus =
    ai.status === "idle" && displayedResponse ? "success" : ai.status;

  const toggleTrigger = React.useCallback((trigger: StressTrigger) => {
    setTriggers((selected) =>
      selected.includes(trigger)
        ? selected.filter((item) => item !== trigger)
        : [...selected, trigger]
    );
  }, []);

  const canAdvance = React.useMemo(() => {
    if (currentStep === "frustration") return triggers.length > 0;
    if (currentStep === "reflection") return reflectionNote.trim().length >= 8;
    return true;
  }, [currentStep, reflectionNote, triggers.length]);

  const handleNext = React.useCallback(() => {
    if (!canAdvance) {
      setError(
        currentStep === "frustration"
          ? "Select at least one pressure point before moving ahead."
          : "Write a short note with at least 8 characters."
      );
      return;
    }

    setError(null);
    setStepIndex((index) => Math.min(index + 1, journeySteps.length - 1));
  }, [canAdvance, currentStep]);

  const handleBack = React.useCallback(() => {
    setError(null);
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const handleSubmit = React.useCallback(async () => {
    const { moodFormSchema } = await import("@/lib/validators");
    const parsed = moodFormSchema.safeParse({
      moodScore,
      examType,
      triggers,
      reflectionNote
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Complete the journey before saving.");
      return;
    }

    setError(null);
    const values: MoodFormValues = parsed.data;
    const saved = upsertToday(values);
    const supportPromise = ai.requestSupport(values);

    window.requestAnimationFrame(() => responseRef.current?.focus());
    const response = await supportPromise;
    updateEntry(saved.id, { ...values, wellnessResponse: response });
    window.requestAnimationFrame(() => responseRef.current?.focus());
  }, [ai, examType, moodScore, reflectionNote, triggers, updateEntry, upsertToday]);

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#fbf0ef] p-3 text-[#2b2426] sm:p-6">
      <section className="mindful-hero-panel relative mx-auto flex h-full w-full max-w-[1480px] flex-col overflow-hidden rounded-[26px] border border-white/60 bg-[#d6c5c8] px-4 py-4 shadow-[0_26px_110px_rgba(108,73,86,0.16)] sm:rounded-[34px] sm:px-8 sm:py-7">
        <div className="mindful-ornament mindful-ornament-left" aria-hidden="true" />
        <div className="mindful-ornament mindful-ornament-right" aria-hidden="true" />
        <div className="mindful-lotus" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_49%_35%,rgba(202,133,190,0.32),transparent_22%),radial-gradient(circle_at_56%_62%,rgba(239,111,93,0.25),transparent_23%),linear-gradient(115deg,rgba(199,163,162,0.52),rgba(241,234,235,0.78)_58%,rgba(207,195,200,0.86))]" />

        <header className="relative z-10 flex h-14 shrink-0 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b2426]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/30 text-[#5f4548]">
              <HeartPulse aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight sm:text-base">Mindful Prep</span>
              <span className="hidden text-xs text-[#6d5d61] sm:block">Exam wellness journey</span>
            </span>
          </Link>
          <nav aria-label="Primary navigation" className="hidden rounded-full border border-white/50 bg-white/24 p-1 shadow-inner shadow-white/20 backdrop-blur-xl md:block">
            <ul className="flex items-center gap-1">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex h-10 items-center rounded-full px-5 text-sm font-bold text-[#5d4a50] transition hover:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b2426]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Badge tone="success" className="h-10 rounded-full border-white/60 bg-white/75 px-3 text-xs text-[#5a3d42] shadow-sm sm:px-4 sm:text-sm">
            <CalendarCheck aria-hidden="true" className="h-4 w-4" />
            {streak} day streak
          </Badge>
        </header>

        <div className="relative z-10 grid min-h-0 flex-1 gap-4 pt-3 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_410px]">
          <main className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-[28px] border border-white/35 bg-white/18 p-4 backdrop-blur-xl sm:p-6">
            <section key={currentStep} className="mindful-step-stage min-h-0 text-[#2b2426]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/45 px-3 py-2 text-xs font-bold uppercase text-[#8c4b3f]">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                {stepCopy[currentStep].eyebrow}
              </div>
              <h1 className="max-w-4xl font-serif text-[clamp(2.35rem,5.25vw,5.35rem)] font-bold leading-[0.96] text-[#211c1e]">
                {stepCopy[currentStep].title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#5c5054] sm:text-lg">
                {stepCopy[currentStep].note}
              </p>
            </section>

            <section className="mt-4 min-h-0 overflow-auto rounded-[24px] border border-white/45 bg-white/34 p-3 text-[#2b2426] shadow-[0_18px_60px_rgba(80,58,64,0.11)] sm:p-4">
              {currentStep === "intro" ? (
                <div className="grid h-full min-h-0 content-center gap-3 sm:grid-cols-3">
                  {[
                    ["Listen", "Start with how your body and mind feel before planning."],
                    ["Name", "Choose the exam pressure and the exact frustrations."],
                    ["Reset", "Receive a compact support plan for the next study block."]
                  ].map(([title, copy]) => (
                    <article key={title} className="rounded-2xl border border-white/55 bg-white/55 p-3">
                      <h2 className="text-base font-bold">{title}</h2>
                      <p className="mt-1 text-sm leading-5 text-[#665a5d]">{copy}</p>
                    </article>
                  ))}
                </div>
              ) : null}

              {currentStep === "exam" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {EXAM_TYPES.map((exam) => (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => setExamType(exam)}
                      className={cn(
                        "flex min-h-12 items-center justify-between rounded-2xl border px-4 text-left text-base font-bold transition",
                        examType === exam
                          ? "border-white bg-white text-[#52353b] shadow-sm"
                          : "border-white/45 bg-white/28 text-[#51454a] hover:bg-white/45"
                      )}
                    >
                      {exam}
                      {examType === exam ? <Check aria-hidden="true" className="h-5 w-5" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}

              {currentStep === "mood" ? (
                <div className="space-y-5">
                  <label htmlFor="journey-mood" className="flex items-end justify-between gap-4">
                    <span className="text-lg font-bold">Mood score</span>
                    <span className="font-serif text-5xl font-bold text-[#3a2b30]">{moodScore}/10</span>
                  </label>
                  <input
                    id="journey-mood"
                    type="range"
                    min={1}
                    max={10}
                    value={moodScore}
                    onChange={(event) => setMoodScore(Number(event.target.value))}
                    aria-label="Mood score"
                    className="h-2 w-full accent-[#6f454d]"
                  />
                  <div className="flex justify-between text-sm font-semibold text-[#6d5d61]">
                    {MOOD_ANCHORS.map((anchor) => (
                      <span key={anchor.score}>{anchor.label}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              {currentStep === "frustration" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {STRESS_TRIGGERS.map((trigger) => {
                    const selected = triggers.includes(trigger);
                    return (
                      <button
                        key={trigger}
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        onClick={() => toggleTrigger(trigger)}
                        className={cn(
                          "min-h-12 rounded-2xl border px-4 text-left text-sm font-bold transition",
                          selected
                            ? "border-white bg-white text-[#52353b] shadow-sm"
                            : "border-white/45 bg-white/28 text-[#51454a] hover:bg-white/45"
                        )}
                      >
                        {trigger}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {currentStep === "reflection" ? (
                <div className="space-y-3">
                  <label htmlFor="journey-reflection" className="text-lg font-bold">
                    Reflection note
                  </label>
                  <textarea
                    id="journey-reflection"
                    value={reflectionNote}
                    onChange={(event) => setReflectionNote(event.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-white/55 bg-white/78 px-4 py-3 text-base leading-7 text-[#2b2426] shadow-inner placeholder:text-[#7a686d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f454d]"
                    placeholder="Today I feel..."
                  />
                  <p className="text-sm font-semibold text-[#6d5d61]">{reflectionNote.length}/500</p>
                </div>
              ) : null}

              {currentStep === "support" ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Exam", examType],
                    ["Mood", `${moodScore}/10`],
                    ["Pressures", `${triggers.length} selected`]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/55 bg-white/54 p-4">
                      <p className="text-xs font-bold uppercase text-[#9a5a48]">{label}</p>
                      <p className="mt-2 text-lg font-bold text-[#2b2426]">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {error ? (
                <p role="alert" className="mt-3 rounded-2xl bg-white/82 px-4 py-3 text-sm font-bold text-[#8b2f31]">
                  {error}
                </p>
              ) : null}
            </section>

            <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1" aria-label="Journey progress">
                {journeySteps.map((step, index) => (
                  <span
                    key={step}
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      index === stepIndex ? "w-9 bg-[#2b2426]" : "w-2 bg-white/65"
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={stepIndex === 0 || ai.status === "loading"}
                  className="h-11 rounded-full border-white/65 bg-white/35 px-4 text-[#3a2b30] hover:bg-white/55"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Back
                </Button>
                {currentStep === "support" ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={ai.status === "loading"}
                    className="h-11 rounded-full bg-[#2b2426] px-5 text-white hover:bg-[#49383d]"
                  >
                    <Send aria-hidden="true" className="h-4 w-4" />
                    {todayEntry ? "Update journey" : "Save journey"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-11 rounded-full bg-[#2b2426] px-5 text-white hover:bg-[#49383d]"
                  >
                    {currentStep === "intro" ? "Start your journey" : "Continue"}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </main>

          <aside className="hidden min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-2.5 lg:grid">
            <section className="relative overflow-hidden rounded-[26px] border border-white/48 bg-white/32 p-4 shadow-[0_18px_60px_rgba(70,52,58,0.13)] backdrop-blur-xl">
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-75", activeSticker.glow)} />
              <div className="relative z-10">
                <p className="text-sm font-bold uppercase text-[#8f4e42]">Mood sticker</p>
                <div className="mt-2 flex items-center gap-4">
                  <div key={activeSticker.emoji} className="mindful-sticker-card flex h-28 w-28 items-center justify-center rounded-[28px] border border-white/70 bg-white/56 text-6xl shadow-[0_20px_45px_rgba(72,52,60,0.18)]">
                    <span aria-hidden="true">{activeSticker.emoji}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2b2426]">{activeSticker.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#5f5356]">{activeSticker.note}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2.5">
              <article className="rounded-[22px] border border-white/48 bg-white/36 p-3 backdrop-blur-xl">
                <div className="mindful-breath-orbit mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#8c6a70]/25">
                  <Wind aria-hidden="true" className="h-7 w-7 text-[#6f454d]" />
                </div>
                <h3 className="mt-2 font-bold">Meditation</h3>
                <p className="mt-1 text-xs leading-5 text-[#665a5d]">4 rounds of slow breathing before the next chapter.</p>
              </article>
              <article className="rounded-[22px] border border-white/48 bg-white/36 p-3 backdrop-blur-xl">
                <div className="mindful-pomodoro-ring mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                  <Clock3 aria-hidden="true" className="h-7 w-7 text-[#6f454d]" />
                </div>
                <h3 className="mt-2 font-bold">Pomodoro</h3>
                <p className="mt-1 text-xs leading-5 text-[#665a5d]">25 minutes focus, 5 minutes away from the desk.</p>
              </article>
            </div>

            <section
              ref={responseRef}
              tabIndex={-1}
              aria-live="polite"
              aria-busy={displayedStatus === "loading"}
              className="min-h-0 overflow-auto rounded-[26px] border border-white/48 bg-white/42 p-4 shadow-[0_18px_60px_rgba(70,52,58,0.13)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-2">
                <Brain aria-hidden="true" className="h-5 w-5 text-[#6f454d]" />
                <h2 className="text-xl font-bold">AI support panel</h2>
              </div>
              {displayedStatus === "loading" ? (
                <div className="mt-4 space-y-3">
                  <div className="h-20 animate-pulse rounded-2xl bg-white/55" />
                  <div className="h-20 animate-pulse rounded-2xl bg-white/45" />
                </div>
              ) : displayedResponse ? (
                <div className="mt-4 grid gap-3">
                  {responseSections.map(([title, key]) => (
                    <article key={key} className="rounded-2xl border border-white/55 bg-white/55 p-3">
                      <h3 className="text-sm font-bold text-[#8f4e42]">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#51464a]">{displayedResponse[key]}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-white/55 bg-white/48 p-4">
                  <Leaf aria-hidden="true" className="h-6 w-6 text-[#6f454d]" />
                  <p className="mt-3 text-sm leading-6 text-[#5f5356]">
                    Complete the journey and your coping strategy, mindfulness exercise, and study tip will appear here.
                  </p>
                </div>
              )}
              {ai.error ? <p className="mt-3 text-sm text-[#8b2f31]">{ai.error}</p> : null}
            </section>
          </aside>
        </div>

        <div className="relative z-10 mt-3 grid shrink-0 gap-3 lg:hidden">
          <div className="flex items-center gap-3 rounded-2xl border border-white/48 bg-white/40 p-3">
            <span className="text-4xl" aria-hidden="true">{activeSticker.emoji}</span>
            <div>
              <p className="text-sm font-bold">{activeSticker.title}</p>
              <p className="text-xs text-[#665a5d]">{activeSticker.note}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/48 bg-white/36 p-3">
              <Moon aria-hidden="true" className="h-5 w-5 text-[#6f454d]" />
              <p className="mt-1 text-sm font-bold">Meditation</p>
            </div>
            <div className="rounded-2xl border border-white/48 bg-white/36 p-3">
              <Clock3 aria-hidden="true" className="h-5 w-5 text-[#6f454d]" />
              <p className="mt-1 text-sm font-bold">Pomodoro</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
