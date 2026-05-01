import { useState, useEffect } from 'react'
import { getDoctorAppointments } from '../api/agent'

function formatDT(iso) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
    full: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }),
  }
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDoctorAppointments()
      .then(setAppointments)
      .catch(() => setError('Could not load your schedule. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const upcoming = appointments.filter(a => new Date(a.appointmentTime) >= now)
    .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime))
  const past = appointments.filter(a => new Date(a.appointmentTime) < now)
    .sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime))
    .slice(0, 10)

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading your schedule…</p>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Upcoming', value: upcoming.length, icon: 'schedule', color: 'text-teal-600 bg-teal-50' },
            { label: 'Today', value: upcoming.filter(a => { const d = new Date(a.appointmentTime); return d.toDateString() === now.toDateString() }).length, icon: 'today', color: 'text-blue-600 bg-blue-50' },
            { label: 'Completed', value: past.length, icon: 'check_circle', color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Total', value: appointments.length, icon: 'event_note', color: 'text-slate-600 bg-slate-100' },
          ].map(({ label, value, icon, color }, i) => (
            <div key={label} className="glass-card p-4 rounded-xl flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">{value}</p>
                <p className="text-slate-500 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <span className="material-symbols-outlined text-red-500" style={{ fontSize: 16 }}>error</span>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Upcoming appointments</h3>
            {upcoming.length === 0 ? (
              <div className="glass-panel border-dashed rounded-xl p-8 flex flex-col items-center text-center animate-fade-in">
                <span className="material-symbols-outlined text-slate-300 mb-2" style={{ fontSize: 32 }}>calendar_today</span>
                <p className="text-slate-500 text-sm">No upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcoming.map((apt, i) => {
                  const { date, time } = formatDT(apt.appointmentTime)
                  const isNext = i === 0
                  return (
                    <div key={apt.id}
                      className={`glass-card p-4 rounded-xl animate-fade-in ${isNext ? 'border-teal-300 ring-1 ring-teal-100 bg-white/90' : ''}`} style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {isNext && <span className="inline-block text-[10px] font-semibold text-teal-700 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full mb-2" style={{ fontFamily: "'DM Mono',monospace" }}>NEXT</span>}
                          <p className="font-medium text-slate-900 text-sm">
                            {apt.patientName ?? `Patient #${apt.patientId}`}
                          </p>
                          <p className="text-slate-500 text-xs mt-0.5">{apt.reason}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-slate-900 font-medium text-sm">{date}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{time}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>


          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Recent history</h3>
            {past.length === 0 ? (
              <div className="glass-panel border-dashed rounded-xl p-8 flex flex-col items-center text-center animate-fade-in">
                <span className="material-symbols-outlined text-slate-300 mb-2" style={{ fontSize: 32 }}>history</span>
                <p className="text-slate-500 text-sm">No past appointments yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {past.map(apt => {
                  const { date, time } = formatDT(apt.appointmentTime)
                  return (
                    <div key={apt.id} className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm px-4 py-3 flex items-center justify-between gap-3 animate-fade-in">
                      <div>
                        <p className="text-slate-700 font-medium text-sm">{apt.patientName ?? `Patient #${apt.patientId}`}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{apt.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-slate-500 text-xs">{date} · {time}</p>
                        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}