// Shared types representing notices and their sources.

export type NoticeSourceId =
  | "cau_portal"
  | "cau_dept"
  | "cau_grad"
  | "cau_intl";

export interface NoticeSource {
  id: NoticeSourceId;
  name: string;
  url: string;
}

export interface Notice {
  id: string;
  title: string;
  url: string;
  publishedAt: Date;
  source: NoticeSourceId;
  summary?: string;
}

