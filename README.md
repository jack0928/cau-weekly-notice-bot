## 📬 CAU Weekly Notice Bot

중앙대학교 소프트웨어학부 및 SW교육원 공지를 자동으로 수집하여
최근 7일간의 신규 공지를 이메일로 발송하는 자동화 봇입니다.

서버 없이 GitHub Actions 기반 Cron 스케줄링으로 운영됩니다.

---

## 🎯 프로젝트 목적
- 학부 / SW교육원 공지를 매번 수동으로 확인하는 번거로움 해결
- 최근 공지만 필터링하여 주간 리포트 형태로 제공
- 서버 인프라 없이 자동화 시스템 구축

---

🏗️ 아키텍처 구조
GitHub Actions (매주 금요일 09:00 KST)
        ↓
crawlAllCauBoards()
        ↓
merge notices
        ↓
filterRecentNotices(7일)
        ↓
buildCauNoticeEmail()
        ↓
sendMail (Gmail SMTP)


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

### ✅ Gmail SMTP 발송
- nodemailer 기반
- App Password 사용
- 환경변수 기반 보안 설정

---

### ✅ GitHub Actions 자동 실행
- 매주 금요일 오전 9시 (KST)
- 수동 실행(workflow_dispatch) 지원
- dist 직접 실행 대신 npm run start 사용

```yaml
cron: "0 0 * * 5"  # 09:00 KST

```

---

## 📊 현재 상태 (MVP 완료)
- ✅ 다중 게시판 병합
- ✅ 날짜 필터 정확 적용
- ✅ HTML + text 이메일
- ✅ Gmail SMTP 연동
- ✅ GitHub Actions 자동 실행
- ✅ 수동 실행 가능

---

## 🔮 향후 개선 사항
- 수신자 리스트 분리
- Slack / Discord 알림 추가
- DB 저장 및 중복 제거 로직
- 관리자용 Web Dashboard
- 중앙대학교 포탈 공지 추가 크롤링


