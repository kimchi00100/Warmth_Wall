# 프로젝트 현황 및 구조 (project_state.md)

## 최신 업데이트 내역
- 테스트용 쓰레기 파일(`test-*.js`, `replace_ui.js` 등) 일괄 삭제 완료
- 사용되지 않는 더미/중복 디렉토리(`src/components`, `src/app/test`, `src/app/public` 등) 완전 삭제 완료
- SPA 아키텍처에 맞춘 단일 `page.tsx` 중심의 파일 구조 확립
- 백엔드 DB 마이그레이션 완료 (하드코딩 가짜 데이터를 실존하는 DB 데이터로 변환)

## 현재 폴더 및 핵심 파일 구조

### 🎨 프론트엔드 (UI & 화면)
- `src/app/page.tsx` : **가장 핵심이 되는 파일입니다.** '우리의 벽', '오늘의 선행', '포스트잇 작성 폼', '나도요 뱃지' 등 프론트엔드의 **모든 UI 컴포넌트와 상태(State) 관리 로직이 이 파일 하나에 전부 통합**되어 있는 SPA(Single Page Application) 구조입니다.
- `src/app/layout.tsx` : 앱 전체의 기본 뼈대 레이아웃과 HTML 메타데이터를 관리합니다.
- `src/app/globals.css` : 전역 스타일 폰트 및 초기화 파일입니다.

### ⚙️ 백엔드 (API 라우트)
- `src/app/api/posts/route.ts` : 전체 포스트잇 조회(GET) 및 새 글 작성(POST) API
- `src/app/api/posts/[id]/repost/route.ts` : 특정 글에 '나도요'를 눌렀을 때 처리하는 API
- `src/app/api/posts/count/today/route.ts` : 오늘의 선행 달성률 게이지를 위한 갯수 반환 API
- `src/app/api/posts/briefing/route.ts` : 상단 전광판의 AI 브리핑 텍스트를 반환하는 API
- `src/app/api/auth/login/route.ts` & `signup/route.ts` : 임시 인증(로그인/회원가입) 처리 API

### 🗄️ 데이터베이스 및 유틸리티
- `warmth_wall.db` : 포스트잇 내용과 태그가 모두 영구 저장되는 진짜 SQLite 데이터베이스 파일
- `src/lib/db.ts` : SQLite DB를 연결하고 스키마(테이블) 구조를 정의하는 파일
- `src/lib/campaignData.ts` : 특정 키워드 캠페인 데이터를 저장해두는 곳
- `src/lib/mockData.ts` : 개발 초기에 사용하던 임시 목업 데이터 모음

## 현재 주요 로직 상태
- **화면 렌더링:** 별도의 라우팅 이동 없이 `page.tsx` 하나에서 모든 탭 이동과 화면 렌더링이 즉각적으로 처리됩니다.
- **나도요 동기화:** 내가 쓴 글(`isOwn`)이라도 타인이 누른 나도요 숫자가 화면에 즉각 렌더링되도록 완벽히 수정되었습니다.
- **날짜 동기화:** 백엔드 DB에 저장된 시간(`created_at`)을 기준으로 '오늘의 선행'에 뜨는 글을 100% 정확히 필터링합니다.
