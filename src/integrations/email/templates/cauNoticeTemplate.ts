import type { Notice } from "../../../types/notice.js";

type BoardId = "sub0501" | "sub0502" | "sub0506";

const BOARD_TITLES: Record<BoardId, string> = {
  sub0501: "📢 공지사항 & 뉴스",
  sub0502: "💼 취업정보",
  sub0506: "🏆 공모전 소식",
};

function formatDate(date: Date): string {
  // Format in Asia/Seoul timezone to avoid UTC conversion issues
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  
  return `${year}-${month}-${day}`;
}

/**
 * Detects board ID from notice URL for cau_dept source.
 * Rules:
 * - url includes "bbs05" → sub0501
 * - url includes "bbs07" → sub0502
 * - url includes "bbs06" → sub0506
 * - fallback → sub0501
 */
function detectBoardId(notice: Notice): BoardId {
  if (notice.url.includes("bbs05")) return "sub0501";
  if (notice.url.includes("bbs07")) return "sub0502";
  if (notice.url.includes("bbs06")) return "sub0506";
  return "sub0501";
}

export function buildUnifiedNoticeEmail(
  notices: Notice[]
): { subject: string; html: string } {
  // eslint-disable-next-line no-console
  console.log("\n=== EMAIL BUILD DEBUG ===");
  // eslint-disable-next-line no-console
  console.log("TOTAL INPUT:", notices.length);
  // eslint-disable-next-line no-console
  console.log("BY SOURCE:",
    notices.reduce((acc, n) => {
      acc[n.source] = (acc[n.source] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );

  if (!notices.length) {
    return {
      subject: "[CAU Notice Bot] 최근 7일간 새로운 공지가 없습니다",
      html: `<p>최근 7일간 새로운 공지가 없습니다.</p>`,
    };
  }

  const totalCount = notices.length;

  // ============================================================
  // Step 1: Group by source (cau_dept vs cau_sw_edu)
  // ============================================================
  const deptNotices = notices.filter((n) => n.source === "cau_dept");
  const swEduNotices = notices.filter((n) => n.source === "cau_sw_edu");

  // eslint-disable-next-line no-console
  console.log("DEPT NOTICES:", deptNotices.length);
  // eslint-disable-next-line no-console
  console.log("SW EDU NOTICES:", swEduNotices.length);

  // ============================================================
  // Step 2: Build dept sections (grouped by board)
  // ============================================================
  let deptHtml = "";
  if (deptNotices.length > 0) {
    // Sort by publishedAt DESC
    const sortedDept = [...deptNotices].sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    // eslint-disable-next-line no-console
    console.log("DEPT AFTER SORT:", sortedDept.length);

    // Group by board
    const deptGrouped: Record<BoardId, Notice[]> = {
      sub0501: [],
      sub0502: [],
      sub0506: [],
    };

    for (const notice of sortedDept) {
      const boardId = detectBoardId(notice);
      if (!notice.url.includes("bbs05") && !notice.url.includes("bbs07") && !notice.url.includes("bbs06")) {
        // eslint-disable-next-line no-console
        console.warn("  [WARN] Unknown board for URL:", notice.url, "→ defaulting to sub0501");
      }
      deptGrouped[boardId].push(notice);
    }

    // eslint-disable-next-line no-console
    console.log("DEPT GROUPED RESULT:",
      Object.fromEntries(
        Object.entries(deptGrouped).map(([k, v]) => [k, v.length])
      )
    );

    // Build board sections
    const deptSections = (Object.keys(deptGrouped) as BoardId[])
      .filter((boardId) => deptGrouped[boardId].length > 0)
      .map((boardId) => {
        const items = deptGrouped[boardId]
          .map(
            (n) => `
            <li style="margin-bottom:8px;">
              <a href="${n.url}" target="_blank" style="text-decoration:none;">
                ${n.title}
              </a>
              <span style="color:#666;font-size:12px;">
                (${formatDate(n.publishedAt)})
              </span>
            </li>
          `
          )
          .join("");

        return `
        <h3 style="margin-top:16px;">${BOARD_TITLES[boardId]}</h3>
        <ul style="padding-left:16px;">
          ${items}
        </ul>
      `;
      })
      .join("");

    deptHtml = `
      <h2 style="margin-top:24px;">🏫 소프트웨어학부</h2>
      ${deptSections}
    `;
  }

  // ============================================================
  // Step 3: Build SW Edu section (single list)
  // ============================================================
  let swEduHtml = "";
  if (swEduNotices.length > 0) {
    // Sort by publishedAt DESC
    const sortedSwEdu = [...swEduNotices].sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );

    // eslint-disable-next-line no-console
    console.log("SW EDU AFTER SORT:", sortedSwEdu.length);

    const swEduItems = sortedSwEdu
      .map(
        (n) => `
            <li style="margin-bottom:8px;">
              <a href="${n.url}" target="_blank" style="text-decoration:none;">
                ${n.title}
              </a>
              <span style="color:#666;font-size:12px;">
                (${formatDate(n.publishedAt)})
              </span>
            </li>
          `
      )
      .join("");

    swEduHtml = `
      <h2 style="margin-top:24px;">🎓 SW교육원</h2>
      <h3 style="margin-top:16px;">📢 공지사항</h3>
      <ul style="padding-left:16px;">
        ${swEduItems}
      </ul>
    `;
  }

  // ============================================================
  // Step 4: Build final HTML
  // ============================================================
  const html = `
    <div style="font-family:Arial, sans-serif; line-height:1.6;">
      <h2>📬 중앙대학교 공지 통합 리포트</h2>
      <p>최근 7일간 총 <strong>${totalCount}건</strong>의 공지가 등록되었습니다.</p>
      ${deptHtml}
      ${swEduHtml}
      <hr style="margin-top:32px;"/>
      <p style="font-size:12px;color:#888;">
        This email was automatically generated by CAU Notice Bot.
      </p>
    </div>
  `;

  return {
    subject: `[CAU Notice Bot] 최근 7일간 공지 ${totalCount}건`,
    html,
  };
}