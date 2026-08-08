import os

path = "C:/Users/xjwoz/OneDrive/Desktop/_Dasom_Hackathon/src/app/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. QUOTES
quotes = """
/* ─── Quotes ─────────────────────────────────────────────────── */
const QUOTES = [
  { text: '인간 도덕 확립의 근간은 선(善)이다. 선의 실현 없이 사랑은 실현되지 아니한다.', author: '정은수', years: '2006-' },
  { text: 'Une bonne action n\\'est jamais perdue. — 선행은 결코 헛되지 않는다.', author: '장 드 라 퐁텐', years: '1621–1695' },
  { text: 'We are here on earth to help others. — 우리가 이 세상에 사는 이유는 서로를 돕기 위해서다.', author: 'W. H. 오든', years: '1907–1973' },
  { text: 'No one has ever become poor by giving. — 베푼다고 해서 가난해지는 사람은 아무도 없다.', author: '앤 프랭크', years: '1929–1945' },
]
const DAILY_QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)]

"""
content = content.replace("/* ─── Dates", quotes + "/* ─── Dates")

# 2. Make TODAY mutable
content = content.replace("const TODAY     = '2026-08-07'", "let TODAY     = '2026-08-07'")

# 3. AuthScreen Quotes UI
auth_target = """        {mode === 'login' && (
          <div onClick={handleDemoLogin} style={{ cursor: 'pointer', marginTop: 18, padding: '9px 13px', background: 'rgba(10,10,10,0.45)', border: '1px solid rgba(250,250,250,0.1)', borderRadius: '4px', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(10,10,10,0.6)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(10,10,10,0.45)'}>
            <div style={{ fontFamily: BODY, fontSize: '10px', color: 'rgba(250,250,250,0.35)', fontWeight: 700, marginBottom: 3, letterSpacing: '0.2px' }}>데모 계정 (클릭 시 자동 로그인)</div>
            <div style={{ fontFamily: BODY, fontSize: '12px', color: 'rgba(250,250,250,0.5)', fontWeight: 500 }}>
              @dasom_ai &nbsp;·&nbsp; <span style={{ color: 'rgba(250,250,250,0.8)' }}>12345678</span>
            </div>
          </div>
        )}
      </div>"""

auth_repl = auth_target + """
      {/* Quotes */}
      <div style={{ position: 'absolute', bottom: 32, left: 26, right: 26, zIndex: 1, borderLeft: '2px solid rgba(250,250,250,0.18)', paddingLeft: 14 }}>
        <div style={{ fontFamily: BODY, fontSize: '11px', fontWeight: 500, color: 'rgba(250,250,250,0.55)', lineHeight: 1.65, fontStyle: 'italic' }}>
          "{DAILY_QUOTE.text}"
        </div>
        <div style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 700, color: 'rgba(250,250,250,0.28)', marginTop: 6, letterSpacing: '0.04em' }}>
          — {DAILY_QUOTE.author} ({DAILY_QUOTE.years})
        </div>
      </div>
"""
content = content.replace(auth_target, auth_repl)

# 4. DiaryTab signature and Points UI
diary_sig = "function DiaryTab({ myPosts, onSelectPost, userId, onLogout }: { myPosts: Post[]; onSelectPost: (post: Post) => void; userId: string; onLogout: () => void }) {"
diary_repl = "function DiaryTab({ myPosts, onSelectPost, userId, onLogout, totalPoints, currentEvent }: { myPosts: Post[]; onSelectPost: (post: Post) => void; userId: string; onLogout: () => void; totalPoints: number; currentEvent: string }) {"
content = content.replace(diary_sig, diary_repl)

header_btn = """          <button onClick={onLogout} style={{ marginTop: 2, flexShrink: 0, padding: '6px 13px', background: 'transparent', border: '1.5px solid rgba(250,250,250,0.18)', borderRadius: '4px', cursor: 'pointer', fontFamily: BODY, fontSize: '11px', fontWeight: 700, color: 'rgba(250,250,250,0.38)', letterSpacing: '0.2px', transition: 'all 0.12s ease' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(250,250,250,0.45)'; el.style.color = WHITE }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(250,250,250,0.18)'; el.style.color = 'rgba(250,250,250,0.38)' }}>
            로그아웃
          </button>"""
