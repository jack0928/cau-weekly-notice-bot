// Test runner for the CAU CSE boards.
// Usage: npm run test:cau sub0501|sub0502|sub0506

import { deptCrawler } from "../src/integrations/cau/deptCrawler.js";
import type { SiteConfig } from "../src/types/config.js";

type BoardName = "sub0501" | "sub0502" | "sub0506";

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
    // We reuse the existing CAU department source ID; the board
    // differentiation is done via listPath and the CLI argument.
    id: "cau_dept",
    baseUrl: BASE_URL,
    listPath,
    selectors: sharedSelectors,
  };
}

async function main() {
  const arg = process.argv[2] as BoardName | undefined;

  if (!arg || !(arg in boardConfig)) {
    // eslint-disable-next-line no-console
    console.error(
      'Usage: npm run test:cau <sub0501|sub0502|sub0506>'
    );
    process.exit(1);
  }

  const site = buildSiteConfig(arg);
  const result = await deptCrawler.crawl(site);

  // eslint-disable-next-line no-console
  console.log(`\n=== Extracted ${result.notices.length} notices from ${arg} ===\n`);

  for (const notice of result.notices) {
    // eslint-disable-next-line no-console
    console.log(`Title: ${notice.title}`);
    // eslint-disable-next-line no-console
    console.log(`Date: ${notice.publishedAt.toISOString().slice(0, 10)}`);
    // eslint-disable-next-line no-console
    console.log(`URL: ${notice.url}`);
    // eslint-disable-next-line no-console
    console.log("---");
  }

  // Also output as JSON for programmatic use
  // eslint-disable-next-line no-console
  console.log("\n=== JSON Output ===");
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));
}

void main();

