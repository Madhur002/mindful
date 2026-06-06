import { act, renderHook } from "@testing-library/react";
import { useWellnessAI } from "@/hooks/useWellnessAI";
import type { WellnessApiResult, WellnessRequest } from "@/types";

const request: WellnessRequest = {
  moodScore: 4,
  examType: "GATE",
  triggers: ["Fear of failure"],
  reflectionNote: "Feeling unsure."
};

const apiResult: WellnessApiResult = {
  fallback: false,
  response: {
    copingStrategy: "Pause and write one controllable action for the next hour.",
    motivation: "GATE preparation is demanding, but one low mood does not erase effort.",
    mindfulnessExercise: "Inhale, hold, exhale, and repeat for four calm rounds.",
    studyTip: "Review one topic deeply before switching to another."
  }
};

const createFetchResponse = (body: unknown, ok = true): Response =>
  ({
    ok,
    json: async () => body
  }) as Response;

describe("useWellnessAI", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches wellness support successfully", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      createFetchResponse(apiResult)
    );
    const { result } = renderHook(() => useWellnessAI());

    await act(async () => {
      await result.current.requestSupport(request);
    });

    expect(result.current.status).toBe("success");
    expect(result.current.response?.motivation).toContain("GATE");
    expect(result.current.fallback).toBe(false);
  });

  it("uses a fallback response when fetch fails", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useWellnessAI());

    await act(async () => {
      await result.current.requestSupport(request);
    });

    expect(result.current.status).toBe("success");
    expect(result.current.fallback).toBe(true);
    expect(result.current.response?.motivation).toContain("GATE");
  });

  it("accepts fallback payloads from the API and resets state", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(
      createFetchResponse({
        ...apiResult,
        fallback: true,
        message: "Fallback from server."
      })
    );
    const { result } = renderHook(() => useWellnessAI());

    await act(async () => {
      await result.current.requestSupport(request);
    });
    expect(result.current.fallback).toBe(true);
    expect(result.current.error).toBe("Fallback from server.");

    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe("idle");
  });

  it("falls back for invalid successful payloads", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(createFetchResponse({ bad: true }));
    const { result } = renderHook(() => useWellnessAI());

    await act(async () => {
      await result.current.requestSupport(request);
    });

    expect(result.current.fallback).toBe(true);
  });

  it("falls back for invalid non-ok payloads", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue(createFetchResponse({ bad: true }, false));
    const { result } = renderHook(() => useWellnessAI());

    await act(async () => {
      await result.current.requestSupport(request);
    });

    expect(result.current.fallback).toBe(true);
  });

  it("uses AbortSignal.timeout when available", async () => {
    const controller = new AbortController();
    controller.abort();
    const originalTimeout = AbortSignal.timeout;
    Object.defineProperty(AbortSignal, "timeout", {
      configurable: true,
      value: jest.fn(() => controller.signal)
    });
    jest.spyOn(global, "fetch").mockResolvedValue(createFetchResponse(apiResult));
    const { result } = renderHook(() => useWellnessAI());

    await act(async () => {
      await result.current.requestSupport(request);
    });

    expect(AbortSignal.timeout).toHaveBeenCalled();
    Object.defineProperty(AbortSignal, "timeout", {
      configurable: true,
      value: originalTimeout
    });
  });
});
