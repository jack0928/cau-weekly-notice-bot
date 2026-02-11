// Integrated test runner for the complete CAU email pipeline.
// Usage: npm run test:email-pipeline

import { writeFileSync } from "fs";
import { deptCrawler } from "../src/integrations/cau/deptCrawler.js";
import type { SiteConfig } from "../src/types/config.js";
import type { Notice } from "../src/types/notice.js";
import { filterRecentNotices } from "../src/core/filters/dateFilter.js";
import { buildCauNoticeEmail } from "../src/integrations/email/templates/cauNoticeTemplate.js";

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

function boardIdResolver(notice: Notice): "sub0501" | "sub0502" | "sub0506" {
  if (notice.url.includes("bbs05")) return "sub0501";
  if (notice.url.includes("bbs07")) return "sub0502";
  if (notice.url.includes("bbs06")) return "sub0506";
  return "sub0501";
}

async function main() {
  // 1. Crawl all 3 CAU boards
  // eslint-disable-next-line no-console
  console.log("🕷️  Crawling CAU boards...\n");
  const crawlResults = await Promise.all(
    BOARDS.map((board) => deptCrawler.crawl(buildSiteConfig(board)))
  );

  // 2. Merge all notices into one array
  const allNotices: Notice[] = [];
  for (const result of crawlResults) {
    if (result.notices && Array.isArray(result.notices)) {
      allNotices.push(...result.notices);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\n📊 Total merged count: ${allNotices.length}`);

  // 3. Apply 7-day filter
  const filteredNotices = filterRecentNotices(allNotices, 7);

  // eslint-disable-next-line no-console
  console.log(`📅 Count after 7-day filter: ${filteredNotices.length}`);

  // 4. Build email template
  const emailResult = buildCauNoticeEmail(filteredNotices, boardIdResolver);

  // 5. Output results
  // eslint-disable-next-line no-console
  console.log(`\n📧 Subject: ${emailResult.subject}`);
  // eslint-disable-next-line no-console
  console.log(`\n📄 HTML:\n${emailResult.html}`);

  // Save HTML to file
  writeFileSync("./email-preview.html", emailResult.html, "utf-8");
  // eslint-disable-next-line no-console
  console.log(`\n✅ HTML saved to email-preview.html`);
}

void main();
