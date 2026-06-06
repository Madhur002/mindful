import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import type { MoodEntry, MoodEntryDraft } from "@/types";

export const createMoodEntry = (
  overrides: Partial<MoodEntry> = {}
): MoodEntry => ({
  id: "entry-1",
  date: "2026-06-06",
  moodScore: 6,
  examType: "NEET",
  triggers: ["Study load"],
  reflectionNote: "Solved physics revision and felt tired.",
  createdAt: "2026-06-06T06:00:00.000Z",
  updatedAt: "2026-06-06T06:00:00.000Z",
  ...overrides
});

export const createMoodDraft = (
  overrides: Partial<MoodEntryDraft> = {}
): MoodEntryDraft => ({
  moodScore: 7,
  examType: "JEE",
  triggers: ["Mock test results", "Time pressure"],
  reflectionNote: "The mock test felt rough, but revision helped.",
  ...overrides
});

type MemoryStorage = Storage & {
  store: Map<string, string>;
};

export const createMemoryStorage = (): MemoryStorage => {
  const store = new Map<string, string>();

  return {
    store,
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys()).at(index) ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    }
  };
};

const Wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
  <>{children}</>
);

export const renderWithApp = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: Wrapper, ...options });
