import os

path = "C:/Users/xjwoz/OneDrive/Desktop/_Dasom_Hackathon/src/app/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update DiaryTab admin buttons
buttons_target = """          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { TODAY = '2026-08-08'; alert('자정으로 강제 초기화되었습니다.'); window.location.reload(); }} style={{ marginTop: 2, flexShrink: 0, padding: '6px 13px', background: 'rgba(255,100,100,0.1)', border: '1.5px solid rgba(255,100,100,0.3)', borderRadius: '4px', cursor: 'pointer', fontFamily: BODY, fontSize: '11px', fontWeight: 700, color: '#FF9DBB', transition: 'all 0.12s ease' }}>
              자정초기화
            </button>
          <button onClick={onLogout} style={{ marginTop: 2, flexShrink: 0, padding: '6px 13px', background: 'transparent', border: '1.5px solid rgba(250,250,250,0.18)', borderRadius: '4px', cursor: 'pointer', fontFamily: BODY, fontSize: '11px', fontWeight: 700, color: 'rgba(250,250,250,0.38)', letterSpacing: '0.2px', transition: 'all 0.12s ease' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(250,250,250,0.45)'; el.style.color = WHITE }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(250,250,250,0.18)'; el.style.color = 'rgba(250,250,250,0.38)' }}>
            로그아웃
          </button>
          </div>"""

buttons_repl = """          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { TODAY = '2026-08-08'; alert('자정으로 강제 초기화되었습니다.'); window.location.reload(); }} style={{ marginTop: 2, flexShrink: 0, padding: '6px 13px', background: 'rgba(255,100,100,0.1)', border: '1.5px solid rgba(255,100,100,0.3)', borderRadius: '4px', cursor: 'pointer', fontFamily: BODY, fontSize: '11px', fontWeight: 700, color: '#FF9DBB', transition: 'all 0.12s ease' }}>
              자정초기화
            </button>
            <button onClick={async () => { 
                alert('제미나이가 통계를 분석하여 새로운 이벤트를 선정 중입니다... 잠시만 기다려주세요.'); 
                const res = await fetch('/api/cron/event');
                if (res.ok) {
                  alert('11:40 이벤트 갱신 완료! 화면이 새로고침됩니다.');
                  window.location.reload();
                }
              }} style={{ marginTop: 2, flexShrink: 0, padding: '6px 13px', background: 'rgba(255,226,52,0.1)', border: '1.5px solid rgba(255,226,52,0.3)', borderRadius: '4px', cursor: 'pointer', fontFamily: BODY, fontSize: '11px', fontWeight: 700, color: '#FFE234', transition: 'all 0.12s ease' }}>
              11:40 호출
            </button>
          <button onClick={onLogout} style={{ marginTop: 2, flexShrink: 0, padding: '6px 13px', background: 'transparent', border: '1.5px solid rgba(250,250,250,0.18)', borderRadius: '4px', cursor: 'pointer', fontFamily: BODY, fontSize: '11px', fontWeight: 700, color: 'rgba(250,250,250,0.38)', letterSpacing: '0.2px', transition: 'all 0.12s ease' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(250,250,250,0.45)'; el.style.color = WHITE }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(250,250,250,0.18)'; el.style.color = 'rgba(250,250,250,0.38)' }}>
            로그아웃
          </button>
          </div>"""
content = content.replace(buttons_target, buttons_repl)

# 2. Update handleNadoro fetchPosts() -> fetchPosts(); fetchProfile();
content = content.replace("if (res.ok) fetchPosts()", "if (res.ok) { fetchPosts(); fetchProfile(); }")

# 3. Update handleAdd fetchPosts() -> fetchPosts(); fetchProfile();
add_target = """        setPosts(prev => [newPost, ...prev])
        fetchPosts()"""
add_repl = """        setPosts(prev => [newPost, ...prev])
        fetchPosts()
        fetchProfile()"""
content = content.replace(add_target, add_repl)


with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch admin successful!")
