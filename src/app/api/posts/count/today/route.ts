import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const row = db.prepare("SELECT COUNT(*) as c FROM posts WHERE created_at >= date('now', 'start of day')").get() as { c: number };
    return NextResponse.json({ count: row.c });
  } catch (error) {
    console.error('Error getting count:', error);
    return NextResponse.json({ error: 'Failed to get count' }, { status: 500 });
  }
}
