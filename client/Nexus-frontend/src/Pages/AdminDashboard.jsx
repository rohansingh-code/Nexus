import { useState, useEffect } from 'react'
import { onboardDoctor, getAllPatients, getDoctors } from '../api/agent'

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
const BLANK_FORM = {
  userId: '', name: '', specialization: '', experienceYears: '',
  qualifications: '', bio: '', shiftStart: '09:00:00', shiftEnd: '17:00:00', workDays: []
}

const inputCls = "w-full border border-white/60 bg-white/50 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm"
const labelCls = "block text-sm font-medium text-slate-700 mb-1.5"

export default function AdminDashboard() {
  const [tab, setTab] = useState('onboard')
  const [form, setForm] = useState(BLANK_FORM)
  const [onboardLoading, setOnboardLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setSearch('')
    if (tab === 'patients') { setDataLoading(true); getAllPatients(0, 50).then(setPatients).catch(() => setMsg({ type: 'error', text: 'Could not load patients.' })).finally(() => setDataLoading(false)) }
    if (tab === 'doctors')  { setDataLoading(true); getDoctors().then(setDoctors).catch(() => setMsg({ type: 'error', text: 'Could not load doctors.' })).finally(() => setDataLoading(false)) }
  }, [tab])

  function toggleDay(day) {
    setForm(p => {
      const s = new Set(p.workDays)
      s.has(day) ? s.delete(day) : s.add(day)
      return { ...p, workDays: [...s] }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.workDays.length === 0) { setMsg({ type: 'error', text: 'Please select at least one work day.' }); return }
    setOnboardLoading(true); setMsg({ type: '', text: '' })
    try {
      await onboardDoctor({
        ...form,
        userId: Number(form.userId),
        experienceYears: Number(form.experienceYears),
        shiftStart: form.shiftStart.length === 5 ? form.shiftStart + ':00' : form.shiftStart,
        shiftEnd:   form.shiftEnd.length === 5   ? form.shiftEnd   + ':00' : form.shiftEnd,
      })
      setMsg({ type: 'success', text: `Dr. ${form.name} has been added successfully.` })
      setForm(BLANK_FORM)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add doctor. Please try again.' })
    } finally {
      setOnboardLoading(false)
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  )
  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase())
  )

  const TABS = [
    { id: 'onboard', label: 'Add doctor', icon: 'person_add' },
    { id: 'patients', label: 'Patients', icon: 'group' },
    { id: 'doctors', label: 'Doctors', icon: 'stethoscope' },
  ]

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">


        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Admin Panel</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage doctors, patients, and hospital records.</p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-red-700 text-xs font-medium">
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>shield</span>
            Admin access
          </span>
        </div>


        <div className="flex gap-1 glass-panel p-1 rounded-xl w-fit animate-fade-in">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMsg({ type: '', text: '' }) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>


        {msg.text && (
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm ${
            msg.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {msg.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {msg.text}
          </div>
        )}


        {tab === 'onboard' && (
          <div className="glass-panel rounded-2xl p-8 animate-fade-in">
            <h2 className="font-semibold text-slate-900 mb-6">Add a new doctor</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>User ID <span className="text-slate-400 font-normal text-xs">(from user account)</span></label>
                  <input type="number" required min={1} placeholder="e.g. 12"
                    value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Full name</label>
                  <input type="text" required placeholder="Dr. Jane Smith"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelCls}>Specialization</label>
                  <input type="text" required placeholder="Cardiology"
                    value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Qualifications</label>
                  <input type="text" required placeholder="MBBS, MD, FRCP"
                    value={form.qualifications} onChange={e => setForm(p => ({ ...p, qualifications: e.target.value }))} className={inputCls} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelCls}>Years of experience</label>
                  <input type="number" required min={0} max={60} placeholder="e.g. 8"
                    value={form.experienceYears} onChange={e => setForm(p => ({ ...p, experienceYears: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Shift start</label>
                  <input type="time" required step="1"
                    value={form.shiftStart} onChange={e => setForm(p => ({ ...p, shiftStart: e.target.value }))} className={inputCls} /></div>
                <div><label className={labelCls}>Shift end</label>
                  <input type="time" required step="1"
                    value={form.shiftEnd} onChange={e => setForm(p => ({ ...p, shiftEnd: e.target.value }))} className={inputCls} /></div>
              </div>

              <div>
                <label className={labelCls}>Work days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button type="button" key={day} onClick={() => toggleDay(day)}
                      className={`px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        form.workDays.includes(day)
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}>
                      {day.charAt(0) + day.slice(1, 3).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Bio <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                <textarea rows={3} placeholder="Brief professional summary…"
                  value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  className={inputCls + ' resize-none'} />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" disabled={onboardLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-60 transition-colors text-white font-semibold text-sm">
                  {onboardLoading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding doctor…</>
                    : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span> Add doctor</>}
                </button>
              </div>
            </form>
          </div>
        )}


        {tab === 'patients' && (
          <div className="glass-panel rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="font-semibold text-slate-900">Registered patients</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 16 }}>search</span>
                <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-white/60 bg-white/50 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all w-60" />
              </div>
            </div>
            {dataLoading
              ? <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
              : filteredPatients.length === 0
                ? <p className="text-slate-400 text-sm py-8 text-center">No patients found.</p>
                : (
                  <div className="divide-y divide-slate-100">
                    {filteredPatients.map(p => (
                      <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-semibold flex-shrink-0">
                            {p.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? 'P'}
                          </div>
                          <div>
                            <p className="text-slate-900 font-medium text-sm">{p.name}</p>
                            <p className="text-slate-400 text-xs">{p.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full" style={{ fontFamily: "'DM Mono',monospace" }}>#{p.id}</span>
                          <p className="text-slate-400 text-xs mt-1">{p.gender} · {p.bloodGroup?.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>
        )}


        {tab === 'doctors' && (
          <div className="glass-panel rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="font-semibold text-slate-900">Registered doctors</h2>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 16 }}>search</span>
                <input type="text" placeholder="Search by name or specialty…" value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-white/60 bg-white/50 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 transition-all w-64" />
              </div>
            </div>
            {dataLoading
              ? <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
              : filteredDoctors.length === 0
                ? <p className="text-slate-400 text-sm py-8 text-center">No doctors found.</p>
                : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {filteredDoctors.map(d => (
                      <div key={d.id} className="glass-card p-4 rounded-xl group hover:-translate-y-0.5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{d.name}</p>
                            <p className="text-teal-600 text-xs mt-0.5">{d.specialization}</p>
                          </div>
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full flex-shrink-0 ml-2" style={{ fontFamily: "'DM Mono',monospace" }}>#{d.id}</span>
                        </div>
                        <p className="text-slate-500 text-xs">{d.shiftStart || '—'} – {d.shiftEnd || '—'}</p>
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {(d.workDays || []).map(day => (
                            <span key={day} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              {day.charAt(0) + day.slice(1, 3).toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>
        )}

      </div>
    </div>
  )
}