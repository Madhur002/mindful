import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  AI_TIMEOUT_MS,
  WELLNESS_BODY_LIMIT_BYTES,
  getFallbackWellnessResponse
} from "@/lib/constants";
import { logger } from "@/lib/logger";
import { isWellnessRateLimited } from "@/lib/rateLimit";
import { sanitizeReflectionNote } from "@/lib/sanitize";
import {
  wellnessRequestSchema,
  wellnessResponseSchema
} from "@/lib/validators";
import type { WellnessRequest, WellnessResponse } from "@/types";

export const runtime = "nodejs";

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

const getClientIp = (request: NextRequest): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",").at(0)?.trim();

  if (firstForwarded) {
    return firstForwarded;
  }

  return request.headers.get("x-real-ip") ?? "local";
};

const buildWellnessPrompt = (
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

  const firstCandidate = parsed.data.candidates?.at(0);
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

const callGemini = async (
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

const fallbackResponse = (request: WellnessRequest, status = 504): NextResponse =>
  NextResponse.json(
    {
      response: getFallbackWellnessResponse(request),
      fallback: true,
      message: "AI support is temporarily unavailable, so a safe fallback is shown."
    },
    { status }
  );

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  if (isWellnessRateLimited(ip)) {
    return NextResponse.json(
      { message: "Too many wellness requests. Please try again later." },
      { status: 429 }
    );
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > WELLNESS_BODY_LIMIT_BYTES) {
    return NextResponse.json(
      { message: "Request body is too large." },
      { status: 413 }
    );
  }

  let jsonBody: unknown;
  try {
    jsonBody = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json(
      { message: "Invalid wellness request." },
      { status: 400 }
    );
  }

  const parsedRequest = wellnessRequestSchema.safeParse(jsonBody);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { message: "Invalid wellness request." },
      { status: 400 }
    );
  }

  const sanitizedNote = sanitizeReflectionNote(parsedRequest.data.reflectionNote);

  try {
    const response = await callGemini(parsedRequest.data, sanitizedNote);
    return NextResponse.json({ response, fallback: false }, { status: 200 });
  } catch (error) {
    logger.error("Gemini wellness request failed", {
      reason: error instanceof Error ? error.message : "unknown"
    });
    return fallbackResponse(parsedRequest.data);
  }
}
