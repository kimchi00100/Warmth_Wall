# 🧱 다솜마을 우리의 벽 (Warmth Wall) - Project State

## 📁 Directory Structure
```
+---data
|       warmth_wall.db
+---docs
|       hackathon_strategy.md
|       layout-screenshot.png
|       warmth-wall-hero.png
+---scripts
|       backup.bat
|       clean.bat
|       dump.txt
|       dump2.txt
|       fix_db.js
|       generate_68_posts.js
|       migrate_bonus.js
|       move_dates.js
|       patch_admin.py
|       patch_page.py
|       patch_repost.py
|       patch_ui.py
|       patch_ui2.py
|       patch_zoom.py
|       push_readme.bat
|       restore.py
|       seed_gemini.js
|       seed_grape_field.js
|       set_event.js
|       squash_main.bat
|       sync_points.js
\---src
    +---app
    |   |   favicon.ico
    |   |   globals.css
    |   |   layout.tsx
    |   |   page.tsx
    |   +---api
    |   |   +---auth
    |   |   +---cron
    |   |   \---posts
    |   +---fonts
    |   +---public
    |   +---test
    |   \---test-layout
    +---components
    |       BriefingBanner.tsx
    |       CampaignBanner.tsx
    |       PostitCard.tsx
    |       PostitForm.tsx
    |       ScopeToggle.tsx
    |       WarmthCounter.tsx
    +---imports
    \---lib
            campaignData.ts
            db.ts
            mockData.ts
```

## 🚀 Key Features Implemented
1. **Infinite Canvas (Public Wall)**: Users can drag and zoom infinitely on the wall to see all posts.
2. **Private Filter (Today's Deeds)**: SPA-based instant filtering to only see personal posts and today's posts.
3. **Optimistic UI ("Me Too" Button)**: Instant visual feedback for liking posts without waiting for network response.
4. ~~**AI Briefing (Gemini)**: Daily automated briefing powered by Gemini Flash-Lite.~~ ❌ (미구현)
5. **Grape Field (Contribution Graph)**: Github-style contribution graph for daily deeds and score tracking.
6. **Post Deletion**: Users can delete their own posts, automatically deducting points to prevent abuse.
7. **Midnight Reset Simulation**: Built-in toggle to simulate the day rolling over to Aug 8th, clearing the canvas visually without destroying DB data.

## 💾 Database State
- Seeded with 68 realistic posts spanning the last 50 days to perfectly demonstrate the Grape Field graph.
- All post dates are aligned to August 7th or earlier, allowing the midnight reset simulation (Aug 8th) to work perfectly.

## 🔒 Deployment Strategy
- **origin-a (Private)**: Contains full commit history, `.env.local` with API keys, and `warmth_wall.db`.
- **origin-b (Public)**: Squashed into a single commit for a clean hackathon presentation, explicitly excluding `.env.local` to protect API keys.
