import os

path = "C:/Users/xjwoz/OneDrive/Desktop/_Dasom_Hackathon/src/app/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update AuthScreen handleLogin fetch payload
login_target = """        body: JSON.stringify({ email: '@dasom_ai', password: 'password123' })"""
login_repl = """        body: JSON.stringify({ email: '@dasom_ai', password: 'password123', client_date: TODAY })"""
content = content.replace(login_target, login_repl)

# Update the generic login if any
gen_login_target = """        body: JSON.stringify({ email: id, password: pw })"""
gen_login_repl = """        body: JSON.stringify({ email: id, password: pw, client_date: TODAY })"""
content = content.replace(gen_login_target, gen_login_repl)

# 2. Update MainApp fetchProfile to also call attend
fetch_profile_target = """  const fetchProfile = useCallback(async () => {
    try {
      if (!currentUser) return;
      const res = await fetch(`/api/auth/me?user_id=${currentUser}`)"""
fetch_profile_repl = """  const fetchProfile = useCallback(async () => {
    try {
      if (!currentUser) return;
      // Trigger attendance check for today
      await fetch('/api/auth/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser, client_date: TODAY })
      });
      const res = await fetch(`/api/auth/me?user_id=${currentUser}`)"""
content = content.replace(fetch_profile_target, fetch_profile_repl)

# 3. Update handleNadoro
nadoro_target = """        if (res.ok) {
          const newPost = await res.json()
          setPosts(prev => [newPost, ...prev])
        }"""
nadoro_repl = """        if (res.ok) {
          const data = await res.json()
          // API returns { status: 'added'|'removed', pointDelta: number, post?: Post }
          if (data.status === 'added' && data.post) {
            setPosts(prev => [data.post, ...prev])
          } else if (data.status === 'removed') {
            setPosts(prev => prev.filter(p => !(p.parent_id === parentId && p.user_id === currentUser)))
          }
          if (data.pointDelta) {
            setTotalPoints(prev => prev + data.pointDelta)
          }
        }"""
content = content.replace(nadoro_target, nadoro_repl)

# 4. Update handleNewPost
newpost_target = """        if (res.ok) {
          const data = await res.json()
          setPosts(prev => [data, ...prev])
          if (data.isCampaignMatched) {"""
newpost_repl = """        if (res.ok) {
          const data = await res.json()
          setPosts(prev => [data, ...prev])
          if (data.earnedPoints) {
            setTotalPoints(prev => prev + data.earnedPoints)
          }
          if (data.isCampaignMatched) {"""
content = content.replace(newpost_target, newpost_repl)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch UI updates successful!")
