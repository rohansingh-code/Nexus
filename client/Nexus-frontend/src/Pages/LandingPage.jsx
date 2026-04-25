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
    const N = 100
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
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
        ctx.fillStyle = 'rgba(13,148,136,0.6)'
        ctx.fill()
      })
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 120) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(13,148,136,${0.15 * (1 - d / 120)})`
          ctx.lineWidth = 0.8
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
      <div className="font-mono text-3xl font-bold text-teal-600 tabular-nums tracking-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-500 text-[10px] uppercase tracking-widest mt-1 font-mono">{label}</div>
    </div>
  )
}

// ── Step badge ─────────────────────────────────────────────────────────────
function StepBadge({ n }) {
  return (
    <div className="w-7 h-7 rounded-full border border-teal-500/40 flex items-center justify-center flex-shrink-0">
      <span className="text-teal-600 font-mono text-[11px] font-bold">{n}</span>
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
      className="min-h-screen bg-white text-slate-800 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(13,148,136,0.2)} 50%{border-color:rgba(13,148,136,0.55)} }
        .fade-up-1{animation:fadeUp 0.7s ease forwards;animation-delay:0.1s;opacity:0}
        .fade-up-2{animation:fadeUp 0.7s ease forwards;animation-delay:0.25s;opacity:0}
        .fade-up-3{animation:fadeUp 0.7s ease forwards;animation-delay:0.45s;opacity:0}
        .fade-up-4{animation:fadeUp 0.7s ease forwards;animation-delay:0.65s;opacity:0}
        .fade-up-5{animation:fadeUp 0.7s ease forwards;animation-delay:0.85s;opacity:0}
        .scanline { animation: scanline 8s linear infinite; }
        .bento-glow:hover { border-color: rgba(13,148,136,0.35) !important; box-shadow: 0 0 40px -8px rgba(13,148,136,0.15); }
        .btn-primary:hover .btn-arrow { transform: translateX(4px); }
        .btn-arrow { transition: transform 0.2s ease; }
        .terminal-cursor { animation: pulse-ring 1s ease-in-out infinite; }
      `}</style>

      {/* ── Background layers ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* radial gradients */}
        <div className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
        {/* noise grain */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: noiseSvg, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />
        {/* horizontal grid lines */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '100% 80px'
          }} />
      </div>

      {/* ── Particle canvas (global) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleField />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 14 }}>local_hospital</span>
          </div>
          <span className="font-mono text-[13px] font-medium tracking-[0.15em] text-slate-800 uppercase">Nexus</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-600 font-mono text-[9px] uppercase tracking-widest">v2.1</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Architecture', 'Docs', 'API'].map(item => (
            <span key={item} className="text-slate-500 hover:text-slate-800 transition-colors text-[12px] font-mono uppercase tracking-wider cursor-pointer">{item}</span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="px-4 py-1.5 text-slate-600 hover:text-slate-900 transition-colors font-mono text-[11px] uppercase tracking-wider">
            Sign in
          </button>
          <button onClick={() => navigate('/signup')}
            className="px-4 py-1.5 rounded-lg bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-all text-teal-700 font-mono text-[11px] uppercase tracking-wider">
            Get Access
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-28 pb-20">

        {/* eyebrow */}
        <div className="fade-up-1 flex items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 terminal-cursor" />
            <span className="font-mono text-teal-600 text-[10px] uppercase tracking-widest">All systems operational</span>
          </div>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: 'linear-gradient(to right,rgba(13,148,136,0.3),transparent)' }} />
          <span className="font-mono text-slate-500 text-[10px] tracking-widest">LLaMA 3.3 · Groq · Spring AI</span>
        </div>

        {/* headline */}
        <div className="fade-up-2 mb-8">
          <h1 className="font-semibold leading-none tracking-tight" style={{ fontFamily: "'DM Sans',sans-serif" }}>
            <span className="block text-slate-500 text-2xl md:text-3xl mb-3 font-light tracking-[0.05em] uppercase">
              Agentic Medical Intelligence
            </span>
            <span className="block text-slate-900" style={{ fontSize: 'clamp(52px,8vw,100px)' }}>
              NEXUS
            </span>
          </h1>
        </div>

        <p className="fade-up-3 text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed mb-12" style={{ fontWeight: 400 }}>
          From symptom to confirmed appointment — autonomously.
          No click-paths, no dropdowns. Just a conversation that
          orchestrates your entire hospital in real time.
        </p>

        {/* CTA row */}
        <div className="fade-up-4 flex flex-wrap items-center gap-4 mb-20">
          <button
            onClick={() => navigate('/signup')}
            className="btn-primary group flex items-center gap-3 px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 transition-all text-white font-semibold text-sm shadow-[0_0_30px_rgba(13,148,136,0.3)] hover:shadow-[0_0_50px_rgba(13,148,136,0.45)]"
          >
            Initialize Your Record
            <span className="btn-arrow material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-slate-700 text-sm font-mono shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>play_circle</span>
            Watch Demo
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="flex -space-x-2">
              {['bg-blue-600','bg-slate-500','bg-teal-600'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center shadow-sm`}>
                  <span className="text-[9px] text-white font-bold">{['AH','RK','PS'][i]}</span>
                </div>
              ))}
            </div>
            <span className="text-slate-500 text-xs font-mono">+2,400 patients onboarded</span>
          </div>
        </div>

        {/* ── Terminal preview card ── */}
        <div className="fade-up-5 relative">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              borderColor: 'rgba(13,148,136,0.2)',
              background: '#ffffff',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)',
              animation: 'borderGlow 4s ease-in-out infinite',
            }}
          >
            {/* terminal title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="ml-3 font-mono text-slate-400 text-[11px]">nexus-agent · session_4f2a</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="font-mono text-teal-600 text-[10px]">live</span>
              </div>
            </div>
            {/* terminal body */}
            <div className="px-6 py-6 font-mono text-sm space-y-4" style={{ minHeight: 160 }}>
              <div className="flex gap-3">
                <span className="text-slate-400">user@nexus:~$</span>
                <span className="text-slate-700">"My knee has been swelling for 3 days, need to see someone soon"</span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-teal-600">nexus&gt;</span>
                <span className="text-slate-600 flex-1">
                  {typingText}
                  <span className="inline-block w-0.5 h-4 bg-teal-600 ml-0.5 align-middle animate-pulse" />
                </span>
              </div>
            </div>
          </div>

          {/* floating badge — booking ready */}
          <div
            className="absolute -right-4 -bottom-4 md:-right-8 md:-bottom-6 px-4 py-3 rounded-xl border border-teal-200 bg-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-teal-500" style={{ fontSize: 14 }}>check_circle</span>
              <span className="text-teal-600 font-mono text-[10px] uppercase tracking-widest">[BOOKING_READY]</span>
            </div>
            <div className="text-slate-600 text-xs font-mono">Dr. Sharma · Tue 10:30 AM</div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div ref={statsRef} className="relative z-10 border-y border-slate-200 py-12 my-8 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value={24700} suffix="+" label="Appointments handled" animate={statsVisible} />
          <StatCard value={99} suffix="%" label="Agent accuracy" animate={statsVisible} />
          <StatCard value={3} suffix="s" label="Avg. resolution time" animate={statsVisible} />
          <StatCard value={12} suffix="+" label="Specialist types" animate={statsVisible} />
        </div>
      </div>

      {/* ── BENTO GRID ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-24">
        <div className="mb-14">
          <p className="font-mono text-teal-700 text-sm font-semibold uppercase tracking-widest mb-3">Why Nexus</p>
          <h2 className="text-slate-900 text-3xl md:text-4xl font-semibold leading-tight max-w-lg">
            Intelligence that acts, not just advises.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Tall left card — Autonomous Triage */}
          <div
            className="bento-glow md:row-span-2 rounded-2xl border border-slate-200 p-8 flex flex-col transition-all duration-500 relative overflow-hidden bg-white shadow-sm"
          >
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(13,148,136,0.05) 0%,transparent 70%)' }} />
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 22 }}>psychology</span>
            </div>
            <h3 className="text-slate-900 font-semibold text-xl mb-3">Autonomous Triage</h3>
            <p className="text-slate-600 leading-relaxed text-sm flex-1">
              LLaMA 3.3-70B reasoning engine perceives intent through multi-turn dialogue,
              infers urgency, maps symptoms to specialties, and dispatches booking workflows —
              all without a single human click.
            </p>
            <div className="mt-8 space-y-3">
              {['Symptom extraction', 'Urgency scoring', 'Specialty routing', 'Booking dispatch'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <StepBadge n={i + 1} />
                  <span className="text-slate-600 text-sm font-mono">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Orchestration */}
          <div
            className="bento-glow rounded-2xl border border-slate-200 p-7 transition-all duration-500 relative overflow-hidden bg-white shadow-sm"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(13,148,136,0.05) 0%,transparent 70%)' }} />
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 20 }}>account_tree</span>
            </div>
            <h3 className="text-slate-900 font-semibold text-base mb-2">Tool Orchestration</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              The agent dynamically calls live hospital APIs — fetching doctors, syncing
              availability, validating slots — chaining tools in real time.
            </p>
            {/* mini API call viz */}
            <div className="mt-5 space-y-2">
              {['GET /doctors?specialty=ortho', 'GET /slots?doctorId=42', 'POST /appointments'].map((call, i) => (
                <div key={call} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className={`font-mono text-[9px] font-bold ${call.startsWith('POST') ? 'text-teal-600' : 'text-blue-500'}`}>
                    {call.startsWith('POST') ? 'POST' : 'GET'}
                  </span>
                  <span className="font-mono text-slate-500 text-[10px] truncate">{call.replace(/^(GET|POST) /, '')}</span>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Persistent Memory */}
          <div
            className="bento-glow rounded-2xl border border-slate-200 p-7 transition-all duration-500 relative overflow-hidden bg-white shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 20 }}>memory</span>
            </div>
            <h3 className="text-slate-900 font-semibold text-base mb-2">Redis Conversation Memory</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Each session is persisted in Redis. The agent recalls your symptoms, preferences,
              and history — no re-explaining across turns.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              {['Multi-turn', 'Session replay', 'TTL expiry'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 font-mono text-[10px]">{tag}</span>
              ))}
            </div>
          </div>

          {/* Wide bottom — Stack */}
          <div
            className="bento-glow md:col-span-2 rounded-2xl border border-slate-200 p-7 transition-all duration-500 flex flex-col md:flex-row gap-8 bg-white shadow-sm"
          >
            <div className="flex-1">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 20 }}>deployed_code</span>
              </div>
              <h3 className="text-slate-900 font-semibold text-base mb-2">Production-Grade Stack</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Microservices architecture with a dedicated AI service, Docker Compose orchestration,
                JWT auth, RBAC, and PostgreSQL persistence — built to scale.
              </p>
            </div>
            {/* stack pills grid */}
            <div className="grid grid-cols-3 gap-2 md:w-64 self-center">
              {[
                { label: 'Spring Boot' },
                { label: 'Spring AI' },
                { label: 'Groq' },
                { label: 'Redis' },
                { label: 'PostgreSQL' },
                { label: 'React' },
                { label: 'Docker' },
                { label: 'Zustand' },
                { label: 'JWT' },
              ].map(({ label }) => (
                <div key={label} className={`px-2 py-1.5 rounded-lg border font-mono text-[9px] text-center text-slate-500 border-slate-200 bg-slate-50`}>{label}</div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 border-t border-slate-200 py-24 bg-slate-50/30">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <p className="font-mono text-teal-700 text-sm font-semibold uppercase tracking-widest mb-4 text-center">How it works</p>
          <h2 className="text-slate-900 text-3xl font-semibold text-center mb-16">Three turns. One confirmed booking.</h2>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom,rgba(13,148,136,0.3),rgba(13,148,136,0),rgba(13,148,136,0.1))' }} />
            <div className="space-y-12">
              {[
                { n: '01', title: 'Describe your symptoms', body: 'Speak naturally. "I have sharp chest pain when I breathe deeply" — no forms, no menus. The agent interprets clinical language and colloquial description equally.', icon: 'chat' },
                { n: '02', title: 'Agent fetches options', body: 'Nexus queries your hospital\'s live doctor database, filters by specialty and availability, and presents you with the best-fit options in seconds.', icon: 'search' },
                { n: '03', title: 'Confirm & done', body: 'One confirmation message. Nexus emits a [BOOKING_READY] tag, the UI renders a confirmation card, and the appointment is committed to PostgreSQL.', icon: 'event_available' },
              ].map(({ n, title, body, icon }) => (
                <div key={n} className="flex gap-8 items-start relative">
                  <div className="w-10 h-10 rounded-full border border-teal-200 bg-white flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm">
                    <span className="font-mono text-teal-600 text-[11px] font-bold">{n}</span>
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 18 }}>{icon}</span>
                      <h3 className="text-slate-900 font-semibold text-lg">{title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="relative z-10 border-t border-slate-200 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div
            className="inline-block px-8 py-14 rounded-3xl border border-slate-200 w-full bg-white shadow-sm"
            style={{
              boxShadow: '0 0 80px -30px rgba(13,148,136,0.1)',
            }}
          >
            <p className="font-mono text-teal-700 text-sm font-semibold uppercase tracking-widest mb-5">Ready to deploy</p>
            <h2 className="text-slate-900 text-3xl md:text-4xl font-semibold mb-5 leading-tight">
              Your hospital, automated.
            </h2>
            <p className="text-slate-600 mb-10 max-w-md mx-auto leading-relaxed">
              Create your patient record and experience the future of healthcare access — starting with a single conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 transition-all text-white font-semibold text-sm shadow-[0_0_30px_rgba(13,148,136,0.3)] hover:shadow-[0_0_50px_rgba(13,148,136,0.45)]"
              >
                Initialize Patient Record
                <span className="btn-arrow material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all text-sm font-mono shadow-sm"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>login</span>
                Operator Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-slate-200 py-8 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-500 text-[11px] uppercase tracking-wider">NEXUS</span>
            <span className="text-slate-300 font-mono text-[11px]">·</span>
            <span className="font-mono text-slate-500 text-[11px]">Agentic Medical Intelligence</span>
          </div>
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
            Spring Boot · Spring AI · Groq · LLaMA 3.3 · Redis · PostgreSQL · React
          </p>
        </div>
      </footer>

    </div>
  )
}