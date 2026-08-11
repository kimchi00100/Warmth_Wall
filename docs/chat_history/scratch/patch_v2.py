import re

def fix_css():
    with open('figma_export_v2/src/index.css', 'r', encoding='utf-8') as f:
        css = f.read()
    css = css.replace("@import 'tailwindcss';", "@tailwind base;\n@tailwind components;\n@tailwind utilities;")
    with open('src/app/globals.css', 'w', encoding='utf-8') as f:
        f.write(css)

def patch_page():
    with open('figma_export_v2/src/App.tsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Add 'use client'
    if "'use client'" not in code and '"use client"' not in code:
        code = "'use client'\n" + code

    # 2. AuthScreen handleSubmit replacement
    old_handle_submit = """  const handleSubmit = () => {
    setError('')
    const h = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`
    if (!handle.trim()) return setError('닉네임을 입력해주세요.')
    if (!pw) return setError('비밀번호를 입력해주세요.')
    if (mode === 'login') {
      const acc = accounts.find(a => a.handle === h && a.password === pw)
      if (!acc) return setError('닉네임 또는 비밀번호가 올바르지 않아요.')
      onLogin(h)
    } else {
      if (!email.trim()) return setError('이메일을 입력해주세요.')
      if (pw.length < 6) return setError('비밀번호는 6자 이상이어야 해요.')
      if (pw !== pwConfirm) return setError('비밀번호가 일치하지 않아요.')
      if (accounts.find(a => a.handle === h)) return setError('이미 사용 중인 닉네임이에요.')
      setAccounts(prev => [...prev, { handle: h, email: email.trim(), password: pw }])
      onLogin(h)
    }
  }"""

    new_handle_submit = """  const handleSubmit = async () => {
    setError('')
    const h = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`
    if (!handle.trim()) return setError('닉네임을 입력해주세요.')
    if (!pw) return setError('비밀번호를 입력해주세요.')
    if (mode === 'login') {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: h, password: pw })
        })
        if (res.ok) {
          localStorage.setItem('user_id', h)
          onLogin(h)
        } else {
          setError('닉네임 또는 비밀번호가 올바르지 않아요.')
        }
      } catch (e) { setError('서버 오류') }
    } else {
      if (!email.trim()) return setError('이메일을 입력해주세요.')
      if (pw.length < 6) return setError('비밀번호는 6자 이상이어야 해요.')
      if (pw !== pwConfirm) return setError('비밀번호가 일치하지 않아요.')
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: h, email: email.trim(), password: pw })
        })
        if (res.ok) {
          alert('회원가입 완료! 메인 화면으로 이동합니다.')
          localStorage.setItem('user_id', h)
          onLogin(h)
        } else {
          setError('이미 사용 중인 닉네임이거나 가입에 실패했습니다.')
        }
      } catch (e) { setError('서버 오류') }
    }
  }"""
    code = code.replace(old_handle_submit, new_handle_submit)

    # 3. Delete MY_ID and SEED_POSTS
    code = code.replace("let MY_ID = '@dasom_ai'  // overwritten by App on login", "")
    code = re.sub(r'const SEED_POSTS: Post\[\] = \[\s*(?:.*?\n)*?\]', '', code)

    # 4. App component modification
    old_app = """export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  if (!currentUser) {
    return <AuthScreen onLogin={handle => { MY_ID = handle; setCurrentUser(handle) }} />
  }

  return <MainApp currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
}"""

    new_app = """export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const uid = localStorage.getItem('user_id')
    if (uid) {
      setCurrentUser(uid)
    }
    setIsLoaded(true)
  }, [])

  if (!isLoaded) return <div style={{background:'#0A0A0A', height:'100vh'}} />

  if (!currentUser) {
    return <AuthScreen onLogin={handle => { setCurrentUser(handle) }} />
  }

  return <MainApp currentUser={currentUser} onLogout={() => { localStorage.removeItem('user_id'); setCurrentUser(null) }} />
}"""
    code = code.replace(old_app, new_app)

    # 5. MainApp State modification
    old_main_app_state = """  const [posts, setPosts]           = useState<Post[]>(() =>
    SEED_POSTS.map(p => p.author === '@dasom_ai' ? { ...p, author: currentUser, isOwn: p.isOwn } : p)
  )"""
    new_main_app_state = """  const [posts, setPosts]           = useState<Post[]>([])

  const fetchPosts = async () => {
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
  }

  useEffect(() => {
    fetchPosts()
  }, [currentUser])"""
    code = code.replace(old_main_app_state, new_main_app_state)

    # 6. handleNadoro
    old_nadoro = """  const handleNadoro = (id: string) => {
    const original = posts.find(p => p.id === id)
    if (!original) return
    if (!original.didNadoro) {
      const repost: Post = {
        id: `repost-${id}`, content: original.content, color: original.color,
        author: currentUser, timeAgo: '방금 전', nadoroCount: 0,
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
    new_nadoro = """  const handleNadoro = async (id: string) => {
    try {
      const original = posts.find(p => p.id === id)
      if (!original) return
      
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'repost',
          postId: id,
          user_id: currentUser
        })
      })
      if (res.ok) {
        fetchPosts()
      }
    } catch (e) { console.error(e) }
  }"""
    code = code.replace(old_nadoro, new_nadoro)

    # 7. handleAdd
    old_add = """  const handleAdd = (content: string, color: string, category: string, photo?: string) =>
    setPosts(prev => [{
      id: `u${Date.now()}`, content, color, author: currentUser, timeAgo: '방금 전',
      nadoroCount: 0, rotation: (Math.random() - 0.5) * 4,
      didNadoro: false, category, date: TODAY, isOwn: true, photo,
    }, ...prev])"""
    new_add = """  const handleAdd = async (content: string, color: string, category: string, photo?: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, color, category, author: currentUser, photo })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.isCampaignMatched) {
          alert('✨캠페인 키워드 매칭! 효과가 2배가 됩니다!✨')
        }
        fetchPosts()
      }
    } catch (e) { console.error(e) }
  }"""
    code = code.replace(old_add, new_add)

    # 8. ProfileView fix
    code = code.replace("function ProfileView({ authorId, allPosts, onClose }: {", "function ProfileView({ authorId, currentUser, allPosts, onClose }: {\n  currentUser: string,")
    code = code.replace("const isMe = authorId === MY_ID", "const isMe = authorId === currentUser")
    code = code.replace("<ProfileView\n          authorId={viewingProfile}\n          allPosts={posts}", "<ProfileView\n          authorId={viewingProfile}\n          currentUser={currentUser}\n          allPosts={posts}")

    # Write to page.tsx
    with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(code)

fix_css()
patch_page()
print("Patch V2 applied successfully.")
