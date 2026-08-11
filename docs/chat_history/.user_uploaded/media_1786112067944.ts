import { useState, useRef, useEffect, useMemo, useCallback } from 'react'

/* ─── Types ──────────────────────────────────────────────────── */
type TabId = 'wall' | 'today' | 'diary'
type SizeV = 'tiny' | 'sm' | 'md' | 'lg' | 'xl'

interface Post {
  id: string
  content: string
  color: string
  author: string
  timeAgo: string
  nadoroCount: number
  rotation: number
  didNadoro: boolean
  category: string
  date: string
  isOwn: boolean
  isRepost?: boolean
  repostFrom?: string
  photo?: string
}

/* ─── Design Tokens ──────────────────────────────────────────── */
const INK   = '#0A0A0A'
const WHITE = '#FAFAFA'
const DISP  = "'Black Han Sans', sans-serif"
const BODY  = "'Noto Sans KR', sans-serif"

const AURA  = 'linear-gradient(148deg, #DDD0FF 0%, #F2C4E0 48%, #FFE3C8 100%)'
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const BORDER  = `2px solid ${INK}`
const HS      = `4px 4px 0 ${INK}`
const HS_SM   = `3px 3px 0 ${INK}`

/* ─── Colors ─────────────────────────────────────────────────── */
const DEFAULT_COLORS = ['#FFE234', '#FF9DBB', '#7EDDD7']
const PALETTE_COLORS = ['#FFBA80','#C6A8F5','#80C4F5','#9FEBA4','#F5E880','#F5A0C8','#80ECF5','#F5A0A0']

const COLOR_NAMES: Record<string, string> = {
  '#FFE234':'노랑', '#FF9DBB':'핑크', '#7EDDD7':'민트',
}

const TACK_MAP: Record<string, string> = {
  '#FFE234':'#C43020','#FF9DBB':'#2040B0','#7EDDD7':'#1A7060',
  '#FFBA80':'#A03020','#C6A8F5':'#4820A0','#80C4F5':'#1A40A0',
  '#9FEBA4':'#288030','#F5E880':'#787020','#F5A0C8':'#A02060',
  '#80ECF5':'#1880A0','#F5A0A0':'#A03030',
}
const getTack = (hex: string) => TACK_MAP[hex] ?? INK

/* ─── Categories ─────────────────────────────────────────────── */
const CATEGORIES = ['도움','배려','인사','나눔','환경','기타'] as const
type BaseCategory = typeof CATEGORIES[number]

const CAT_COLOR: Record<string, string> = {
  도움:'#FFE234', 배려:'#FF9DBB', 인사:'#FFE234', 나눔:'#FFBA80', 환경:'#9FEBA4', 기타:'#C6A8F5',
}

/* ─── Post-it sizes ──────────────────────────────────────────── */
const PHOTO_H = 108

const SIZE_CFG: Record<SizeV, { w: number; minH: number; fs: number }> = {
  tiny: { w: 138, minH: 90,  fs: 14 },
  sm:   { w: 154, minH: 112, fs: 16 },
  md:   { w: 162, minH: 136, fs: 17 },
  lg:   { w: 162, minH: 162, fs: 17 },
  xl:   { w: 154, minH: 186, fs: 16 },
}
const SIZE_CYCLE: SizeV[] = ['md','tiny','lg','sm','xl','md','sm','lg','tiny','md','xl','sm']

/* ─── Dates ──────────────────────────────────────────────────── */
const TODAY     = '2026-08-07'
const YESTERDAY = '2026-08-06'
const TWO_AGO   = '2026-08-05'
const THREE_AGO = '2026-08-04'

/* ─── Date utilities ─────────────────────────────────────────── */
function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

function fmtDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number)
  if (dateStr === TODAY) return `${m}월 ${d}일 (오늘)`
  if (dateStr === YESTERDAY) return `${m}월 ${d}일 (어제)`
  return `${m}월 ${d}일`
}

function fmtMonth(dateStr: string): string {
  return `${Number(dateStr.split('-')[1])}월`
}

function getDow(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const js = new Date(y, m - 1, d).getDay()
  return js === 0 ? 6 : js - 1
}

function calcStreak(myPosts: Post[]): number {
  const set = new Set(myPosts.map(p => p.date))
  let streak = 0, cur = TODAY
  while (set.has(cur)) { streak++; cur = addDays(cur, -1) }
  return streak
}

const GRASS_COLORS = [
  'rgba(10,10,10,0.08)',
  '#DDD0FF',
  '#B89FEE',
  '#8A5ED8',
  '#5520B8',
]
function grassColor(count: number) {
  return GRASS_COLORS[Math.min(count, 4)]
}

function buildContribGrid(myPosts: Post[], weeks = 18) {
  const countByDate: Record<string, number> = {}
  myPosts.forEach(p => { countByDate[p.date] = (countByDate[p.date] || 0) + 1 })
  let start = addDays(TODAY, -(weeks - 1) * 7)
  const dow = getDow(start)
  start = addDays(start, -dow)
  type Cell = { dateStr: string; count: number; isToday: boolean; isFuture: boolean }
  const result: Array<{ monthLabel: string | null; days: Cell[] }> = []
  let cur = start
  let prevMonth = ''
  for (let w = 0; w < weeks; w++) {
    const days: Cell[] = []
    for (let d = 0; d < 7; d++) {
      days.push({ dateStr: cur, count: countByDate[cur] || 0, isToday: cur === TODAY, isFuture: cur > TODAY })
      cur = addDays(cur, 1)
    }
    const wMonth = fmtMonth(days[0].dateStr)
    result.push({ monthLabel: wMonth !== prevMonth ? wMonth : null, days })
    prevMonth = wMonth
  }
  return result
}

/* ─── Account ────────────────────────────────────────────────── */
const MY_ID = '@dasom_ai'

/* ─── Deterministic hash → 0–1 ──────────────────────────────── */
function hashNum(s: string, seed: number): number {
  let h = seed * 2654435761
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x9e3779b9) }
  return ((h >>> 0) / 0xFFFFFFFF)
}

/* ─── Scattered canvas layout ─────────────────────────────────
   3 columns on a canvas ~2× the viewport width so the centered
   initial view shows all three columns, with posts spilling
   slightly off both sides to hint at draggability.              */
const S_NUM_COLS = 3
const S_COL_W    = 158
const S_COL_GAP  = 48
const S_COL_SLOT = S_COL_W + S_COL_GAP
const S_PAD_X    = 40
const S_PAD_Y    = 36
const S_X_JITTER = 22   // ±pixels horizontal scatter within column
const S_Y_EXTRA  = 52   // 0–N pixels extra vertical gap per row

function useScatteredLayout(posts: Post[]) {
  return useMemo(() => {
    const colH = Array(S_NUM_COLS).fill(S_PAD_Y)
    type Rect = { x: number; y: number; w: number; h: number }
    const placed: Rect[] = []

    const items = posts.map((post, i) => {
      const v = SIZE_CYCLE[i % SIZE_CYCLE.length]
      const cfg = SIZE_CFG[v]
      const cardW = cfg.w
      const cardH = post.photo ? cfg.minH + PHOTO_H : cfg.minH

      // Round-robin guarantees all columns fill evenly
      const col = i % S_NUM_COLS

      const r1 = hashNum(post.id, 1)   // x jitter
      const r2 = hashNum(post.id, 2)   // y extra gap

      const xBase = S_PAD_X + col * S_COL_SLOT
      const x = xBase + (r1 - 0.5) * 2 * S_X_JITTER
      let y = colH[col] + r2 * S_Y_EXTRA

      // Nudge down if overlapping a placed card
      let tries = 0
      while (tries < 8) {
        const hit = placed.find(p =>
          x < p.x + p.w + 8 && x + cardW > p.x - 8 &&
          y < p.y + p.h + 8 && y + cardH > p.y - 8
        )
        if (!hit) break
        y = hit.y + hit.h + 14
        tries++
      }

      placed.push({ x, y, w: cardW, h: cardH })
      colH[col] = y + cardH + 16

      return { post, v, x, y }
    })

    const canvasW = S_PAD_X * 2 + S_NUM_COLS * S_COL_SLOT + S_X_JITTER * 2
    const canvasH = Math.max(...colH) + S_PAD_Y
    return { items, canvasW, canvasH }
  }, [posts])
}

