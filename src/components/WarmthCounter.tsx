'use client';

import { useEffect, useState } from 'react';

export default function WarmthCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/posts/count/today')
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(console.error);
  }, []);

  if (count === null) return null;

  return (
    <div className="bg-orange-100 text-orange-800 p-4 rounded-xl shadow-sm text-center font-bold mb-6 border border-orange-200">
      오늘 우리가 쌓은 선행: {count}개
    </div>
  );
}
