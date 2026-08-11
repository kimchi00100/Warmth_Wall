# 프로젝트 현황 및 구조 (project_state.md)

## 최신 업데이트 내역
- 테스트용 쓰레기 파일(`test-*.js`, `replace_ui.js` 등) 일괄 삭제 완료
- 사용되지 않는 더미/중복 디렉토리(`src/components`, `src/app/test`, `src/app/public` 등) 완전 삭제 완료
- SPA 아키텍처에 맞춘 단일 `page.tsx` 중심의 파일 구조 확립
- 백엔드 DB 마이그레이션 및 경로 이동 완료 (`data` 폴더)

## 현재 폴더 및 핵심 파일 구조도 (Tree)

```text
📦 _Dasom_Hackathon (최상단 루트)
 ┣ 📂 data
 ┃ ┗ 📜 warmth_wall.db         # 사용자의 글과 태그가 100% 영구 저장되는 실제 SQLite DB
 ┃
 ┣ 📂 docs
 ┃ ┣ 📜 hackathon_strategy.md  # 해커톤 기획서 및 발표 전략
 ┃ ┗ 🖼️ layout-screenshot.png  # 참고용 UI 스크린샷
 ┃
 ┣ 📂 src                      # 💻 실제 코드가 들어있는 핵심 폴더
 ┃ ┣ 📂 app
 ┃ ┃ ┣ 📂 api                  # ⚙️ 백엔드 (서버 API 라우트)
 ┃ ┃ ┃ ┣ 📂 auth
 ┃ ┃ ┃ ┃ ┗ 📜 route.ts         # 임시 로그인/인증 처리
 ┃ ┃ ┃ ┣ 📂 cron               # 주기적 반복 작업
 ┃ ┃ ┃ ┃ ┗ 📜 route.ts
 ┃ ┃ ┃ ┗ 📂 posts
 ┃ ┃ ┃   ┣ 📂 [id]/repost
 ┃ ┃ ┃   ┃ ┗ 📜 route.ts       # 특정 글에 '나도요' 눌렀을 때의 DB 처리 로직
 ┃ ┃ ┃   ┣ 📂 briefing
 ┃ ┃ ┃   ┃ ┗ 📜 route.ts       # 상단 전광판의 AI 브리핑 텍스트 처리 API
 ┃ ┃ ┃   ┣ 📂 count/today
 ┃ ┃ ┃   ┃ ┗ 📜 route.ts       # 오늘의 선행 달성률(게이지바) 반환 API
 ┃ ┃ ┃   ┗ 📜 route.ts         # 포스트잇 목록 조회(GET) 및 새 글 작성(POST)
 ┃ ┃ ┃
 ┃ ┃ ┣ 📜 page.tsx             # 🎨 프론트엔드 핵심 (우리의 벽, 오늘의 선행 화면과 UI 로직이 모두 통합된 SPA 뷰포트)
 ┃ ┃ ┣ 📜 layout.tsx           # 전체 앱의 뼈대 레이아웃과 HTML 메타데이터
 ┃ ┃ ┗ 📜 globals.css          # 기본 디자인 및 폰트 스타일
 ┃ ┃
 ┃ ┗ 📂 lib
 ┃   ┣ 📜 db.ts                # SQLite DB 연결 및 스키마 구조 정의 파일
 ┃   ┣ 📜 campaignData.ts      # 특정 키워드(캠페인) 데이터를 보관하는 곳
 ┃   ┗ 📜 mockData.ts          # 개발 초기에 쓰던 임시 더미 데이터 모음
 ┃
 ┣ 📜 project_state.md         # 📝 현재 보고 계신 이 파일 (프로젝트 전체 현황도)
 ┣ 📜 package.json             # 프로젝트에 설치된 필수 라이브러리 명세서
 ┣ 📜 next.config.mjs          # Next.js 프레임워크 필수 설정 파일
 ┗ 📜 ... 기타 앱 구동을 위한 필수 설정 파일들 (.env.local, tsconfig.json, tailwind.config.ts 등)
```

## 현재 주요 로직 상태
- **화면 렌더링 (SPA):** 별도의 라우팅(페이지 이동) 없이 `src/app/page.tsx` 한 곳에서 탭 이동 및 데이터 렌더링이 즉각적으로 처리됩니다.
- **나도요 동기화:** 내가 쓴 글(`isOwn`)이라도 타인이 누른 나도요 숫자가 '우리의 벽' 화면에 즉각 렌더링되도록 수정되어 있습니다.
- **날짜 동기화:** 백엔드 DB에 저장된 시간(`created_at`)을 기준으로 '오늘의 선행'에 뜨는 내 글을 100% 정확히 필터링합니다.
