// Minimal test runner for the CAU department crawler.
// - Builds a SiteConfig for a department site
// - Calls deptCrawler.crawl
// - Logs the returned notices to the console

import { deptCrawler } from "../src/integrations/cau/deptCrawler.js";
import { cauBoards } from "../src/integrations/cau/boards.js";

async function main() {
  for (const board of cauBoards) {
    const result = await deptCrawler.crawl(board);
    // eslint-disable-next-line no-console
    console.log(board.id, result.notices.length);
  }
}

void main();

