// High-level weekly notice job that composes crawling, filtering, and formatting.
// This module should remain mostly domain-focused and avoid direct I/O.

import type { JobConfig } from "../../types/config";
import type { JobRunResult } from "../../types/result";

export async function runWeeklyNoticeJobDomain(
  _config: JobConfig
): Promise<JobRunResult> {
  // TODO: orchestrate crawling, filtering, deduplication, and email payload preparation.
  return {
    crawled: [],
    filtered: [],
  };
}

