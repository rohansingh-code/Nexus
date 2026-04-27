export default function DoctorCard({ doctor, onSelect }) {
  return (
    <div 
      className="glass-card p-5 flex flex-col justify-between group animate-fade-in" 
      onClick={() => onSelect(doctor)}
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          <span className="text-[10px] text-teal-600 font-semibold tracking-wider uppercase">Available Specialist</span>
        </div>
        <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
          {doctor.name}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {doctor.specialization}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-[10px] text-slate-400 font-medium tracking-tight">Schedule available</span>
        <button 
          className="px-4 py-1.5 rounded-lg bg-teal-600 text-white text-[11px] font-semibold hover:bg-teal-500 transition-all shadow-sm"
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