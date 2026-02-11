// Configuration for CAU CSE boards that share the same HTML structure.

import type { SiteConfig } from "../../types/config.js";

const BASE_URL = "https://cse.cau.ac.kr";

const sharedSelectors: NonNullable<SiteConfig["selectors"]> = {
  item: "table.table-basic tr",
  title: "td.aleft a",
  url: "td.aleft a",
  date: "td.pc-only",
};

export const cauBoards: SiteConfig[] = [
  {
    id: "cau_notice",
    baseUrl: BASE_URL,
    listPath: "/sub05/sub0501.php",
    selectors: sharedSelectors,
  },
  {
    id: "cau_job",
    baseUrl: BASE_URL,
    listPath: "/sub05/sub0502.php",
    selectors: sharedSelectors,
  },
  {
    id: "cau_contest",
    baseUrl: BASE_URL,
    listPath: "/sub05/sub0506.php",
    selectors: sharedSelectors,
  },
];

