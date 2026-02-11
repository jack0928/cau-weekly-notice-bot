// Base utilities and shared types for CAU site crawlers.
// Concrete crawlers for each site will extend or use these helpers.

import type { CrawlResult } from "../../types/result";
import type { SiteConfig } from "../../types/config";

export interface CauCrawler {
  id: string;
  crawl(site: SiteConfig): Promise<CrawlResult>;
}

export async function fetchCauListPage(_url: string): Promise<string> {
  // TODO: perform HTTP GET and return HTML content.
  return "";
}

