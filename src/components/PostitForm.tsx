'use client';

import { useState } from 'react';
import { campaignData } from '@/lib/campaignData';

export default function PostitForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [showEffect, setShowEffect] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    let finalContent = content;
    if (content.includes(campaignData.targetKeyword)) {
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 2000);
      finalContent = content + " (✨캠페인 참여로 온기 2배!)";
    }
    
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('session_id', sessionId);
    }

    onSubmit({ content: finalContent, nickname, session_id: sessionId });
    setContent('');
    setNickname('');
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white p-4 rounded-xl shadow-sm border ${showEffect ? 'border-orange-500 bg-orange-50 transition-colors' : 'border-gray-200'} mb-8`}>
      {showEffect && <div className="text-orange-500 text-sm font-bold mb-2 transition-all">✨ 따뜻함이 2배로 적립되었습니다! ✨</div>}
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
