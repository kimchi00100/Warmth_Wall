'use client';

import { useEffect, useState, useCallback } from 'react';
import ScopeToggle from '@/components/ScopeToggle';
import PostitForm from '@/components/PostitForm';
import PostitCard from '@/components/PostitCard';
import CampaignBanner from '@/components/CampaignBanner';

export default function Home() {
  const [scope, setScope] = useState<'today' | 'all'>('today');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const fetchPosts = useCallback(async (currentScope: 'today' | 'all') => {
    setLoading(true);
    let id = localStorage.getItem('user_id');
    if (!id) {
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/posts?scope=${currentScope}&user_id=${id}`);
      const data = await res.json();
      setPosts(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setUserId(localStorage.getItem('user_id'));
    fetchPosts(scope);
  }, [scope, fetchPosts]);

  const handlePostSubmit = async (data: any) => {
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchPosts(scope);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignup = async () => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user_id', data.user_id);
      setUserId(data.user_id);
      fetchPosts(scope);
    } else {
      alert(data.error);
    }
  };

  const handleLogin = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user_id', data.user_id);
      setUserId(data.user_id);
      fetchPosts(scope);
    } else {
      alert(data.error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    setUserId(null);
    setPosts([]);
  };

  return (
    <div>
      <div>
        {userId ? (
          <div>
            <span>로그인 됨</span>
            <button onClick={handleLogout}>로그아웃</button>
          </div>
        ) : (
          <div>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>로그인</button>
            <button onClick={handleSignup}>회원가입</button>
          </div>
        )}
      </div>

      <main className="max-w-md mx-auto p-4 min-h-screen bg-gray-50 text-gray-900">
        <header className="py-8 relative">
          <h1 className="text-3xl font-bold text-center text-orange-500">내 벽</h1>
          <p className="text-center text-gray-500 mt-2 text-sm">내가 실천한 따뜻한 마음들</p>
          <a href="/public" className="absolute right-0 top-10 text-orange-500 font-medium hover:underline text-sm">
            우리의 벽 →
          </a>
        </header>
        
        <CampaignBanner />
        <PostitForm onSubmit={handlePostSubmit} />
        
        <ScopeToggle scope={scope} onChange={setScope} />
        
        <div className="space-y-4 pb-12">
          {loading ? (
            <p className="text-center text-gray-400 py-10">불러오는 중...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-400 py-10 bg-white rounded-xl border border-dashed border-gray-300">아직 작성된 선행이 없습니다.</p>
          ) : (
            posts.map(post => (
              <PostitCard key={post.id} post={post} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