/* ─── Seed data ──────────────────────────────────────────────── */
const SEED_POSTS: Post[] = [
  { id:'1',  color:'#FFE234', content:'버스에서 어르신께 자리를 양보했어요',   author:'@warm_bear',    timeAgo:'5분 전',   nadoroCount:14, rotation:-2.1, didNadoro:false, category:'배려', date:TODAY,     isOwn:false },
  { id:'2',  color:'#FF9DBB', content:'비 오는 날 우산 함께 써드렸어요',       author:'@spring_sun',   timeAgo:'13분 전',  nadoroCount:6,  rotation: 1.7, didNadoro:false, category:'나눔', date:TODAY,     isOwn:false },
  { id:'3',  color:'#7EDDD7', content:'계단에서 유모차 들어드렸어요',          author:'@sky_cloud',    timeAgo:'30분 전',  nadoroCount:11, rotation:-0.6, didNadoro:true,  category:'도움', date:TODAY,     isOwn:false },
  { id:'5',  color:'#FF9DBB', content:'길에서 지갑 떨어진 분 찾아드렸어요',   author:'@mindle99',     timeAgo:'1시간 전', nadoroCount:22, rotation:-1.4, didNadoro:false, category:'도움', date:TODAY,     isOwn:false },
  { id:'6',  color:'#7EDDD7', content:'편의점 앞 쓰레기 주워 버렸어요',       author:'@greenstep',    timeAgo:'2시간 전', nadoroCount:9,  rotation: 0.8, didNadoro:false, category:'환경', date:TODAY,     isOwn:false },
  { id:'8',  color:'#C6A8F5', content:'지하철에서 길 잃은 분 안내했어요',     author:'@guide_k',      timeAgo:'3시간 전', nadoroCount:7,  rotation: 1.1, didNadoro:false, category:'도움', date:TODAY,     isOwn:false },
  { id:'9',  color:'#FFE234', content:'할머니 장바구니 들어드렸어요',          author:'@kind_neighbor',timeAgo:'4시간 전', nadoroCount:18, rotation:-1.0, didNadoro:false, category:'도움', date:TODAY,     isOwn:false },
  { id:'10', color:'#7EDDD7', content:'주문 기다리는 분께 먼저 양보했어요',   author:'@yooyoo_j',     timeAgo:'5시간 전', nadoroCount:3,  rotation: 2.6, didNadoro:false, category:'배려', date:TODAY,     isOwn:false },
  { id:'11', color:'#FFBA80', content:'카페 직원분께 "수고하세요" 했어요',     author:'@warmspoon',    timeAgo:'6시간 전', nadoroCount:15, rotation:-0.3, didNadoro:false, category:'인사', date:TODAY,     isOwn:false },
  { id:'12', color:'#9FEBA4', content:'동네 고양이한테 간식 챙겨줬어요',      author:'@street_cat',   timeAgo:'7시간 전', nadoroCount:10, rotation: 1.5, didNadoro:false, category:'환경', date:TODAY,     isOwn:false },
  { id:'4',  color:'#FFE234', content:'카페 테이블 닦고\n나왔어요',           author:MY_ID,           timeAgo:'1시간 전', nadoroCount:5,  rotation: 2.2, didNadoro:false, category:'배려', date:TODAY,     isOwn:true  },
  { id:'7',  color:'#FFE234', content:'엘리베이터 문\n잡아드렸어요',          author:MY_ID,           timeAgo:'3시간 전', nadoroCount:8,  rotation:-2.7, didNadoro:false, category:'도움', date:TODAY,     isOwn:true  },
  { id:'d1', color:'#7EDDD7', content:'동네 공원\n쓰레기 봉사했어요',         author:MY_ID,           timeAgo:'어제',     nadoroCount:0,  rotation:-0.7, didNadoro:false, category:'환경', date:YESTERDAY, isOwn:true  },
  { id:'d2', color:'#FFE234', content:'앞사람 커피값\n몰래 냈어요',           author:MY_ID,           timeAgo:'어제',     nadoroCount:0,  rotation: 1.6, didNadoro:false, category:'나눔', date:YESTERDAY, isOwn:true  },
  { id:'d3', color:'#FF9DBB', content:'길고양이한테\n간식 챙겨줬어요',        author:MY_ID,           timeAgo:'어제',     nadoroCount:0,  rotation:-2.1, didNadoro:false, category:'환경', date:YESTERDAY, isOwn:true  },
  { id:'d4', color:'#FF9DBB', content:'버스 기사님께\n감사 인사 했어요',      author:MY_ID,           timeAgo:'이틀 전',  nadoroCount:0,  rotation:-2.0, didNadoro:false, category:'인사', date:TWO_AGO,   isOwn:true  },
  { id:'d5', color:'#7EDDD7', content:'우산 나눠\n써드렸어요',               author:MY_ID,           timeAgo:'이틀 전',  nadoroCount:0,  rotation: 1.3, didNadoro:false, category:'나눔', date:TWO_AGO,   isOwn:true  },
  { id:'d6', color:'#FFE234', content:'무거운 짐\n들어드렸어요',             author:MY_ID,           timeAgo:'사흘 전',  nadoroCount:0,  rotation: 0.5, didNadoro:false, category:'도움', date:THREE_AGO, isOwn:true  },
  { id:'h01', color:'#7EDDD7', content:'쓰레기 줍기 봉사',        author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 1.2, didNadoro:false, category:'환경', date:'2026-08-03', isOwn:true },
  { id:'h02', color:'#FF9DBB', content:'노인정 방문 봉사',        author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-1.5, didNadoro:false, category:'도움', date:'2026-08-02', isOwn:true },
  { id:'h03', color:'#FFE234', content:'후배 밥 사줬어요',        author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 0.8, didNadoro:false, category:'나눔', date:'2026-08-02', isOwn:true },
  { id:'h04', color:'#C6A8F5', content:'택배 기사님께 음료 드림', author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-0.9, didNadoro:false, category:'배려', date:'2026-07-31', isOwn:true },
  { id:'h05', color:'#9FEBA4', content:'공원 꽃 물주기',          author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 2.0, didNadoro:false, category:'환경', date:'2026-07-31', isOwn:true },
  { id:'h06', color:'#FFE234', content:'길 안내 도움',            author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-1.1, didNadoro:false, category:'도움', date:'2026-07-30', isOwn:true },
  { id:'h07', color:'#FF9DBB', content:'주차 도움드렸어요',       author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 1.4, didNadoro:false, category:'도움', date:'2026-07-28', isOwn:true },
  { id:'h08', color:'#FFBA80', content:'이웃 택배 대신 받음',     author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-0.6, didNadoro:false, category:'배려', date:'2026-07-27', isOwn:true },
  { id:'h09', color:'#7EDDD7', content:'재활용 분리수거 도움',    author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 0.3, didNadoro:false, category:'환경', date:'2026-07-25', isOwn:true },
  { id:'h10', color:'#FFE234', content:'헌혈했어요',              author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-2.2, didNadoro:false, category:'나눔', date:'2026-07-25', isOwn:true },
  { id:'h11', color:'#C6A8F5', content:'복지관 봉사활동',         author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 1.7, didNadoro:false, category:'도움', date:'2026-07-25', isOwn:true },
  { id:'h12', color:'#FF9DBB', content:'카페 의자 정리해드림',    author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-1.3, didNadoro:false, category:'배려', date:'2026-07-22', isOwn:true },
  { id:'h13', color:'#9FEBA4', content:'길고양이 밥 챙김',        author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 0.9, didNadoro:false, category:'환경', date:'2026-07-20', isOwn:true },
  { id:'h14', color:'#FFE234', content:'새치기 양보',             author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-0.4, didNadoro:false, category:'배려', date:'2026-07-19', isOwn:true },
  { id:'h15', color:'#7EDDD7', content:'장애인 도보 동행',        author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 2.1, didNadoro:false, category:'도움', date:'2026-07-19', isOwn:true },
  { id:'h16', color:'#FFBA80', content:'음식 나눔 행사 참가',     author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-1.8, didNadoro:false, category:'나눔', date:'2026-07-16', isOwn:true },
  { id:'h17', color:'#FF9DBB', content:'폭염에 생수 나눔',        author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 0.6, didNadoro:false, category:'나눔', date:'2026-07-14', isOwn:true },
  { id:'h18', color:'#C6A8F5', content:'어르신 짐 들어드림',      author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-0.7, didNadoro:false, category:'도움', date:'2026-07-12', isOwn:true },
  { id:'h19', color:'#FFE234', content:'아이 미아 신고 도움',     author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 1.5, didNadoro:false, category:'도움', date:'2026-07-10', isOwn:true },
  { id:'h20', color:'#9FEBA4', content:'나무 물 주기',            author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-1.0, didNadoro:false, category:'환경', date:'2026-07-07', isOwn:true },
  { id:'h21', color:'#FF9DBB', content:'반찬 나눔 이웃',          author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 0.2, didNadoro:false, category:'나눔', date:'2026-07-07', isOwn:true },
  { id:'h22', color:'#7EDDD7', content:'우산 양보',               author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-2.0, didNadoro:false, category:'배려', date:'2026-07-04', isOwn:true },
  { id:'h23', color:'#FFE234', content:'공중화장실 청소',         author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 1.3, didNadoro:false, category:'환경', date:'2026-07-01', isOwn:true },
  { id:'h24', color:'#FFBA80', content:'식사비 익명 후원',        author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-0.8, didNadoro:false, category:'나눔', date:'2026-06-28', isOwn:true },
  { id:'h25', color:'#C6A8F5', content:'독거노인 말벗',           author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 1.1, didNadoro:false, category:'도움', date:'2026-06-25', isOwn:true },
  { id:'h26', color:'#FF9DBB', content:'지하철 자리 양보',        author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-1.4, didNadoro:false, category:'배려', date:'2026-06-22', isOwn:true },
  { id:'h27', color:'#9FEBA4', content:'산책로 쓰레기 줍기',      author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 0.7, didNadoro:false, category:'환경', date:'2026-06-20', isOwn:true },
  { id:'h28', color:'#FFE234', content:'화재 신고 도움',          author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-1.6, didNadoro:false, category:'도움', date:'2026-06-18', isOwn:true },
  { id:'h29', color:'#7EDDD7', content:'옷 기부',                 author:MY_ID, timeAgo:'', nadoroCount:0, rotation: 2.0, didNadoro:false, category:'나눔', date:'2026-06-15', isOwn:true },
  { id:'h30', color:'#FFBA80', content:'유기견 임시보호',         author:MY_ID, timeAgo:'', nadoroCount:0, rotation:-0.5, didNadoro:false, category:'환경', date:'2026-06-12', isOwn:true },
]

