import type { z } from "zod";
import type {
  moodEntrySchema,
  moodFormSchema,
  stressTriggerSchema,
  wellnessApiResultSchema,
  wellnessRequestSchema,
  wellnessResponseSchema,
  examTypeSchema
} from "@/lib/validators";

export type ExamType = z.infer<typeof examTypeSchema>;
export type StressTrigger = z.infer<typeof stressTriggerSchema>;
export type WellnessResponse = z.infer<typeof wellnessResponseSchema>;
export type WellnessRequest = z.infer<typeof wellnessRequestSchema>;
export type WellnessApiResult = z.infer<typeof wellnessApiResultSchema>;
export type MoodEntry = z.infer<typeof moodEntrySchema>;
export type MoodFormValues = z.infer<typeof moodFormSchema>;

export type MoodEntryDraft = MoodFormValues & {
  wellnessResponse?: WellnessResponse;
};

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type DateRangeFilter = {
  from?: string;
  to?: string;
};

export type TrendPoint = {
  date: string;
  moodScore: number | null;
};

export type TriggerFrequency = {
  trigger: StressTrigger;
  count: number;
};
