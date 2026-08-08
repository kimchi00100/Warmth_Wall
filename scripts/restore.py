import os

path = r"C:\Users\xjwoz\OneDrive\Desktop\_Dasom_Hackathon\src\app\page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

restore_code = """        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      } as React.CSSProperties}
      onClick={() => onCardClick?.(post)}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = `rotate(${post.rotation * 0.2}deg) translateY(-5px) translateX(-2px)`
        el.style.boxShadow = `6px 6px 0 ${INK}`
        el.style.zIndex = '10'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = `rotate(${post.rotation}deg) translateY(0) translateX(0)`
        el.style.boxShadow = HS
        el.style.zIndex = ''
      }}
    >
      <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', zIndex: 4 }}>
        <Tack color={getTack(post.color)} />
      </div>

      {hasPhoto && (
        <div style={{ width: '100%', height: PHOTO_H, flexShrink: 0, borderBottom: BORDER, overflow: 'hidden' }}>
          <img src={post.photo} alt="선행 사진" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div style={{ flex: 1, padding: hasPhoto ? '10px 12px 42px' : '14px 12px 42px', position: 'relative' }}>
        {post.isRepost && post.repostFrom && (
          <div style={{
            background: INK, color: WHITE, borderRadius: '1px',
            padding: '3px 8px', fontSize: '9px', fontFamily: BODY, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 3, marginBottom: 8,
          }}>
            <span style={{ fontSize: 9 }}>↗</span> {post.repostFrom}님과 공동 선행
          </div>
        )}

        <span style={{
          position: 'absolute', top: hasPhoto ? 10 : 10, right: 10,
          fontSize: '9px', background: INK, color: WHITE,
          padding: '2px 7px', borderRadius: '1px', fontFamily: BODY, fontWeight: 700, letterSpacing: '0.3px',
        }}>{post.category}</span>

        <p style={{
          fontFamily: BODY, color: INK, fontSize: cfg.fs,
          fontWeight: 700, lineHeight: 1.55, whiteSpace: 'pre-wrap',
          margin: 0, paddingRight: 20,
        }}>{post.content}</p>
      </div>

      <div style={{
        position: 'absolute', bottom: 8, left: 10, right: 8,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4,
      }}>
        <div>
          <div style={{ fontSize: '11px', color: INK, fontFamily: BODY, fontWeight: 700 }}>{post.author}</div>
          <div style={{ fontSize: '9px', color: 'rgba(10,10,10,0.5)', fontFamily: BODY }}>{post.timeAgo}</div>
        </div>

        {onNadoro && (
          <button
            onClick={e => { 
              e.stopPropagation(); 
              e.preventDefault(); 
              if (!post.isOwn) onNadoro(post.id);
            }}
            onPointerDown={e => e.stopPropagation()}
            style={{
              minWidth: 40, height: 40, borderRadius: '1px',
              background: post.didNadoro ? INK : WHITE,
              border: BORDER,
              boxShadow: post.didNadoro ? 'none' : HS_SM,
              color: post.didNadoro ? WHITE : INK,
              cursor: post.isOwn ? 'default' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: BODY, fontWeight: 900, lineHeight: 1.1,
              padding: '2px 6px', flexShrink: 0,
              transition: 'all 0.12s ease',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 900 }}>{post.nadoroCount}</span>
            <span style={{ fontSize: '7px', fontWeight: 700 }}>나도요</span>
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Post Detail Modal ──────────────────────────────────────── */
function PostDetailModal({ post, onClose, onViewProfile, onNadoro, onDeletePost }: {"""

target_str = "function PostDetailModal({ post, onClose, onViewProfile, onNadoro, onDeletePost }: {"
new_content = content.replace(target_str, restore_code)

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)
    
print("Restored!")