/* ─── SVG Icons ──────────────────────────────────────────────── */
function IconWall({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="0.5"/>
      <rect x="12" y="2" width="8" height="8" rx="0.5"/>
      <rect x="2" y="12" width="8" height="8" rx="0.5"/>
      <rect x="12" y="12" width="8" height="8" rx="0.5"/>
    </svg>
  )
}
function IconStar({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M11 2l2.5 6H20l-5 3.6 1.9 6.4L11 14.4 5.1 18 7 11.6 2 8h6.5L11 2z"/>
    </svg>
  )
}
function IconBook({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M2 4h8c1.1 0 2 .9 2 2v13c0-1.1-.9-2-2-2H2V4z"/>
      <path d="M20 4h-8c-1.1 0-2 .9-2 2v13c0-1.1.9-2 2-2h8V4z"/>
    </svg>
  )
}
function IconSearch({ size = 18, color = INK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="9" r="6"/>
      <path d="M13.5 13.5L18 18"/>
    </svg>
  )
}
function IconCamera({ size = 20, color = INK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6C2 4.9 2.9 4 4 4h1.5L7 2h8l1.5 2H18c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6z"/>
      <circle cx="11" cy="11" r="3.5"/>
    </svg>
  )
}
function IconClose({ size = 14, color = INK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <path d="M2 2l10 10M12 2L2 12"/>
    </svg>
  )
}
function IconArrowLeft({ size = 18, color = WHITE }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L6 9l6 6"/>
    </svg>
  )
}

/* ─── Grain overlay ──────────────────────────────────────────── */
function Grain({ opacity = 0.055 }: { opacity?: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
      backgroundImage: GRAIN, opacity, mixBlendMode: 'overlay' as const,
    }} />
  )
}

/* ─── Tack pin ───────────────────────────────────────────────── */
function Tack({ color }: { color: string }) {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: '50%',
      background: color, border: `1.5px solid ${INK}`,
      boxShadow: '1px 1px 0 rgba(0,0,0,0.4)',
    }} />
  )
}

