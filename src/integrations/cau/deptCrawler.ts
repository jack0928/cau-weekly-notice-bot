// Crawler implementation for a specific CAU department site.
// Responsibilities:
// - Build the list URL from site config
// - Fetch HTML
// - Parse notice list elements using selectors from config
// - Return a CrawlResult containing Notice[]

import type { CauCrawler } from "./baseCrawler.js";
import type { SiteConfig } from "../../types/config.js";
import type { CrawlResult } from "../../types/result.js";
import type { Notice } from "../../types/notice.js";
import { httpGet } from "../../utils/http.js";
import { parseHtml } from "../../utils/html.js";

export const deptCrawler: CauCrawler = {
  id: "cau_dept",
  async crawl(site: SiteConfig): Promise<CrawlResult> {
    const listUrl = buildListUrl(site);
    const html = await httpGet(listUrl);
    // Temporary debug log: first 1000 characters of the fetched HTML.
    // eslint-disable-next-line no-console
    const notices = parseNoticesFromHtml(html, site, listUrl);

    return {
      sourceId: site.id,
      notices,
    };
  },
};

function buildListUrl(site: SiteConfig): string {
  // Use URL to safely join baseUrl and listPath.
  return new URL(site.listPath, site.baseUrl).toString();
}

function parseNoticesFromHtml(html: string, site: SiteConfig, listUrl: string): Notice[] {
  const doc = parseHtml(html) as unknown as {
    querySelectorAll?(selector: string): any[];
  };

  const selectors = site.selectors ?? {};
  const itemSelector = selectors.item ?? "li";
  const titleSelector = selectors.title ?? "a";
  const urlSelector = selectors.url ?? "a";
  const dateSelector = selectors.date ?? ".date";

  const items =
    typeof doc.querySelectorAll === "function"
      ? doc.querySelectorAll(itemSelector)
      : [];

  // Temporary debug: log how many items match the configured selector.
  // eslint-disable-next-line no-console
  console.log(`[${site.id}] Found ${Array.isArray(items) ? items.length : 0} rows for selector "${itemSelector}"`);

  const notices: Notice[] = [];
  let skippedCount = 0;
  const skipReasons: Record<string, number> = {};

  for (const item of items) {
    const element = item as {
      querySelector?(selector: string): any;
      querySelectorAll?(selector: string): any[];
      tagName?: string;
    };

    // Skip header rows: rows with <th> elements or first cell is exactly "번호"
    const hasTh = element.querySelector?.("th");
    if (hasTh) {
      skippedCount++;
      skipReasons["header_row"] = (skipReasons["header_row"] || 0) + 1;
      continue;
    }

    const firstCell = element.querySelector?.("td:first-child");
    if (firstCell) {
      const firstCellText = firstCell.textContent?.toString().trim() ?? "";
      // "번호" indicates header row, but "공지" is a valid data row indicator
      if (firstCellText === "번호") {
        skippedCount++;
        skipReasons["header_row"] = (skipReasons["header_row"] || 0) + 1;
        continue;
      }
    }

    // Must have a title link in td.aleft a
    const titleEl =
      typeof element.querySelector === "function"
        ? element.querySelector(titleSelector)
        : undefined;
    const urlEl =
      typeof element.querySelector === "function"
        ? element.querySelector(urlSelector)
        : undefined;

    if (!titleEl || !urlEl) {
      skippedCount++;
      skipReasons["no_title_link"] = (skipReasons["no_title_link"] || 0) + 1;
      continue;
    }

    // Extract date from td.pc-only cells, preferring YYYY.MM.DD format
    let rawDate: string | undefined;
    if (typeof element.querySelectorAll === "function") {
      const dateCandidates = element.querySelectorAll(dateSelector) as any[];
      const texts =
        dateCandidates
          ?.map((c) => c?.textContent?.toString().trim())
          .filter((t: string | undefined): t is string => Boolean(t)) ?? [];

      // Prefer a value that looks like YYYY.MM.DD
      rawDate = texts.find((t) => /^\d{4}\.\d{2}\.\d{2}$/.test(t));
      
      // If no date found, try to get from all td cells (fallback)
      if (!rawDate) {
        const allCells = element.querySelectorAll?.("td") as any[] ?? [];
        const cellTexts = allCells
          .map((c) => c?.textContent?.toString().trim())
          .filter((t: string | undefined): t is string => Boolean(t));
        rawDate = cellTexts.find((t) => /^\d{4}\.\d{2}\.\d{2}$/.test(t));
      }
    }

    const rawTitle = titleEl?.textContent?.toString().trim();
    const rawHref = urlEl?.getAttribute?.("href") as string | undefined;

    const cleanedTitle = stripNewTagText(rawTitle);

    if (!cleanedTitle || !rawHref) {
      skippedCount++;
      skipReasons["no_title_or_url"] = (skipReasons["no_title_or_url"] || 0) + 1;
      continue;
    }

    if (!rawDate) {
      skippedCount++;
      skipReasons["no_date"] = (skipReasons["no_date"] || 0) + 1;
      // eslint-disable-next-line no-console
      console.log(`  [SKIP] "${cleanedTitle.substring(0, 50)}..." - no valid date found`);
      continue;
    }

    // Use listUrl as base to correctly resolve query-only hrefs like "?nmode=view..."
    const url = new URL(rawHref, listUrl).toString();
    const publishedAt = parsePublishedAt(rawDate);

    // Validate parsed date
    if (!(publishedAt instanceof Date) || isNaN(publishedAt.getTime())) {
      skippedCount++;
      skipReasons["invalid_date"] = (skipReasons["invalid_date"] || 0) + 1;
      // eslint-disable-next-line no-console
      console.log(`  [SKIP] "${cleanedTitle.substring(0, 50)}..." - invalid date: ${rawDate}`);
      continue;
    }

    // eslint-disable-next-line no-console
    console.log(`  [OK] "${cleanedTitle.substring(0, 50)}..." | ${rawDate}`);

    notices.push({
      id: `${site.id}:${url}`,
      title: cleanedTitle,
      url,
      publishedAt,
      source: site.id,
    });
  }

  // eslint-disable-next-line no-console
  console.log(`[${site.id}] Extracted ${notices.length} notices, skipped ${skippedCount} rows`);
  if (Object.keys(skipReasons).length > 0) {
    // eslint-disable-next-line no-console
    console.log(`[${site.id}] Skip reasons:`, skipReasons);
  }

  return notices;
}

function stripNewTagText(title: string | undefined): string | undefined {
  if (!title) return title;
  // Remove standalone 'NEW' markers and collapse whitespace.
  return title.replace(/\bNEW\b/g, "").replace(/\s+/g, " ").trim();
}

function parsePublishedAt(raw: string): Date {
  const trimmed = raw.trim();

  // Handle CAU-style dates like 2026.02.10
  const dotParts = trimmed.split(".");
  if (dotParts.length >= 3) {
    const [yearStr, monthStr, dayStr] = dotParts;
    const year = Number(yearStr);
    const month = Number(monthStr) - 1; // JS Date months are 0-based
    const day = Number(dayStr);

    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return new Date(year, month, day);
    }
  }

  // Fallback to built-in parsing for any other formats.
  return new Date(trimmed);
}

