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

    // 3. Fallback AI logic (simulated since we don't have an API key)
    const fallbackMessage = `오늘 다솜마을에는 ${totalToday}건의 따뜻한 선행이 모였어요! 주로 '${topKeyword}' 관련 선행이 많았네요.`;

    return NextResponse.json({ briefing: fallbackMessage });
  } catch (error) {
    console.error('Error generating AI briefing:', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
  }
}
