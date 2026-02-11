// Entrypoint for the weekly notice bot.
// This will eventually delegate to app.runWeeklyNoticeJob or other jobs.

import { createApp } from "./app";

async function main() {
  const app = createApp();

  // TODO: select and run a specific job (e.g., weekly notice job).
  // This will likely be based on environment variables or CLI args.

  // Placeholder to avoid unused variable linting for now.
  void app;
}

void main();

