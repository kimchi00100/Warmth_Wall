'use client';

import { useEffect, useState, useCallback } from 'react';
import PostitCard from '@/components/PostitCard';
import WarmthCounter from '@/components/WarmthCounter';
import Link from 'next/link';

export default function PublicWall() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublicPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts?scope=public');
      const data = await res.json();
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPublicPosts();
  }, [fetchPublicPosts]);

  const handleRepost = async (id: string) => {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      await fetch(`/api/posts/${id}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      alert('이 선행에 동참했습니다! 내 벽에 추가되었습니다.');
      // Refresh count if it changes (would need cross-component state, but reloading public posts is enough for now)
      fetchPublicPosts();
    } catch (e) {
      console.error(e);
      alert('동참하기에 실패했습니다.');
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 min-h-screen bg-gray-50 text-gray-900">
      <header className="py-8 relative">
        <Link href="/" className="absolute left-0 top-10 text-orange-500 font-medium hover:underline text-sm">
          ← 내 벽
        </Link>
        <h1 className="text-3xl font-bold text-center text-orange-500">우리의 벽</h1>
        <p className="text-center text-gray-500 mt-2 text-sm">모두가 함께 만든 따뜻함</p>
      </header>
      
      <WarmthCounter />
      
      <div className="space-y-4 pb-12">
        {loading ? (
          <p className="text-center text-gray-400 py-10">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 py-10 bg-white rounded-xl border border-dashed border-gray-300">아직 작성된 선행이 없습니다.</p>
        ) : (
          posts.filter(p => !p.parent_id).map(post => {
            const repostCount = posts.filter(p => p.parent_id === post.id).length;
            return <PostitCard key={post.id} post={post} onRepost={handleRepost} repostCount={repostCount} />;
          })
        )}
      </div>
    </main>
  );
}
