// Integrated test runner for the complete CAU email pipeline.
// Usage: npm run test:email-pipeline

import { writeFileSync } from "fs";
import { deptCrawler } from "../src/integrations/cau/deptCrawler.js";
import { swEduCrawler } from "../src/integrations/cau/swEduCrawler.js";
import type { SiteConfig } from "../src/types/config.js";
import type { Notice } from "../src/types/notice.js";
import { filterRecentNotices } from "../src/core/filters/dateFilter.js";
import { buildUnifiedNoticeEmail } from "../src/integrations/email/templates/cauNoticeTemplate.js";

const BOARDS = ["sub0501", "sub0502", "sub0506"] as const;
const BASE_URL = "https://cse.cau.ac.kr";
const SW_EDU_BASE_URL = "https://swedu.cau.ac.kr";

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

const swEduSelectors: NonNullable<SiteConfig["selectors"]> = {
  item: "div.list_type_h1 table tbody tr",
  title: "td.tl a",
  url: "td.tl a",
  date: "td",
};

function buildSiteConfig(board: typeof BOARDS[number]): SiteConfig {
  return {
    id: "cau_dept",
    baseUrl: BASE_URL,
    listPath: boardConfig[board].listPath,
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

async function main() {
  // eslint-disable-next-line no-console
  console.log("🕷️  Crawling CAU boards...\n");

  // 1. Crawl dept boards (sub0501, sub0502, sub0506)
  // eslint-disable-next-line no-console
  console.log("📚 Crawling Department boards...");
  const deptCrawlResults = await Promise.all(
    BOARDS.map((board) => deptCrawler.crawl(buildSiteConfig(board)))
  );

  const deptNotices: Notice[] = [];
  for (const result of deptCrawlResults) {
    if (result.notices && Array.isArray(result.notices)) {
      deptNotices.push(...result.notices);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`✅ DEPT COUNT: ${deptNotices.length}`);

  // 2. Crawl SW Education Institute
  // eslint-disable-next-line no-console
  console.log("\n🎓 Crawling SW Education Institute...");
  const swEduSite = buildSwEduSiteConfig();
  const swEduResult = await swEduCrawler.crawl(swEduSite);

  const swEduNotices: Notice[] = [];
  if (swEduResult.notices && Array.isArray(swEduResult.notices)) {
    swEduNotices.push(...swEduResult.notices);
  }

  // eslint-disable-next-line no-console
  console.log(`✅ SW EDU COUNT: ${swEduNotices.length}`);

  // 3. Merge all notices from both sources
  const allNotices: Notice[] = [
    ...deptNotices,
    ...swEduNotices,
  ];

  // eslint-disable-next-line no-console
  console.log(`\n📊 MERGED COUNT: ${allNotices.length}`);

  // eslint-disable-next-line no-console
  console.log("BY SOURCE:",
    allNotices.reduce((acc, n) => {
      acc[n.source] = (acc[n.source] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );

  // 4. Apply 7-day filter to merged notices
  const filteredNotices = filterRecentNotices(allNotices, 7);

  // eslint-disable-next-line no-console
  console.log(`\n📅 Count after 7-day filter: ${filteredNotices.length}`);

  // eslint-disable-next-line no-console
  console.log("\n=== PIPELINE → EMAIL ===");
  // eslint-disable-next-line no-console
  console.log("FINAL COUNT:", filteredNotices.length);
  // eslint-disable-next-line no-console
  console.log("SOURCES:",
    filteredNotices.reduce((acc, n) => {
      acc[n.source] = (acc[n.source] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );

  // 5. Build email template with both dept and SW Edu notices
  const emailResult = buildUnifiedNoticeEmail(filteredNotices);

  // 6. Output results
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
