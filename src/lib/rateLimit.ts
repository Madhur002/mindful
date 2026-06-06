import { WELLNESS_RATE_LIMIT, WELLNESS_RATE_WINDOW_MS } from "@/lib/constants";

type RateRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateRecord>();

export const resetWellnessRateLimitForTests = (): void => {
  rateLimitStore.clear();
};

export const isWellnessRateLimited = (ip: string, now = Date.now()): boolean => {
  const record = rateLimitStore.get(ip);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + WELLNESS_RATE_WINDOW_MS
    });
    return false;
  }

  if (record.count >= WELLNESS_RATE_LIMIT) {
    return true;
  }

  record.count += 1;
  return false;
};
