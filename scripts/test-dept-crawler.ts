// Minimal test runner for the CAU department crawler.
// - Builds a SiteConfig for a department site
// - Calls deptCrawler.crawl
// - Logs the returned notices to the console

import { deptCrawler } from "../src/integrations/cau/deptCrawler.js";
import type { SiteConfig } from "../src/types/config.js";

async function main() {
  const site: SiteConfig = {
    id: "cau_dept",
    baseUrl: "https://cse.cau.ac.kr",
    listPath: "/sub05/sub0501.php",
    selectors: {
      // The notice list rows live inside the main board table.
      // Cheerio does not auto-insert <tbody>, so we match all rows.
      item: "table.table-basic tr",
      // The title link is inside the "aleft" column.
      title: "td.aleft a",
      url: "td.aleft a",
      // All date-like cells share the pc-only class; the crawler
      // will choose the one that looks like a YYYY.MM.DD date.
      date: "td.pc-only",
    },
  };

  const result = await deptCrawler.crawl(site);

  // For quick inspection, log notices as JSON.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result.notices, null, 2));
}

void main();

