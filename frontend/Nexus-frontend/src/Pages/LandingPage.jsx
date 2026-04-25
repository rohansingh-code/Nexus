import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

// ── Animated counter hook ──────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

// ── Typing animation hook ──────────────────────────────────────────────────
function useTyping(lines, loop = true) {
  const [display, setDisplay] = useState('')
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const current = lines[lineIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1))
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), 1800)
        } else {
          setCharIdx(c => c + 1)
        }
      } else {
        setDisplay(current.slice(0, charIdx - 1))
        if (charIdx - 1 === 0) {
          setDeleting(false)
          setLineIdx(i => (i + 1) % lines.length)
          setCharIdx(0)
        } else {
          setCharIdx(c => c - 1)
        }
      }
    }, deleting ? 35 : 55)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, lineIdx, lines])
  return display
}

// ── Noise texture SVG ──────────────────────────────────────────────────────
const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

// ── Particle field ─────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.width = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    const N = 55
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(249,115,22,0.35)'
        ctx.fill()
      })
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 100) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(249,115,22,${0.08 * (1 - d / 100)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }} />
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, animate }) {
  const count = useCounter(value, 2200, animate)
  return (
    <div className="flex flex-col items-center">
      <div className="font-mono text-3xl font-bold text-orange-400 tabular-nums tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-stone-500 text-[10px] uppercase tracking-widest mt-1 font-mono">{label}</div>
    </div>
  )
}

