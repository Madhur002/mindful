import {
  buildMoodTrend,
  calculateTriggerFrequency,
  detectMoodInsight
} from "@/lib/analytics";
import { createMoodEntry } from "@/test/test-utils";

describe("analytics", () => {
  it("builds mood trends and trigger frequencies", () => {
    const entries = [
      createMoodEntry({ date: "2026-06-05", moodScore: 3, triggers: ["Mock test results"] }),
      createMoodEntry({ id: "entry-2", date: "2026-06-06", moodScore: 7, triggers: ["Study load"] })
    ];

    expect(buildMoodTrend(entries, 7)).toHaveLength(7);
    expect(calculateTriggerFrequency(entries)).toEqual(
      expect.arrayContaining([
        { trigger: "Mock test results", count: 1 },
        { trigger: "Study load", count: 1 }
      ])
    );
  });

  it("detects mock-test mood drops", () => {
    const entries = [
      createMoodEntry({ moodScore: 8, triggers: ["Study load"] }),
      createMoodEntry({ id: "entry-2", date: "2026-06-05", moodScore: 3, triggers: ["Mock test results"] })
    ];

    expect(detectMoodInsight(entries)).toBe(
      "Your mood tends to drop before mock tests."
    );
  });
});
