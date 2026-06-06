import {
  moodEntrySchema,
  wellnessApiResultSchema,
  wellnessRequestSchema,
  wellnessResponseSchema
} from "@/lib/validators";
import { createMoodEntry } from "@/test/test-utils";

const wellnessResponse = {
  copingStrategy: "Take a short reset and write the next tiny action.",
  motivation: "NEET prep is demanding, and effort still matters today.",
  mindfulnessExercise: "Inhale, hold, exhale, and repeat slowly.",
  studyTip: "Pair revision with breaks so recall stays fresh."
};

describe("validators", () => {
  it("accepts a valid mood entry", () => {
    expect(moodEntrySchema.safeParse(createMoodEntry()).success).toBe(true);
  });

  it("rejects an invalid mood entry", () => {
    const result = moodEntrySchema.safeParse(
      createMoodEntry({ moodScore: 12 })
    );

    expect(result.success).toBe(false);
  });

  it("accepts valid wellness requests and responses", () => {
    expect(
      wellnessRequestSchema.safeParse({
        moodScore: 5,
        examType: "UPSC",
        triggers: ["Fear of failure"],
        reflectionNote: "Feeling unsure today."
      }).success
    ).toBe(true);
    expect(wellnessResponseSchema.safeParse(wellnessResponse).success).toBe(true);
    expect(
      wellnessApiResultSchema.safeParse({
        response: wellnessResponse,
        fallback: false
      }).success
    ).toBe(true);
  });

  it("rejects malformed API responses", () => {
    expect(
      wellnessApiResultSchema.safeParse({
        response: { copingStrategy: "short" },
        fallback: false
      }).success
    ).toBe(false);
  });
});
