// Load recipients from environment variable or local file.

import type { Recipient } from "../types/recipient.js";

export async function loadRecipients(): Promise<Recipient[]> {
  // Try environment variable first (for GitHub Actions)
  const recipientsJson = process.env.RECIPIENTS_JSON;
  if (recipientsJson) {
    console.log("📋 Loading recipients from RECIPIENTS_JSON environment variable");
    try {
      const parsed = JSON.parse(recipientsJson);
      if (Array.isArray(parsed)) {
        console.log(`✅ Loaded ${parsed.length} recipient(s) from env var`);
        return parsed as Recipient[];
      }
      console.error("❌ RECIPIENTS_JSON is not an array");
    } catch (err) {
      console.error("❌ Failed to parse RECIPIENTS_JSON:", err);
    }
  }

  // Fallback to local file (for development)
  // Use dynamic import with explicit path to avoid TypeScript compilation issues
  console.log("📋 Attempting to load recipients from local src/config/recipients.ts");
  try {
    // Use full URL-based import to bypass TypeScript checking
    const recipientsPath = new URL("./recipients.js", import.meta.url);
    const localRecipients = await import(recipientsPath.href).catch(() => null);
    
    if (localRecipients?.recipients && Array.isArray(localRecipients.recipients)) {
      console.log(`✅ Loaded ${localRecipients.recipients.length} recipient(s) from local file`);
      return localRecipients.recipients;
    }
  } catch (err) {
    console.log("ℹ️ Local config file not found (this is normal in GitHub Actions)");
  }

  console.error("\n❌ No recipients found!");
  console.error("Please either:");
  console.error("  1. Set RECIPIENTS_JSON environment variable (for GitHub Actions)");
  console.error("  2. Create src/config/recipients.ts file (for local development)");
  return [];
}
