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
    console.log(html.slice(0, 1000));
    const notices = parseNoticesFromHtml(html, site);

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

function parseNoticesFromHtml(html: string, site: SiteConfig): Notice[] {
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
  console.log(`deptCrawler: found ${Array.isArray(items) ? items.length : 0} items for selector "${itemSelector}"`);

  const notices: Notice[] = [];

  for (const item of items) {
    const element = item as {
      querySelector?(selector: string): any;
      querySelectorAll?(selector: string): any[];
    };

    const titleEl =
      typeof element.querySelector === "function"
        ? element.querySelector(titleSelector)
        : undefined;
    const urlEl =
      typeof element.querySelector === "function"
        ? element.querySelector(urlSelector)
        : undefined;

    let rawDate: string | undefined;
    if (typeof element.querySelectorAll === "function") {
      const dateCandidates = element.querySelectorAll(dateSelector) as any[];
      const texts =
        dateCandidates
          ?.map((c) => c?.textContent?.toString().trim())
          .filter((t: string | undefined): t is string => Boolean(t)) ?? [];

      // Prefer a value that looks like YYYY.MM.DD, but fall back to the first non-empty one.
      rawDate =
        texts.find((t) => /^\d{4}\.\d{2}\.\d{2}$/.test(t)) ?? texts[0];
    } else {
      const dateEl =
        typeof element.querySelector === "function"
          ? element.querySelector(dateSelector)
          : undefined;
      rawDate = dateEl?.textContent?.toString().trim();
    }

    const rawTitle = titleEl?.textContent?.toString().trim();
    const rawHref = urlEl?.getAttribute?.("href") as string | undefined;

    const cleanedTitle = stripNewTagText(rawTitle);

    if (!cleanedTitle || !rawHref || !rawDate) {
      // Skip incomplete entries rather than failing the whole crawl.
      continue;
    }

    const url = new URL(rawHref, site.baseUrl).toString();
    const publishedAt = parsePublishedAt(rawDate);

    notices.push({
      id: `${site.id}:${url}`,
      title: cleanedTitle,
      url,
      publishedAt,
      source: site.id,
    });
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

