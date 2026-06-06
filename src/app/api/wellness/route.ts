import { NextResponse, type NextRequest } from "next/server";
import { WELLNESS_BODY_LIMIT_BYTES, getFallbackWellnessResponse } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { isWellnessRateLimited } from "@/lib/rateLimit";
import { sanitizeReflectionNote } from "@/lib/sanitize";
import { callGemini } from "@/lib/server/gemini";
import { wellnessRequestSchema } from "@/lib/validators";
import type { WellnessRequest } from "@/types";

export const runtime = "nodejs";

const getClientIp = (request: NextRequest): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  const [firstForwardedRaw] = forwarded?.split(",") ?? [];
  const firstForwarded = firstForwardedRaw?.trim();

  if (firstForwarded) {
    return firstForwarded;
  }

  return request.headers.get("x-real-ip") ?? "local";
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
