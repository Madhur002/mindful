type LogMetadata = Readonly<Record<string, unknown>>;

const canLog = (): boolean => process.env.NODE_ENV !== "production";

export const logger = {
  warn(message: string, metadata?: LogMetadata): void {
    if (canLog()) {
      console.warn(message, metadata ?? {});
    }
  },
  error(message: string, metadata?: LogMetadata): void {
    if (canLog()) {
      console.error(message, metadata ?? {});
    }
  }
};
