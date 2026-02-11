// Pipeline for crawling multiple CAU boards, filtering, and sorting.

import { deptCrawler } from "../../integrations/cau/deptCrawler.js";
import type { SiteConfig } from "../../types/config.js";
import type { Notice } from "../../types/notice.js";
import { filterRecentNotices } from "../filters/dateFilter.js";

const BOARDS = ["sub0501", "sub0502", "sub0506"] as const;

type BoardName = typeof BOARDS[number];

const BASE_URL = "https://cse.cau.ac.kr";

const boardConfig: Record<BoardName, { listPath: string }> = {
  sub0501: { listPath: "/sub05/sub0501.php" },
  sub0502: { listPath: "/sub05/sub0502.php" },
  sub0506: { listPath: "/sub05/sub0506.php" },
};

const sharedSelectors: NonNullable<SiteConfig["selectors"]> = {
  item: "table.table-basic tr",
  title: "td.aleft a",
  url: "td.aleft a",
  date: "td.pc-only",
};

function buildSiteConfig(board: BoardName): SiteConfig {
  const { listPath } = boardConfig[board];

  return {
    id: "cau_dept",
    baseUrl: BASE_URL,
    listPath,
    selectors: sharedSelectors,
  };
}

export async function runCauPipeline(): Promise<Notice[]> {
  // Crawl all boards in parallel.
  const crawlResults = await Promise.all(
    BOARDS.map((board) => {
      const site = buildSiteConfig(board);
      return deptCrawler.crawl(site);
    })
  );

  // Merge all notices into a flat array.
  const allNotices: Notice[] = [];
  for (const result of crawlResults) {
    if (result.notices && Array.isArray(result.notices)) {
      allNotices.push(...result.notices);
    }
  }

  // Apply 7-day filter.
  const filtered = filterRecentNotices(allNotices, 7);

  // Sort by publishedAt descending (latest first).
  const sorted = [...filtered].sort((a, b) => {
    const timeA = a.publishedAt instanceof Date ? a.publishedAt.getTime() : 0;
    const timeB = b.publishedAt instanceof Date ? b.publishedAt.getTime() : 0;
    return timeB - timeA;
  });

  return sorted;
}
