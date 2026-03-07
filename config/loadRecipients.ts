// Load recipients from environment variable or local file.

import type { Recipient } from "../src/types/recipient.js";

export async function loadRecipients(): Promise<Recipient[]> {
  // Try environment variable first (for GitHub Actions)
  const recipientsJson = process.env.RECIPIENTS_JSON;
  if (recipientsJson) {
    try {
      const parsed = JSON.parse(recipientsJson);
      if (Array.isArray(parsed)) {
        return parsed as Recipient[];
      }
      console.error("RECIPIENTS_JSON is not an array");
    } catch (err) {
      console.error("Failed to parse RECIPIENTS_JSON:", err);
    }
  }

  // Fallback to local file (for development)
  try {
    const localRecipients = await import("./recipients.js");
    if (localRecipients.recipients && Array.isArray(localRecipients.recipients)) {
      return localRecipients.recipients;
    }
  } catch {
    // File doesn't exist, continue to error below
  }

  console.error("No recipients found. Please set RECIPIENTS_JSON env var or create config/recipients.ts");
  return [];
}
