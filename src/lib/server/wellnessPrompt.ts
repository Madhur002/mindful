import type { WellnessRequest } from "@/types";

export const buildWellnessPrompt = (
  request: WellnessRequest,
  sanitizedNote: string
): string => {
  const triggerText =
    request.triggers.length > 0 ? request.triggers.join(", ") : "none selected";

  return `You are a compassionate mental wellness companion for Indian students preparing for competitive exams like ${request.examType}. 
The student has reported a mood score of ${request.moodScore}/10 and identified these stress triggers: ${triggerText}. 
Their reflection: '${sanitizedNote}'.

Respond warmly and specifically. Your response must include exactly these four sections in JSON:
{
  "copingStrategy": "One specific, actionable coping technique for their triggers (2-3 sentences)",
  "motivation": "A personalized motivational message acknowledging the difficulty of ${request.examType} preparation (2-3 sentences)",
  "mindfulnessExercise": "A brief breathing or grounding exercise they can do right now (3-4 steps)",
  "studyTip": "One study-balance tip specific to ${request.examType} preparation (2 sentences)"
}
Respond ONLY with valid JSON. No preamble, no markdown, no explanation outside the JSON.`;
};
