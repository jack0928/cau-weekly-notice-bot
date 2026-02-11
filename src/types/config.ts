// Configuration types for the weekly notice bot.

import type { NoticeSourceId } from "./notice";

export interface SiteConfig {
  id: NoticeSourceId;
  baseUrl: string;
  listPath: string;
  // CSS selectors, XPaths, or other parsing hints.
  selectors?: {
    item?: string;
    title?: string;
    url?: string;
    date?: string;
  };
}

export interface CrawlerConfig {
  timezone: string;
  lookbackDays: number;
  sites: SiteConfig[];
}

export interface EmailConfig {
  from: string;
  to: string[];
  subjectPrefix?: string;
}

export interface JobConfig {
  crawler: CrawlerConfig;
  email: EmailConfig;
}

