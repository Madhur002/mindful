import {
  addDays,
  formatDisplayDate,
  getMoodBandIndex,
  parseDateKey,
  toDateKey
} from "@/lib/utils";

describe("utils", () => {
  it("formats and shifts dates", () => {
    const date = parseDateKey("2026-06-06");

    expect(toDateKey(date)).toBe("2026-06-06");
    expect(toDateKey(addDays(date, -1))).toBe("2026-06-05");
    expect(formatDisplayDate("2026-06-06")).toContain("2026");
  });

  it("maps mood scores into color bands", () => {
    expect([1, 3, 5, 7, 9].map(getMoodBandIndex)).toEqual([0, 1, 2, 3, 4]);
  });
});
