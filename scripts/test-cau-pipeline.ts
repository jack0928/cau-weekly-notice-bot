// Test runner for the CAU pipeline.
// Usage: npm run test:pipeline

import { runCauPipeline } from "../src/core/pipeline/runCauPipeline.js";

async function main() {
  // eslint-disable-next-line no-console
  console.log("🔍 Testing CAU Pipeline (Dept + SW Edu)...\n");

  // Run the full pipeline (crawl all sources, merge, filter, sort).
  const filteredNotices = await runCauPipeline();

  // eslint-disable-next-line no-console
  console.log("\n=== Pipeline Results ===");
  // eslint-disable-next-line no-console
  console.log(`Final count (after 7-day filter): ${filteredNotices.length}\n`);

  // Group notices by source
  const bySource = filteredNotices.reduce((acc, notice) => {
    const source = notice.source;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(notice);
    return acc;
  }, {} as Record<string, typeof filteredNotices>);

  // eslint-disable-next-line no-console
  console.log("=== Breakdown by Source ===");
  for (const [source, notices] of Object.entries(bySource)) {
    // eslint-disable-next-line no-console
    console.log(`${source}: ${notices.length} notices`);
  }

  // eslint-disable-next-line no-console
  console.log("\n=== Recent Notices (sorted by date, latest first) ===");
  for (const notice of filteredNotices) {
    const dateStr = notice.publishedAt instanceof Date 
      ? notice.publishedAt.toISOString().slice(0, 10)
      : "Invalid Date";
    // eslint-disable-next-line no-console
    console.log(`[${notice.source}] ${dateStr} - ${notice.title.substring(0, 60)}...`);
  }
}

void main();
