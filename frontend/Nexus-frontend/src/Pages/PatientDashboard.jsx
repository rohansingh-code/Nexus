import { useState, useEffect } from 'react'
import { getProfile, getPatientAppointments } from '../api/agent'
import { useAppStore } from '../store/useAppStore'

export default function PatientDashboard() {
  const user = useAppStore(state => state.user)
  const setUser = useAppStore(state => state.setUser)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [profileData, aptsData] = await Promise.all([
          getProfile(),
          getPatientAppointments()
        ])
        setUser(profileData)
        setAppointments(aptsData)
      } catch (err) {
        setError('Failed to sync with Nexus database.')
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [setUser])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-t-2 border-orange-500 animate-spin"></div>
          <span className="font-mono text-xs text-stone-500 uppercase tracking-widest">Syncing Nodes...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bento-glow p-6 border border-red-500/30 bg-red-500/10 rounded-xl">
          <p className="text-red-400 font-mono text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        
        {/* Profile Card */}
        <div className="bento-glow rounded-3xl border border-white/[0.07] p-8 flex justify-between items-center"
             style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <span className="material-symbols-outlined text-orange-400 text-3xl">person</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline-md text-stone-200 mb-1">{user?.name}</h1>
              <p className="font-mono text-xs text-stone-500 uppercase tracking-widest">
                ID: {user?.id} • {user?.gender} • {user?.bloodGroup?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></div>
            STATUS: NOMINAL
          </div>
        </div>

        {/* Medical Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-glow rounded-3xl border border-white/[0.07] p-8"
               style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-stone-400">vital_signs</span>
              <h2 className="font-mono text-xs text-stone-300 tracking-widest uppercase">Vitals Record</h2>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center terminal-line pl-4">
                 <span className="text-sm text-stone-500 font-mono">Date of Birth</span>
                 <span className="font-mono text-stone-200 bg-black/40 px-3 py-1 rounded-md border border-white/5">{user?.birthDate}</span>
               </div>
               <div className="flex justify-between items-center terminal-line pl-4">
                 <span className="text-sm text-stone-500 font-mono">Clearance Level</span>
                 <span className="font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-md border border-teal-500/20">PATIENT</span>
               </div>
             </div>
          </div>

          <div className="bento-glow rounded-3xl border border-white/[0.07] p-8 relative overflow-hidden"
               style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
             <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-orange-500/10 blur-2xl rounded-full pointer-events-none"></div>
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4 relative z-10">
              <span className="material-symbols-outlined text-orange-400">event</span>
              <h2 className="font-mono text-xs text-orange-400 tracking-widest uppercase">Upcoming Appointments</h2>
             </div>
             
             <div className="space-y-4 relative z-10">
               {appointments.length === 0 ? (
                 <p className="text-stone-500 font-mono text-xs italic">No scheduled appointments found.</p>
               ) : (
                 appointments.map((apt) => (
                   <div key={apt.id} className="border border-white/5 bg-black/40 rounded-xl p-4 flex justify-between items-center hover:border-orange-500/30 hover:bg-orange-500/5 transition-colors group">
                     <div>
                       <p className="text-stone-200 text-sm font-medium flex items-center gap-2">
                         <span className="material-symbols-outlined text-[14px] text-stone-500 group-hover:text-orange-400 transition-colors">medical_services</span>
                         {apt.doctorName}
                       </p>
                       <p className="text-stone-500 text-xs font-mono mt-1">{apt.reason}</p>
                     </div>
                     <div className="text-right">
                       <span className="block font-mono text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded uppercase tracking-wider">
                         {new Date(apt.appointmentTime).toLocaleDateString()}
                       </span>
                       <span className="block text-stone-500 font-mono text-[10px] mt-2">
                         {new Date(apt.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
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
