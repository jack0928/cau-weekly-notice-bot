// Environment variable helper utilities.

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    // Throwing here is acceptable; actual handling strategy can be refined later.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

