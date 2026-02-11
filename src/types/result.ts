// Result and error types for jobs and crawlers.

import type { Notice } from "./notice.js";

export interface CrawlResult {
  sourceId: string;
  notices: Notice[];
}

export interface JobRunResult {
  crawled: CrawlResult[];
  filtered: Notice[];
  sentEmailCount?: number;
  errors?: ErrorInfo[];
}

export interface ErrorInfo {
  message: string;
  sourceId?: string;
  stack?: string;
}