/* ─── PostItCard ─────────────────────────────────────────────── */
function PostItCard({
  post, onNadoro, sizeV = 'md', fresh, onCardClick,
}: {
  post: Post
  onNadoro?: (id: string) => void
  sizeV?: SizeV
  fresh?: boolean
  onCardClick?: (post: Post) => void
}) {
  const cfg = SIZE_CFG[sizeV]
  const hasPhoto = !!post.photo
  const cardMinH = hasPhoto ? cfg.minH + PHOTO_H : cfg.minH

  return (
    <div
      className={fresh ? 'postit-pop' : ''}
      style={{
        '--rot': `${post.rotation}deg`,
        background: post.color,
        border: BORDER,
        boxShadow: HS,
        transform: `rotate(${post.rotation}deg)`,
        position: 'relative',
        width: cfg.w,
        minHeight: cardMinH,
        padding: 0,
        borderRadius: '2px',
        cursor: onCardClick ? 'pointer' : 'default',
        userSelect: 'none',
        overflow: 'hidden',
        display: 'flex',
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

        {onNadoro && !post.isOwn && (
          <button
            onClick={e => { e.stopPropagation(); e.preventDefault(); onNadoro(post.id) }}
            onPointerDown={e => e.stopPropagation()}
            style={{
              minWidth: 40, height: 40, borderRadius: '1px',
              background: post.didNadoro ? INK : WHITE,
              border: BORDER,
              boxShadow: post.didNadoro ? 'none' : HS_SM,
              color: post.didNadoro ? WHITE : INK,
              cursor: 'pointer',
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
function PostDetailModal({ post, onClose, onViewProfile, onNadoro }: {
  post: Post
  onClose: () => void
  onViewProfile: (authorId: string) => void
  onNadoro?: (id: string) => void
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 400, backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-in" style={{ width: '100%', maxWidth: 480, background: WHITE, border: BORDER, borderBottom: 'none', boxShadow: `0 -6px 0 ${INK}`, borderRadius: '4px 4px 0 0', maxHeight: '88vh', overflowY: 'auto' }}>
        {/* Color bar */}
        <div style={{ height: 10, background: post.color, borderBottom: BORDER }} />

        <div style={{ padding: '0 20px 40px' }}>
          <div style={{ width: 36, height: 4, borderRadius: '2px', background: 'rgba(10,10,10,0.15)', margin: '14px auto 18px' }} />

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{
              fontSize: '11px', background: post.color, color: INK,
              padding: '4px 14px', border: BORDER, borderRadius: '2px',
              fontFamily: BODY, fontWeight: 700, boxShadow: HS_SM,
            }}>{post.category}</span>
            <button onClick={onClose} style={{ width: 32, height: 32, border: BORDER, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: HS_SM, borderRadius: '2px' }}>
              <IconClose size={13} />
            </button>
          </div>

          {/* Photo */}
          {post.photo && (
            <div style={{ border: BORDER, borderRadius: '2px', overflow: 'hidden', marginBottom: 18 }}>
              <img src={post.photo} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Repost badge */}
          {post.isRepost && post.repostFrom && (
            <div style={{ background: INK, color: WHITE, padding: '5px 12px', marginBottom: 12, fontSize: '10px', fontFamily: BODY, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: '2px' }}>
              ↗ {post.repostFrom}님과 공동 선행
            </div>
          )}

          {/* Content */}
          <p style={{ fontFamily: BODY, fontSize: '20px', fontWeight: 700, color: INK, lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: '0 0 12px' }}>{post.content}</p>

          <div style={{ fontFamily: BODY, fontSize: '12px', color: 'rgba(10,10,10,0.38)', fontWeight: 500, marginBottom: 22 }}>{post.timeAgo}</div>

          {/* Divider */}
          <div style={{ height: 2, background: 'rgba(10,10,10,0.1)', marginBottom: 18 }} />

          {/* Nadoro row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ fontFamily: BODY, fontSize: '14px', fontWeight: 600, color: INK }}>
              나도요 <span style={{ fontFamily: DISP, fontSize: '26px', color: INK }}>{post.nadoroCount}</span>명
            </div>
            {!post.isOwn && onNadoro && (
              <button
                onClick={() => onNadoro(post.id)}
                style={{
                  padding: '9px 22px', background: post.didNadoro ? INK : post.color,
                  border: BORDER, boxShadow: HS_SM,
                  fontFamily: DISP, fontSize: '16px', color: post.didNadoro ? WHITE : INK,
                  cursor: 'pointer', borderRadius: '2px', transition: 'all 0.12s ease',
                }}
              >{post.didNadoro ? '취소' : '나도요!'}</button>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 2, background: 'rgba(10,10,10,0.1)', marginBottom: 18 }} />

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: DISP, fontSize: '19px', color: INK }}>{post.author}</div>
              <div style={{ fontFamily: BODY, fontSize: '11px', color: 'rgba(10,10,10,0.38)', fontWeight: 500, marginTop: 2 }}>게시자</div>
            </div>
            <button
              onClick={() => { onClose(); onViewProfile(post.author) }}
              style={{
                padding: '9px 18px', background: '#FFE234', border: BORDER, boxShadow: HS_SM,
                fontFamily: BODY, fontSize: '13px', fontWeight: 700, color: INK,
                cursor: 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.12s ease',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = `4px 4px 0 ${INK}` }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = HS_SM }}
            >
              프로필 보기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Diary Page Entry ───────────────────────────────────────── */
/* ─── Profile View ───────────────────────────────────────────── */
function ProfileView({ authorId, allPosts, onClose }: {
  authorId: string
  allPosts: Post[]
  onClose: () => void
}) {
  const isMe = authorId === MY_ID
  const authorPosts = allPosts.filter(p => p.author === authorId && !p.isRepost)
  const dates = [...new Set(authorPosts.map(p => p.date))].sort((a, b) => b.localeCompare(a))
  const [selDate, setSelDate] = useState(() => dates[0] ?? TODAY)
  const profileGrid = useMemo(() => buildContribGrid(authorPosts, 18), [authorPosts])
  const grassRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (grassRef.current) grassRef.current.scrollLeft = grassRef.current.scrollWidth
  }, [])

  const entries = authorPosts.filter(p => p.date === selDate)
  const prevDate = dates.find(d => d < selDate) ?? null
  const nextDate = [...dates].reverse().find(d => d > selDate) ?? null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(10,10,10,0.8)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-in" style={{ width: '100%', maxWidth: 480, height: '92vh', background: INK, border: BORDER, borderBottom: 'none', boxShadow: `0 -8px 0 ${INK}, -4px 0 0 ${INK}, 4px 0 0 ${INK}`, borderRadius: '6px 6px 0 0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: INK, flexShrink: 0, borderBottom: BORDER, padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={onClose} style={{ background: 'transparent', border: BORDER, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '2px', boxShadow: '2px 2px 0 rgba(250,250,250,0.08)', flexShrink: 0 }}>
              <IconArrowLeft size={16} />
            </button>
            <div>
              <div style={{ fontFamily: DISP, color: WHITE, fontSize: '22px', lineHeight: 1 }}>{authorId}</div>
              <div style={{ fontFamily: BODY, fontSize: '11px', color: 'rgba(250,250,250,0.38)', marginTop: 4, fontWeight: 500 }}>
                {isMe ? '나의 선행 다이어리' : '공개 선행 다이어리'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontFamily: BODY, fontSize: '11px', color: 'rgba(250,250,250,0.32)', fontWeight: 600 }}>
              총 {authorPosts.length}개
            </div>
          </div>
        </div>

        {/* 잔디밭 */}
        <div style={{ background: INK, flexShrink: 0, borderBottom: BORDER, padding: '12px 16px 13px' }}>
          <div style={{ fontFamily: BODY, fontSize: '10px', color: 'rgba(250,250,250,0.35)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.4px' }}>선행 잔디밭</div>
          <div ref={grassRef} style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: CGAP }}>
              <div style={{ display: 'flex', marginLeft: 22 }}>
                {profileGrid.map((week, wi) => (
                  <div key={wi} style={{ width: CSLOT, flexShrink: 0, fontSize: '9px', fontFamily: BODY, fontWeight: 700, color: week.monthLabel ? 'rgba(250,250,250,0.5)' : 'transparent', lineHeight: 1, paddingBottom: 3 }}>
                    {week.monthLabel ?? '.'}
                  </div>
                ))}
              </div>
              {[0,1,2,3,4,5,6].map(dayIdx => (
                <div key={dayIdx} style={{ display: 'flex', alignItems: 'center', gap: CGAP }}>
                  <div style={{ width: 16, fontSize: '9px', fontFamily: BODY, fontWeight: 700, color: 'rgba(250,250,250,0.35)', textAlign: 'right', flexShrink: 0, lineHeight: 1, paddingRight: 4 }}>
                    {[0,2,4].includes(dayIdx) ? DAY_LABELS[dayIdx] : ''}
                  </div>
                  {profileGrid.map((week, wi) => {
                    const cell = week.days[dayIdx]
                    const isSelected = cell.dateStr === selDate
                    return (
                      <button key={wi}
                        onClick={() => !cell.isFuture && setSelDate(cell.dateStr)}
                        style={{
                          width: CELL, height: CELL, flexShrink: 0,
                          background: cell.isFuture ? 'transparent' : grassColor(cell.count),
                          border: isSelected ? '2px solid #FFE234' : cell.isToday ? '2px solid rgba(250,250,250,0.5)' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '2px', cursor: cell.isFuture ? 'default' : 'pointer',
                          padding: 0, transition: 'transform 0.1s ease', boxSizing: 'border-box',
                        }}
                        onMouseEnter={e => { if (!cell.isFuture) (e.currentTarget as HTMLElement).style.transform = 'scale(1.4)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: BODY, fontSize: '9px', color: 'rgba(250,250,250,0.3)', fontWeight: 600 }}>적음</span>
            {GRASS_COLORS.map((c, i) => (
              <div key={i} style={{ width: CELL, height: CELL, background: c, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px' }} />
            ))}
            <span style={{ fontFamily: BODY, fontSize: '9px', color: 'rgba(250,250,250,0.3)', fontWeight: 600 }}>많음</span>
          </div>
        </div>

        {/* Notebook page */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Spiral binding */}
          <div style={{ width: 30, background: '#1A1A1A', borderRight: BORDER, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 13, flexShrink: 0, overflowY: 'hidden' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(150,150,150,0.32)', background: '#111', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.85)', flexShrink: 0 }} />
            ))}
          </div>

          {/* Scrollable page */}
          <div style={{ flex: 1, overflowY: 'auto', background: PAPER_BG, backgroundImage: PAPER_RULE, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 38, top: 0, bottom: 0, width: 1, background: 'rgba(200,50,40,0.2)', pointerEvents: 'none' }} />
            <div style={{ padding: '20px 14px 28px 10px', position: 'relative', zIndex: 2 }}>
              <div style={{ marginBottom: 18, paddingLeft: 10 }}>
                <div style={{ fontFamily: DISP, fontSize: '20px', color: INK, paddingBottom: 6, borderBottom: '2px solid rgba(10,10,10,0.12)', display: 'inline-block' }}>
                  {selDate ? fmtDate(selDate) : '날짜 선택'}
                </div>
                {entries.length > 0 && (
                  <div style={{ fontFamily: BODY, fontSize: '11px', color: 'rgba(10,10,10,0.32)', marginTop: 5, fontWeight: 500 }}>{entries.length}개의 선행</div>
                )}
              </div>

              {dates.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 36, paddingLeft: 24 }}>
                  <div style={{ fontFamily: DISP, fontSize: '16px', color: INK, opacity: 0.2 }}>아직 기록이 없어요</div>
                </div>
              ) : entries.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 36, paddingLeft: 24 }}>
                  <div style={{ fontFamily: DISP, fontSize: '16px', color: INK, opacity: 0.2 }}>이 날의 기록이 없어요</div>
                  <div style={{ fontFamily: BODY, fontSize: '11px', color: INK, opacity: 0.15, marginTop: 6, fontWeight: 500 }}>잔디밭에서 다른 날을 선택해봐요</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 14px', paddingLeft: 2, paddingTop: 14 }}>
                  {entries.map((post, idx) => {
                    const v: SizeV = SIZE_CYCLE[idx % SIZE_CYCLE.length]
                    const tapeRot = (hashNum(post.id, 7) - 0.5) * 12
                    return (
                      <div key={post.id} style={{ position: 'relative', marginTop: 14 }}>
                        <div style={{
                          position: 'absolute', top: -10, left: '50%',
                          transform: `translateX(-50%) rotate(${tapeRot}deg)`,
                          width: 50, height: 14, background: post.color, opacity: 0.82,
                          border: '1px solid rgba(0,0,0,0.1)', borderRadius: '1px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)', zIndex: 2,
                        }} />
                        <PostItCard post={post} sizeV={v} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date nav — jumps between dates that actually have posts */}
        <div style={{ background: INK, borderTop: BORDER, flexShrink: 0, display: 'flex', alignItems: 'stretch' }}>
          <button
            disabled={!prevDate}
            onClick={() => prevDate && setSelDate(prevDate)}
            style={{
              flex: 1, padding: '10px 8px', background: 'transparent', border: 'none', borderRight: BORDER,
              cursor: prevDate ? 'pointer' : 'not-allowed',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 2, paddingLeft: 14,
            }}
          >
            <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: prevDate ? 'rgba(250,250,250,0.4)' : 'rgba(250,250,250,0.15)' }}>← 이전 날</span>
            <span style={{ fontFamily: DISP, fontSize: '13px', color: prevDate ? WHITE : 'rgba(250,250,250,0.2)' }}>{prevDate ? fmtDate(prevDate) : '—'}</span>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 12px', minWidth: 110 }}>
            <span style={{ fontFamily: DISP, fontSize: '18px', color: WHITE, lineHeight: 1 }}>
              {selDate ? fmtDate(selDate).replace(' (오늘)', '').replace(' (어제)', '') : '—'}
            </span>
            {selDate === TODAY && <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: '#FFE234', marginTop: 3 }}>오늘</span>}
            {selDate === YESTERDAY && <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: '#7EDDD7', marginTop: 3 }}>어제</span>}
          </div>
          <button
            disabled={!nextDate}
            onClick={() => nextDate && setSelDate(nextDate)}
            style={{
              flex: 1, padding: '10px 8px', background: 'transparent', border: 'none', borderLeft: BORDER,
              cursor: nextDate ? 'pointer' : 'not-allowed',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 2, paddingRight: 14,
            }}
          >
            <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: nextDate ? 'rgba(250,250,250,0.4)' : 'rgba(250,250,250,0.15)' }}>다음 날 →</span>
            <span style={{ fontFamily: DISP, fontSize: '13px', color: nextDate ? WHITE : 'rgba(250,250,250,0.2)' }}>{nextDate ? fmtDate(nextDate) : '—'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Today Summary Strip ────────────────────────────────────── */
function TodaySummary({ posts }: { posts: Post[] }) {
  const today = posts.filter(p => p.date === TODAY)
  const nadoro = today.reduce((s, p) => s + p.nadoroCount, 0)
  const cats = today.reduce((a, p) => { a[p.category] = (a[p.category] || 0) + 1; return a }, {} as Record<string,number>)
  const top = Object.entries(cats).sort(([,a],[,b]) => b-a)[0]?.[0] ?? '—'
  const items = [
    { label: '오늘 선행', value: `${today.length}개`, bg: '#FFE234' },
    { label: '나도요!',   value: `${nadoro}번`,       bg: '#FF9DBB' },
    { label: '인기 분류', value: top,                  bg: '#7EDDD7' },
  ]
  return (
    <div style={{ display: 'flex', borderTop: BORDER }}>
      {items.map((item, i) => (
        <div key={item.label} style={{
          flex: 1, padding: '8px 10px',
          background: item.bg, borderRight: i < 2 ? BORDER : 'none',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <span style={{ fontFamily: DISP, fontSize: '16px', color: INK, lineHeight: 1 }}>{item.value}</span>
          <span style={{ fontFamily: BODY, fontSize: '9px', color: INK, opacity: 0.6, fontWeight: 600 }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Wall Tab ───────────────────────────────────────────────── */
function WallTab({ posts, onNadoro, onSelectPost }: {
  posts: Post[]
  onNadoro: (id: string) => void
  onSelectPost: (post: Post) => void
}) {
  const [query, setQuery]   = useState('')
  const [catFilter, setCat] = useState<string>('전체')
  const searchRef = useRef<HTMLInputElement>(null)

  const wallPosts = useMemo(() => {
    let list = posts.filter(p => !p.isRepost && p.date === TODAY)
    if (catFilter !== '전체') list = list.filter(p => p.category === catFilter)
    const q = query.trim().toLowerCase()
    if (q) list = list.filter(p => p.content.toLowerCase().includes(q) || p.author.toLowerCase().includes(q))
    return list
  }, [posts, catFilter, query])

  const { items, canvasW, canvasH } = useScatteredLayout(wallPosts)

  const containerRef  = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 375, h: 600 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging   = useRef(false)
  const dragOrigin = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const dragDist   = useRef(0)
  const centeredOnce = useRef(false)

  // Center the canvas when layout is ready
  useEffect(() => {
    if (!centeredOnce.current && containerSize.w > 100 && canvasW > 0) {
      centeredOnce.current = true
      const cx = -Math.max(0, Math.floor((canvasW - containerSize.w) / 2))
      setOffset({ x: cx, y: 0 })
    }
  }, [containerSize.w, canvasW])

  // Reset to center when filter/search changes
  useEffect(() => {
    if (!centeredOnce.current) return
    const cx = -Math.max(0, Math.floor((canvasW - containerSize.w) / 2))
    setOffset({ x: cx, y: 0 })
  }, [catFilter, query])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => setContainerSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const clamp = useCallback((ox: number, oy: number) => ({
    x: Math.min(0, Math.max(Math.min(0, containerSize.w - canvasW), ox)),
    y: Math.min(0, Math.max(Math.min(0, containerSize.h - canvasH), oy)),
  }), [containerSize, canvasW, canvasH])

  const onPtrDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragDist.current = 0
    if ((e.target as HTMLElement).closest('button,input')) return
    dragging.current  = true
    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPtrMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - dragOrigin.current.mx
    const dy = e.clientY - dragOrigin.current.my
    dragDist.current = Math.hypot(dx, dy)
    setOffset(clamp(dragOrigin.current.ox + dx, dragOrigin.current.oy + dy))
  }
  const onPtrUp = (e: React.PointerEvent) => {
    const wasDrag = dragDist.current >= 8
    dragging.current = false
    if (wasDrag) return
    // Tap detected — find the card under the pointer using elementFromPoint
    // (pointer capture means e.target is the container, not the actual card)
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    if (!el || el.closest('button')) return
    const cardEl = el.closest('[data-postid]') as HTMLElement | null
    if (!cardEl) return
    const postId = cardEl.dataset.postid
    const found = items.find(it => it.post.id === postId)
    if (found) onSelectPost(found.post)
  }

  const STEP = S_COL_SLOT
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      const dirs: Record<string,[number,number]> = {
        ArrowLeft:[STEP,0], ArrowRight:[-STEP,0], ArrowUp:[0,STEP], ArrowDown:[0,-STEP],
      }
      const d = dirs[e.key]
      if (!d) return
      e.preventDefault()
      setOffset(prev => clamp(prev.x + d[0], prev.y + d[1]))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clamp, STEP])

  const allCats = ['전체', ...CATEGORIES]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: INK, flexShrink: 0 }}>
        <div style={{ padding: '14px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(250,250,250,0.1)' }}>
          <h1 style={{ fontFamily: DISP, color: WHITE, fontSize: '28px', margin: 0, lineHeight: 1 }}>우리의 벽</h1>
          <div style={{ display: 'flex', gap: 6 }}>
            {['←','→'].map(a => (
              <div key={a} style={{ width: 28, height: 28, border: '2px solid rgba(250,250,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'rgba(250,250,250,0.35)', fontFamily: BODY, borderRadius: '2px' }}>{a}</div>
            ))}
          </div>
        </div>

        <div style={{ padding: '10px 16px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: WHITE, border: BORDER, borderRadius: '2px', padding: '0 10px', height: 38 }}>
            <IconSearch size={16} color="rgba(10,10,10,0.4)" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="검색어 입력..."
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: BODY, fontSize: '13px', fontWeight: 600, color: INK }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                <IconClose size={12} color="rgba(10,10,10,0.4)" />
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 7, padding: '10px 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {allCats.map(cat => {
            const active = catFilter === cat
            const accentBg = cat === '전체' ? '#FFE234' : (CAT_COLOR[cat] ?? '#FFE234')
            return (
              <button key={cat} onClick={() => setCat(cat)} style={{
                padding: '5px 12px', borderRadius: '2px', flexShrink: 0,
                background: active ? accentBg : 'transparent',
                border: active ? BORDER : '2px solid rgba(250,250,250,0.22)',
                boxShadow: active ? HS_SM : 'none',
                cursor: 'pointer', fontFamily: BODY, fontSize: '11px', fontWeight: 700,
                color: active ? INK : 'rgba(250,250,250,0.55)',
                transform: active ? 'translateY(-1px)' : 'none',
                transition: 'all 0.12s ease',
              }}>{cat}</button>
            )
          })}
        </div>

        <TodaySummary posts={posts} />
      </div>

      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'hidden', cursor: 'grab', background: AURA, position: 'relative', userSelect: 'none', touchAction: 'none' }}
        onPointerDown={onPtrDown}
        onPointerMove={onPtrMove}
        onPointerUp={onPtrUp}
        onPointerLeave={() => { dragging.current = false }}
      >
        <Grain opacity={0.06} />

        {wallPosts.length === 0 ? (
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div style={{ width: 60, height: 60, border: `2px dashed rgba(10,10,10,0.25)`, borderRadius: '2px', background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSearch size={24} color="rgba(10,10,10,0.3)" />
            </div>
            <p style={{ fontFamily: DISP, color: INK, fontSize: '18px', opacity: 0.4, margin: 0 }}>검색 결과가 없어요</p>
            <button onClick={() => { setQuery(''); setCat('전체') }} style={{ padding: '7px 16px', background: INK, color: WHITE, border: 'none', fontFamily: BODY, fontWeight: 700, fontSize: '12px', cursor: 'pointer', borderRadius: '2px' }}>전체 보기</button>
          </div>
        ) : (
          <div style={{
            position: 'absolute', width: canvasW, height: canvasH,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: 'transform 0.06s ease-out',
            willChange: 'transform', zIndex: 2,
          }}>
            {items.map(({ post, v, x, y }) => (
              <div
                key={post.id}
                data-postid={post.id}
                style={{ position: 'absolute', left: x, top: y, cursor: 'pointer' }}
              >
                <PostItCard post={post} onNadoro={onNadoro} sizeV={v} />
              </div>
            ))}
          </div>
        )}

        {wallPosts.length > 0 && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 3, background: INK, color: WHITE, padding: '5px 12px', borderRadius: '1px', border: BORDER, fontSize: '10px', fontFamily: BODY, fontWeight: 600, boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>드래그 · 방향키</div>
        )}
      </div>
    </div>
  )
}

/* ─── Today Tab ──────────────────────────────────────────────── */
function TodayTab({ myPosts, onAdd, onSelectPost }: {
  myPosts: Post[]
  onAdd: () => void
  onSelectPost: (post: Post) => void
}) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: INK, flexShrink: 0, borderBottom: BORDER }}>
        <div style={{ padding: '14px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: DISP, color: WHITE, fontSize: '26px', margin: 0, lineHeight: 1 }}>오늘의 선행</h2>
            <p style={{ fontFamily: BODY, color: 'rgba(250,250,250,0.38)', fontSize: '11px', margin: '5px 0 0', fontWeight: 500 }}>
              오늘 실천 <strong style={{ color: '#7EDDD7' }}>{myPosts.length}</strong>개 · 자정에 초기화돼요
            </p>
          </div>
          <button onClick={onAdd} style={{
            width: 44, height: 44, borderRadius: '2px',
            background: '#FFE234', border: BORDER, boxShadow: HS_SM,
            fontSize: '26px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: INK, fontWeight: 900, lineHeight: 1,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px) translateX(-1px)'; el.style.boxShadow = `4px 4px 0 ${INK}` }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = HS_SM }}
          >+</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 16px 20px', background: AURA, position: 'relative' }}>
        <Grain opacity={0.06} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          {myPosts.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '72px' }} className="slide-up">
              <div style={{ width: 72, height: 72, border: `2px dashed rgba(10,10,10,0.25)`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: 'rgba(255,255,255,0.4)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.4">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <p style={{ fontFamily: DISP, color: INK, fontSize: '20px', margin: '0 0 8px', opacity: 0.5 }}>오늘의 첫 선행을 기록해볼까요?</p>
              <p style={{ fontFamily: BODY, color: INK, fontSize: '12px', margin: 0, opacity: 0.35, fontWeight: 500 }}>+ 버튼을 눌러 시작해요</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: '28px' }}>
              {myPosts.map(post => (
                <div key={post.id} style={{ overflow: 'visible' }}>
                  <PostItCard post={post} sizeV="md" fresh onCardClick={onSelectPost} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Diary Tab ──────────────────────────────────────────────── */
const CELL = 13
const CGAP = 3
const CSLOT = CELL + CGAP
const DAY_LABELS = ['월','화','수','목','금','토','일']

const PAPER_BG   = '#EDE6D3'
const PAPER_RULE = 'repeating-linear-gradient(transparent, transparent 31px, rgba(70,100,200,0.07) 31px, rgba(70,100,200,0.07) 32px)'

function DiaryTab({ myPosts, onSelectPost }: { myPosts: Post[]; onSelectPost: (post: Post) => void }) {
  const [selDate, setSelDate] = useState(TODAY)
  const grassRef = useRef<HTMLDivElement>(null)

  const entries = myPosts.filter(p => p.date === selDate)
  const streak  = calcStreak(myPosts)
  const grid    = useMemo(() => buildContribGrid(myPosts, 18), [myPosts])

  const prevDay = addDays(selDate, -1)
  const nextDay = addDays(selDate,  1)
  const earliest = addDays(TODAY, -120)
  const canPrev = selDate > earliest
  const canNext = selDate < TODAY

  useEffect(() => {
    if (grassRef.current) grassRef.current.scrollLeft = grassRef.current.scrollWidth
  }, [])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: INK }}>

      {/* Header */}
      <div style={{ background: INK, flexShrink: 0, borderBottom: BORDER }}>
        <div style={{ padding: '14px 18px 13px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: DISP, color: WHITE, fontSize: '30px', lineHeight: 1, letterSpacing: '-0.5px' }}>{MY_ID}</div>
            <div style={{ fontFamily: BODY, fontSize: '11px', color: 'rgba(250,250,250,0.38)', margin: '5px 0 0', fontWeight: 500 }}>선행 다이어리</div>
          </div>
          {streak > 0 && (
            <div style={{ flexShrink: 0, background: '#FFE234', border: BORDER, boxShadow: HS_SM, padding: '7px 13px', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <span style={{ fontFamily: DISP, fontSize: '20px', color: INK, lineHeight: 1 }}>{streak}일</span>
              <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: INK, opacity: 0.65 }}>연속 선행</span>
            </div>
          )}
        </div>
      </div>

      {/* Grass grid */}
      <div style={{ background: INK, flexShrink: 0, borderBottom: BORDER, padding: '12px 16px 14px' }}>
        <div style={{ fontFamily: BODY, fontSize: '10px', color: 'rgba(250,250,250,0.35)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.4px' }}>나의 선행 잔디밭</div>
        <div ref={grassRef} style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: CGAP }}>
            <div style={{ display: 'flex', marginLeft: 22 }}>
              {grid.map((week, wi) => (
                <div key={wi} style={{ width: CSLOT, flexShrink: 0, fontSize: '9px', fontFamily: BODY, fontWeight: 700, color: week.monthLabel ? 'rgba(250,250,250,0.5)' : 'transparent', lineHeight: 1, paddingBottom: 3 }}>
                  {week.monthLabel ?? '.'}
                </div>
              ))}
            </div>
            {[0,1,2,3,4,5,6].map(dayIdx => (
              <div key={dayIdx} style={{ display: 'flex', alignItems: 'center', gap: CGAP }}>
                <div style={{ width: 16, fontSize: '9px', fontFamily: BODY, fontWeight: 700, color: 'rgba(250,250,250,0.35)', textAlign: 'right', flexShrink: 0, lineHeight: 1, paddingRight: 4 }}>
                  {[0,2,4].includes(dayIdx) ? DAY_LABELS[dayIdx] : ''}
                </div>
                {grid.map((week, wi) => {
                  const cell = week.days[dayIdx]
                  const isSelected = cell.dateStr === selDate
                  return (
                    <button
                      key={wi}
                      title={`${fmtDate(cell.dateStr)}${cell.count > 0 ? ` · ${cell.count}개` : ''}`}
                      onClick={() => !cell.isFuture && setSelDate(cell.dateStr)}
                      style={{
                        width: CELL, height: CELL, flexShrink: 0,
                        background: cell.isFuture ? 'transparent' : grassColor(cell.count),
                        border: isSelected ? `2px solid #FFE234` : cell.isToday ? `2px solid rgba(250,250,250,0.5)` : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '2px', cursor: cell.isFuture ? 'default' : 'pointer',
                        padding: 0, transition: 'transform 0.1s ease', boxSizing: 'border-box',
                      }}
                      onMouseEnter={e => { if (!cell.isFuture) (e.currentTarget as HTMLElement).style.transform = 'scale(1.4)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: BODY, fontSize: '9px', color: 'rgba(250,250,250,0.3)', fontWeight: 600 }}>적음</span>
          {GRASS_COLORS.map((c, i) => (
            <div key={i} style={{ width: CELL, height: CELL, background: c, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          ))}
          <span style={{ fontFamily: BODY, fontSize: '9px', color: 'rgba(250,250,250,0.3)', fontWeight: 600 }}>많음</span>
        </div>
      </div>

      {/* Notebook page area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Spiral binding */}
        <div style={{ width: 30, background: '#1A1A1A', borderRight: BORDER, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 13, flexShrink: 0, overflowY: 'hidden' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(150,150,150,0.32)', background: '#111', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.85)', flexShrink: 0 }} />
          ))}
        </div>

        {/* Page content — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', background: PAPER_BG, backgroundImage: PAPER_RULE, position: 'relative' }}>
          {/* Red margin line */}
          <div style={{ position: 'absolute', left: 38, top: 0, bottom: 0, width: 1, background: 'rgba(200,50,40,0.2)', pointerEvents: 'none' }} />

          <div style={{ padding: '20px 14px 28px 10px', position: 'relative', zIndex: 2 }}>
            {/* Date heading */}
            <div style={{ marginBottom: 24, paddingLeft: 10 }}>
              <div style={{ fontFamily: DISP, fontSize: '22px', color: INK, paddingBottom: 6, borderBottom: '2px solid rgba(10,10,10,0.12)', display: 'inline-block' }}>
                {fmtDate(selDate)}
              </div>
              {entries.length > 0 && (
                <div style={{ fontFamily: BODY, fontSize: '11px', color: 'rgba(10,10,10,0.32)', marginTop: 5, fontWeight: 500 }}>
                  {entries.length}개의 선행 기록
                </div>
              )}
            </div>

            {entries.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 40, paddingLeft: 20 }}>
                <div style={{ fontFamily: DISP, fontSize: '18px', color: INK, opacity: 0.2 }}>이 날의 기록이 없어요</div>
                <div style={{ fontFamily: BODY, fontSize: '11px', color: INK, opacity: 0.15, marginTop: 6, fontWeight: 500 }}>다른 날을 눌러봐요</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 14px', paddingLeft: 2, paddingTop: 14, paddingBottom: 8 }}>
                {entries.map((post, idx) => {
                  const v: SizeV = SIZE_CYCLE[idx % SIZE_CYCLE.length]
                  const tapeRot = (hashNum(post.id, 7) - 0.5) * 12
                  return (
                    <div key={post.id} style={{ position: 'relative', marginTop: 14 }}>
                      <div style={{
                        position: 'absolute', top: -10, left: '50%',
                        transform: `translateX(-50%) rotate(${tapeRot}deg)`,
                        width: 50, height: 14, background: post.color, opacity: 0.82,
                        border: '1px solid rgba(0,0,0,0.1)', borderRadius: '1px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)', zIndex: 2,
                      }} />
                      <PostItCard post={post} sizeV={v} onCardClick={onSelectPost} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date navigation */}
      <div style={{ background: INK, borderTop: BORDER, flexShrink: 0, display: 'flex', alignItems: 'stretch' }}>
        <button
          disabled={!canPrev}
          onClick={() => canPrev && setSelDate(prevDay)}
          style={{
            flex: 1, padding: '10px 8px', background: 'transparent', border: 'none', borderRight: BORDER,
            cursor: canPrev ? 'pointer' : 'not-allowed',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 2, paddingLeft: 14,
          }}
        >
          <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: canPrev ? 'rgba(250,250,250,0.4)' : 'rgba(250,250,250,0.15)', letterSpacing: '0.3px' }}>← 이전 날</span>
          <span style={{ fontFamily: DISP, fontSize: '13px', color: canPrev ? WHITE : 'rgba(250,250,250,0.2)' }}>{fmtDate(prevDay)}</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 12px', minWidth: 120 }}>
          <span style={{ fontFamily: DISP, fontSize: '20px', color: WHITE, lineHeight: 1 }}>
            {fmtDate(selDate).replace(' (오늘)','').replace(' (어제)','')}
          </span>
          {selDate === TODAY && <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: '#FFE234', marginTop: 3 }}>오늘</span>}
          {selDate === YESTERDAY && <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: '#7EDDD7', marginTop: 3 }}>어제</span>}
        </div>
        <button
          disabled={!canNext}
          onClick={() => canNext && setSelDate(nextDay)}
          style={{
            flex: 1, padding: '10px 8px', background: 'transparent', border: 'none', borderLeft: BORDER,
            cursor: canNext ? 'pointer' : 'not-allowed',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 2, paddingRight: 14,
          }}
        >
          <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: 700, color: canNext ? 'rgba(250,250,250,0.4)' : 'rgba(250,250,250,0.15)', letterSpacing: '0.3px' }}>다음 날 →</span>
          <span style={{ fontFamily: DISP, fontSize: '13px', color: canNext ? WHITE : 'rgba(250,250,250,0.2)' }}>{fmtDate(nextDay)}</span>
        </button>
      </div>
    </div>
  )
}

/* ─── Swatch ─────────────────────────────────────────────────── */
function Swatch({ hex, selected, onClick }: { hex: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 30, height: 30, background: hex, cursor: 'pointer', flexShrink: 0,
      border: selected ? `2px solid ${INK}` : `2px solid transparent`,
      boxShadow: selected ? `2px 2px 0 ${INK}` : 'none',
      borderRadius: '2px',
      transform: selected ? 'translateY(-2px)' : 'none',
      transition: 'all 0.12s ease',
    }} />
  )
}

/* ─── Add Modal ──────────────────────────────────────────────── */
function AddModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (content: string, color: string, category: string, photo?: string) => void
}) {
  const [content, setContent]         = useState('')
  const [color, setColor]             = useState(DEFAULT_COLORS[0])
  const [showPalette, setShowPalette] = useState(false)
  const [category, setCategory]       = useState<BaseCategory>('배려')
  const [customCat, setCustomCat]     = useState('')
  const [photo, setPhoto]             = useState<string | null>(null)
  const textRef  = useRef<HTMLTextAreaElement>(null)
  const fileRef  = useRef<HTMLInputElement>(null)

  useEffect(() => { textRef.current?.focus() }, [])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const finalCat = category === '기타' && customCat.trim() ? customCat.trim() : category
  const ok = content.trim().length > 0 && (category !== '기타' || customCat.trim().length > 0)

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.72)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-in" style={{ width: '100%', maxWidth: 480, background: WHITE, border: BORDER, borderBottom: 'none', boxShadow: `0 -6px 0 ${INK}`, padding: '10px 20px 36px', borderRadius: '4px 4px 0 0', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: '2px', background: 'rgba(10,10,10,0.15)', margin: '12px auto 18px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: DISP, color: INK, fontSize: '22px', margin: 0 }}>새 선행 기록</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, border: BORDER, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: HS_SM, borderRadius: '2px' }}>
            <IconClose size={13} />
          </button>
        </div>

        <p style={{ fontFamily: BODY, fontSize: '11px', color: INK, margin: '0 0 8px', fontWeight: 700, opacity: 0.5, letterSpacing: '0.5px' }}>선행 분류</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: category === '기타' ? 8 : 18, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '7px 14px', borderRadius: '2px', background: category === cat ? (CAT_COLOR[cat] ?? '#FFE234') : 'transparent', border: BORDER, boxShadow: category === cat ? HS_SM : 'none', cursor: 'pointer', fontFamily: BODY, fontSize: '12px', fontWeight: 700, color: INK, transform: category === cat ? 'translateY(-1px)' : 'none', transition: 'all 0.12s ease' }}>{cat}</button>
          ))}
        </div>
        {category === '기타' && (
          <div style={{ marginBottom: 16 }}>
            <input type="text" value={customCat} onChange={e => setCustomCat(e.target.value.slice(0,5))} placeholder="분류 직접 입력 (최대 5글자)" maxLength={5}
              style={{ width: '100%', padding: '10px 14px', background: 'transparent', border: BORDER, color: INK, fontFamily: BODY, fontSize: '14px', fontWeight: 600, outline: 'none', borderRadius: '2px' }} />
            <div style={{ textAlign: 'right', fontSize: '10px', color: INK, fontFamily: BODY, opacity: 0.4, marginTop: 4, fontWeight: 600 }}>{customCat.length}/5글자</div>
          </div>
        )}

        <p style={{ fontFamily: BODY, fontSize: '11px', color: INK, margin: '0 0 10px', fontWeight: 700, opacity: 0.5, letterSpacing: '0.5px' }}>사진 첨부 <span style={{ fontWeight: 400, opacity: 0.6 }}>(선택)</span></p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
        {photo ? (
          <div style={{ position: 'relative', border: BORDER, borderRadius: '2px', overflow: 'hidden', marginBottom: 18 }}>
            <img src={photo} alt="첨부 사진 미리보기" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
            <button onClick={() => setPhoto(null)} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: INK, border: '2px solid rgba(250,250,250,0.5)', borderRadius: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconClose size={12} color={WHITE} />
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()} style={{ width: '100%', height: 76, border: `2px dashed rgba(10,10,10,0.25)`, borderRadius: '2px', background: 'rgba(10,10,10,0.03)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, transition: 'background 0.12s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,10,10,0.07)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(10,10,10,0.03)' }}
          >
            <IconCamera size={20} color="rgba(10,10,10,0.35)" />
            <span style={{ fontFamily: BODY, fontSize: '13px', fontWeight: 600, color: 'rgba(10,10,10,0.4)' }}>사진 추가하기</span>
          </button>
        )}

        <p style={{ fontFamily: BODY, fontSize: '11px', color: INK, margin: '0 0 10px', fontWeight: 700, opacity: 0.5, letterSpacing: '0.5px' }}>색상</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: showPalette ? 8 : 18, flexWrap: 'wrap' }}>
          {DEFAULT_COLORS.map(hex => (
            <div key={hex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Swatch hex={hex} selected={color === hex} onClick={() => setColor(hex)} />
              <span style={{ fontSize: '8px', fontFamily: BODY, fontWeight: 700, color: INK, opacity: 0.5 }}>{COLOR_NAMES[hex]}</span>
            </div>
          ))}
          <button onClick={() => setShowPalette(s => !s)} style={{ width: 30, height: 30, border: `2px dashed rgba(10,10,10,0.35)`, background: showPalette ? 'rgba(10,10,10,0.08)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', borderRadius: '2px', transition: 'background 0.12s' }}>+</button>
          {!DEFAULT_COLORS.includes(color) && <Swatch hex={color} selected onClick={() => {}} />}
        </div>
        {showPalette && (
          <div className="palette-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '12px 14px', background: 'rgba(10,10,10,0.05)', border: BORDER, borderRadius: '2px', marginBottom: 16 }}>
            {PALETTE_COLORS.map(hex => <Swatch key={hex} hex={hex} selected={color === hex} onClick={() => { setColor(hex); setShowPalette(false) }} />)}
          </div>
        )}

        <p style={{ fontFamily: BODY, fontSize: '11px', color: INK, margin: '0 0 10px', fontWeight: 700, opacity: 0.5, letterSpacing: '0.5px' }}>미리보기</p>
        <div style={{ background: color, border: BORDER, boxShadow: HS, borderRadius: '2px', overflow: 'hidden', marginBottom: 20, transform: 'rotate(-0.3deg)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)' }}>
            <Tack color={getTack(color)} />
          </div>
          {photo && (
            <div style={{ width: '100%', height: 110, borderBottom: BORDER, overflow: 'hidden' }}>
              <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          )}
          <div style={{ padding: '12px 14px 40px', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 10, right: 10, fontSize: '9px', background: INK, color: WHITE, padding: '2px 7px', borderRadius: '1px', fontFamily: BODY, fontWeight: 700 }}>{finalCat}</span>
            <textarea ref={textRef} value={content} onChange={e => setContent(e.target.value)} placeholder="오늘 한 작은 선행을 적어봐요..." maxLength={80} rows={3}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontFamily: BODY, fontSize: '17px', fontWeight: 700, color: INK, resize: 'none', lineHeight: 1.55, caretColor: INK }} />
            <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '10px', color: INK, fontFamily: BODY, fontWeight: 600, opacity: 0.4 }}>{content.length}/80</div>
          </div>
        </div>

        <button
          disabled={!ok}
          onClick={() => { if (ok) { onAdd(content.trim(), color, finalCat, photo ?? undefined); onClose() } }}
          style={{ width: '100%', padding: '14px', background: ok ? '#FFE234' : 'rgba(10,10,10,0.07)', border: ok ? BORDER : '2px solid rgba(10,10,10,0.1)', boxShadow: ok ? HS : 'none', fontFamily: DISP, fontSize: '18px', color: ok ? INK : 'rgba(10,10,10,0.25)', cursor: ok ? 'pointer' : 'not-allowed', borderRadius: '2px', transition: 'all 0.14s ease' }}
          onMouseEnter={e => { if (ok) { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `5px 5px 0 ${INK}` } }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'none'; el.style.boxShadow = ok ? HS : 'none' }}
        >포스트잇 붙이기</button>
      </div>
    </div>
  )
}

