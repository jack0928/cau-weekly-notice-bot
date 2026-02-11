// Simple logging abstraction. You can later swap this for a structured logger.

export interface Logger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

export function createLogger(): Logger {
  // TODO: consider integrating a proper logging library.
  return {
    info(message: string, meta?: unknown) {
      // eslint-disable-next-line no-console
      console.info(message, meta);
    },
    warn(message: string, meta?: unknown) {
      // eslint-disable-next-line no-console
      console.warn(message, meta);
    },
    error(message: string, meta?: unknown) {
      // eslint-disable-next-line no-console
      console.error(message, meta);
    },
  };
}

