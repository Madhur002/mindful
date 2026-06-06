import { act, renderHook, waitFor } from "@testing-library/react";
import { useMoodHistory } from "@/hooks/useMoodHistory";
import { createMoodDraft } from "@/test/test-utils";

describe("useMoodHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds, updates, and filters entries", async () => {
    const { result } = renderHook(() => useMoodHistory());

    await waitFor(() => expect(result.current.entries).toEqual([]));

    act(() => {
      result.current.upsertToday(createMoodDraft(), "2026-06-01");
      result.current.upsertToday(
        createMoodDraft({ examType: "GATE", moodScore: 5 }),
        "2026-06-03"
      );
    });

    const first = result.current.entries.find((entry) => entry.date === "2026-06-01");
    expect(first).toBeDefined();

    act(() => {
      if (first) {
        result.current.updateEntry(first.id, createMoodDraft({ moodScore: 9 }));
      }
    });

    expect(result.current.entries.find((entry) => entry.id === first?.id)?.moodScore).toBe(9);
    expect(
      result.current.getByDateRange({ from: "2026-06-02", to: "2026-06-04" })
    ).toHaveLength(1);
  });
});
