import { useState, useEffect } from 'react'
import { getDoctorAppointments } from '../api/agent'
import { useAppStore } from '../store/useAppStore'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // A doctor might not have a full 'profile' endpoint yet, but their ID is in the token.
  // We just fetch appointments.
  useEffect(() => {
    async function loadDoctorData() {
      try {
        const apts = await getDoctorAppointments()
        setAppointments(apts)
      } catch (err) {
        setError('Failed to fetch schedule from Nexus.')
      } finally {
        setLoading(false)
      }
    }
    loadDoctorData()
  }, [])

  // Simple sorting: upcoming vs past
  const now = new Date()
  const upcomingAppointments = appointments.filter(a => new Date(a.appointmentTime) >= now)
  const pastAppointments = appointments.filter(a => new Date(a.appointmentTime) < now)

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-t-2 border-orange-500 animate-spin"></div>
          <span className="font-mono text-xs text-stone-500 uppercase tracking-widest">Loading Schedule...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="bento-glow rounded-3xl border border-white/[0.07] p-8 flex justify-between items-center"
             style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.1)]">
              <span className="material-symbols-outlined text-teal-400 text-3xl">stethoscope</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline-md text-stone-200 mb-1">Doctor Command Center</h1>
              <p className="font-mono text-xs text-stone-500 uppercase tracking-widest">
                Live Schedule & Patient Overview
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono text-[10px] tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
            ON SHIFT
          </div>
        </div>

        {error && (
           <div className="bento-glow p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-red-400 font-mono text-sm">
             {error}
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bento-glow rounded-3xl border border-white/[0.07] p-8 relative overflow-hidden"
               style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
            <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4 relative z-10">
              <span className="material-symbols-outlined text-orange-400">schedule</span>
              <h2 className="font-mono text-xs text-orange-400 tracking-widest uppercase">Today's Queue</h2>
            </div>
            
            <div className="space-y-4 relative z-10">
              {upcomingAppointments.length === 0 ? (
                <p className="text-stone-500 font-mono text-xs italic">No upcoming appointments.</p>
              ) : (
                upcomingAppointments.map((apt, idx) => (
                  <div key={apt.id} className={`border ${idx === 0 ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5 bg-black/40'} rounded-xl p-5 transition-all group`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-stone-200 font-medium text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-stone-500 group-hover:text-orange-400 transition-colors">person</span>
                        Patient ID: {apt.patientId}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-1 rounded border ${idx === 0 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-white/5 text-stone-400 border-white/10'}`}>
                        {new Date(apt.appointmentTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-stone-400 font-mono">{apt.reason}</p>
                      <span className="font-mono text-[10px] tracking-widest text-stone-500 uppercase bg-black/50 px-2 py-1 rounded">SCHEDULED</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Appointments */}
          <div className="bento-glow rounded-3xl border border-white/[0.07] p-8"
               style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-stone-500">history</span>
              <h2 className="font-mono text-xs text-stone-400 tracking-widest uppercase">Recent History</h2>
            </div>

            <div className="space-y-4">
              {pastAppointments.length === 0 ? (
                <p className="text-stone-500 font-mono text-xs italic">No past appointments.</p>
              ) : (
                pastAppointments.map(apt => (
                  <div key={apt.id} className="border border-white/5 bg-black/20 rounded-xl p-5 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-stone-300 font-medium text-sm flex items-center gap-2">
                         <span className="material-symbols-outlined text-[16px] text-stone-600">person</span>
                         Patient ID: {apt.patientId}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">
                        {new Date(apt.appointmentTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-stone-500 font-mono">{apt.reason}</p>
                      <span className="font-mono text-[10px] tracking-widest text-teal-500 uppercase border border-teal-500/20 bg-teal-500/10 px-2 py-1 rounded">COMPLETED</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
