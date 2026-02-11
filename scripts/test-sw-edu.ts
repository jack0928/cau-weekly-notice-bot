// Test runner for CAU SW Education Institute.
// Usage: npm run test:sw-edu

import { swEduCrawler } from "../src/integrations/cau/swEduCrawler.js";
import type { SiteConfig } from "../src/types/config.js";

const site: SiteConfig = {
  id: "cau_sw_edu",
  baseUrl: "https://swedu.cau.ac.kr",
  listPath: "/board/list?boardtypeid=7&menuid=001005005",
  selectors: {
    item: "div.list_type_h1 table tbody tr",
    title: "td.tl a",
    url: "td.tl a",
    date: "td",
  },
};

async function main() {
  try {
    // eslint-disable-next-line no-console
    console.log("🔍 Testing SW Education Institute crawler...\n");

    const result = await swEduCrawler.crawl(site);

    // eslint-disable-next-line no-console
    console.log(`\n=== Extracted ${result.notices.length} notices ===\n`);

    for (const notice of result.notices) {
      // eslint-disable-next-line no-console
      console.log(`Title: ${notice.title}`);
      // eslint-disable-next-line no-console
      console.log(`Date: ${notice.publishedAt.toISOString().slice(0, 10)}`);
      // eslint-disable-next-line no-console
      console.log(`URL: ${notice.url}`);
      // eslint-disable-next-line no-console
      console.log(`ID: ${notice.id}`);
      // eslint-disable-next-line no-console
      console.log("---");
    }

    // Also output as JSON for programmatic use
    // eslint-disable-next-line no-console
    console.log("\n=== JSON Output ===");
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error testing SW Edu crawler:", error);
    process.exit(1);
  }
}

void main();
