import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/agent'
import { useAppStore } from '../store/useAppStore'

export default function LoginPage() {
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAppStore(s => s.setAuth)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(creds)
      setAuth(data.jwt, data.roles)
      navigate('/dashboard')
    } catch {
      setError('Incorrect email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg-subtle flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>


      <div className="hidden md:flex w-1/2 bg-teal-600 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
          </div>
          <span className="text-white font-semibold">Nexus</span>
        </div>
        <div>
          <p className="text-teal-100 text-sm mb-3 uppercase tracking-widest" style={{ fontFamily: "'DM Mono',monospace" }}>AI Medical Booking</p>
          <h2 className="text-white text-4xl font-semibold leading-snug mb-6">
            The fastest way to see the right doctor.
          </h2>
          <p className="text-teal-200 leading-relaxed" style={{ fontWeight: 300 }}>
            Describe your symptoms. Nexus finds available specialists and books your appointment — in one conversation.
          </p>
        </div>
        <div className="flex items-center gap-3 text-teal-200 text-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
          End-to-end encrypted · HIPAA compliant
        </div>
      </div>


      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 glass-panel">
        <div className="w-full max-w-sm animate-fade-in">

          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
            </div>
            <span className="font-semibold text-slate-900">Nexus</span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account to continue.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input type="email" required autoComplete="email"
                value={creds.username}
                onChange={e => setCreds(p => ({ ...p, username: e.target.value }))}
                className="w-full border border-white/60 bg-white/50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm"
                placeholder="you@example.com" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-xs text-teal-600 hover:text-teal-700 font-medium">Forgot password?</button>
              </div>
              <input type="password" required autoComplete="current-password"
                value={creds.password}
                onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                className="w-full border border-white/60 bg-white/50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm"
                placeholder="••••••••" />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: 16 }}>error</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-60 transition-colors text-white font-semibold text-sm mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-teal-600 font-medium hover:text-teal-700">
              Create one free
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}