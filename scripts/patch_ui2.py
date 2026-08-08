import os

path = "C:/Users/xjwoz/OneDrive/Desktop/_Dasom_Hackathon/src/app/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. didNadoro:true -> didNadoro:false
target1 = "{ id:'3',  color:'#7EDDD7', content:'계단에서 유모차 들어드렸어요',          author:'@sky_cloud',    timeAgo:'30분 전',  nadoroCount:11, rotation:-0.6, didNadoro:true,  category:'도움', date:TODAY,     isOwn:false },"
repl1   = "{ id:'3',  color:'#7EDDD7', content:'계단에서 유모차 들어드렸어요',          author:'@sky_cloud',    timeAgo:'30분 전',  nadoroCount:11, rotation:-0.6, didNadoro:false,  category:'도움', date:TODAY,     isOwn:false },"

if target1 in content:
    content = content.replace(target1, repl1)
else:
    print("Warning: Target 1 not found")

# 2. author:MY_ID -> author:'@greenstep' and isOwn:true -> isOwn:false for fake data
# There are 38 entries using MY_ID in SEED_POSTS.
content = content.replace("author:MY_ID", "author:'@greenstep'")
# Wait, if I replace author:MY_ID, I should also replace isOwn:true for those entries!
# Because if isOwn is true, it might still show up. But they won't match myId anymore so they'd be filtered out of "오늘의 선행", which is what we want.
# Actually, the logic is: `isOwn: p.user_id === myId || p.author === myNick || p.isOwn`.
# If `p.isOwn` is true in the source, it stays true!
# So I must replace `isOwn:true` with `isOwn:false` in the SEED_POSTS block!
# Let's just find all `isOwn:true` in the SEED_POSTS block and replace with `isOwn:false`.
# (There are no other `isOwn:true` in the file except possibly some other place? No, SEED_POSTS is the only place with `isOwn:true` hardcoded).
content = content.replace("isOwn:true", "isOwn:false")
content = content.replace("isOwn: true", "isOwn: false")

# 3. PostDetailModal realtime fix
target3 = """      {/* Post detail modal */}
      {viewingPost && (
        <PostDetailModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}"""

repl3 = """      {/* Post detail modal */}
      {viewingPost && (
        <PostDetailModal
          post={posts.find(p => p.id === viewingPost.id) || viewingPost}
          onClose={() => setViewingPost(null)}"""

if target3 in content:
    content = content.replace(target3, repl3)
else:
    print("Warning: Target 3 not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("UI Patch applied successfully.")
