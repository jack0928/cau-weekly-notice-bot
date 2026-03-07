## Overview

This project is a weekly notice crawler bot for Chung-Ang University websites.
It crawls multiple notice boards, filters notices published within the last 7 days,
formats a unified HTML email report, and is executed automatically every Friday
at 9:00 AM KST via GitHub Actions.

## Project Structure

```
cau-weekly-notice-bot/
├── src/
│   ├── app/
│   │   └── runCauNoticeBot.ts       # Main production entrypoint
│   ├── core/
│   │   ├── filters/
│   │   │   └── dateFilter.ts        # 7-day notice filtering logic
│   │   ├── mail/
│   │   │   └── mailSender.ts        # SMTP email sender (Nodemailer)
│   │   └── pipeline/
│   │       └── runCauPipeline.ts    # Orchestrates crawling + filtering
│   ├── integrations/
│   │   ├── cau/
│   │   │   ├── baseCrawler.ts       # Crawler interface definition
│   │   │   ├── boards.ts            # Site config definitions
│   │   │   ├── deptCrawler.ts       # Crawler for Dept boards (sub0501, sub0502, sub0506)
│   │   │   ├── swEduCrawler.ts      # Crawler for SW Education Institute
│   │   │   └── index.ts             # Crawler registry and orchestrator
│   │   └── email/
│   │       └── templates/
│   │           └── cauNoticeTemplate.ts  # HTML email builder
│   ├── types/
│   │   ├── config.ts                # SiteConfig interface
│   │   ├── notice.ts                # Notice interface & NoticeSourceId
│   │   └── result.ts                # CrawlResult interface
│   └── utils/
│       ├── html.ts                  # HTML parsing (Cheerio wrapper)
│       ├── http.ts                  # HTTP GET with retry logic
│       └── logger.ts                # Environment-based logging (DEBUG=true)
├── scripts/
│   ├── test-email-pipeline.ts       # Full pipeline test (crawl + filter + email)
│   ├── test-email-template.ts       # Email template test with mock data
│   └── test-sw-edu.ts               # SW Education crawler isolated test
├── .github/workflows/
│   └── weekly-notice.yml            # Weekly cron job (Fridays 9:00 AM KST)
├── package.json                     # Dependencies & npm scripts
├── tsconfig.json                    # TypeScript configuration (ESM)
└── .env                             # Local secrets (SMTP_USER, SMTP_PASS, MAIL_TO)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions (Fridays 9:00 AM KST)                        │
│   → runs: npm run start                                     │
│   → executes: src/app/runCauNoticeBot.ts                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Crawl Department Boards (cau_dept)                       │
│    - sub0501: 공지사항 & 뉴스                                │
│    - sub0502: 취업정보                                       │
│    - sub0506: 공모전 소식                                    │
│    → deptCrawler.crawl() for each board                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Crawl SW Education Institute (cau_sw_edu)                │
│    - 공지사항 (boardtypeid=7&menuid=001005005)              │
│    → swEduCrawler.crawl()                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Merge All Notices                                        │
│    - Combine dept + SW Edu into single Notice[]             │
│    - Preserve source field (cau_dept / cau_sw_edu)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Filter Recent Notices (7 days)                           │
│    - filterRecentNotices(allNotices, 7)                     │
│    - Compare publishedAt with current time                  │
│    - Timezone: Asia/Seoul (KST)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Build Unified HTML Email                                 │
│    - buildUnifiedNoticeEmail(recentNotices)                 │
│    - Group dept notices by boardId (sub0501/02/06)          │
│    - SW Edu notices in separate section                     │
│    - HTML structure:                                        │
│      📬 중앙대학교 공지 통합 리포트                          │
│      🏫 소프트웨어학부                                       │
│         📢 공지사항 & 뉴스 / 💼 취업정보 / 🏆 공모전 소식    │
│      🎓 SW교육원                                             │
│         📢 공지사항                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Send Email via SMTP                                      │
│    - sendMail(subject, html)                                │
│    - Gmail SMTP with credentials from env                   │
│    - Auto-generate plain text fallback                      │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### Crawlers (`src/integrations/cau/`)

Each crawler implements the `CauCrawler` interface:

```typescript
interface CauCrawler {
  id: NoticeSourceId;
  crawl(site: SiteConfig): Promise<CrawlResult>;
}
```

**deptCrawler** (학부 홈페이지):
- Handles 3 boards: sub0501, sub0502, sub0506
- Selector: `div.view_content tbody tr`
- Extracts: title (`td.tl a`), URL, date (`td:nth-child(4)`)
- URL format: `/bbs/bbsView.do?...`

**swEduCrawler** (SW교육원):
- Single board: boardtypeid=7
- Selector: `div.list_type_h1 table tbody tr`
- Extracts: title (`td.tl a`), URL, date (3rd `td`)
- URL format: `/board/view?menuid=...&boardid=...`
- Skips header rows (`<th>` or "번호")
- Includes "공지" rows

### Date Filtering (`src/core/filters/dateFilter.ts`)

- `filterRecentNotices(notices, days)`: Filters notices within last N days
- Timezone-aware: Uses KST via manual date parsing (`new Date(year, month - 1, day)`)
- Debug logs: NOW, THRESHOLD, PASS/SKIP for each notice

### Email Template (`src/integrations/email/templates/cauNoticeTemplate.ts`)

- `buildUnifiedNoticeEmail(notices)`: Generates HTML email from Notice[]
- Splits notices by `source` (cau_dept / cau_sw_edu)
- Dept section: Groups by boardId (sub0501/02/06)
- SW Edu section: Single chronological list
- Date format: YYYY-MM-DD (KST) via `Intl.DateTimeFormat`

### HTTP Utility (`src/utils/http.ts`)

- `httpGet(url)`: Fetches HTML with retry logic
- Retry mechanism: 3 attempts, 2-second delay
- User-Agent: Realistic browser string
- Throws after final retry failure

### Logger (`src/utils/logger.ts`)

- `debug()`: Only logs when `DEBUG=true`
- `info()`, `warn()`, `error()`: Always log (production)
- Used throughout crawlers, filters, and pipeline

## Environment Variables

Required for production (GitHub Actions Secrets):

- `SMTP_USER`: Gmail account for sending
- `SMTP_PASS`: Gmail app password
- `MAIL_TO`: Recipient email address

Optional:

- `DEBUG=true`: Enables verbose debug logging

## GitHub Actions Workflow

`.github/workflows/weekly-notice.yml`:

- **Schedule**: `cron: "0 0 * * 5"` (Fridays 00:00 UTC = 09:00 KST)
- **Manual trigger**: `workflow_dispatch`
- **Execution**: `npm run start` → runs `src/app/runCauNoticeBot.ts`
- **Secrets**: Injects `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`

## Testing

Local test scripts (run via `npm run test:*`):

- `test:sw-edu` – Test SW Education crawler in isolation
- `test:email-pipeline` – Full pipeline test (crawl + filter + email build)
- `test:email-template` – Email template test with mock data

Debug mode: `DEBUG=true npm run test:email-pipeline`

## Technology Stack

- **Runtime**: Node.js 20.x (ESM)
- **Language**: TypeScript (NodeNext module resolution)
- **HTTP**: Native `fetch` API
- **Parsing**: Cheerio (jQuery-like HTML parsing)
- **Email**: Nodemailer (Gmail SMTP)
- **Automation**: GitHub Actions
- **Environment**: dotenv

