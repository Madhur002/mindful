import { logger } from "@/lib/logger";

describe("logger", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      configurable: true
    });
    jest.restoreAllMocks();
  });

  it("logs warnings and errors outside production", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = jest.spyOn(console, "error").mockImplementation(() => undefined);

    logger.warn("warn");
    logger.error("error");

    expect(warn).toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  });

  it("does not log in production", () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true
    });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    logger.warn("hidden");

    expect(warn).not.toHaveBeenCalled();
  });
});
