import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup } from '../api/agent'

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

export default function SignUpPage() {
  const [form, setForm] = useState({
    username: '', // Using username for email as per backend
    password: '',
    name: '',
    birthDate: '',
    gender: 'MALE',
    bloodGroup: 'O_POSITIVE'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await signup(form)
      setSuccess('Record initialized successfully. Proceed to authorization.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Initialization failed. Check your data format.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: noiseSvg, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '100% 80px'
          }} />
      </div>

      <div className="z-10 w-full max-w-2xl mt-12 mb-12 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 mb-6 shadow-[0_0_20px_rgba(20,184,166,0.1)]">
             <span className="material-symbols-outlined text-teal-400">person_add</span>
          </div>
          <h1 className="text-slate-900 font-bold text-3xl font-headline-md tracking-tight mb-2">Initialize Patient Record</h1>
          <p className="text-slate-600 font-mono text-[11px] uppercase tracking-[0.2em]">
            System Registration
          </p>
        </div>

        <div className="bento-glow rounded-3xl border border-slate-200 p-8"
             style={{ background: 'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,1))', backdropFilter: 'blur(20px)' }}>
          
          <form onSubmit={handleSignUp} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">badge</span> Full Legal Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white shadow-sm border border-slate-200 focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-stone-700 transition-all font-mono"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">mail</span> Operator ID (Email)
                </label>
                <input
                  type="email"
                  required
                  value={form.username}
                  onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                  className="w-full bg-white shadow-sm border border-slate-200 focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-stone-700 transition-all font-mono"
                  placeholder="john@nexus.local"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">key</span> Passcode
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-white shadow-sm border border-slate-200 focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-stone-700 transition-all font-mono tracking-widest"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">cake</span> Birth Date
                </label>
                <input
                  type="date"
                  required
                  value={form.birthDate}
                  onChange={(e) => setForm(p => ({ ...p, birthDate: e.target.value }))}
                  className="w-full bg-white shadow-sm border border-slate-200 focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-slate-800 transition-all font-mono [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">wc</span> Gender
                </label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) => setForm(p => ({ ...p, gender: e.target.value }))}
                  className="w-full bg-white shadow-sm border border-slate-200 focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] outline-none rounded-xl px-4 py-3.5 text-sm text-slate-800 transition-all font-mono appearance-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">bloodtype</span> Blood Group
                </label>
                <select
                  required
                  value={form.bloodGroup}
                  onChange={(e) => setForm(p => ({ ...p, bloodGroup: e.target.value }))}
                  className="w-full bg-white shadow-sm border border-slate-200 focus:border-teal-500/50 focus:shadow-[0_0_20px_rgba(20,184,166,0.15)] outline-none rounded-xl px-4 py-3.5 text-sm text-slate-800 transition-all font-mono appearance-none"
                >
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-fade-in mt-4">
                <span className="material-symbols-outlined text-red-400 text-[18px]">gpp_bad</span>
                <span className="text-red-400 text-xs font-mono">{error}</span>
              </div>
            )}

            {success && (
              <div className="px-4 py-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center gap-3 animate-fade-in mt-4">
                <span className="material-symbols-outlined text-teal-400 text-[18px]">check_circle</span>
                <span className="text-teal-400 text-xs font-mono">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 px-7 py-4 mt-8 rounded-xl bg-white border border-slate-300 hover:bg-teal-500/20 hover:border-teal-500/50 disabled:opacity-50 transition-all text-slate-900 font-semibold text-sm shadow-[0_0_30px_rgba(20,184,166,0.1)] hover:shadow-[0_0_40px_rgba(20,184,166,0.25)]"
            >
              {loading ? (
                <span className="font-mono text-xs tracking-widest uppercase">TRANSMITTING...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-teal-400">publish</span>
                  SUBMIT RECORD
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button 
              onClick={() => navigate('/login')}
              className="text-[10px] font-mono text-slate-500 hover:text-teal-400 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-1 mx-auto"
            >
              <span className="material-symbols-outlined text-[12px]">login</span>
              Return to Authorization
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
