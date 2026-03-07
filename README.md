## 📬 CAU Weekly Notice Bot

중앙대학교 소프트웨어학부 및 SW교육원 공지를 자동으로 수집하여
최근 7일간의 신규 공지를 **여러 수신자에게** 이메일로 발송하는 자동화 봇입니다.

서버 없이 GitHub Actions 기반 Cron 스케줄링으로 운영됩니다.

---

## 🎯 주요 특징

- ✅ **다중 게시판 크롤링**: 학부 3개 + SW교육원 1개 게시판
- ✅ **7일 필터링**: Asia/Seoul 타임존 기반 정확한 날짜 처리
- ✅ **여러 수신자 지원**: BCC 방식으로 한 번에 발송
- ✅ **통합 HTML 리포트**: 게시판별 그룹화 + 깔끔한 레이아웃
- ✅ **자동 실행**: 매주 금요일 오전 8시 KST
- ✅ **재시도 로직**: 네트워크 오류 시 자동 재시도 (최대 3회)

---

## 🏗️ 아키텍처 구조

```
GitHub Actions (매주 금요일 08:00 KST)
        ↓
crawl Department Boards (sub0501, 0502, 0506)
        ↓
crawl SW Education Institute
        ↓
merge all notices
        ↓
filterRecentNotices(7일)
        ↓
loadRecipients() [환경변수 or 로컬 파일]
        ↓
buildUnifiedNoticeEmail()
        ↓
sendMail(recipients) [BCC 방식]
```


---

## 🧩 주요 기능

### ✅ 다중 게시판 크롤링
- 소프트웨어학부
  - sub0501 (공지사항 & 뉴스)
  - sub0502 (취업정보)
  - sub0506 (공모전 소식)
- SW교육원

공지([공지]) 게시글도 포함하여 수집합니다.

---

### ✅ 7일 이내 공지만 필터링
- Asia/Seoul 기준 날짜 처리
- UTC 변환 이슈 방지
- invalid date 자동 제외
- publishedAt 기준 정확한 필터링

---

### ✅ 이메일 템플릿
- HTML 템플릿
- text fallback 지원
- 학부 / SW교육원 섹션 분리
- 게시판별 그룹화 유지

예상 출력 구조:
📬 중앙대학교 공지 통합 리포트
최근 7일간 총 N건

🏫 소프트웨어학부
  📢 공지사항 & 뉴스
  💼 취업정보
  🏆 공모전 소식

🎓 SW교육원
  📢 공지사항

  
---

### ✅ Gmail SMTP 발송 (BCC 방식)
- nodemailer 기반
- 여러 수신자에게 BCC로 발송 (프라이버시 보호)
- 1회 전송으로 효율적
- App Password 사용
- 환경변수 기반 보안 설정

---

### ✅ GitHub Actions 자동 실행
- 매주 금요일 오전 8시 (KST)
- 수동 실행(workflow_dispatch) 지원
- TypeScript 직접 실행 (ts-node)

```yaml
cron: "0 23 * * 4"  # Thursdays 23:00 UTC = Fridays 08:00 KST
```

---

## 📊 현재 상태 (MVP 완료)
- ✅ 다중 게시판 병합 (학부 3개 + SW교육원 1개)
- ✅ 날짜 필터 정확 적용 (Asia/Seoul 타임존)
- ✅ 여러 수신자 지원 (BCC 방식)
- ✅ HTML + text 이메일
- ✅ Gmail SMTP 연동
- ✅ GitHub Actions 자동 실행
- ✅ HTTP 재시도 로직 (최대 3회)
- ✅ 환경변수 기반 로그 제어

---

## ⚙️ 설정 방법

### 1. GitHub Secrets 등록

Repository → Settings → Secrets and variables → Actions에서 다음 Secret들을 추가하세요:

| Secret 이름 | 설명 | 예시 |
|------------|------|------|
| `EMAIL_USER` | Gmail 계정 | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail 앱 비밀번호 | `abcd efgh ijkl mnop` |
| `RECIPIENTS_JSON` | 수신자 목록 (JSON) | 아래 참조 |

#### RECIPIENTS_JSON 형식

**한 줄로 작성** (공백 제거):

```json
[{"name":"홍길동","email":"hong@cau.ac.kr"},{"name":"김철수","email":"kim@cau.ac.kr"}]
```

**현재 설정**:
```json
[{"name":"권재민","email":"jack020928@naver.com"},{"name":"권재민(중앙대)","email":"jack0928@cau.ac.kr"}]
```

---

### 2. 로컬 개발 설정

로컬에서 테스트하려면:

1. **의존성 설치**:
   ```bash
   npm install
   ```

2. **수신자 설정 파일 생성**:
   ```bash
   cp src/config/recipients.example.ts src/config/recipients.ts
   ```

3. **수신자 정보 수정**:
   ```typescript
   // src/config/recipients.ts
   export const recipients: Recipient[] = [
     { name: "테스트", email: "your-test@email.com" },
   ];
   ```

4. **환경변수 설정** (`.env` 파일):
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   DEBUG=true  # 디버그 로그 활성화 (선택)
   ```

5. **실행**:
   ```bash
   npm run start
   ```

---

## 📧 수신자 수정 방법

### GitHub Actions (운영 환경)

1. Repository → Settings → Secrets and variables → Actions
2. `RECIPIENTS_JSON` Secret 클릭
3. "Update secret" 클릭
4. 새로운 JSON 값으로 업데이트:
   ```json
   [{"name":"새 수신자","email":"new@example.com"}]
   ```
5. Save

다음 실행부터 자동으로 새 수신자에게 발송됩니다.

### 로컬 개발

`src/config/recipients.ts` 파일을 직접 수정:

```typescript
export const recipients: Recipient[] = [
  { name: "홍길동 교수님", email: "hong@cau.ac.kr" },
  { name: "김철수 조교", email: "kim@cau.ac.kr" },
  { name: "학과사무실", email: "office@cau.ac.kr" },
];
```

이 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

---

## 🧪 테스트

### 전체 파이프라인 테스트
```bash
npm run test:email-pipeline
```

### 크롤러별 독립 테스트
```bash
npm run test:sw-edu          # SW교육원 크롤러만 테스트
```

### 디버그 모드
```bash
DEBUG=true npm run start     # 상세 로그 출력
```

---

## 🛠️ 기술 스택

- **Runtime**: Node.js 20.x (ESM)
- **Language**: TypeScript (NodeNext module resolution)
- **HTTP Client**: Native `fetch` API
- **HTML Parser**: Cheerio
- **Email**: Nodemailer (Gmail SMTP)
- **CI/CD**: GitHub Actions
- **Environment**: dotenv

---

## 📂 프로젝트 구조

상세한 구조는 [`ARCHITECTURE.md`](ARCHITECTURE.md)를 참조하세요.

---

## 🔮 향후 개선 사항

- Slack / Discord 알림 추가
- DB 저장 및 중복 제거 로직
- 관리자용 Web Dashboard
- 중앙대학교 포탈 공지 추가 크롤링
- 수신자별 맞춤 필터링 (선택적 구독)
- 에러 알림 (발송 실패 시 관리자에게 통지)

---

## 📝 라이선스

MIT

---

## 👤 관리자

권재민
- Email: jack020928@naver.com
- Email (CAU): jack0928@cau.ac.kr
