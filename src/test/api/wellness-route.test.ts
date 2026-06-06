/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/wellness/route";
import { resetWellnessRateLimitForTests } from "@/lib/rateLimit";
import type { WellnessRequest, WellnessResponse } from "@/types";

const requestBody: WellnessRequest = {
  moodScore: 5,
  examType: "NEET",
  triggers: ["Study load", "Fear of failure"],
  reflectionNote: "<b>Feeling tense</b>"
};

const geminiResponse: WellnessResponse = {
  copingStrategy: "Break the next hour into one revision task and one short reset.",
  motivation: "NEET preparation is intense, and this check-in is a strong step.",
  mindfulnessExercise: "Inhale for four, hold for four, exhale for four, and repeat.",
  studyTip: "Review one high-yield topic, then take a real pause before continuing."
};

const createRequest = (
  body: unknown,
  ip = "203.0.113.1"
): NextRequest =>
  new NextRequest("http://localhost/api/wellness", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip
    },
    body: JSON.stringify(body)
  });

describe("/api/wellness", () => {
  beforeEach(() => {
    resetWellnessRateLimitForTests();
    process.env.GEMINI_API_KEY = "test-key";
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it("returns validated Gemini output for valid input", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: JSON.stringify(geminiResponse) }] } }
          ]
        }),
        { status: 200 }
      )
    );

    const response = await POST(createRequest(requestBody));
    const payload = (await response.json()) as { response: WellnessResponse; fallback: boolean };

    expect(response.status).toBe(200);
    expect(payload.fallback).toBe(false);
    expect(payload.response.motivation).toContain("NEET");
  });

  it("returns a safe 400 for invalid input", async () => {
    const response = await POST(createRequest({ moodScore: 20 }));
    const payload = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(payload.message).toBe("Invalid wellness request.");
  });

  it("handles malformed JSON and oversized bodies safely", async () => {
    const malformed = new NextRequest("http://localhost/api/wellness", {
      method: "POST",
      body: "{bad"
    });
    const tooLarge = new NextRequest("http://localhost/api/wellness", {
      method: "POST",
      body: JSON.stringify({ text: "a".repeat(11 * 1024) })
    });

    expect((await POST(malformed)).status).toBe(400);
    expect((await POST(tooLarge)).status).toBe(413);
  });

  it("rate limits after ten requests per hour", async () => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            candidates: [
              { content: { parts: [{ text: JSON.stringify(geminiResponse) }] } }
            ]
          }),
          { status: 200 }
        )
      )
    );

    for (let index = 0; index < 10; index += 1) {
      await POST(createRequest(requestBody, "198.51.100.9"));
    }

    const response = await POST(createRequest(requestBody, "198.51.100.9"));
    expect(response.status).toBe(429);
  });

  it("returns fallback with 504 when Gemini fails", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("timeout"));
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(createRequest(requestBody));
    const payload = (await response.json()) as { response: WellnessResponse; fallback: boolean };

    expect(response.status).toBe(504);
    expect(payload.fallback).toBe(true);
    expect(payload.response.motivation).toContain("NEET");
  });

  it("falls back for missing API key and invalid Gemini envelopes", async () => {
    delete process.env.GEMINI_API_KEY;
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect((await POST(createRequest(requestBody, "203.0.113.2"))).status).toBe(504);

    process.env.GEMINI_API_KEY = "test-key";
    jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ candidates: [] }), { status: 200 })
    );
    expect((await POST(createRequest(requestBody, "203.0.113.3"))).status).toBe(504);
  });

  it("falls back for schema-invalid Gemini responses and non-ok Gemini status", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ candidates: "bad" }), { status: 200 })
    );
    expect((await POST(createRequest(requestBody, "203.0.113.4"))).status).toBe(504);

    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "bad" }), { status: 500 })
    );
    expect((await POST(createRequest({ ...requestBody, triggers: [] }, "203.0.113.5"))).status).toBe(504);
  });
});
