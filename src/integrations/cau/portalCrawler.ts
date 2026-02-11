// Crawler implementation for the main CAU portal notices.

import type { CauCrawler } from "./baseCrawler";
import type { SiteConfig } from "../../types/config";
import type { CrawlResult } from "../../types/result";

export const portalCrawler: CauCrawler = {
  id: "cau_portal",
  async crawl(_site: SiteConfig): Promise<CrawlResult> {
    // TODO: implement portal-specific crawling logic.
    return {
      sourceId: "cau_portal",
      notices: [],
    };
  },
};

