'use client';

import { useState } from 'react';
import { campaignData } from '@/lib/campaignData';

export default function PostitForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    onSubmit({ content: content, nickname, user_id: userId });
    setContent('');
    setNickname('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
      <textarea
        className="w-full p-3 border border-gray-200 rounded-lg mb-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
        rows={3}
        placeholder="당신의 작은 선행을 공유해주세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <input 
          type="text"
          className="flex-1 border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 text-gray-800"
          placeholder="닉네임 (선택)"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <button type="submit" className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors whitespace-nowrap">
          붙이기
        </button>
      </div>
    </form>
  );
}
