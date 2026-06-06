import { z } from "zod";
import { AI_TIMEOUT_MS } from "@/lib/constants";
import { buildWellnessPrompt } from "@/lib/server/wellnessPrompt";
import { wellnessResponseSchema } from "@/lib/validators";
import type { WellnessRequest, WellnessResponse } from "@/types";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const geminiPartSchema = z.object({ text: z.string().optional() }).passthrough();
const geminiResponseSchema = z
  .object({
    candidates: z
      .array(
        z
          .object({
            content: z
              .object({
                parts: z.array(geminiPartSchema)
              })
              .optional()
          })
          .passthrough()
      )
      .optional()
  })
  .passthrough();

const stripCodeFence = (text: string): string =>
  text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

const parseGeminiWellness = (text: string): WellnessResponse => {
  const rawJson = stripCodeFence(text);
  const parsedJson: unknown = JSON.parse(rawJson);
  return wellnessResponseSchema.parse(parsedJson);
};

const extractGeminiText = (payload: unknown): string => {
  const parsed = geminiResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Invalid Gemini envelope");
  }

  const firstCandidate = parsed.data.candidates?.[0];
  const parts = firstCandidate?.content?.parts ?? [];
  const text = parts
    .map((part) => part.text)
    .filter((partText): partText is string => Boolean(partText))
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Gemini returned no text");
  }

  return text;
};

export const callGemini = async (
  request: WellnessRequest,
  sanitizedNote: string
): Promise<WellnessResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key missing");
  }
  const model = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildWellnessPrompt(request, sanitizedNote) }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gemini returned ${response.status} for model ${model}: ${errorText.slice(0, 200)}`
    );
  }

  const payload: unknown = await response.json();
  return parseGeminiWellness(extractGeminiText(payload));
};