/* ─── Tab config ─────────────────────────────────────────────── */
const TABS: { id: TabId; icon: () => React.ReactNode; label: string; accent: string }[] = [
  { id: 'wall',  icon: () => <IconWall  size={20} />, label: '우리의 벽',   accent: '#FFE234' },
  { id: 'today', icon: () => <IconStar  size={20} />, label: '오늘의 선행', accent: '#7EDDD7' },
  { id: 'diary', icon: () => <IconBook  size={20} />, label: '다이어리',    accent: '#FF9DBB' },
]

/* ─── App ────────────────────────────────────────────────────── */
export default function App() {
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
  }

  const handleAdd = (content: string, color: string, category: string, photo?: string) =>
    setPosts(prev => [{
      id: `u${Date.now()}`, content, color, author: MY_ID, timeAgo: '방금 전',
      nadoroCount: 0, rotation: (Math.random() - 0.5) * 4,
      didNadoro: false, category, date: TODAY, isOwn: true, photo,
    }, ...prev])

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: INK }}>
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {tab === 'wall'  && (
          <WallTab
            posts={posts}
            onNadoro={handleNadoro}
            onSelectPost={post => setViewingPost(post)}
          />
        )}
        {tab === 'today' && (
          <TodayTab
            myPosts={myToday}
            onAdd={() => setModal(true)}
            onSelectPost={post => setViewingPost(post)}
          />
        )}
        {tab === 'diary' && (
          <DiaryTab
            myPosts={allMyPosts}
            onSelectPost={post => setViewingPost(post)}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ background: INK, borderTop: BORDER, display: 'flex', flexShrink: 0 }}>
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '10px 4px 12px',
              background: active ? t.accent : 'transparent',
              border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              borderRight: t.id !== 'diary' ? BORDER : 'none',
              color: active ? INK : 'rgba(250,250,250,0.35)',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}>
              {t.icon()}
              <span style={{ fontFamily: BODY, fontSize: '9px', fontWeight: active ? 700 : 500, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Add modal */}
      {showModal && <AddModal onClose={() => setModal(false)} onAdd={handleAdd} />}

      {/* Post detail modal */}
      {viewingPost && (
        <PostDetailModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onViewProfile={authorId => {
            setViewingPost(null)
            setViewingProfile(authorId)
          }}
          onNadoro={id => {
            handleNadoro(id)
          }}
        />
      )}

      {/* Profile view overlay */}
      {viewingProfile && (
        <ProfileView
          authorId={viewingProfile}
          allPosts={posts}
          onClose={() => setViewingProfile(null)}
        />
      )}
    </div>
  )
}
