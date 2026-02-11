// Maps site/source IDs to concrete crawler implementations.
// Implementation will be plugged in from the integrations layer.

import type { SiteCrawler } from "./crawlerService";
import type { NoticeSourceId } from "../../types/notice";

export function buildCrawlerRegistry(
  _crawlers: SiteCrawler[]
): Record<NoticeSourceId, SiteCrawler> {
  // TODO: build and return a lookup map from source ID to crawler.
  return {} as Record<NoticeSourceId, SiteCrawler>;
}

