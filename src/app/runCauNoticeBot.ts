// Production runner for the CAU notice bot.
// Orchestrates: crawling → filtering → email generation → sending.

import "dotenv/config";
import { deptCrawler } from "../integrations/cau/deptCrawler.js";
import { swEduCrawler } from "../integrations/cau/swEduCrawler.js";
import type { SiteConfig } from "../types/config.js";
import type { Notice } from "../types/notice.js";
import { filterRecentNotices } from "../core/filters/dateFilter.js";
import { buildUnifiedNoticeEmail } from "../integrations/email/templates/cauNoticeTemplate.js";
import { sendMail } from "../core/mail/mailSender.js";

const boards = ["sub0501", "sub0502", "sub0506"] as const;

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

function buildSiteConfig(board: typeof boards[number]): SiteConfig {
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
  try {
    // 1. Crawl dept boards (sub0501, sub0502, sub0506)
    // eslint-disable-next-line no-console
    console.log("📚 Crawling Department boards...");
    
    const deptNotices: Notice[] = [];
    for (const board of boards) {
      const site = buildSiteConfig(board);
      const result = await deptCrawler.crawl(site);
      if (result.notices && Array.isArray(result.notices)) {
        deptNotices.push(...result.notices);
      }
    }

    // eslint-disable-next-line no-console
    console.log(`✅ Dept count: ${deptNotices.length}`);

    // 2. Crawl SW Education Institute
    // eslint-disable-next-line no-console
    console.log("🎓 Crawling SW Education Institute...");
    const swEduSite = buildSwEduSiteConfig();
    const swEduResult = await swEduCrawler.crawl(swEduSite);

    const swEduNotices: Notice[] = [];
    if (swEduResult.notices && Array.isArray(swEduResult.notices)) {
      swEduNotices.push(...swEduResult.notices);
    }

    // eslint-disable-next-line no-console
    console.log(`✅ SW Edu count: ${swEduNotices.length}`);

    // 3. Merge all notices from both sources
    const allNotices: Notice[] = [
      ...deptNotices,
      ...swEduNotices,
    ];

    // eslint-disable-next-line no-console
    console.log(`📊 Total merged count: ${allNotices.length}`);

    // 4. Apply 7-day filter
    const recent = filterRecentNotices(allNotices, 7);

    // eslint-disable-next-line no-console
    console.log(`📅 Filtered count (7 days): ${recent.length}`);

    // 5. Exit if no recent notices
    if (recent.length === 0) {
      // eslint-disable-next-line no-console
      console.log("No recent notices found. Exiting without sending email.");
      return;
    }

    // 6. Build email with both dept and SW Edu notices
    const email = buildUnifiedNoticeEmail(recent);

    // 7. Send email
    await sendMail(email.subject, email.html);

    // eslint-disable-next-line no-console
    console.log("✅ Email sent successfully.");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error running CAU notice bot:", error);
    process.exit(1);
  }
}

void main();
