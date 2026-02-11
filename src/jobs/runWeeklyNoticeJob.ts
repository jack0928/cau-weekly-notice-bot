// Concrete job runner that wires infrastructure and domain logic together.

import type { JobRunResult } from "../types/result.js";
import type { JobConfig } from "../types/config.js";

export async function runWeeklyNoticeJob(
  _config: JobConfig
): Promise<JobRunResult> {
  // TODO: read config, instantiate dependencies, and delegate to the domain job.
  return {
    crawled: [],
    filtered: [],
  };
}

