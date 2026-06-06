import { z } from "zod";
import {
  EXAM_TYPES,
  MOOD_MAX,
  MOOD_MIN,
  REFLECTION_MAX_LENGTH,
  STORAGE_VERSION,
  STRESS_TRIGGERS
} from "@/lib/constants";

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const examTypeSchema = z.enum(EXAM_TYPES);
export const stressTriggerSchema = z.enum(STRESS_TRIGGERS);

export const moodScoreSchema = z
  .number()
  .int()
  .min(MOOD_MIN)
  .max(MOOD_MAX);

export const reflectionNoteSchema = z
  .string()
  .max(REFLECTION_MAX_LENGTH)
  .transform((value) => value.trim());

export const wellnessResponseSchema = z
  .object({
    copingStrategy: z.string().min(8).max(800),
    motivation: z.string().min(8).max(800),
    mindfulnessExercise: z.string().min(8).max(800),
    studyTip: z.string().min(8).max(800)
  })
  .strict();

export const wellnessRequestSchema = z
  .object({
    moodScore: moodScoreSchema,
    examType: examTypeSchema,
    triggers: z.array(stressTriggerSchema).max(STRESS_TRIGGERS.length),
    reflectionNote: z.string().max(REFLECTION_MAX_LENGTH).optional().default("")
  })
  .strict();

export const wellnessApiResultSchema = z
  .object({
    response: wellnessResponseSchema,
    fallback: z.boolean(),
    message: z.string().max(160).optional()
  })
  .strict();

export const moodFormSchema = z
  .object({
    moodScore: moodScoreSchema,
    examType: examTypeSchema,
    triggers: z.array(stressTriggerSchema).max(STRESS_TRIGGERS.length),
    reflectionNote: reflectionNoteSchema
  })
  .strict();

export const moodEntrySchema = moodFormSchema
  .extend({
    id: z.string().min(1),
    date: z.string().regex(dateKeyPattern),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    wellnessResponse: wellnessResponseSchema.optional()
  })
  .strict();

export const storagePayloadSchema = z
  .object({
    version: z.literal(STORAGE_VERSION),
    entries: z.array(moodEntrySchema)
  })
  .strict();

export const dateRangeSchema = z
  .object({
    from: z.string().regex(dateKeyPattern).optional(),
    to: z.string().regex(dateKeyPattern).optional()
  })
  .strict();
