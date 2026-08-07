const fs = require('fs');
const file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove SEED_POSTS
code = code.replace(/const SEED_POSTS: Post\[\] = \[[\s\S]*?\]/g, 'const SEED_POSTS: Post[] = []');

// 2. Remove MY_ID
code = code.replace(/const MY_ID = '@dasom_ai'/g, '// MY_ID removed');

// 3. ProfileView definition
code = code.replace(
`function ProfileView({ authorId, allPosts, onClose }: {
  authorId: string
  allPosts: Post[]
  onClose: () => void
}) {
  const isMe = authorId === MY_ID`,
`function ProfileView({ authorId, allPosts, onClose, currentUserId }: {
  authorId: string
  allPosts: Post[]
  onClose: () => void
  currentUserId: string | null
}) {
  const isMe = authorId === currentUserId`
);

// 4. App Component
const appStart = `export default function App() {
  const [tab, setTab]               = useState<TabId>('wall')
  const [posts, setPosts]           = useState<Post[]>(SEED_POSTS)
  const [showModal, setModal]       = useState(false)
  const [viewingPost, setViewingPost]       = useState<Post | null>(null)
  const [viewingProfile, setViewingProfile] = useState<string | null>(null)

  const allMyPosts = posts.filter(p => p.isOwn)
  const myToday    = allMyPosts.filter(p => p.date === TODAY)

  const handleNadoro = (id: string) => {
    const original = posts.find(p => p.id === id)
    if (!original) return
    if (!original.didNadoro) {
      const repost: Post = {
        id: \`repost-\${id}\`, content: original.content, color: original.color,
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
        .filter(p => p.id !== \`repost-\${id}\`)
      )
      setViewingPost(prev => prev?.id === id ? { ...prev, didNadoro: false, nadoroCount: prev.nadoroCount - 1 } : prev)
    }
  }

  const handleAdd = (content: string, color: string, category: string, photo?: string) =>
    setPosts(prev => [{
      id: \`u\${Date.now()}\`, content, color, author: MY_ID, timeAgo: '방금 전',
      nadoroCount: 0, rotation: (Math.random() - 0.5) * 4,
      didNadoro: false, category, date: TODAY, isOwn: true, photo,
    }, ...prev])

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: INK }}>`;

const appReplacement = `export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  
  const [tab, setTab]               = useState<TabId>('wall')
  const [posts, setPosts]           = useState<Post[]>([])
  const [showModal, setModal]       = useState(false)
  const [viewingPost, setViewingPost]       = useState<Post | null>(null)
  const [viewingProfile, setViewingProfile] = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('user_id')
    if (id) setUserId(id)
  }, [])

  useEffect(() => {
    if (!userId) return;
    fetch('/api/posts?scope=public')
      .then(r => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const transformed = data.map(d => ({
          id: d.id,
          content: d.content,
          color: DEFAULT_COLORS[Math.floor(hashNum(d.id, 3) * DEFAULT_COLORS.length)],
          author: d.nickname || d.user_id,
          timeAgo: '방금 전',
          nadoroCount: 0,
          rotation: (hashNum(d.id, 4) - 0.5) * 4,
          didNadoro: false,
          category: d.keyword || '기타',
          date: d.created_at ? d.created_at.split(' ')[0] : TODAY,
          isOwn: d.user_id === userId,
          photo: d.photo
        }));
        setPosts(transformed);
      });
  }, [userId]);

  const allMyPosts = posts.filter(p => p.isOwn)
  const myToday    = allMyPosts.filter(p => p.date === TODAY)

  const handleNadoro = (id: string) => {
    const original = posts.find(p => p.id === id)
    if (!original) return
    fetch(\`/api/posts/\${id}/repost\`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }).catch(e=>console.error(e));

    if (!original.didNadoro) {
      const repost: Post = {
        id: \`repost-\${id}\`, content: original.content, color: original.color,
        author: userId || '익명', timeAgo: '방금 전', nadoroCount: 0,
        rotation: (Math.random() - 0.5) * 4,
        didNadoro: false, category: original.category,
        date: TODAY, isOwn: true, isRepost: true, repostFrom: original.author,
        photo: original.photo,
      }
      setPosts(prev => [
        ...prev.map(p => p.id === id ? { ...p, didNadoro: true, nadoroCount: p.nadoroCount + 1 } : p),
        repost,
      ])
      setViewingPost(prev => prev?.id === id ? { ...prev, didNadoro: true, nadoroCount: prev.nadoroCount + 1 } : prev)
    } else {
      setPosts(prev => prev
        .map(p => p.id === id ? { ...p, didNadoro: false, nadoroCount: p.nadoroCount - 1 } : p)
        .filter(p => p.id !== \`repost-\${id}\`)
      )
      setViewingPost(prev => prev?.id === id ? { ...prev, didNadoro: false, nadoroCount: prev.nadoroCount - 1 } : prev)
    }
  }

  const handleAdd = (content: string, color: string, category: string, photo?: string) => {
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        nickname: userId,
        user_id: userId,
        keyword: category,
        photo
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.isCampaignMatched) {
        alert("✨캠페인 키워드 매칭! 온기 2배 적립!");
      }
      const newPost: Post = {
        id: data.id || \`u\${Date.now()}\`, content: data.content || content, color, 
        author: userId || '익명', timeAgo: '방금 전',
        nadoroCount: 0, rotation: (Math.random() - 0.5) * 4,
        didNadoro: false, category: data.keyword || category, 
        date: TODAY, isOwn: true, photo: data.photo || photo,
      }
      setPosts(prev => [newPost, ...prev])
    }).catch(e => console.error(e));
  }

  if (!userId) {
    return (
      <div style={{ padding: 40, background: 'white', color: 'black', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ marginBottom: 20 }}>로그인 / 회원가입</h2>
        <form onSubmit={e => {
          e.preventDefault();
          const uid = (new FormData(e.currentTarget)).get('uid') as string;
          localStorage.setItem('user_id', uid);
          setUserId(uid);
        }} style={{ display: 'flex', gap: 10 }}>
          <input name="uid" placeholder="유저 ID 입력" required style={{ border: '2px solid black', padding: '10px 14px', fontSize: 16 }} />
          <button type="submit" style={{ border: '2px solid black', padding: '10px 20px', background: 'black', color: 'white', cursor: 'pointer', fontSize: 16 }}>접속</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: INK }}>`;

code = code.replace(appStart, appReplacement);

// 5. Update ProfileView usage in App return
const profileViewUsage = `<ProfileView
          authorId={viewingProfile}
          allPosts={posts}
          onClose={() => setViewingProfile(null)}
        />`;
const profileViewUsageRepl = `<ProfileView
          authorId={viewingProfile}
          allPosts={posts}
          onClose={() => setViewingProfile(null)}
          currentUserId={userId}
        />`;
code = code.replace(profileViewUsage, profileViewUsageRepl);

fs.writeFileSync(file, code);
console.log("Replacement complete!");
