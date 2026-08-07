# project_state.md
## 마지막 업데이트: 단계 2 완료 시점 (CRUD API 및 Mock Data 시딩)
## 폴더/파일 구조
- `src/app/`: Next.js 라우터 (기본 생성됨)
- `src/lib/db.ts`: SQLite DB 초기화 및 테이블 생성 로직
- `src/lib/mockData.ts`: 초기 피드 구성을 위한 20개 Mock 데이터 시딩 로직
- `src/app/api/posts/route.ts`: POST(작성) 및 GET(목록 조회) API
- `src/app/api/posts/[id]/repost/route.ts`: POST(동참하기) API
- `warmth_wall.db`: SQLite DB 파일 (정상 생성 확인)

## DB 상태
- posts 테이블 (id, content, keyword, nickname, session_id, parent_id, is_mock, created_at)
  - Mock 데이터 20개 + 테스트 데이터 1개 삽입 완료

## 핵심 인터페이스 / 연결점
- 프론트엔드에서 `/api/posts` (GET/POST) 및 `/api/posts/[id]/repost` (POST) 엔드포인트 호출 예정

## 완료된 기능
- [x] 단계 1: 프로젝트 초기화 및 DB 스키마 세팅 (SQLite 대체)
- [x] 단계 2: 핵심 API(CRUD) 작성 및 Mock 데이터 시딩 완료

## 미완성/알려진 이슈
- 없음

## 다음 작업
- 단계 3: '내 벽' 화면 및 포스트잇 작성 기능 구현
