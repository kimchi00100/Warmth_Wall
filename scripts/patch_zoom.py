import os

path = "C:/Users/xjwoz/OneDrive/Desktop/_Dasom_Hackathon/src/app/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add zoom state and replace clamp
target_clamp = """  const [containerSize, setContainerSize] = useState({ w: 375, h: 600 })

  const { items, canvasW, canvasH } = useScatteredLayout(wallPosts, containerSize.w, containerSize.h)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging   = useRef(false)
  const dragOrigin = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const dragDist   = useRef(0)
  const centeredOnce = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => setContainerSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const clamp = useCallback((ox: number, oy: number) => ({
    x: Math.min(0, Math.max(Math.min(0, containerSize.w - canvasW), ox)),
    y: Math.min(0, Math.max(Math.min(0, containerSize.h - canvasH), oy)),
  }), [containerSize, canvasW, canvasH])"""

repl_clamp = """  const [containerSize, setContainerSize] = useState({ w: 375, h: 600 })

  const { items, canvasW, canvasH } = useScatteredLayout(wallPosts, containerSize.w, containerSize.h)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const dragging   = useRef(false)
  const dragOrigin = useRef({ mx: 0, my: 0, ox: 0, oy: 0 })
  const dragDist   = useRef(0)
  const centeredOnce = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => setContainerSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Infinite canvas: loose clamp boundaries to allow panning when zoomed out
  const clamp = useCallback((ox: number, oy: number, z = 1) => {
    const cw = canvasW * z
    const ch = canvasH * z
    const pad = 1500
    const minX = Math.min(0, containerSize.w - cw) - pad
    const minY = Math.min(0, containerSize.h - ch) - pad
    return {
      x: Math.min(pad, Math.max(minX, ox)),
      y: Math.min(pad, Math.max(minY, oy)),
    }
  }, [containerSize, canvasW, canvasH])"""

content = content.replace(target_clamp, repl_clamp)


# 2. Add wheel listener
target_key = """  const STEP = 120
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {"""

repl_key = """  // Infinite Zoom handler
  const onWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      
      const el = containerRef.current
      if (!el) return
      
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      
      setZoom(oldZoom => {
        const scaleBy = 1.05
        const newZoom = e.deltaY > 0 ? oldZoom / scaleBy : oldZoom * scaleBy
        const clampedZoom = Math.max(0.1, Math.min(newZoom, 4))
        
        setOffset(oldOffset => {
          const dx = (px - oldOffset.x) * (clampedZoom / oldZoom - 1)
          const dy = (py - oldOffset.y) * (clampedZoom / oldZoom - 1)
          return clamp(oldOffset.x - dx, oldOffset.y - dy, clampedZoom)
        })
        
        return clampedZoom
      })
    }
  }, [clamp])

  useEffect(() => {
    const el = containerRef.current
    if (el) {
       el.addEventListener('wheel', onWheel, { passive: false })
       return () => el.removeEventListener('wheel', onWheel)
    }
  }, [onWheel])

  const STEP = 120
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {"""

content = content.replace(target_key, repl_key)


# 3. Apply zoom to transform
target_transform = """        ) : (
          <div style={{
            position: 'absolute', width: canvasW, height: canvasH,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            transition: 'transform 0.06s ease-out',
            willChange: 'transform', zIndex: 2,
          }}>"""

repl_transform = """        ) : (
          <div style={{
            position: 'absolute', width: canvasW, height: canvasH,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: dragging.current ? 'none' : 'transform 0.06s ease-out',
            willChange: 'transform', zIndex: 2,
          }}>"""

content = content.replace(target_transform, repl_transform)

# 4. Also update onPtrMove to use current zoom for clamp, though panning is just translation
target_ptr = """  const onPtrMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - dragOrigin.current.mx
    const dy = e.clientY - dragOrigin.current.my
    dragDist.current = Math.hypot(dx, dy)
    setOffset(clamp(dragOrigin.current.ox + dx, dragOrigin.current.oy + dy))
  }"""

repl_ptr = """  const onPtrMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - dragOrigin.current.mx
    const dy = e.clientY - dragOrigin.current.my
    dragDist.current = Math.hypot(dx, dy)
    setOffset(prev => clamp(dragOrigin.current.ox + dx, dragOrigin.current.oy + dy, zoom))
  }"""

content = content.replace(target_ptr, repl_ptr)


with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Infinite zoom patch applied!")
