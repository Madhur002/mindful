"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AI_TIMEOUT_MS,
  getFallbackWellnessResponse
} from "@/lib/constants";
import { wellnessApiResultSchema, wellnessRequestSchema } from "@/lib/validators";
import type {
  AsyncStatus,
  WellnessRequest,
  WellnessResponse
} from "@/types";

type WellnessAIState = {
  status: AsyncStatus;
  response: WellnessResponse | null;
  error: string | null;
  fallback: boolean;
};

type WellnessAIHook = WellnessAIState & {
  requestSupport: (request: WellnessRequest) => Promise<WellnessResponse>;
  reset: () => void;
};

const combineAbortSignals = (signals: readonly AbortSignal[]): AbortSignal => {
  const controller = new AbortController();
  const abort = (): void => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  };

  signals.forEach((signal) => {
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
  });

  return controller.signal;
};

const createRequestSignal = (controller: AbortController): AbortSignal => {
  if (typeof AbortSignal.timeout === "function") {
    return combineAbortSignals([
      controller.signal,
      AbortSignal.timeout(AI_TIMEOUT_MS)
    ]);
  }

  window.setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  return controller.signal;
};

export const useWellnessAI = (): WellnessAIHook => {
  const [state, setState] = useState<WellnessAIState>({
    status: "idle",
    response: null,
    error: null,
    fallback: false
  });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    []
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: "idle", response: null, error: null, fallback: false });
  }, []);

  const requestSupport = useCallback(async (request: WellnessRequest) => {
    const parsedRequest = wellnessRequestSchema.parse(request);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ status: "loading", response: null, error: null, fallback: false });

    try {
      const result = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedRequest),
        signal: createRequestSignal(controller)
      });
      const payload: unknown = await result.json();
      const parsedPayload = wellnessApiResultSchema.safeParse(payload);

      if (parsedPayload.success) {
        setState({
          status: "success",
          response: parsedPayload.data.response,
          error: parsedPayload.data.fallback
            ? (parsedPayload.data.message ?? "Showing offline wellness support.")
            : null,
          fallback: parsedPayload.data.fallback
        });
        return parsedPayload.data.response;
      }

      if (!result.ok) {
        throw new Error("Wellness support unavailable");
      }
      throw new Error("Unexpected wellness response");
    } catch {
      const fallback = getFallbackWellnessResponse(parsedRequest);
      setState({
        status: "success",
        response: fallback,
        error: "Showing fallback support because AI could not respond in time.",
        fallback: true
      });
      return fallback;
    }
  }, []);

  return { ...state, requestSupport, reset };
};
