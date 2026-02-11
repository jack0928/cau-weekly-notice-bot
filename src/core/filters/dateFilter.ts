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

  return notices.filter((notice) => {
    const publishedAt = notice.publishedAt;
    if (!(publishedAt instanceof Date)) {
      return false;
    }

    const time = publishedAt.getTime();
    if (!Number.isFinite(time)) {
      return false;
    }

    return time >= thresholdTime;
  });
}

