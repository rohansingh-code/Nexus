import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/agent'
import { useAppStore } from '../store/useAppStore'

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

export default function LoginPage() {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAppStore(state => state.setAuth)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(creds)
      setAuth(data.jwt, data.roles)
      navigate('/dashboard')
    } catch {
      setError('Invalid credentials or unauthorized')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: noiseSvg, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '100% 80px'
          }} />
      </div>

      <div className="z-10 w-full max-w-md animate-fade-in">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-600/10 border border-teal-600/20 mb-6 shadow-[0_0_20px_rgba(13,148,136,0.1)]">
             <span className="material-symbols-outlined text-teal-500">admin_panel_settings</span>
          </div>
          <h1 className="text-slate-900 font-bold text-3xl font-headline-md tracking-tight mb-2">Operator Login</h1>
          <p className="text-slate-600 font-mono text-[11px] uppercase tracking-[0.2em]">
            Provide valid credentials to proceed
          </p>
        </div>

        <div className="bento-glow rounded-3xl border border-slate-200 p-8"
             style={{ background: 'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,1))', backdropFilter: 'blur(20px)' }}>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">person</span> Operator ID
              </label>
              <input
                type="text"
                required
                value={creds.username}
                onChange={(e) => setCreds(p => ({ ...p, username: e.target.value }))}
                className="w-full bg-white shadow-sm border border-slate-200 focus:border-teal-600/50 focus:shadow-[0_0_20px_rgba(13,148,136,0.15)] outline-none rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-stone-700 transition-all font-mono"
                placeholder="system_admin"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">key</span> Passcode
              </label>
              <input
                type="password"
                required
                value={creds.password}
                onChange={(e) => setCreds(p => ({ ...p, password: e.target.value }))}
                className="w-full bg-white shadow-sm border border-slate-200 focus:border-teal-600/50 focus:shadow-[0_0_20px_rgba(13,148,136,0.15)] outline-none rounded-xl px-4 py-3.5 text-sm text-slate-800 placeholder-stone-700 transition-all font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-red-400 text-[18px]">gpp_bad</span>
                <span className="text-red-400 text-xs font-mono">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 px-7 py-4 mt-8 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 transition-all text-slate-900 font-semibold text-sm shadow-[0_0_30px_rgba(13,148,136,0.25)] hover:shadow-[0_0_50px_rgba(13,148,136,0.4)]"
            >
              {loading ? (
                <span className="font-mono text-xs tracking-widest uppercase">Authorizing...</span>
              ) : (
                <>
                  AUTHORIZE SESSION
                  <span className="material-symbols-outlined btn-arrow" style={{ fontSize: 18 }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button 
              onClick={() => navigate('/signup')}
              className="text-[10px] font-mono text-slate-500 hover:text-teal-500 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-[12px]">add</span>
              Initialize New Record
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
