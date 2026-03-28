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
import { info, warn, error } from "../utils/logger.js";
import { loadRecipients } from "../config/loadRecipients.js";

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

const PIPELINE_MAX_RETRIES = 3;
const PIPELINE_RETRY_DELAY_MS = 3000;

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

type CrawlAttemptResult = {
  notices: Notice[];
  successSources: string[];
  failedSources: string[];
};

async function crawlAllSourcesOnce(): Promise<CrawlAttemptResult> {
  const notices: Notice[] = [];
  const successSources: string[] = [];
  const failedSources: string[] = [];

  info("📚 Crawling Department boards...");
  for (const board of boards) {
    try {
      const site = buildSiteConfig(board);
      const result = await deptCrawler.crawl(site);
      if (result.notices && Array.isArray(result.notices)) {
        notices.push(...result.notices);
      }
      successSources.push(`cau_dept:${board}`);
    } catch (err) {
      failedSources.push(`cau_dept:${board}`);
      warn(`⚠️ Crawl failed for cau_dept:${board}`, err);
    }
  }

  info("🎓 Crawling SW Education Institute...");
  try {
    const swEduSite = buildSwEduSiteConfig();
    const swEduResult = await swEduCrawler.crawl(swEduSite);
    if (swEduResult.notices && Array.isArray(swEduResult.notices)) {
      notices.push(...swEduResult.notices);
    }
    successSources.push("cau_sw_edu");
  } catch (err) {
    failedSources.push("cau_sw_edu");
    warn("⚠️ Crawl failed for cau_sw_edu", err);
  }

  return { notices, successSources, failedSources };
}

async function main() {
  try {
    let allNotices: Notice[] = [];
    let successSources: string[] = [];
    let failedSources: string[] = [];

    for (let attempt = 1; attempt <= PIPELINE_MAX_RETRIES; attempt++) {
      const result = await crawlAllSourcesOnce();
      allNotices = result.notices;
      successSources = result.successSources;
      failedSources = result.failedSources;

      if (successSources.length > 0) {
        break;
      }

      if (attempt < PIPELINE_MAX_RETRIES) {
        warn(
          `⚠️ All sources failed on attempt ${attempt}/${PIPELINE_MAX_RETRIES}. Retrying in ${PIPELINE_RETRY_DELAY_MS}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, PIPELINE_RETRY_DELAY_MS));
      }
    }

    if (successSources.length === 0) {
      throw new Error(`All crawl sources failed after ${PIPELINE_MAX_RETRIES} attempts`);
    }

    info(`✅ Successful sources: ${successSources.length}`);
    if (failedSources.length > 0) {
      warn(`⚠️ Failed sources: ${failedSources.join(", ")}`);
    }

    info(`📊 Total merged count: ${allNotices.length}`);

    const recent = filterRecentNotices(allNotices, 7);

    info(`📅 Filtered count (7 days): ${recent.length}`);

    if (recent.length === 0) {
      info("No recent notices found. Exiting without sending email.");
      return;
    }

    // Load recipients from env var or local config file
    const recipients = await loadRecipients();
    
    if (recipients.length === 0) {
      error("❌ No recipients configured.");
      error("Please set RECIPIENTS_JSON environment variable or create config/recipients.ts");
      error("Example: RECIPIENTS_JSON='[{\"name\":\"User\",\"email\":\"user@example.com\"}]'");
      process.exit(1);
    }

    info(`📧 Preparing email for ${recipients.length} recipient(s)...`);

    const email = buildUnifiedNoticeEmail(
      recent,
      failedSources.length > 0 ? failedSources : undefined
    );

    await sendMail(recipients, email.subject, email.html);

    info(`✅ Email sent to ${recipients.length} recipient(s) via BCC.`);
  } catch (err) {
    error("❌ Error running CAU notice bot:", err);
    process.exit(1);
  }
}

void main();
