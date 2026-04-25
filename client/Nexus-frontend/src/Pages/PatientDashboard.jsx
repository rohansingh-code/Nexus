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
          <div className="w-8 h-8 rounded-full border-t-2 border-teal-600 animate-spin"></div>
          <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">Syncing Nodes...</span>
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
        <div className="bento-glow rounded-3xl border border-slate-200 p-8 flex justify-between items-center"
             style={{ background: 'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,1))', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-600/10 border border-teal-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(13,148,136,0.1)]">
              <span className="material-symbols-outlined text-teal-500 text-3xl">person</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline-md text-slate-800 mb-1">{user?.name}</h1>
              <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                ID: {user?.id} • {user?.gender} • {user?.bloodGroup?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-teal-600/10 border border-teal-600/30 text-teal-500 font-mono text-[10px] tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-ping"></div>
            STATUS: NOMINAL
          </div>
        </div>

        {/* Medical Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bento-glow rounded-3xl border border-slate-200 p-8"
               style={{ background: 'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,1))', backdropFilter: 'blur(20px)' }}>
             <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <span className="material-symbols-outlined text-slate-600">vital_signs</span>
              <h2 className="font-mono text-xs text-slate-700 tracking-widest uppercase">Vitals Record</h2>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center terminal-line pl-4">
                 <span className="text-sm text-slate-500 font-mono">Date of Birth</span>
                 <span className="font-mono text-slate-800 bg-white shadow-sm px-3 py-1 rounded-md border border-slate-100">{user?.birthDate}</span>
               </div>
               <div className="flex justify-between items-center terminal-line pl-4">
                 <span className="text-sm text-slate-500 font-mono">Clearance Level</span>
                 <span className="font-mono text-teal-400 bg-teal-500/10 px-3 py-1 rounded-md border border-teal-500/20">PATIENT</span>
               </div>
             </div>
          </div>

          <div className="bento-glow rounded-3xl border border-slate-200 p-8 relative overflow-hidden"
               style={{ background: 'linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,1))', backdropFilter: 'blur(20px)' }}>
             <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-teal-600/10 blur-2xl rounded-full pointer-events-none"></div>
             <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4 relative z-10">
              <span className="material-symbols-outlined text-teal-500">event</span>
              <h2 className="font-mono text-xs text-teal-500 tracking-widest uppercase">Upcoming Appointments</h2>
             </div>
             
             <div className="space-y-4 relative z-10">
               {appointments.length === 0 ? (
                 <p className="text-slate-500 font-mono text-xs italic">No scheduled appointments found.</p>
               ) : (
                 appointments.map((apt) => (
                   <div key={apt.id} className="border border-slate-100 bg-white shadow-sm rounded-xl p-4 flex justify-between items-center hover:border-teal-600/30 hover:bg-teal-600/5 transition-colors group">
                     <div>
                       <p className="text-slate-800 text-sm font-medium flex items-center gap-2">
                         <span className="material-symbols-outlined text-[14px] text-slate-500 group-hover:text-teal-500 transition-colors">medical_services</span>
                         {apt.doctorName}
                       </p>
                       <p className="text-slate-500 text-xs font-mono mt-1">{apt.reason}</p>
                     </div>
                     <div className="text-right">
                       <span className="block font-mono text-[10px] text-teal-500 bg-teal-600/10 border border-teal-600/20 px-2 py-1 rounded uppercase tracking-wider">
                         {new Date(apt.appointmentTime).toLocaleDateString()}
                       </span>
                       <span className="block text-slate-500 font-mono text-[10px] mt-2">
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
