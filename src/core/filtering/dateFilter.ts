// Logic for filtering notices by date (e.g., within the last N days).
// Implementation will leverage utilities from src/utils/date.

import type { Notice } from "../../types/notice";

export function filterRecentNotices(
  _notices: Notice[],
  _now: Date,
  _lookbackDays: number
): Notice[] {
  // TODO: implement filtering to only keep notices within the last N days.
  return [];
}

