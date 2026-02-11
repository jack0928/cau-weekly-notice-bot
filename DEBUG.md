# 디버그 가이드

## 문제 발생 시 캐시 정리

ts-node와 TypeScript 캐시 문제로 인해 코드 변경사항이 반영되지 않을 수 있습니다.

### 캐시 정리 방법

```bash
npm run clean:cache
```

또는 수동으로:

```bash
rm -rf dist .ts-node node_modules/.cache
```

### 캐시 정리가 필요한 경우

- 코드 수정 후 변경사항이 반영되지 않을 때
- 이전 버전의 함수가 계속 실행될 때
- 타입 에러가 실제 코드와 맞지 않을 때

## 디버그 로그 활성화

현재 다음 파일들에 디버그 로그가 포함되어 있습니다:

### 1. `src/core/filters/dateFilter.ts`
- 7일 필터 기준 시간 출력
- 각 공지의 통과/거부 여부 상세 로그
- 필터 전/후 카운트

### 2. `src/integrations/email/templates/cauNoticeTemplate.ts`
- 입력 공지 총 개수
- source별 분류 (cau_dept vs cau_sw_edu)
- 정렬 후 개수
- 게시판별 그룹화 결과
- 알 수 없는 URL 경고

### 3. `scripts/test-email-pipeline.ts`
- 파이프라인에서 이메일로 전달되는 데이터 검증
- source별 최종 카운트

## 테스트 실행 순서

```bash
# 1. 캐시 정리
npm run clean:cache

# 2. 크롤러 테스트
npm run test:sw-edu

# 3. 파이프라인 테스트
npm run test:pipeline

# 4. 이메일 템플릿 테스트
npm run test:email-template

# 5. 전체 이메일 파이프라인 테스트
npm run test:email-pipeline
```

## 일반적인 문제들

### 문제: 이메일에 공지 개수가 적게 나옴

**확인 사항:**
1. `DATE FILTER DEBUG` 로그에서 필터 통과/거부 확인
2. `EMAIL BUILD DEBUG` 로그에서 source별 분류 확인
3. `DEPT GROUPED RESULT` 로그에서 게시판별 분류 확인

**원인:**
- 날짜 파싱 문제 (UTC vs KST)
- source 값이 잘못 설정됨
- boardIdResolver가 URL을 인식하지 못함

### 문제: SW Edu 공지가 포함되지 않음

**확인 사항:**
1. `SOURCES:` 로그에서 `cau_sw_edu` 카운트 확인
2. crawler 로그에서 실제 크롤링 성공 여부 확인

### 문제: 게시판별 분류가 잘못됨

**확인 사항:**
1. `[WARN] Unknown board for URL:` 경고 확인
2. URL에 `bbs05`, `bbs07`, `bbs06` 포함 여부 확인

## 로그 출력 예시

정상적인 경우:

```
=== DATE FILTER DEBUG ===
NOW: 2026-02-11T...
THRESHOLD: 2026-02-04T...
DAYS: 7
  [PASS] cau_dept | 2026-02-10 | 학부 공지...
  [PASS] cau_sw_edu | 2026-02-09 | SW교육원...
FILTER RESULT: 10 / 50 passed

=== PIPELINE → EMAIL ===
FINAL COUNT: 10
SOURCES: { cau_dept: 7, cau_sw_edu: 3 }

=== EMAIL BUILD DEBUG ===
TOTAL INPUT: 10
BY SOURCE: { cau_dept: 7, cau_sw_edu: 3 }
DEPT NOTICES: 7
SW EDU NOTICES: 3
DEPT AFTER SORT: 7
DEPT GROUPED RESULT: { sub0501: 4, sub0502: 2, sub0506: 1 }
SW EDU AFTER SORT: 3
```
