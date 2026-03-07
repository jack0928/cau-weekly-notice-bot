// Pure utility for filtering notices to those within the last N days.

import type { Notice } from "../../types/notice.js";
import { debug } from "../../utils/logger.js";

export function filterRecentNotices(
  notices: Notice[],
  days: number = 7
): Notice[] {
  if (!Number.isFinite(days) || days <= 0) {
    return [];
  }

  const now = new Date();
  const msInDay = 24 * 60 * 60 * 1000;
  const thresholdTime = now.getTime() - days * msInDay;

  debug("\n=== DATE FILTER DEBUG ===");
  debug("NOW:", now.toISOString());
  debug("THRESHOLD:", new Date(thresholdTime).toISOString());
  debug("DAYS:", days);

  const filtered = notices.filter((notice) => {
    const publishedAt = notice.publishedAt;
    if (!(publishedAt instanceof Date)) {
      debug(`  [REJECT] Invalid date for: ${notice.title.substring(0, 40)}...`);
      return false;
    }

    const time = publishedAt.getTime();
    if (!Number.isFinite(time)) {
      debug(`  [REJECT] Non-finite time for: ${notice.title.substring(0, 40)}...`);
      return false;
    }

    const pass = time >= thresholdTime;
    if (pass) {
      debug(`  [PASS] ${notice.source} | ${publishedAt.toISOString().slice(0, 10)} | ${notice.title.substring(0, 40)}...`);
    } else {
      debug(`  [SKIP] ${notice.source} | ${publishedAt.toISOString().slice(0, 10)} | ${notice.title.substring(0, 40)}... (too old)`);
    }

    return pass;
  });

  debug(`FILTER RESULT: ${filtered.length} / ${notices.length} passed\n`);

  return filtered;
}

