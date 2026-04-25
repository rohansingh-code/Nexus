export default function DoctorCard({ doctor, onSelect }) {
  return (
    <div 
      className="bento-glow bg-stone-900/40 border border-white/5 rounded-xl p-5 flex flex-col justify-between hover:bg-orange-500/5 hover:border-orange-500/30 transition-all cursor-pointer group animate-fade-in" 
      onClick={() => onSelect(doctor)}
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-400 text-[14px]">medical_services</span>
          </div>
          <span className="font-mono text-[9px] text-orange-400 tracking-widest uppercase">Available Specialist</span>
        </div>
        <p className="font-mono text-sm text-stone-300 group-hover:text-stone-100 transition-colors">
          {doctor.name}
        </p>
        <p className="font-mono text-[10px] text-stone-500 mt-1 uppercase tracking-wider">
          {doctor.specialization} • ID: {doctor.id}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="font-mono text-[9px] text-stone-600 tracking-widest uppercase">SYST_ACTION</span>
        <button 
          className="px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-400 font-mono text-[10px] tracking-widest hover:bg-orange-500 hover:text-white hover:border-orange-400 transition-all shadow-sm"
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