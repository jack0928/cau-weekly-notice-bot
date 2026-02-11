// Production runner for the CAU notice bot.
// Orchestrates: crawling → filtering → email generation → sending.

import "dotenv/config";
import { deptCrawler } from "../integrations/cau/deptCrawler.js";
import type { SiteConfig } from "../types/config.js";
import type { Notice } from "../types/notice.js";
import { filterRecentNotices } from "../core/filters/dateFilter.js";
import { buildCauNoticeEmail } from "../integrations/email/templates/cauNoticeTemplate.js";
import { sendMail } from "../core/mail/mailSender.js";

const boards = ["sub0501", "sub0502", "sub0506"] as const;

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

function buildSiteConfig(board: typeof boards[number]): SiteConfig {
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
  try {
    // 1. Crawl all boards sequentially
    const allNotices: Notice[] = [];
    
    for (const board of boards) {
      const site = buildSiteConfig(board);
      const result = await deptCrawler.crawl(site);
      if (result.notices && Array.isArray(result.notices)) {
        allNotices.push(...result.notices);
      }
    }

    // eslint-disable-next-line no-console
    console.log(`Total merged count: ${allNotices.length}`);

    // 2. Apply 7-day filter
    const recent = filterRecentNotices(allNotices, 7);

    // eslint-disable-next-line no-console
    console.log(`Filtered count (7 days): ${recent.length}`);

    // 3. Exit if no recent notices
    if (recent.length === 0) {
      // eslint-disable-next-line no-console
      console.log("No recent notices found. Exiting without sending email.");
      return;
    }

    // 4. Build email
    const email = buildCauNoticeEmail(recent, boardIdResolver);

    // 5. Send email
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
