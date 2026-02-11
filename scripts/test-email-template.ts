// Test runner for CAU unified email template.
// Usage: npm run test:email-template

import { writeFileSync } from "fs";
import type { Notice } from "../src/types/notice.js";
import { buildUnifiedNoticeEmail } from "../src/integrations/email/templates/cauNoticeTemplate.js";

async function main() {
  // Mock notices with mixed sources: cau_dept + cau_sw_edu
  const mockNotices: Notice[] = [
    // cau_dept notices (sub0501, sub0502, sub0506)
    {
      id: "dept_1",
      title: "2026학년도 1학기 수강신청 안내",
      url: "https://cse.cau.ac.kr/sub05/sub0501.php?nmode=view&code=oktomato_bbs05&uid=3316",
      publishedAt: new Date(),
      source: "cau_dept",
    },
    {
      id: "dept_2",
      title: "삼성전자 인턴십 모집 공고",
      url: "https://cse.cau.ac.kr/sub05/sub0502.php?nmode=view&code=oktomato_bbs07&uid=100",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      source: "cau_dept",
    },
    {
      id: "dept_3",
      title: "2026 SW 창업 아이디어 공모전",
      url: "https://cse.cau.ac.kr/sub05/sub0506.php?nmode=view&code=oktomato_bbs06&uid=200",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      source: "cau_dept",
    },
    {
      id: "dept_4",
      title: "졸업인정제한자 능력인정제도 변경안내",
      url: "https://cse.cau.ac.kr/sub05/sub0501.php?nmode=view&code=oktomato_bbs05&uid=3311",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      source: "cau_dept",
    },
    {
      id: "dept_5",
      title: "네이버 클라우드 플랫폼 채용 설명회",
      url: "https://cse.cau.ac.kr/sub05/sub0502.php?nmode=view&code=oktomato_bbs07&uid=101",
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      source: "cau_dept",
    },

    // cau_sw_edu notices
    {
      id: "swedu_1",
      title: "SW중심대학 2026학년도 1학기 인턴십 학부생 추가 모집",
      url: "https://swedu.cau.ac.kr/board/view?boardtypeid=7&menuid=001005005&id=12345",
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      source: "cau_sw_edu",
    },
    {
      id: "swedu_2",
      title: "2026 SW교육원 특강 시리즈 안내",
      url: "https://swedu.cau.ac.kr/board/view?boardtypeid=7&menuid=001005005&id=12346",
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      source: "cau_sw_edu",
    },
    {
      id: "swedu_3",
      title: "AI 활용 프로그래밍 경진대회 참가 신청",
      url: "https://swedu.cau.ac.kr/board/view?boardtypeid=7&menuid=001005005&id=12347",
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      source: "cau_sw_edu",
    },
  ];

  const result = buildUnifiedNoticeEmail(mockNotices);

  // eslint-disable-next-line no-console
  console.log("Subject:", result.subject);
  // eslint-disable-next-line no-console
  console.log("\nHTML:");
  // eslint-disable-next-line no-console
  console.log(result.html);

  writeFileSync("./email-preview.html", result.html, "utf-8");
  // eslint-disable-next-line no-console
  console.log("\n✅ HTML written to email-preview.html");
  // eslint-disable-next-line no-console
  console.log(`\n📊 Mock data summary:`);
  // eslint-disable-next-line no-console
  console.log(`   - Total: ${mockNotices.length} notices`);
  // eslint-disable-next-line no-console
  console.log(`   - cau_dept: ${mockNotices.filter((n) => n.source === "cau_dept").length} notices`);
  // eslint-disable-next-line no-console
  console.log(`   - cau_sw_edu: ${mockNotices.filter((n) => n.source === "cau_sw_edu").length} notices`);
}

void main();
