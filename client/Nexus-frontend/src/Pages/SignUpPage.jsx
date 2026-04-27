import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup } from '../api/agent'

export default function SignUpPage() {
  const [form, setForm] = useState({
    username: '', password: '', name: '',
    birthDate: '', gender: 'MALE', bloodGroup: 'O_POSITIVE'
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
      setSuccess('Account created! Redirecting you to sign in…')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  const f = (key, val) => setForm(p => ({ ...p, [key]: val }))
  const inputCls = "w-full border border-white/60 bg-white/50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm"
  const labelCls = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <div className="min-h-screen mesh-bg-subtle flex flex-col items-center justify-center px-6 py-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Free. No credit card required.</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 animate-fade-in">
          <form onSubmit={handleSignUp} className="space-y-5">

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full name</label>
                <input type="text" required placeholder="Jane Doe"
                  value={form.name} onChange={e => f('name', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email address</label>
                <input type="email" required placeholder="you@example.com" autoComplete="email"
                  value={form.username} onChange={e => f('username', e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelCls}>Password</label>
              <input type="password" required minLength={8} placeholder="Minimum 8 characters"
                value={form.password} onChange={e => f('password', e.target.value)} className={inputCls} />
              {form.password.length > 0 && form.password.length < 8 && (
                <p className="text-amber-600 text-xs mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>warning</span>
                  At least 8 characters needed
                </p>
              )}
            </div>

            {/* DOB + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date of birth</label>
                <input type="date" required
                  value={form.birthDate} onChange={e => f('birthDate', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select value={form.gender} onChange={e => f('gender', e.target.value)} className={inputCls}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Blood group */}
            <div>
              <label className={labelCls}>Blood group</label>
              <select value={form.bloodGroup} onChange={e => f('bloodGroup', e.target.value)} className={inputCls}>
                {['A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE'].map(v => (
                  <option key={v} value={v}>{v.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3.5 py-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5" style={{ fontSize: 16 }}>error</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 px-3.5 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 16 }}>check_circle</span>
                <span className="text-emerald-700 text-sm">{success}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 transition-colors text-white font-semibold text-sm">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                : 'Create account'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-teal-600 font-medium hover:text-teal-700">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}