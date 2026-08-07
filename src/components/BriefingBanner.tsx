'use client';

import { useEffect, useState } from 'react';

export default function BriefingBanner() {
  const [briefing, setBriefing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/posts/briefing')
      .then(r => r.json())
      .then(d => setBriefing(d.briefing))
      .catch(console.error);
  }, []);

  if (!briefing) return null;

  return (
    <div className="bg-orange-500 text-white p-3 text-sm text-center font-medium shadow-md">
      ✨ AI 브리핑: {briefing}
    </div>
  );
}
