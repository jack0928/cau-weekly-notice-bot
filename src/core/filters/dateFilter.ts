// Pure utility for filtering notices to those within the last N days.

import type { Notice } from "../../types/notice.js";

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

  // eslint-disable-next-line no-console
  console.log("\n=== DATE FILTER DEBUG ===");
  // eslint-disable-next-line no-console
  console.log("NOW:", now.toISOString());
  // eslint-disable-next-line no-console
  console.log("THRESHOLD:", new Date(thresholdTime).toISOString());
  // eslint-disable-next-line no-console
  console.log("DAYS:", days);

  const filtered = notices.filter((notice) => {
    const publishedAt = notice.publishedAt;
    if (!(publishedAt instanceof Date)) {
      // eslint-disable-next-line no-console
      console.log(`  [REJECT] Invalid date for: ${notice.title.substring(0, 40)}...`);
      return false;
    }

    const time = publishedAt.getTime();
    if (!Number.isFinite(time)) {
      // eslint-disable-next-line no-console
      console.log(`  [REJECT] Non-finite time for: ${notice.title.substring(0, 40)}...`);
      return false;
    }

    const pass = time >= thresholdTime;
    if (pass) {
      // eslint-disable-next-line no-console
      console.log(`  [PASS] ${notice.source} | ${publishedAt.toISOString().slice(0, 10)} | ${notice.title.substring(0, 40)}...`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`  [SKIP] ${notice.source} | ${publishedAt.toISOString().slice(0, 10)} | ${notice.title.substring(0, 40)}... (too old)`);
    }

    return pass;
  });

  // eslint-disable-next-line no-console
  console.log(`FILTER RESULT: ${filtered.length} / ${notices.length} passed\n`);

  return filtered;
}

