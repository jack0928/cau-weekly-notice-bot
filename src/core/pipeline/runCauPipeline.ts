// Pipeline for crawling multiple CAU boards, filtering, and sorting.

import { deptCrawler } from "../../integrations/cau/deptCrawler.js";
import { swEduCrawler } from "../../integrations/cau/swEduCrawler.js";
import type { SiteConfig } from "../../types/config.js";
import type { Notice } from "../../types/notice.js";
import { filterRecentNotices } from "../filters/dateFilter.js";

const BOARDS = ["sub0501", "sub0502", "sub0506"] as const;

type BoardName = typeof BOARDS[number];

const BASE_URL = "https://cse.cau.ac.kr";
const SW_EDU_BASE_URL = "https://swedu.cau.ac.kr";

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

const swEduSelectors: NonNullable<SiteConfig["selectors"]> = {
  item: "div.list_type_h1 table tbody tr",
  title: "td.tl a",
  url: "td.tl a",
  date: "td",
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

function buildSwEduSiteConfig(): SiteConfig {
  return {
    id: "cau_sw_edu",
    baseUrl: SW_EDU_BASE_URL,
    listPath: "/board/list?boardtypeid=7&menuid=001005005",
    selectors: swEduSelectors,
  };
}

export async function runCauPipeline(): Promise<Notice[]> {
  // Crawl all dept boards in parallel.
  const deptCrawlResults = await Promise.all(
    BOARDS.map((board) => {
      const site = buildSiteConfig(board);
      return deptCrawler.crawl(site);
    })
  );

  // Crawl SW Education Institute board.
  const swEduSite = buildSwEduSiteConfig();
  const swEduResult = await swEduCrawler.crawl(swEduSite);

  // Merge all notices into a flat array.
  const allNotices: Notice[] = [];
  
  // Add dept board notices
  for (const result of deptCrawlResults) {
    if (result.notices && Array.isArray(result.notices)) {
      allNotices.push(...result.notices);
    }
  }

  // Add SW Edu notices
  if (swEduResult.notices && Array.isArray(swEduResult.notices)) {
    allNotices.push(...swEduResult.notices);
  }

  // eslint-disable-next-line no-console
  console.log(`[Pipeline] Total merged count: ${allNotices.length}`);

  // Apply 7-day filter AFTER merging all sources.
  const filtered = filterRecentNotices(allNotices, 7);

  // eslint-disable-next-line no-console
  console.log(`[Pipeline] Count after 7-day filter: ${filtered.length}`);

  // Sort by publishedAt descending (latest first).
  const sorted = [...filtered].sort((a, b) => {
    const timeA = a.publishedAt instanceof Date ? a.publishedAt.getTime() : 0;
    const timeB = b.publishedAt instanceof Date ? b.publishedAt.getTime() : 0;
    return timeB - timeA;
  });

  return sorted;
}
