// Crawler implementation for CAU SW Education Institute.
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

export const swEduCrawler: CauCrawler = {
  id: "cau_sw_edu",
  async crawl(site: SiteConfig): Promise<CrawlResult> {
    const listUrl = buildListUrl(site);
    const html = await httpGet(listUrl);
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

  // Debug: log how many items match the configured selector.
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
      skipReasons["header_row_th"] = (skipReasons["header_row_th"] || 0) + 1;
      continue;
    }

    const firstCell = element.querySelector?.("td:first-child");
    if (firstCell) {
      const firstCellText = firstCell.textContent?.toString().trim() ?? "";
      // "번호" indicates header row, but "공지" is a valid data row indicator
      if (firstCellText === "번호") {
        skippedCount++;
        skipReasons["header_row_text"] = (skipReasons["header_row_text"] || 0) + 1;
        continue;
      }
    }

    // Must have a title link in td.tl a
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

    // Extract date from third td (index 2)
    let rawDate: string | undefined;
    if (typeof element.querySelectorAll === "function") {
      const allCells = element.querySelectorAll("td") as any[];
      if (allCells && allCells.length >= 3) {
        const dateCell = allCells[2];
        rawDate = dateCell?.textContent?.toString().trim();
      }
    }

    const rawTitle = titleEl?.textContent?.toString().trim();
    const rawHref = urlEl?.getAttribute?.("href") as string | undefined;

    const cleanedTitle = stripNewTagText(rawTitle);

    if (!cleanedTitle || !rawHref) {
      skippedCount++;
      skipReasons["no_title_or_url"] = (skipReasons["no_title_or_url"] || 0) + 1;
      // eslint-disable-next-line no-console
      console.log(`  [SKIP] no_title_or_url`);
      continue;
    }

    if (!rawDate) {
      skippedCount++;
      skipReasons["no_date"] = (skipReasons["no_date"] || 0) + 1;
      // eslint-disable-next-line no-console
      console.log(`  [SKIP] "${cleanedTitle.substring(0, 50)}..." - no valid date found`);
      continue;
    }

    // Extract exact href and resolve to absolute URL if relative
    // Resolve against /board/ to preserve directory structure
    const url = new URL(rawHref, "https://swedu.cau.ac.kr/board/").href;
    const publishedAt = parsePublishedAt(rawDate);

    // Validate parsed date
    if (!(publishedAt instanceof Date) || isNaN(publishedAt.getTime())) {
      skippedCount++;
      skipReasons["invalid_date"] = (skipReasons["invalid_date"] || 0) + 1;
      // eslint-disable-next-line no-console
      console.log(`  [SKIP] "${cleanedTitle.substring(0, 50)}..." - invalid date: ${rawDate}`);
      continue;
    }

    // Extract boardid from query string for Notice.id
    const boardId = extractBoardId(url);
    const noticeId = boardId ? `${site.id}:${boardId}` : `${site.id}:${url}`;

    // Debug: log extracted notice with title, date, and URL
    // eslint-disable-next-line no-console
    console.log(`  [OK] "${cleanedTitle.substring(0, 50)}..." | ${rawDate} | ${url}`);

    notices.push({
      id: noticeId,
      title: cleanedTitle,
      url,
      publishedAt,
      source: "cau_sw_edu",
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

  // Handle dates like 2026.02.10 or 2026-02-10
  const dotParts = trimmed.split(".");
  const dashParts = trimmed.split("-");
  
  let parts: string[] = [];
  if (dotParts.length >= 3) {
    parts = dotParts;
  } else if (dashParts.length >= 3) {
    parts = dashParts;
  }

  if (parts.length >= 3) {
    const [yearStr, monthStr, dayStr] = parts;
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

function extractBoardId(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    const boardid = urlObj.searchParams.get("boardid");
    
    if (boardid) {
      return `boardid=${boardid}`;
    }
  } catch {
    // Invalid URL, return undefined
  }
  return undefined;
}
