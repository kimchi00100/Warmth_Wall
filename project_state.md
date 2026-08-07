# project_state.md
## 마지막 업데이트: 단계 4 완료 시점 ('우리의 벽' 및 총량 카운터 구현)
## 폴더/파일 구조
- `src/app/page.tsx`: '내 벽' 메인 페이지 (UI 연동)
- `src/app/public/page.tsx`: '우리의 벽' (공개 피드) 페이지
- `src/components/ScopeToggle.tsx`: 오늘/전체 전환 토글 UI
- `src/components/PostitForm.tsx`: 포스트잇 작성 폼 UI
- `src/components/PostitCard.tsx`: 포스트잇 카드 UI
- `src/components/WarmthCounter.tsx`: 상단 총량 카운터 UI
- `src/lib/db.ts`: SQLite DB 로직
- `src/lib/mockData.ts`: 20개 Mock 데이터 시딩
- `src/app/api/posts/route.ts`: POST(작성) 및 GET(목록 조회) API
- `src/app/api/posts/[id]/repost/route.ts`: POST(동참하기) API
- `src/app/api/posts/count/today/route.ts`: 오늘 총량 반환 API
- `warmth_wall.db`: SQLite DB 파일

## DB 상태
- posts 테이블 (id, content, keyword, nickname, session_id, parent_id, is_mock, created_at)
  - 데이터 정상 적재 및 호출 검증 완료

## 완료된 기능
- [x] 단계 1: 프로젝트 초기화 및 DB 스키마 세팅
- [x] 단계 2: 핵심 API(CRUD) 작성 및 Mock 데이터 시딩 완료
- [x] 단계 3: '내 벽' 화면 및 포스트잇 작성 기능 구현
- [x] 단계 4: '우리의 벽' (공개 피드) 및 상단 총량 카운터 구현

## 미완성/알려진 이슈
- 없음

## 다음 작업
- 단계 5: 키워드 기반 필터링('키워드 태그' 클라우드) 구현
