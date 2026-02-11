// Crawler implementation for CAU international office/global site notices.

import type { CauCrawler } from "./baseCrawler.js";
import type { SiteConfig } from "../../types/config.js";
import type { CrawlResult } from "../../types/result.js";

export const intlCrawler: CauCrawler = {
  id: "cau_intl",
  async crawl(_site: SiteConfig): Promise<CrawlResult> {
    // TODO: implement international office-specific crawling logic.
    return {
      sourceId: "cau_intl",
      notices: [],
    };
  },
};

