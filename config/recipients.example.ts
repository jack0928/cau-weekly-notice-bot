// Example recipients configuration.
// 
// For local development:
//   1. Copy this file to recipients.ts
//   2. Update with actual recipients
//
// For GitHub Actions:
//   Use RECIPIENTS_JSON environment variable instead
//   Format: [{"name":"홍길동","email":"hong@example.com"},{"name":"김철수","email":"kim@example.com"}]

import type { Recipient } from "../src/types/recipient.js";

export const recipients: Recipient[] = [
  { name: "Example User 1", email: "user1@example.com" },
  { name: "Example User 2", email: "user2@example.com" },
];
