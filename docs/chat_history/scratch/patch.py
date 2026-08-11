import re

def fix_css():
    with open('src/app/globals.css', 'r', encoding='utf-8') as f:
        css = f.read()
    css = css.replace("@import 'tailwindcss';", "@tailwind base;\n@tailwind components;\n@tailwind utilities;")
    with open('src/app/globals.css', 'w', encoding='utf-8') as f:
        f.write(css)

def patch_page():
    with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. FallbackAuth Component Injection
    auth_component = """
function FallbackAuth({ onLogin }: { onLogin: (id: string) => void }) {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register') {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: nickname, email, password })
      })
      if (res.ok) {
        alert('회원가입 완료! 로그인해주세요.')
        setMode('login')
      } else {
        alert('회원가입 실패')
      }
    } else {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: nickname, password })
      })
      if (res.ok) {
        localStorage.setItem('user_id', nickname)
        onLogin(nickname)
      } else {
        alert('로그인 실패')
      }
    }
  }

  return (
    <div style={{ padding: 40, color: '#fff', background: '#0A0A0A', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>{mode === 'login' ? '로그인' : '회원가입'}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
        <input placeholder="@닉네임 (user_id)" value={nickname} onChange={e => setNickname(e.target.value)} style={{ padding: 10, color: '#000' }} required />
        {mode === 'register' && (
          <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 10, color: '#000' }} required />
        )}
        <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 10, color: '#000' }} required />
        <button type="submit" style={{ padding: 12, background: '#7C3AED', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </form>
      <button onClick={() => setMode(m => m === 'login' ? 'register' : 'login')} style={{ marginTop: 20, background: 'none', color: '#888', border: 'none', cursor: 'pointer' }}>
        {mode === 'login' ? '회원가입하러 가기' : '로그인하러 가기'}
      </button>
    </div>
  )
}
"""
    # Insert before export default function App
    code = code.replace("export default function App() {", auth_component + "\nexport default function App() {")

    # 2. Add 'use client'
    if "'use client'" not in code and '"use client"' not in code:
        code = "'use client'\n" + code

    # 3. Replace MY_ID in App with userId logic
    code = code.replace("const MY_ID = '@dasom_ai'", "// MY_ID replaced by userId")
    
    app_logic_replacement = """
  const [userId, setUserId] = useState<string | null>(null)
  
  const fetchPosts = async (currentUserId: string) => {
    try {
      const res = await fetch('/api/posts')
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map((p: any) => ({
          ...p,
          isOwn: p.author === currentUserId,
          timeAgo: p.date === TODAY ? '오늘' : p.date, // API might have raw dates
        }))
        setPosts([...mapped, ...SEED_POSTS])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const uid = localStorage.getItem('user_id')
    if (uid) {
      setUserId(uid)
      fetchPosts(uid)
    }
  }, [])

  if (!userId) {
    return <FallbackAuth onLogin={(id) => { setUserId(id); fetchPosts(id); }} />
  }

  const MY_ID = userId;
"""
    code = code.replace("const [posts, setPosts]       = useState<Post[]>(SEED_POSTS)", 
                        "const [posts, setPosts]       = useState<Post[]>(SEED_POSTS)\n" + app_logic_replacement)

    # 4. Modify handleAdd
    old_handle_add = """  const handleAdd = (content: string, color: string, category: string, photo?: string) =>
    setPosts(prev => [{
      id: `u${Date.now()}`, content, color, author: MY_ID, timeAgo: '방금 전',
      nadoroCount: 0, rotation: (Math.random() - 0.5) * 4,
      didNadoro: false, category, date: TODAY, isOwn: true, photo,
    }, ...prev])"""

    new_handle_add = """  const handleAdd = async (content: string, color: string, category: string, photo?: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, color, category, author: MY_ID, photo })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.isCampaignMatched) {
          alert('✨캠페인 키워드 매칭! 효과가 2배가 됩니다!✨')
        }
        fetchPosts(MY_ID)
      }
    } catch (e) { console.error(e) }
  }"""
    code = code.replace(old_handle_add, new_handle_add)

    # 5. Modify handleNadoro
    old_handle_nadoro_start = "const handleNadoro = (id: string) => {"
    old_handle_nadoro = """  const handleNadoro = (id: string) => {
    const original = posts.find(p => p.id === id)
    if (!original) return
    if (!original.didNadoro) {
      const repost: Post = {
        id: `repost-${id}`, content: original.content, color: original.color,
        author: MY_ID, timeAgo: '방금 전', nadoroCount: 0,
        rotation: (Math.random() - 0.5) * 4,
        didNadoro: false, category: original.category,
        date: TODAY, isOwn: true, isRepost: true, repostFrom: original.author,
        photo: original.photo,
      }
      setPosts(prev => [
        ...prev.map(p => p.id === id ? { ...p, didNadoro: true, nadoroCount: p.nadoroCount + 1 } : p),
        repost,
      ])
      // Update viewingPost if it's the same post
      setViewingPost(prev => prev?.id === id ? { ...prev, didNadoro: true, nadoroCount: prev.nadoroCount + 1 } : prev)
    } else {
      setPosts(prev => prev
        .map(p => p.id === id ? { ...p, didNadoro: false, nadoroCount: p.nadoroCount - 1 } : p)
        .filter(p => p.id !== `repost-${id}`)
      )
      setViewingPost(prev => prev?.id === id ? { ...prev, didNadoro: false, nadoroCount: prev.nadoroCount - 1 } : prev)
    }
  }"""

    new_handle_nadoro = """  const handleNadoro = async (id: string) => {
    try {
      const original = posts.find(p => p.id === id)
      if (!original) return
      
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'repost',
          postId: id,
          user_id: MY_ID
        })
      })
      if (res.ok) {
        fetchPosts(MY_ID)
      }
    } catch (e) { console.error(e) }
  }"""
    code = code.replace(old_handle_nadoro, new_handle_nadoro)
    
    # 6. ProfileView MY_ID fix
    # ProfileView checks `const isMe = authorId === MY_ID` but MY_ID might not be defined if it's outside.
    # We should change ProfileView signature to accept `currentUserId: string` instead of relying on MY_ID global.
    code = code.replace("function ProfileView({ authorId, allPosts, onClose }: {", "function ProfileView({ authorId, currentUserId, allPosts, onClose }: { currentUserId: string,")
    code = code.replace("const isMe = authorId === MY_ID", "const isMe = authorId === currentUserId")
    # Where it's called in App:
    code = code.replace("<ProfileView\n          authorId={viewingProfile}\n          allPosts={posts}", "<ProfileView\n          authorId={viewingProfile}\n          currentUserId={MY_ID}\n          allPosts={posts}")

    # Write back
    with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)

fix_css()
patch_page()
print("Patch applied successfully.")
