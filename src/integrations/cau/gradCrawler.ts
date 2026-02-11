// Crawler implementation for CAU graduate school notices.

import type { CauCrawler } from "./baseCrawler.js";
import type { SiteConfig } from "../../types/config.js";
import type { CrawlResult } from "../../types/result.js";

export const gradCrawler: CauCrawler = {
  id: "cau_grad",
  async crawl(_site: SiteConfig): Promise<CrawlResult> {
    // TODO: implement graduate school-specific crawling logic.
    return {
      sourceId: "cau_grad",
      notices: [],
    };
  },
};

