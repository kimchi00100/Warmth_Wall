import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  // 1. Get the least used category over the last 7 days
  try {
    const rows = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM posts 
      WHERE created_at >= date('now', '-7 days')
        AND category IS NOT NULL
      GROUP BY category
      ORDER BY count ASC
    `).all() as {category: string, count: number}[];

    // Default categories if DB is empty
    const allCategories = ['도움', '배려', '인사', '나눔', '환경', '기타'];
    let targetCategory = '인사'; // fallback

    // 2. Query Gemini API to pick the least used tag
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const statsText = allCategories.map(cat => {
          const row = rows.find(r => r.category === cat);
          return `${cat}: ${row ? row.count : 0}회`;
        }).join(', ');
        
        const prompt = `다음은 지난 일주일간 다솜마을 앱의 선행 카테고리별 사용 횟수입니다: [${statsText}]. 이 중에서 사용 횟수가 0회인 카테고리는 무조건 제외하고, 1회 이상 사용된 카테고리들 중에서 가장 적게 사용된 카테고리를 하나만 선택해서 2글자로 대답해주세요 (예: 인사, 환경, 도움, 배려, 나눔, 기타). 부연 설명 없이 딱 단어만 대답하세요.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiAnswer = data.candidates[0].content.parts[0].text.trim();
            if (allCategories.includes(aiAnswer)) {
              targetCategory = aiAnswer;
            }
          }
        } else {
          const errText = await response.text();
          console.error('Gemini API Error Response:', response.status, errText);
        }
      } catch (e) {
        console.error('Gemini API Fetch Error:', e);
      }
    } else {
      console.warn('GEMINI_API_KEY is not set. Using fallback logic.');
    }

    // Smart Fallback if Gemini failed to pick a valid category (targetCategory is still default '인사')
    // We calculate the least used category from the DB directly (must be > 0 uses)
    if (targetCategory === '인사') {
      const validRows = rows.filter(r => r.count > 0);
      if (validRows.length > 0) {
        // Since rows are ordered by count ASC, the first one has the lowest > 0 count
        targetCategory = validRows[0].category;
      }
    }

    db.prepare(`
      INSERT INTO config (key, value) 
      VALUES ('current_event', ?) 
      ON CONFLICT(key) DO UPDATE SET value = ?
    `).run(targetCategory, targetCategory);

    // Reset all users' bonus status for the new event
    db.prepare(`UPDATE users SET has_received_event_bonus = 0`).run();

    return NextResponse.json({ 
      success: true, 
      new_event_category: targetCategory, 
      message: `Event updated to [${targetCategory}] based on past 7 days usage.` 
    }, { status: 200 });
  } catch (error) {
    console.error('Error running event cron:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
