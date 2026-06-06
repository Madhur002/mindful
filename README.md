# Mindful Prep

A production-ready mental wellness tracker for Indian students preparing for NEET, JEE, CUET, CAT, GATE, UPSC, and board examinations. The app helps students record daily mood, identify stress triggers, journal reflections, receive Gemini-powered coping support, and monitor well-being trends over time.

## Problem Statement

Exam-prep students often face stress, anxiety, burnout, self-doubt, and emotional uncertainty during preparation and result seasons. Mindful Prep provides a local-first MVP that makes daily emotional tracking simple, private, accessible, and tied to the student's exam context.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `GEMINI_API_KEY` | Yes for live AI | Google Gemini API key. Read only by `src/app/api/wellness/route.ts`; never sent to the client. |

If the key is absent or Gemini fails, the API returns a validated static fallback response.

## Architecture

```text
Browser
  |
  | localStorage via useMoodHistory
  v
Next.js App Router pages
  |-- /              Daily check-in + AI response + compact trends
  |-- /history       Mood charts, calendar heatmap, journal filters
  |-- /resources     Static wellness resources and India helplines
  |
  | POST /api/wellness
  v
Validated server route
  |-- Zod request validation
  |-- 10 KB body guard
  |-- IP rate limit
  |-- reflection sanitization
  |-- Gemini server-side call
  |-- Zod response validation
  |-- static fallback on failure
```

## Commands

```bash
npm run typecheck
npm run lint
npm test -- --coverage
npm run build
npm audit
```

Coverage thresholds are enforced globally in `jest.config.ts`: 90% statements, 85% branches, 90% functions, 90% lines.

## Deployment

```bash
npm run build
vercel deploy
```

The app is Vercel-ready with App Router routes, strict TypeScript, security headers in `next.config.ts`, and `.env` excluded from git.

## Accessibility Notes

- Semantic landmarks are used for header, nav, main, sections, articles, and footer.
- Mood score uses a labeled range input with slider ARIA values.
- Stress triggers are keyboard-selectable checkboxes with `aria-checked`.
- AI support uses `aria-live="polite"` and loading regions use `aria-busy`.
- Validation errors use `role="alert"` and labels/description IDs are wired to form controls.
- Focus moves to the AI support region after check-in submission.
- CSS preserves visible focus rings and prevents horizontal overflow at narrow widths.
- Component accessibility is covered with `jest-axe`.

## Requirements Traceability

| Requirement | Implementation |
|---|---|
| Daily mood tracking | `src/components/mood/MoodCheckIn.tsx`, `src/hooks/useMoodHistory.ts`, `src/lib/storage.ts` |
| Mood scale 1-10 with emoji anchors | `src/components/mood/MoodScoreSlider.tsx`, `src/lib/constants.ts` |
| Exam selector | `src/components/mood/ExamSelect.tsx`, `src/lib/constants.ts` |
| Exact stress trigger categories | `src/components/mood/TriggerSelector.tsx`, `src/lib/constants.ts` |
| Reflection note, max 500 chars | `src/components/mood/ReflectionTextarea.tsx`, `src/lib/validators.ts` |
| One check-in per day, edit until midnight | `src/lib/storage.ts`, `src/hooks/useMoodHistory.ts` |
| Gemini-powered wellness support | `src/app/api/wellness/route.ts`, `src/hooks/useWellnessAI.ts` |
| Request and response validation | `src/lib/validators.ts`, `src/app/api/wellness/route.ts` |
| Prompt sanitization | `src/lib/sanitize.ts`, `src/app/api/wellness/route.ts` |
| Fallback AI response | `src/lib/constants.ts`, `src/app/api/wellness/route.ts`, `src/hooks/useWellnessAI.ts` |
| 7-day and 30-day trends | `src/components/mood/MoodChart.tsx`, `src/lib/analytics.ts` |
| Trigger frequency visualization | `src/components/mood/MoodChart.tsx`, `src/lib/analytics.ts` |
| Streak counter | `src/hooks/useStreak.ts`, `src/app/page.tsx`, `src/components/history/HistoryClient.tsx` |
| Calendar heatmap | `src/components/mood/MoodCalendar.tsx` |
| Pattern insight card | `src/lib/analytics.ts`, `src/components/mood/MoodChart.tsx` |
| Emotion journal list and filters | `src/components/journal/JournalList.tsx`, `src/components/journal/JournalEntry.tsx` |
| Wellness resources and India helplines | `src/components/resources/ResourcesClient.tsx`, `src/lib/constants.ts` |
| Security headers | `next.config.ts` |
| Versioned localStorage schema | `src/lib/storage.ts` |
| Production-safe logging | `src/lib/logger.ts` |
| Automated tests and axe checks | `src/test/**`, `jest.config.ts`, `jest.setup.ts` |

Helpline details are linked in-app to current public pages for [iCALL](https://icallhelpline.org/faqs/) and [Vandrevala Foundation](https://www.vandrevalafoundation.com/free-counseling/contact-us).
