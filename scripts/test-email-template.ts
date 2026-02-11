// Test runner for CAU email template.
// Usage: npm run test:email-template

import { writeFileSync } from "fs";
import type { Notice } from "../src/types/notice.js";
import { buildCauNoticeEmail } from "../src/integrations/email/templates/cauNoticeTemplate.js";

type BoardId = "sub0501" | "sub0502" | "sub0506";

function boardIdResolver(notice: Notice): BoardId {
  if (notice.url.includes("bbs05")) {
    return "sub0501";
  }
  if (notice.url.includes("bbs07")) {
    return "sub0502";
  }
  if (notice.url.includes("bbs06")) {
    return "sub0506";
  }
  // Default fallback
  return "sub0501";
}

async function main() {
  const mockNotices: Notice[] = [
    {
      id: "1",
      title: "2026학년도 1학기 수강신청 안내",
      url: "https://cse.cau.ac.kr/sub05/sub0501.php?nmode=view&code=oktomato_bbs05&uid=3316",
      publishedAt: new Date(),
      source: "cau_dept",
    },
    {
      id: "2",
      title: "삼성전자 인턴십 모집 공고",
      url: "https://cse.cau.ac.kr/sub05/sub0502.php?nmode=view&code=oktomato_bbs07&uid=100",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      source: "cau_dept",
    },
    {
      id: "3",
      title: "2026 SW 창업 아이디어 공모전",
      url: "https://cse.cau.ac.kr/sub05/sub0506.php?nmode=view&code=oktomato_bbs06&uid=200",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      source: "cau_dept",
    },
    {
      id: "4",
      title: "졸업인정제한자 능력인정제도 변경안내",
      url: "https://cse.cau.ac.kr/sub05/sub0501.php?nmode=view&code=oktomato_bbs05&uid=3311",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      source: "cau_dept",
    },
    {
      id: "5",
      title: "네이버 클라우드 플랫폼 채용 설명회",
      url: "https://cse.cau.ac.kr/sub05/sub0502.php?nmode=view&code=oktomato_bbs07&uid=101",
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      source: "cau_dept",
    },
  ];

  const result = buildCauNoticeEmail(mockNotices, boardIdResolver);

  // eslint-disable-next-line no-console
  console.log("Subject:", result.subject);
  // eslint-disable-next-line no-console
  console.log("\nHTML:");
  // eslint-disable-next-line no-console
  console.log(result.html);

  writeFileSync("./email-preview.html", result.html, "utf-8");
  // eslint-disable-next-line no-console
  console.log("\n✅ HTML written to email-preview.html");
}

void main();
