// Test runner for the CAU pipeline.
// Usage: npm run test:pipeline

import { deptCrawler } from "../src/integrations/cau/deptCrawler.js";
import type { SiteConfig } from "../src/types/config.js";
import { runCauPipeline } from "../src/core/pipeline/runCauPipeline.js";

const BOARDS = ["sub0501", "sub0502", "sub0506"] as const;
const BASE_URL = "https://cse.cau.ac.kr";

const boardConfig = {
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

function buildSiteConfig(board: typeof BOARDS[number]): SiteConfig {
  return {
    id: "cau_dept",
    baseUrl: BASE_URL,
    listPath: boardConfig[board].listPath,
    selectors: sharedSelectors,
  };
}

async function main() {
  // Get merged count before filtering.
  const crawlResults = await Promise.all(
    BOARDS.map((board) => deptCrawler.crawl(buildSiteConfig(board)))
  );
  const mergedCount = crawlResults.reduce(
    (sum, result) => sum + (result.notices?.length ?? 0),
    0
  );

  // Run the full pipeline (filter + sort).
  const filteredNotices = await runCauPipeline();

  // eslint-disable-next-line no-console
  console.log("Total merged count:", mergedCount);
  // eslint-disable-next-line no-console
  console.log("Count after 7-day filter:", filteredNotices.length);
  // eslint-disable-next-line no-console
  console.log("Titles:");
  for (const notice of filteredNotices) {
    // eslint-disable-next-line no-console
    console.log(`  - ${notice.title}`);
  }
}

void main();
