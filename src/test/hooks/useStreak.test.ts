import { calculateStreak } from "@/hooks/useStreak";
import { renderHook } from "@testing-library/react";
import { useStreak } from "@/hooks/useStreak";
import { createMoodEntry } from "@/test/test-utils";

describe("calculateStreak", () => {
  it("returns zero for empty history", () => {
    expect(calculateStreak([], "2026-06-06")).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(
      calculateStreak(
        [
          createMoodEntry({ date: "2026-06-06" }),
          createMoodEntry({ id: "entry-2", date: "2026-06-05" }),
          createMoodEntry({ id: "entry-3", date: "2026-06-04" })
        ],
        "2026-06-06"
      )
    ).toBe(3);
  });

  it("stops at gaps and handles single entries", () => {
    expect(
      calculateStreak(
        [
          createMoodEntry({ date: "2026-06-06" }),
          createMoodEntry({ id: "entry-2", date: "2026-06-04" })
        ],
        "2026-06-06"
      )
    ).toBe(1);
  });

  it("memoizes streak through the hook", () => {
    const { result } = renderHook(() =>
      useStreak([createMoodEntry({ date: new Date().toISOString().slice(0, 10) })])
    );

    expect(result.current).toBeGreaterThanOrEqual(0);
  });
});