header_btn_repl = """          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { TODAY = '2026-08-08'; alert('자정으로 강제 초기화되었습니다.'); window.location.reload(); }} style={{ marginTop: 2, flexShrink: 0, padding: '6px 13px', background: 'rgba(255,100,100,0.1)', border: '1.5px solid rgba(255,100,100,0.3)', borderRadius: '4px', cursor: 'pointer', fontFamily: BODY, fontSize: '11px', fontWeight: 700, color: '#FF9DBB', transition: 'all 0.12s ease' }}>
              자정초기화
            </button>
""" + header_btn + "\n          </div>"
content = content.replace(header_btn, header_btn_repl)

points_ui = """
      {/* Points & Event UI */}
      <div style={{ background: '#0F0F0F', flexShrink: 0, borderBottom: BORDER, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 700, color: 'rgba(250,250,250,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>선행 점수</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: DISP, fontSize: '38px', lineHeight: 1, color: '#FFE234', letterSpacing: '-1px' }}>{totalPoints}</span>
              <span style={{ fontFamily: BODY, fontSize: '12px', fontWeight: 800, color: 'rgba(255,226,52,0.55)' }}>pts</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '5px 10px' }}>
              <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 800, color: 'rgba(250,250,250,0.5)' }}>+</span>
              <span style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 700, color: 'rgba(250,250,250,0.45)' }}>출석 +1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '5px 10px' }}>
              <span style={{ fontSize: 13 }}>↗</span>
              <span style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 700, color: 'rgba(250,250,250,0.45)' }}>포스팅 +1</span>
            </div>
          </div>
        </div>
        {currentEvent && (
          <div style={{ marginTop: 10, background: 'linear-gradient(120deg, rgba(255,226,52,0.10) 0%, rgba(255,186,128,0.10) 100%)', border: '1.5px solid rgba(255,226,52,0.35)', borderRadius: '6px', padding: '9px 13px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ width: 3, height: '100%', background: '#FFE234', flexShrink: 0, alignSelf: 'stretch', borderRadius: 2 }} />
            <div>
              <div style={{ fontFamily: BODY, fontSize: '11px', fontWeight: 800, color: '#FFE234', marginBottom: 2 }}>이번 기간의 이벤트</div>
              <div style={{ fontFamily: BODY, fontSize: '11px', fontWeight: 600, color: 'rgba(250,250,250,0.7)', lineHeight: 1.5 }}>
                이번 기간의 이벤트는 <span style={{ background: 'rgba(255,226,52,0.15)', color: '#FFE234', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>{currentEvent}</span> 카테고리의 선행입니다.
              </div>
              <div style={{ fontFamily: BODY, fontSize: '10px', fontWeight: 500, color: 'rgba(255,186,128,0.85)', marginTop: 4 }}>달성 시 +2점 보너스 (1회 한정)</div>
            </div>
          </div>
        )}
      </div>
"""
content = content.replace("      {/* 포도밭 */}", points_ui + "\n      {/* 포도밭 */}")

# 5. MainApp state and fetch logic
main_sig = "  const [viewingProfile, setViewingProfile] = useState<string | null>(null)\n  const localNadoroRef = useRef<Set<string>>(new Set())"
main_repl = main_sig + """
  const [totalPoints, setTotalPoints] = useState(0)
  const [currentEvent, setCurrentEvent] = useState('인사')
"""
content = content.replace(main_sig, main_repl)

main_fetch_target = """  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts')"""
main_fetch_repl = """  const fetchProfile = useCallback(async () => {
    try {
      if (!currentUser) return;
      const res = await fetch(`/api/auth/me?user_id=${currentUser}`)
      if (res.ok) {
        const data = await res.json()
        if (data.user) setTotalPoints(data.user.total_points)
        if (data.currentEvent) setCurrentEvent(data.currentEvent)
      }
    } catch (e) {}
  }, [currentUser])

""" + main_fetch_target
content = content.replace(main_fetch_target, main_fetch_repl)

useeff_target = """  useEffect(() => {
    fetchPosts()
  }, [fetchPosts, currentUser])"""
useeff_repl = """  useEffect(() => {
    fetchPosts()
    fetchProfile()
  }, [fetchPosts, fetchProfile, currentUser])"""
content = content.replace(useeff_target, useeff_repl)

# 6. Pass props to DiaryTab
diary_call = "<DiaryTab myPosts={allMyPosts} onSelectPost={setViewingPost} userId={currentNick} onLogout={onLogout} />"
diary_call_repl = "<DiaryTab myPosts={allMyPosts} onSelectPost={setViewingPost} userId={currentNick} onLogout={onLogout} totalPoints={totalPoints} currentEvent={currentEvent} />"
content = content.replace(diary_call, diary_call_repl)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch successful!")
