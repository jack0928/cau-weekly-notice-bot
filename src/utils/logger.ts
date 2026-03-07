// Simple logging utility with environment-based control.

const isDebugMode = process.env.DEBUG === "true";

export function debug(message: string, ...args: any[]): void {
  if (isDebugMode) {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
}

export function info(message: string, ...args: any[]): void {
  // eslint-disable-next-line no-console
  console.log(message, ...args);
}

export function warn(message: string, ...args: any[]): void {
  // eslint-disable-next-line no-console
  console.warn(message, ...args);
}

export function error(message: string, ...args: any[]): void {
  // eslint-disable-next-line no-console
  console.error(message, ...args);
}
