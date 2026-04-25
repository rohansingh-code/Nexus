export default function DoctorCard({ doctor, onSelect }) {
  return (
    <div 
      className="bento-glow bg-white/40 border border-slate-100 rounded-xl p-5 flex flex-col justify-between hover:bg-teal-600/5 hover:border-teal-600/30 transition-all cursor-pointer group animate-fade-in" 
      onClick={() => onSelect(doctor)}
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-teal-600/10 border border-teal-600/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-500 text-[14px]">medical_services</span>
          </div>
          <span className="font-mono text-[9px] text-teal-500 tracking-widest uppercase">Available Specialist</span>
        </div>
        <p className="font-mono text-sm text-slate-700 group-hover:text-stone-100 transition-colors">
          {doctor.name}
        </p>
        <p className="font-mono text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
          {doctor.specialization} • ID: {doctor.id}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">SYST_ACTION</span>
        <button 
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 font-mono text-[10px] tracking-widest hover:bg-teal-600 hover:text-slate-900 hover:border-teal-500 transition-all shadow-sm"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(doctor)
          }}
        >
          SELECT DOCTOR
        </button>
      </div>
    </div>
  )
}