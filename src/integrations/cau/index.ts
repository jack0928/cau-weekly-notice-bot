// Registry of CAU crawlers, keyed by source ID.

import type { CauCrawler } from "./baseCrawler.js";
import { portalCrawler } from "./portalCrawler.js";
import { deptCrawler } from "./deptCrawler.js";
import { gradCrawler } from "./gradCrawler.js";
import { intlCrawler } from "./intlCrawler.js";

export const cauCrawlers: CauCrawler[] = [
  portalCrawler,
  deptCrawler,
  gradCrawler,
  intlCrawler,
];

