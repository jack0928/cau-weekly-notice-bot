// Service responsible for orchestrating crawling across all configured sites.
// Implementation will be added later.

import type { CrawlerConfig } from "../../types/config";
import type { CrawlResult } from "../../types/result";

export interface SiteCrawler {
  id: string;
  crawl(config: CrawlerConfig): Promise<CrawlResult>;
}

export async function crawlAllSites(
  _config: CrawlerConfig,
  _crawlers: SiteCrawler[]
): Promise<CrawlResult[]> {
  // TODO: implement orchestration of crawling for all sites.
  return [];
}