// ── Step badge ─────────────────────────────────────────────────────────────
function StepBadge({ n }) {
  return (
    <div className="w-7 h-7 rounded-full border border-orange-500/40 flex items-center justify-center flex-shrink-0">
      <span className="text-orange-400 font-mono text-[11px] font-bold">{n}</span>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const typingText = useTyping([
    'Booking appointment for Dr. Sharma…',
    'Analyzing reported symptoms…',
    'Fetching available time slots…',
    'Confirming orthopedic specialist…',
    'Your appointment is confirmed.',
  ])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      className="min-h-screen bg-stone-950 text-stone-200 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(249,115,22,0.2)} 50%{border-color:rgba(249,115,22,0.55)} }
        .fade-up-1{animation:fadeUp 0.7s ease forwards;animation-delay:0.1s;opacity:0}
        .fade-up-2{animation:fadeUp 0.7s ease forwards;animation-delay:0.25s;opacity:0}
        .fade-up-3{animation:fadeUp 0.7s ease forwards;animation-delay:0.45s;opacity:0}
        .fade-up-4{animation:fadeUp 0.7s ease forwards;animation-delay:0.65s;opacity:0}
        .fade-up-5{animation:fadeUp 0.7s ease forwards;animation-delay:0.85s;opacity:0}
        .scanline { animation: scanline 8s linear infinite; }
        .bento-glow:hover { border-color: rgba(249,115,22,0.35) !important; box-shadow: 0 0 40px -8px rgba(249,115,22,0.15); }
        .btn-primary:hover .btn-arrow { transform: translateX(4px); }
        .btn-arrow { transition: transform 0.2s ease; }
        .terminal-cursor { animation: pulse-ring 1s ease-in-out infinite; }
      `}</style>

      {/* ── Background layers ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* radial gradients */}
        <div className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(194,65,12,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)' }} />
        {/* noise grain */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: noiseSvg, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />
        {/* scanline */}
        <div className="scanline absolute left-0 w-full h-[2px]"
          style={{ background: 'linear-gradient(to right,transparent,rgba(249,115,22,0.08),transparent)' }} />
        {/* horizontal grid lines */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '100% 80px'
          }} />
      </div>

      {/* ── Particle canvas (hero only) ── */}
      <div className="absolute top-0 left-0 w-full h-[70vh] z-0">
        <ParticleField />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-400" style={{ fontSize: 14 }}>local_hospital</span>
          </div>
          <span className="font-mono text-[13px] font-medium tracking-[0.15em] text-stone-300 uppercase">Nexus</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 font-mono text-[9px] uppercase tracking-widest">v2.1</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Architecture', 'Docs', 'API'].map(item => (
            <span key={item} className="text-stone-500 hover:text-stone-300 transition-colors text-[12px] font-mono uppercase tracking-wider cursor-pointer">{item}</span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="px-4 py-1.5 text-stone-400 hover:text-stone-200 transition-colors font-mono text-[11px] uppercase tracking-wider">
            Sign in
          </button>
          <button onClick={() => navigate('/signup')}
            className="px-4 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/40 hover:bg-orange-500/20 transition-all text-orange-400 font-mono text-[11px] uppercase tracking-wider">
            Get Access
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-16">

        {/* eyebrow */}
        <div className="fade-up-1 flex items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 terminal-cursor" />
            <span className="font-mono text-emerald-400 text-[10px] uppercase tracking-widest">All systems operational</span>
          </div>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to right,rgba(249,115,22,0.3),transparent)' }} />
          <span className="font-mono text-stone-600 text-[10px] tracking-widest">LLaMA 3.3 · Groq · Spring AI</span>
        </div>

        {/* headline */}
        <div className="fade-up-2 mb-6">
          <h1 className="font-semibold leading-none tracking-tight" style={{ fontFamily: "'DM Sans',sans-serif" }}>
            <span className="block text-stone-500 text-2xl md:text-3xl mb-2 font-light tracking-[0.05em] uppercase">
              Agentic Medical Intelligence
            </span>
            <span className="block text-white" style={{ fontSize: 'clamp(52px,8vw,100px)' }}>
              NEXUS
            </span>
          </h1>
        </div>

        <p className="fade-up-3 text-stone-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10" style={{ fontWeight: 300 }}>
          From symptom to confirmed appointment — autonomously.
          No click-paths, no dropdowns. Just a conversation that
          orchestrates your entire hospital in real time.
        </p>

        {/* CTA row */}
        <div className="fade-up-4 flex flex-wrap items-center gap-4 mb-16">
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary group flex items-center gap-3 px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 transition-all text-white font-semibold text-sm shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.45)]"
          >
            Initialize Your Record
            <span className="btn-arrow material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all text-stone-300 text-sm font-mono"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>play_circle</span>
            Watch Demo
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="flex -space-x-2">
              {['bg-orange-700','bg-stone-600','bg-teal-700'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-stone-950 flex items-center justify-center`}>
                  <span className="text-[9px] text-white font-bold">{['AH','RK','PS'][i]}</span>
                </div>
              ))}
            </div>
            <span className="text-stone-500 text-xs font-mono">+2,400 patients onboarded</span>
          </div>
        </div>

        {/* ── Terminal preview card ── */}
        <div className="fade-up-5 relative">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: 'rgba(249,115,22,0.2)',
              background: 'linear-gradient(135deg,rgba(28,25,23,0.9),rgba(12,10,9,0.95))',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
              animation: 'borderGlow 4s ease-in-out infinite',
            }}
          >
            {/* terminal title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 font-mono text-stone-500 text-[11px]">nexus-agent · session_4f2a</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-emerald-400 text-[10px]">live</span>
              </div>
            </div>
            {/* terminal body */}
            <div className="px-6 py-5 font-mono text-sm space-y-2.5" style={{ minHeight: 140 }}>
              <div className="flex gap-3">
                <span className="text-stone-600">user@nexus:~$</span>
                <span className="text-stone-300">"My knee has been swelling for 3 days, need to see someone soon"</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-orange-400">nexus&gt;</span>
                <span className="text-stone-400 flex-1">
                  {typingText}
                  <span className="inline-block w-0.5 h-4 bg-orange-400 ml-0.5 align-middle animate-pulse" />
                </span>
              </div>
            </div>
          </div>

          {/* floating badge — booking ready */}
          <div
            className="absolute -right-4 -bottom-4 md:-right-8 md:-bottom-6 px-4 py-3 rounded-xl border border-emerald-500/30"
            style={{
              background: 'linear-gradient(135deg,rgba(6,78,59,0.5),rgba(4,47,46,0.5))',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 14 }}>check_circle</span>
              <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest">[BOOKING_READY]</span>
            </div>
            <div className="text-stone-300 text-xs font-mono">Dr. Sharma · Tue 10:30 AM</div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div ref={statsRef} className="relative z-10 border-y border-white/[0.05] py-10 my-4">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value={24700} suffix="+" label="Appointments handled" animate={statsVisible} />
          <StatCard value={99} suffix="%" label="Agent accuracy" animate={statsVisible} />
          <StatCard value={3} suffix="s" label="Avg. resolution time" animate={statsVisible} />
          <StatCard value={12} suffix="+" label="Specialist types" animate={statsVisible} />
        </div>
      </div>

      {/* ── BENTO GRID ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">
        <div className="mb-12">
          <p className="font-mono text-orange-400 text-[11px] uppercase tracking-widest mb-3">Why Nexus</p>
          <h2 className="text-white text-3xl md:text-4xl font-semibold leading-tight max-w-lg">
            Intelligence that acts, not just advises.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Tall left card — Autonomous Triage */}
          <div
            className="bento-glow md:row-span-2 rounded-2xl border border-white/[0.07] p-8 flex flex-col transition-all duration-500 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg,rgba(28,25,23,0.8),rgba(12,10,9,0.9))' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(249,115,22,0.1) 0%,transparent 70%)' }} />
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-orange-400" style={{ fontSize: 22 }}>psychology</span>
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">Autonomous Triage</h3>
            <p className="text-stone-400 leading-relaxed text-sm flex-1">
              LLaMA 3.3-70B reasoning engine perceives intent through multi-turn dialogue,
              infers urgency, maps symptoms to specialties, and dispatches booking workflows —
              all without a single human click.
            </p>
            <div className="mt-8 space-y-3">
              {['Symptom extraction', 'Urgency scoring', 'Specialty routing', 'Booking dispatch'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <StepBadge n={i + 1} />
                  <span className="text-stone-400 text-sm font-mono">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Orchestration */}
          <div
            className="bento-glow rounded-2xl border border-white/[0.07] p-7 transition-all duration-500 relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))' }}
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(20,184,166,0.08) 0%,transparent 70%)' }} />
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-teal-400" style={{ fontSize: 20 }}>account_tree</span>
            </div>
            <h3 className="text-white font-semibold text-base mb-2">Tool Orchestration</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              The agent dynamically calls live hospital APIs — fetching doctors, syncing
              availability, validating slots — chaining tools in real time.
            </p>
            {/* mini API call viz */}
            <div className="mt-5 space-y-1.5">
              {['GET /doctors?specialty=ortho', 'GET /slots?doctorId=42', 'POST /appointments'].map((call, i) => (
                <div key={call} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900/60 border border-white/[0.04]">
                  <span className={`font-mono text-[9px] font-bold ${call.startsWith('POST') ? 'text-orange-400' : 'text-teal-400'}`}>
                    {call.startsWith('POST') ? 'POST' : 'GET'}
                  </span>
                  <span className="font-mono text-stone-500 text-[10px] truncate">{call.replace(/^(GET|POST) /, '')}</span>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Persistent Memory */}
          <div
            className="bento-glow rounded-2xl border border-white/[0.07] p-7 transition-all duration-500 relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))' }}
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-violet-400" style={{ fontSize: 20 }}>memory</span>
            </div>
            <h3 className="text-white font-semibold text-base mb-2">Redis Conversation Memory</h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Each session is persisted in Redis. The agent recalls your symptoms, preferences,
              and history — no re-explaining across turns.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {['Multi-turn', 'Session replay', 'TTL expiry'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full border border-violet-500/25 bg-violet-500/5 text-violet-300 font-mono text-[10px]">{tag}</span>
              ))}
            </div>
          </div>

          {/* Wide bottom — Stack */}
          <div
            className="bento-glow md:col-span-2 rounded-2xl border border-white/[0.07] p-7 transition-all duration-500 flex flex-col md:flex-row gap-8"
            style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))' }}
          >
            <div className="flex-1">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-sky-400" style={{ fontSize: 20 }}>deployed_code</span>
              </div>
              <h3 className="text-white font-semibold text-base mb-2">Production-Grade Stack</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Microservices architecture with a dedicated AI service, Docker Compose orchestration,
                JWT auth, RBAC, and PostgreSQL persistence — built to scale.
              </p>
            </div>
            {/* stack pills grid */}
            <div className="grid grid-cols-3 gap-2 md:w-64 self-center">
              {[
                { label: 'Spring Boot', color: 'text-green-400 border-green-500/25 bg-green-500/5' },
                { label: 'Spring AI', color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' },
                { label: 'Groq', color: 'text-orange-400 border-orange-500/25 bg-orange-500/5' },
                { label: 'Redis', color: 'text-red-400 border-red-500/25 bg-red-500/5' },
                { label: 'PostgreSQL', color: 'text-sky-400 border-sky-500/25 bg-sky-500/5' },
                { label: 'React', color: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5' },
                { label: 'Docker', color: 'text-blue-400 border-blue-500/25 bg-blue-500/5' },
                { label: 'Zustand', color: 'text-purple-400 border-purple-500/25 bg-purple-500/5' },
                { label: 'JWT', color: 'text-yellow-400 border-yellow-500/25 bg-yellow-500/5' },
              ].map(({ label, color }) => (
                <div key={label} className={`px-2 py-1.5 rounded-lg border font-mono text-[9px] text-center ${color}`}>{label}</div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 border-t border-white/[0.05] py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="font-mono text-orange-400 text-[11px] uppercase tracking-widest mb-3 text-center">How it works</p>
          <h2 className="text-white text-3xl font-semibold text-center mb-14">Three turns. One confirmed booking.</h2>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom,rgba(249,115,22,0.3),rgba(249,115,22,0),rgba(249,115,22,0.1))' }} />
            <div className="space-y-10">
              {[
                { n: '01', title: 'Describe your symptoms', body: 'Speak naturally. "I have sharp chest pain when I breathe deeply" — no forms, no menus. The agent interprets clinical language and colloquial description equally.', icon: 'chat' },
                { n: '02', title: 'Agent fetches options', body: 'Nexus queries your hospital\'s live doctor database, filters by specialty and availability, and presents you with the best-fit options in seconds.', icon: 'search' },
                { n: '03', title: 'Confirm & done', body: 'One confirmation message. Nexus emits a [BOOKING_READY] tag, the UI renders a confirmation card, and the appointment is committed to PostgreSQL.', icon: 'event_available' },
              ].map(({ n, title, body, icon }) => (
                <div key={n} className="flex gap-8 items-start relative">
                  <div className="w-10 h-10 rounded-full border border-orange-500/40 bg-stone-950 flex items-center justify-center flex-shrink-0 relative z-10">
                    <span className="font-mono text-orange-400 text-[11px] font-bold">{n}</span>
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-stone-500" style={{ fontSize: 16 }}>{icon}</span>
                      <h3 className="text-white font-semibold text-base">{title}</h3>
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="relative z-10 border-t border-white/[0.05] py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="inline-block px-8 py-12 rounded-3xl border border-orange-500/20 w-full"
            style={{
              background: 'linear-gradient(135deg,rgba(28,25,23,0.8),rgba(12,10,9,0.95))',
              boxShadow: '0 0 80px -30px rgba(249,115,22,0.2)',
            }}
          >
            <p className="font-mono text-orange-400 text-[11px] uppercase tracking-widest mb-4">Ready to deploy</p>
            <h2 className="text-white text-3xl md:text-4xl font-semibold mb-4 leading-tight">
              Your hospital, automated.
            </h2>
            <p className="text-stone-400 mb-10 max-w-sm mx-auto leading-relaxed">
              Create your patient record and experience the future of healthcare access — starting with a single conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 transition-all text-white font-semibold text-sm shadow-[0_0_30px_rgba(249,115,22,0.35)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)]"
              >
                Initialize Patient Record
                <span className="btn-arrow material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-stone-400 hover:text-stone-200 transition-all text-sm font-mono"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>login</span>
                Operator Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-6">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-stone-600 text-[11px] uppercase tracking-wider">NEXUS</span>
            <span className="text-stone-800 font-mono text-[11px]">·</span>
            <span className="font-mono text-stone-700 text-[11px]">Agentic Medical Intelligence</span>
          </div>
          <p className="font-mono text-[10px] text-stone-700 uppercase tracking-widest">
            Spring Boot · Spring AI · Groq · LLaMA 3.3 · Redis · PostgreSQL · React
          </p>
        </div>
      </footer>

    </div>
  )
}