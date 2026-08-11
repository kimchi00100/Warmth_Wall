<div align="center">
  <h1>🧱 다솜마을 우리의 벽 (Warmth Wall)</h1>
  <p><strong>우리의 작은 선행이 모여 만드는 따뜻한 마을 커뮤니티</strong></p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)
  ![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
  ![Gemini AI](https://img.shields.io/badge/Gemini_AI-3.6_Flash-blue?logo=google)
</div>

<br />

## 📖 프로젝트 소개

'우리의 벽(Warmth Wall)'은 다솜마을 주민들이 서로의 선행을 공유하고 격려하며, 마을 전체의 따뜻함을 시각적으로 체감할 수 있는 **온라인 커뮤니티 플랫폼**입니다. 

자신이 실천한 작은 친절을 '포스트잇' 형태로 기록하고, 다른 이웃들의 선행에 **'나도요(공감)'** 버튼을 누르며 선한 영향력을 퍼뜨릴 수 있습니다. 특히 구글의 **Gemini AI**를 활용하여 매일매일 마을의 온기를 따뜻한 문장으로 요약해주는 브리핑 기능을 제공합니다.

---

## ✨ 핵심 기능 (Features)

### 1. 💛 내 글과 우리의 글 (SPA 기반 화면 전환)
- **우리의 벽 (Public Wall):** 마을 전체의 모든 포스트잇이 칠판에 붙은 것처럼 시각적으로 아름답게 렌더링됩니다.
- **오늘의 선행 (Private Filter):** 방대한 데이터 중에서도 '오늘', '내가 작성한' 글만 즉각적으로 필터링하여 빠릿하게 보여줍니다. (페이지 새로고침 없는 SPA 아키텍처)

### 2. 👍 나도요 (공감하기) 및 Optimistic UI
- 타인의 선행에 동참하고 싶을 때 누르는 **'나도요'** 뱃지 기능이 구현되어 있습니다.
- **사용자 경험(UX) 극대화:** 버튼 클릭 시 서버의 응답을 기다리지 않고 즉각적으로 화면의 숫자를 올리고 UI 색상을 변경하는 **Optimistic UI(낙관적 업데이트)** 기법이 적용되어 있어 매우 부드러운 반응성을 자랑합니다.

### 3. 🤖 AI 온기 브리핑 (Powered by Gemini)
- 화면 상단의 흐르는 전광판을 통해 **매일 그날의 선행 통계를 기반으로 AI가 생성한 브리핑**을 제공합니다.
- Gemini API가 "오늘 몇 건의 선행이 있었고, 어떤 카테고리(태그)가 가장 인기가 많았는지" 분석하여 다정한 사람의 말투로 요약해 줍니다.

---

## 🏗️ 기술 스택 및 아키텍처

- **Frontend:** Next.js (App Router), React Hook, Tailwind CSS
- **Backend:** Next.js API Routes (Serverless)
- **Database:** SQLite3 (`better-sqlite3`)
- **AI 연동:** Google Generative AI (Gemini `gemini-3.6-flash`)

### 📌 데이터 플로우 구조
본 프로젝트는 단일 파일(`src/app/page.tsx`) 내에서 모든 상태 관리와 화면 렌더링을 처리하는 최적화된 SPA 구조를 가집니다. 데이터베이스 파일(`data/warmth_wall.db`)과 직접 통신하는 백엔드 API가 연결되어 있어 별도의 복잡한 서버 인프라 없이도 즉각적으로 배포 및 실행이 가능합니다.

---

## 🚀 실행 방법 (Getting Started)

1. **저장소 클론 및 패키지 설치**
   ```bash
   git clone https://github.com/kimchi00100/Dasom_Warmth_Wall.git
   cd Dasom_Warmth_Wall
   npm install
   ```

2. **환경변수 설정 (API Key 세팅)**
   프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고, 발급받은 구글 Gemini API 키를 입력합니다.
   ```env
   GEMINI_API_KEY=당신의_실제_API_키를_넣으세요
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **웹 브라우저 접속**
   `http://localhost:3000` 으로 접속하여 다솜마을의 따뜻함을 직접 경험해 보세요!

---
<div align="center">
  <i>해커톤 프로젝트용으로 기획 및 제작되었습니다.</i>
</div>
