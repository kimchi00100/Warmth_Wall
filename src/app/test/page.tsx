'use client';

import { useState } from 'react';

export default function TestPage() {
  const [output, setOutput] = useState<string>('');
  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState('');

  const getSessionId = () => {
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = 'test_sess_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('session_id', sid);
    }
    return sid;
  };

  const handleCreatePost = async () => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content || 'Test Content', session_id: getSessionId() })
      });
      const data = await res.json();
      setOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setOutput(err.toString());
    }
  };

  const handleGetPosts = async (scope: string) => {
    try {
      const res = await fetch(`/api/posts?scope=${scope}&session_id=${getSessionId()}`);
      const data = await res.json();
      setOutput(`Scope: ${scope}\nCount: ${data.length}\nData: ` + JSON.stringify(data, null, 2));
    } catch (err: any) {
      setOutput(err.toString());
    }
  };

  const handleRepost = async () => {
    if (!parentId) return setOutput('Parent ID is required for repost');
    try {
      const res = await fetch(`/api/posts/${parentId}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: getSessionId() })
      });
      const data = await res.json();
      
      // Auto-fetch scope=today to verify it's in '내 벽'
      const getRes = await fetch(`/api/posts?scope=today&session_id=${getSessionId()}`);
      const getTodayData = await getRes.json();
      
      setOutput(`[Repost Result]\n${JSON.stringify(data, null, 2)}\n\n[Auto-Fetch scope=today]\nCount: ${getTodayData.length}\nData: ${JSON.stringify(getTodayData, null, 2)}`);
    } catch (err: any) {
      setOutput(err.toString());
    }
  };

  const handleBriefing = async () => {
    try {
      const res = await fetch('/api/posts/briefing');
      const data = await res.json();
      setOutput(`[AI Briefing Response]\n${JSON.stringify(data, null, 2)}`);
    } catch (err: any) {
      setOutput(err.toString());
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>Manual API Verification Test Page</h1>
      <div style={{ marginBottom: 20 }}>
        <h3>1. Create Post</h3>
        <input type="text" value={content} onChange={e => setContent(e.target.value)} placeholder="Content" />
        <button id="btn-create" onClick={handleCreatePost}>Create POST</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>2. Get Posts</h3>
        <button id="btn-get-today" onClick={() => handleGetPosts('today')}>GET scope=today</button>
        <button id="btn-get-all" onClick={() => handleGetPosts('all')}>GET scope=all</button>
        <button id="btn-get-public" onClick={() => handleGetPosts('public')}>GET scope=public</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>3. Repost</h3>
        <input type="text" value={parentId} onChange={e => setParentId(e.target.value)} placeholder="Parent ID" id="input-parent-id" />
        <button id="btn-repost" onClick={handleRepost}>Repost & Fetch Today</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>4. AI Briefing</h3>
        <button id="btn-briefing" onClick={handleBriefing}>Get Briefing</button>
      </div>

      <h3>Output</h3>
      <pre id="output" style={{ background: '#eee', padding: 10, border: '1px solid #ccc', minHeight: 100, whiteSpace: 'pre-wrap' }}>
        {output}
      </pre>
    </div>
  );
}
