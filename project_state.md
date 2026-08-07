# project_state.md
## 마지막 업데이트: 단계 1 완료 시점 (Next.js 및 SQLite DB 세팅)
## 폴더/파일 구조
- `src/app/`: Next.js 라우터 (기본 생성됨)
- `src/lib/db.ts`: SQLite DB 초기화 및 테이블 생성 로직
- `warmth_wall.db`: SQLite DB 파일 (런타임 생성 예정)

## DB 상태
- posts 테이블 (id, content, keyword, nickname, session_id, parent_id, is_mock, created_at)
  - `parent_id`에 self-reference FK 제약조건 적용됨.

## 핵심 인터페이스 / 연결점
- `src/lib/db.ts` 내의 `db` 객체를 import 하여 백엔드 API에서 사용

## 완료된 기능
- [x] 단계 1: 프로젝트 초기화 및 DB 스키마 세팅 (Supabase 대신 로컬 SQLite로 대체)

## 미완성/알려진 이슈
- 없음

## 다음 작업
- 단계 2: 핵심 API(CRUD) 작성 및 Mock 데이터 시딩
