import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, getPatientAppointments } from '../api/agent'
import { useAppStore } from '../store/useAppStore'

const STATUS_COLORS = {
  SCHEDULED: 'bg-teal-50 text-teal-700 border-teal-200',
  COMPLETED:  'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED:  'bg-red-50 text-red-600 border-red-200',
}

function formatDT(iso) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
  }
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const user = useAppStore(s => s.user)
  const setUser = useAppStore(s => s.setUser)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [profile, apts] = await Promise.all([getProfile(), getPatientAppointments()])
        setUser(profile)
        setAppointments(apts)
      } catch {
        setError('Could not load your data. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [setUser])

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading your profile…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl max-w-sm">
        <span className="material-symbols-outlined text-red-500" style={{ fontSize: 20 }}>error</span>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    </div>
  )

  const upcoming = appointments.filter(a => new Date(a.appointmentTime) >= new Date())
  const past = appointments.filter(a => new Date(a.appointmentTime) < new Date())

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Profile card */}
        <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
              {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{user?.name ?? '—'}</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {user?.gender?.charAt(0) + user?.gender?.slice(1).toLowerCase() ?? ''} ·{' '}
                {user?.bloodGroup?.replace('_', ' ') ?? '—'} ·{' '}
                DOB {user?.birthDate ?? '—'}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/chat')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 transition-colors text-white font-semibold text-sm shadow-sm self-start md:self-auto">
            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>add</span>
            Book appointment
          </button>
        </div>

        {/* Upcoming appointments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Upcoming appointments</h3>
            <span className="text-xs text-slate-400" style={{ fontFamily: "'DM Mono',monospace" }}>{upcoming.length} scheduled</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="glass-panel rounded-2xl border-dashed p-10 flex flex-col items-center text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-teal-500" style={{ fontSize: 24 }}>calendar_today</span>
              </div>
              <p className="text-slate-700 font-medium mb-1">No upcoming appointments</p>
              <p className="text-slate-400 text-sm mb-5 max-w-xs">Tell Nexus your symptoms and it'll find you the right doctor and book a time slot.</p>
              <button onClick={() => navigate('/chat')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 transition-colors text-white font-semibold text-sm">
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>chat_bubble</span>
                Book via AI
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt, idx) => {
                const { date, time } = formatDT(apt.appointmentTime)
                return (
                  <div key={apt.id} className={`glass-card p-5 flex items-center justify-between gap-4 animate-fade-in ${idx === 0 ? 'border-teal-300 ring-1 ring-teal-100' : ''}`} style={{ animationDelay: `${0.1 + idx * 0.05}s` }}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${idx === 0 ? 'bg-teal-50' : 'bg-slate-50'}`}>
                        <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{apt.doctorName ?? `Doctor #${apt.doctorId}`}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{apt.reason}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-slate-900 font-medium text-sm">{date}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Past appointments */}
        {past.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Past appointments</h3>
            <div className="space-y-2">
              {past.map(apt => {
                const { date, time } = formatDT(apt.appointmentTime)
                return (
                  <div key={apt.id} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm px-5 py-4 flex items-center justify-between gap-4 animate-fade-in">
                    <div>
                      <p className="text-slate-700 font-medium text-sm">{apt.doctorName ?? `Doctor #${apt.doctorId}`}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{apt.reason}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-slate-500 text-xs">{date} · {time}</p>
                      <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[apt.status] ?? STATUS_COLORS.COMPLETED}`}>
                        {apt.status?.charAt(0) + apt.status?.slice(1).toLowerCase() ?? 'Completed'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}