// Manual test runner for filterRecentNotices.
// Usage: npm run test:date

import type { Notice } from "../src/types/notice.js";
import { filterRecentNotices } from "../src/core/filters/dateFilter.js";

function daysAgo(n: number): Date {
  const now = new Date();
  const msInDay = 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - n * msInDay);
}

async function main() {
  const notices: Notice[] = [
    {
      id: "within-2-days",
      title: "Notice within 2 days",
      url: "https://example.com/within-2-days",
      publishedAt: daysAgo(2),
      source: "cau_dept",
    },
    {
      id: "eight-days-old",
      title: "Notice 8 days old",
      url: "https://example.com/eight-days-old",
      publishedAt: daysAgo(8),
      source: "cau_dept",
    },
    {
      id: "exactly-7-days",
      title: "Notice exactly 7 days old",
      url: "https://example.com/exactly-7-days",
      publishedAt: daysAgo(7),
      source: "cau_dept",
    },
    {
      id: "invalid-date",
      title: "Notice with invalid date",
      url: "https://example.com/invalid-date",
      publishedAt: new Date("invalid" as unknown as string),
      source: "cau_dept",
    },
  ];

  const filtered = filterRecentNotices(notices, 7);

  // eslint-disable-next-line no-console
  console.log("Original count:", notices.length);
  // eslint-disable-next-line no-console
  console.log("Filtered count:", filtered.length);
  // eslint-disable-next-line no-console
  console.log(
    "Filtered IDs:",
    filtered.map((n) => n.id)
  );
}

void main();

