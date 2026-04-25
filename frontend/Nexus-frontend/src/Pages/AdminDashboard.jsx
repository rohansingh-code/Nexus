import { useState, useEffect } from 'react'
import { onboardDoctor, getAllPatients, getDoctors } from '../api/agent'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ONBOARD') // 'ONBOARD', 'PATIENTS', 'DOCTORS'
  
  // Onboard State
  const [form, setForm] = useState({
    userId: '', name: '', specialization: '', experienceYears: '',
    qualifications: '', bio: '', shiftStart: '09:00:00', shiftEnd: '17:00:00', workDays: []
  })
  const [onboardLoading, setOnboardLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Data State
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [dataLoading, setDataLoading] = useState(false)

  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

  useEffect(() => {
    if (activeTab === 'PATIENTS') {
      fetchPatients()
    } else if (activeTab === 'DOCTORS') {
      fetchDoctors()
    }
  }, [activeTab])

  async function fetchPatients() {
    setDataLoading(true)
    try {
      const data = await getAllPatients(0, 50) // Fetch top 50 for now
      setPatients(data)
    } catch (err) {
      setError('Failed to fetch patients.')
    } finally {
      setDataLoading(false)
    }
  }

  async function fetchDoctors() {
    setDataLoading(true)
    try {
      const data = await getDoctors()
      setDoctors(data)
    } catch (err) {
      setError('Failed to fetch doctors.')
    } finally {
      setDataLoading(false)
    }
  }

  function toggleDay(day) {
    setForm(prev => {
      const days = new Set(prev.workDays)
      if (days.has(day)) days.delete(day)
      else days.add(day)
      return { ...prev, workDays: Array.from(days) }
    })
  }

  async function handleOnboardSubmit(e) {
    e.preventDefault()
    setOnboardLoading(true)
    setError('')
    setSuccess('')

    if (form.workDays.length === 0) {
      setError('Select at least one work day.')
      setOnboardLoading(false)
      return
    }

    try {
      await onboardDoctor({
        ...form,
        userId: Number(form.userId),
        experienceYears: Number(form.experienceYears),
        shiftStart: form.shiftStart.length === 5 ? form.shiftStart + ':00' : form.shiftStart,
        shiftEnd: form.shiftEnd.length === 5 ? form.shiftEnd + ':00' : form.shiftEnd,
      })
      setSuccess(`Doctor ${form.name} successfully onboarded.`)
      setForm({
        userId: '', name: '', specialization: '', experienceYears: '',
        qualifications: '', bio: '', shiftStart: '09:00:00', shiftEnd: '17:00:00', workDays: []
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to onboard doctor.')
    } finally {
      setOnboardLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-6 relative z-10 animate-fade-in">
        
        {/* Header */}
        <div className="bento-glow rounded-3xl border border-red-500/20 p-8 flex justify-between items-center"
             style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <span className="material-symbols-outlined text-red-500 text-3xl">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-2xl font-headline-md text-stone-200 mb-1">Admin Control Center</h1>
              <p className="font-mono text-xs text-stone-500 uppercase tracking-widest">
                High Privilege Operations & Live Data
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[10px] tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
            LEVEL 5 CLEARANCE
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-white/5 pb-4">
          {['ONBOARD', 'PATIENTS', 'DOCTORS'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); }}
              className={`px-6 py-3 font-mono text-[11px] tracking-[0.2em] uppercase transition-all rounded-xl ${
                activeTab === tab 
                  ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                  : 'bg-black/40 text-stone-500 border border-white/5 hover:text-stone-300 hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bento-glow bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
            <span className="text-red-400 text-xs font-mono">{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bento-glow bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-teal-400 text-[18px]">check_circle</span>
            <span className="text-teal-400 text-xs font-mono">{success}</span>
          </div>
        )}

        {/* ONBOARD TAB */}
        {activeTab === 'ONBOARD' && (
          <div className="bento-glow rounded-3xl border border-white/[0.07] p-8 animate-fade-in relative overflow-hidden"
               style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4 relative z-10">
              <span className="material-symbols-outlined text-orange-500">person_add</span>
              <h2 className="font-mono text-sm text-stone-200 tracking-widest uppercase">Initialize Doctor Entity</h2>
            </div>
            
            <form onSubmit={handleOnboardSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">pin</span> System User ID</label>
                  <input type="number" required min={1} value={form.userId} onChange={(e) => setForm(p => ({ ...p, userId: e.target.value }))} className="w-full bg-black/40 border border-white/10 focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-stone-200 font-mono transition-all" placeholder="e.g. 1" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">badge</span> Formal Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-black/40 border border-white/10 focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-stone-200 font-mono transition-all" placeholder="Dr. Gregory House" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">medical_services</span> Specialization</label>
                  <input type="text" required value={form.specialization} onChange={(e) => setForm(p => ({ ...p, specialization: e.target.value }))} className="w-full bg-black/40 border border-white/10 focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-stone-200 font-mono transition-all" placeholder="Diagnostic Medicine" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">workspace_premium</span> Qualifications</label>
                  <input type="text" required value={form.qualifications} onChange={(e) => setForm(p => ({ ...p, qualifications: e.target.value }))} className="w-full bg-black/40 border border-white/10 focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-stone-200 font-mono transition-all" placeholder="M.D., Board Certified" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">timeline</span> Experience (Years)</label>
                  <input type="number" required min={0} max={60} value={form.experienceYears} onChange={(e) => setForm(p => ({ ...p, experienceYears: e.target.value }))} className="w-full bg-black/40 border border-white/10 focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-stone-200 font-mono transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">schedule</span> Shift Start</label>
                  <input type="time" required step="1" value={form.shiftStart} onChange={(e) => setForm(p => ({ ...p, shiftStart: e.target.value }))} className="w-full bg-black/40 border border-white/10 focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-stone-200 font-mono transition-all [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">update</span> Shift End</label>
                  <input type="time" required step="1" value={form.shiftEnd} onChange={(e) => setForm(p => ({ ...p, shiftEnd: e.target.value }))} className="w-full bg-black/40 border border-white/10 focus:border-orange-500/50 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)] outline-none rounded-xl px-4 py-3 text-sm text-stone-200 font-mono transition-all [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">calendar_month</span> Operational Days</label>
                <div className="flex flex-wrap gap-3">
                  {DAYS.map(day => (
                    <button type="button" key={day} onClick={() => toggleDay(day)} className={`px-4 py-2.5 rounded-xl border font-mono text-[10px] tracking-widest transition-all ${form.workDays.includes(day) ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]' : 'bg-black/40 border-white/10 text-stone-500 hover:border-white/30'}`}>{day.substring(0, 3)}</button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button type="submit" disabled={onboardLoading} className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-semibold text-[11px] tracking-[0.2em] uppercase px-8 py-4 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  {onboardLoading ? 'TRANSMITTING...' : 'COMMIT DOCTOR'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PATIENTS TAB */}
        {activeTab === 'PATIENTS' && (
          <div className="bento-glow rounded-3xl border border-white/[0.07] p-8 animate-fade-in"
               style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-teal-400">group</span>
              <h2 className="font-mono text-sm text-stone-200 tracking-widest uppercase">Registered Patients</h2>
             </div>
             {dataLoading ? (
               <div className="flex items-center gap-3 py-4">
                 <div className="w-4 h-4 border-t-2 border-teal-500 rounded-full animate-spin"></div>
                 <p className="text-stone-500 font-mono text-xs">Fetching records...</p>
               </div>
             ) : (
               <div className="grid gap-4">
                 {patients.map(p => (
                   <div key={p.id} className="border border-white/5 bg-black/40 p-5 rounded-xl flex justify-between items-center hover:border-teal-500/30 hover:bg-teal-500/5 transition-all group">
                     <div>
                       <p className="text-stone-200 font-medium text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-stone-600 group-hover:text-teal-400 transition-colors">person</span>
                          {p.name}
                       </p>
                       <p className="text-stone-500 font-mono text-[10px] mt-2 uppercase">{p.email}</p>
                     </div>
                     <div className="text-right">
                       <span className="text-teal-400 font-mono text-[10px] border border-teal-500/20 bg-teal-500/10 px-2 py-1 rounded">ID: {p.id}</span>
                       <p className="text-stone-500 font-mono text-[10px] mt-2">{p.gender} | {p.bloodGroup?.replace('_',' ')}</p>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* DOCTORS TAB */}
        {activeTab === 'DOCTORS' && (
          <div className="bento-glow rounded-3xl border border-white/[0.07] p-8 animate-fade-in"
               style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(20px)' }}>
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-orange-400">stethoscope</span>
              <h2 className="font-mono text-sm text-stone-200 tracking-widest uppercase">Registered Doctors</h2>
             </div>
             {dataLoading ? (
               <div className="flex items-center gap-3 py-4">
                 <div className="w-4 h-4 border-t-2 border-orange-500 rounded-full animate-spin"></div>
                 <p className="text-stone-500 font-mono text-xs">Fetching records...</p>
               </div>
             ) : (
               <div className="grid lg:grid-cols-2 gap-4">
                 {doctors.map(d => (
                   <div key={d.id} className="border border-white/5 bg-black/40 p-5 rounded-xl hover:border-orange-500/30 hover:bg-orange-500/5 transition-all group">
                     <div className="flex justify-between items-start mb-3">
                       <p className="text-stone-200 font-medium text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-stone-600 group-hover:text-orange-400 transition-colors">medical_services</span>
                          {d.name}
                       </p>
                       <span className="text-orange-400 font-mono text-[10px] border border-orange-500/20 bg-orange-500/10 px-2 py-1 rounded">ID: {d.id}</span>
                     </div>
                     <p className="text-stone-400 font-mono text-[11px] mb-3">{d.specialization}</p>
                     <p className="text-stone-500 font-mono text-[10px] uppercase">Shifts: {d.shiftStart} - {d.shiftEnd}</p>
                     <div className="flex flex-wrap gap-2 mt-3">
                       {d.workDays.map(day => (
                         <span key={day} className="text-[9px] border border-white/10 bg-white/5 px-2 py-1 rounded font-mono text-stone-400 uppercase tracking-widest">{day.substring(0,3)}</span>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  )
}
