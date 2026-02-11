// Crawler implementation for a specific CAU department site.

import type { CauCrawler } from "./baseCrawler";
import type { SiteConfig } from "../../types/config";
import type { CrawlResult } from "../../types/result";

export const deptCrawler: CauCrawler = {
  id: "cau_dept",
  async crawl(_site: SiteConfig): Promise<CrawlResult> {
    // TODO: implement department-specific crawling logic.
    return {
      sourceId: "cau_dept",
      notices: [],
    };
  },
};

