// HTML parsing helpers (server-side DOM parsing).
// We expose a tiny, browser-like wrapper over cheerio so that callers
// can use querySelector/querySelectorAll/textContent/getAttribute in
// a familiar way without depending directly on cheerio.

import * as cheerio from "cheerio";

interface HtmlElementWrapper {
  querySelector(selector: string): HtmlElementWrapper | undefined;
  querySelectorAll(selector: string): HtmlElementWrapper[];
  textContent: string;
  getAttribute(name: string): string | undefined;
}

interface HtmlDocumentWrapper {
  querySelectorAll(selector: string): HtmlElementWrapper[];
}

function wrapElement(
  $: cheerio.CheerioAPI,
  selection: cheerio.Cheerio<any>
): HtmlElementWrapper {
  return {
    querySelector(selector: string): HtmlElementWrapper | undefined {
      const found = selection.find(selector).first();
      if (!found || found.length === 0) return undefined;
      return wrapElement($, found);
    },
    querySelectorAll(selector: string): HtmlElementWrapper[] {
      const found = selection.find(selector);
      const results: HtmlElementWrapper[] = [];
      found.each((_, el) => {
        const wrapped = $(el);
        results.push(wrapElement($, wrapped));
      });
      return results;
    },
    get textContent(): string {
      return selection.text();
    },
    getAttribute(name: string): string | undefined {
      const value = selection.attr(name);
      return value === undefined ? undefined : String(value);
    },
  };
}

export function parseHtml(html: string): HtmlDocumentWrapper {
  const $ = cheerio.load(html);

  return {
    querySelectorAll(selector: string): HtmlElementWrapper[] {
      const found = $(selector);
      const results: HtmlElementWrapper[] = [];
      found.each((_, el) => {
        const wrapped = $(el);
        results.push(wrapElement($, wrapped));
      });
      return results;
    },
  };
}

