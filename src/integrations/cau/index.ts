// Registry of CAU crawlers, keyed by source ID.

import type { CauCrawler } from "./baseCrawler";
import { portalCrawler } from "./portalCrawler";
import { deptCrawler } from "./deptCrawler";
import { gradCrawler } from "./gradCrawler";
import { intlCrawler } from "./intlCrawler";

export const cauCrawlers: CauCrawler[] = [
  portalCrawler,
  deptCrawler,
  gradCrawler,
  intlCrawler,
];

