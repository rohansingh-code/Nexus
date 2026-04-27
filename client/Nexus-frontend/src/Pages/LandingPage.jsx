import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const SUGGESTIONS = [
  'I have chest pain when I breathe deeply',
  'My knee has been swelling for 3 days',
  'I need to see a cardiologist this week',
  'Recurring migraines, need a specialist',
]

function TypingDemo() {
  const [lineIdx, setLineIdx] = useState(0)
  const [chars, setChars] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = SUGGESTIONS[lineIdx]
    const t = setTimeout(() => {
      if (!deleting) {
        if (chars < current.length) setChars(c => c + 1)
        else setTimeout(() => setDeleting(true), 1600)
      } else {
        if (chars > 0) setChars(c => c - 1)
        else { setDeleting(false); setLineIdx(i => (i + 1) % SUGGESTIONS.length) }
      }
    }, deleting ? 28 : 52)
    return () => clearTimeout(t)
  }, [chars, deleting, lineIdx])

  return (
    <span className="text-slate-700">
      {SUGGESTIONS[lineIdx].slice(0, chars)}
      <span className="inline-block w-0.5 h-4 bg-teal-500 ml-0.5 align-middle animate-pulse" />
    </span>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen mesh-bg text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .f1{animation:fadeUp .5s ease .05s both}
        .f2{animation:fadeUp .5s ease .15s both}
        .f3{animation:fadeUp .5s ease .3s both}
        .f4{animation:fadeUp .5s ease .45s both}
        .f5{animation:fadeUp .5s ease .6s both}
        .feat-card:hover { border-color: #0d9488; background: #f0fdfa; }
        @media (prefers-reduced-motion:reduce) { * { animation:none !important; } }
      `}</style>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-wide">Nexus</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')}
              className="px-4 py-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
              Sign in
            </button>
            <button onClick={() => navigate('/signup')}
              className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors shadow-sm">
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="f1 flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-700 text-xs font-medium" style={{ fontFamily: "'DM Mono',monospace" }}>Powered by LLaMA 3.3 · Groq</span>
        </div>

        <h1 className="f2 text-4xl md:text-6xl font-semibold leading-tight text-slate-900 mb-6 max-w-3xl">
          Describe your symptoms.<br />
          <span className="text-gradient font-bold tracking-tight">Get a booked appointment.</span>
        </h1>

        <p className="f3 text-lg text-slate-500 max-w-xl leading-relaxed mb-10" style={{ fontWeight: 300 }}>
          Nexus is an AI agent that understands what you're feeling, finds the right specialist, and confirms your hospital appointment — all in one conversation.
        </p>

        <div className="f4 flex flex-wrap items-center gap-3 mb-16">
          <button onClick={() => navigate('/signup')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 transition-colors text-white font-semibold text-sm shadow-md hover:shadow-lg">
            Create your free account
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
          <button onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-700 text-sm font-medium">
            Sign in to your account
          </button>
        </div>

        {/* ── Demo terminal ── */}
        <div className="f5 glass-card overflow-hidden">
          {/* title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/40 border-b border-white/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-slate-400 text-xs ml-2" style={{ fontFamily: "'DM Mono',monospace" }}>nexus — triage session</span>
          </div>
          {/* chat preview */}
          <div className="bg-white px-6 py-6 space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
              </div>
              <div className="bg-slate-50 rounded-xl rounded-tl-sm px-4 py-3 max-w-sm">
                <p className="text-slate-700 text-sm leading-relaxed">
                  Hi, I'm Nexus. Tell me what you're experiencing and I'll find you the right doctor and book your appointment. What's going on?
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start justify-end">
              <div className="bg-teal-600 rounded-xl rounded-tr-sm px-4 py-3 max-w-sm">
                <p className="text-white text-sm leading-relaxed">
                  <TypingDemo />
                </p>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white/40 backdrop-blur-md border-y border-white/60 py-20 relative z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-teal-600 text-xs font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono',monospace" }}>How it works</p>
          <h2 className="text-3xl font-semibold text-slate-900 mb-12">From symptom to booked in 3 steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', icon: 'chat_bubble', title: 'Describe how you feel', body: 'Type naturally — "my knee has been swelling" or "chest pain when breathing". No forms. No dropdowns. Just a conversation.' },
              { n: '02', icon: 'search', title: 'Agent finds options', body: 'Nexus queries your hospital\'s live database, filters by specialty and availability, and presents you with best-fit doctors in seconds.' },
              { n: '03', icon: 'event_available', title: 'Confirm & done', body: 'One message to confirm. Your appointment is saved, the doctor is notified, and you get a clear booking summary.' },
            ].map(({ n, icon, title, body }) => (
              <div key={n} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-teal-200 bg-teal-50 flex items-center justify-center">
                  <span className="text-teal-600 text-xs font-bold" style={{ fontFamily: "'DM Mono',monospace" }}>{n}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-teal-500" style={{ fontSize: 16 }}>{icon}</span>
                    {title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-teal-600 text-xs font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: "'DM Mono',monospace" }}>Built different</p>
        <h2 className="text-3xl font-semibold text-slate-900 mb-10">Everything you need, nothing you don't</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: 'psychology', title: 'Smart triage', body: 'LLaMA 3.3-70B reads your symptoms, infers urgency, and routes you to the right specialty without any manual selection.' },
            { icon: 'account_tree', title: 'Live hospital data', body: 'The agent calls your hospital\'s real APIs — fetching doctors, checking availability, and booking slots in real time.' },
            { icon: 'memory', title: 'Remembers context', body: 'Each conversation is persisted in Redis so the agent recalls what you told it across multiple turns.' },
            { icon: 'lock', title: 'Secure by design', body: 'JWT authentication, role-based access control, and end-to-end encryption across every request.' },
            { icon: 'speed', title: 'Seconds, not minutes', body: 'Groq inference runs at 500+ tokens/sec — responses feel instant, not like waiting for a slow chatbot.' },
            { icon: 'devices', title: 'Works everywhere', body: 'Responsive across desktop and mobile. Start a booking on your phone, finish on your laptop.' },
          ].map(({ icon, title, body }) => (
            <div key={title} className="glass-card p-6 rounded-xl group hover:-translate-y-1">
              <span className="material-symbols-outlined text-teal-500 mb-3 block group-hover:scale-110 transition-transform" style={{ fontSize: 20 }}>{icon}</span>
              <h3 className="font-semibold text-slate-900 text-sm mb-1.5">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-teal-600 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">Ready to book your first appointment?</h2>
          <p className="text-teal-100 mb-8 leading-relaxed" style={{ fontWeight: 300 }}>
            Create a free patient account. No credit card, no forms — just a conversation.
          </p>
          <button onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-teal-50 transition-colors text-teal-700 font-semibold text-sm shadow-md">
            Create free account
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
            </div>
            <span className="text-slate-500 text-sm">Nexus Health</span>
          </div>
          <p className="text-slate-400 text-xs" style={{ fontFamily: "'DM Mono',monospace" }}>
            Spring Boot · Spring AI · Groq · React · PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  )
}