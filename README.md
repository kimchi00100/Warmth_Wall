# 🧱 다솜마을 우리의 벽 (Warmth Wall)

## 프로젝트 소개
'우리의 벽'은 다솜마을 주민들이 서로의 선행을 공유하고 격려하며, 마을 전체의 따뜻함을 시각적으로 체감할 수 있는 커뮤니티 플랫폼입니다. 자신이 실천한 작은 친절을 '내 벽(포스트잇)'에 기록하고, 다른 이웃들의 선행에 동참(Repost)하며 선한 영향력을 퍼뜨릴 수 있습니다.

## 주요 기능
- **내 벽 (Private Wall):** 개인 세션 기반으로 오늘 실천한 선행을 기록하고 확인합니다.
- **우리의 벽 (Public Wall):** 마을 전체의 모든 포스트잇이 실시간으로 집계되어 노출됩니다. 누구나 타인의 선행에 '동참하기(Repost)' 버튼을 눌러 공감할 수 있습니다.
- **AI 온기 브리핑:** 그날 모인 따뜻한 행동들의 키워드를 분석하여, Gemini AI가 다정한 문체로 다솜마을 전체를 향한 격려 메시지를 매일 전달해 줍니다.
- **AI 넛지 캠페인:** 특정 기간 집중 실천할 선행 키워드(예: '인사')가 담긴 글을 작성하면 온기가 2배로 적립되는 효과를 부여하여 자발적인 참여를 독려합니다.

## 사용된 기술 (Tech Stack)
- **프론트엔드:** Next.js 14, React, Tailwind CSS
- **백엔드/API:** Next.js API Routes (Serverless)
- **데이터베이스:** SQLite (`better-sqlite3`)
- **AI 연동:** Google Gemini API (`gemini-3.6-flash`)

## 실행 방법
1. 저장소 클론 및 패키지 설치
   ```bash
   git clone https://github.com/kimchi00100/Warmth_Wall.git
   cd Warmth_Wall
   npm install
   ```
2. 환경변수 설정
   프로젝트 루트에 `.env.local` 파일을 생성하고 발급받은 Gemini API 키를 입력합니다.
   ```env
   GEMINI_API_KEY=당신의_API_키
   ```
3. 개발 서버 실행
   ```bash
   npm run dev
   ```
4. 브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

---
*해커톤 프로젝트용으로 제작되었습니다.*
