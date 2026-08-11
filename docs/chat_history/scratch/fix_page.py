import re

def fix_page():
    with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. fetchPosts mapping
    old_fetch = """  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map((p: any) => ({
          ...p,
          isOwn: p.author === currentUser,
          timeAgo: p.date === TODAY ? '오늘' : p.date,
        }))
        setPosts(mapped)
      }
    } catch (e) { console.error(e) }
  }"""
    
    new_fetch = """  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts?scope=all')
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map((p: any) => {
          // Parse created_at string (e.g. "2026-08-07 15:30:00")
          const dateStr = p.created_at ? p.created_at.split(' ')[0] : TODAY;
          // Calculate nadoro (very basic mock logic for now, in a real app this would be a separate table/query)
          // Since we don't have a robust nadoro count in DB yet, we'll initialize to 0 or use a mock
          
          return {
            id: p.id,
            content: p.content,
            color: p.color || '#FFE234',
            author: p.nickname || p.user_id,
            timeAgo: dateStr === TODAY ? '오늘' : dateStr,
            nadoroCount: 0, 
            rotation: (Math.random() - 0.5) * 4,
            didNadoro: false,
            category: p.category || '기타',
            date: dateStr,
            isOwn: p.user_id === currentUser,
            photo: p.photo
          }
        })
        setPosts(mapped)
      }
    } catch (e) { console.error(e) }
  }"""
    code = code.replace(old_fetch, new_fetch)

    # 2. useScatteredLayout jitter fix
    old_scatter = """      const col = i % S_NUM_COLS
      const row = Math.floor(i / S_NUM_COLS)"""
      
    new_scatter = """      // Scatter columns pseudo-randomly based on ID to avoid left-leaning when items are few
      const col = Math.floor(hashNum(post.id, 3) * S_NUM_COLS)
      const row = Math.floor(i / S_NUM_COLS)"""
    code = code.replace(old_scatter, new_scatter)

    with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)

fix_page()
print("Page fixed.")
