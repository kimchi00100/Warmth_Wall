import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // 1. Get today's total posts
    const row = db.prepare("SELECT COUNT(*) as c FROM posts WHERE created_at >= date('now', 'start of day')").get() as { c: number };
    const totalToday = row.c;

    // 2. Get the most frequent keyword today
    const topKeywordRow = db.prepare(`
      SELECT keyword, COUNT(*) as k_count 
      FROM posts 
      WHERE created_at >= date('now', 'start of day') AND keyword IS NOT NULL
      GROUP BY keyword 
      ORDER BY k_count DESC 
      LIMIT 1
    `).get() as { keyword: string, k_count: number } | undefined;

    const topKeyword = topKeywordRow?.keyword || '따뜻한 마음';

    // 3. AI Briefing logic
    let aiBriefing = null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `오늘 다솜마을에는 총 ${totalToday}건의 선행이 있었고, 가장 많이 언급된 키워드는 '${topKeyword}'입니다. 이 데이터를 바탕으로 주민들에게 1~2문장의 따뜻한 격려 브리핑을 평어체(해요체)로 작성해주세요.`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates[0].content.parts[0].text) {
            aiBriefing = data.candidates[0].content.parts[0].text.trim();
          }
        } else {
          console.error('Gemini API Error Response:', await response.text());
        }
      } catch (e) {
        console.error('Gemini API Fetch Error:', e);
      }
    }

    // Fallback if AI fails or no key
    const fallbackMessage = `오늘 다솜마을에는 ${totalToday}건의 따뜻한 선행이 모였어요! 주로 '${topKeyword}' 관련 선행이 많았네요.`;

    return NextResponse.json({ briefing: aiBriefing || fallbackMessage });
  } catch (error) {
    console.error('Error generating AI briefing:', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}
