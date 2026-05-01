export default function BookingConfirm({ bookingReady, onConfirm, onCancel, status }) {
  if (status === 'success') return null

  return (
    <div 
      className="rounded-2xl border p-6 mt-6 w-full animate-fade-in shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
      style={{
        borderColor: 'rgba(16,185,129,0.25)',
        background: 'linear-gradient(135deg, rgba(6,78,59,0.15), rgba(4,47,46,0.25))',
        backdropFilter: 'blur(16px)',
      }}
    >

      <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-600/10 blur-3xl rounded-full pointer-events-none" />
      

      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600/10 border border-teal-600/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="material-symbols-outlined text-teal-600 text-[18px]">check_circle</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-teal-600 tracking-[0.2em] uppercase font-bold">[BOOKING_READY]</span>
            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Protocol Verification Required</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded bg-teal-600/10 border border-teal-600/20">
            <span className="font-mono text-[9px] text-teal-600 uppercase tracking-tighter animate-pulse">Live_Sync</span>
        </div>
      </div>


      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col gap-1 terminal-line pl-3">
          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">Specialist</span>
          <span className="text-slate-800 text-xs font-mono">{bookingReady.doctorName ?? `Dr. #${bookingReady.doctorId}`}</span>
        </div>
        <div className="flex flex-col gap-1 terminal-line pl-3">
          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">Slot_Time</span>
          <span className="text-slate-800 text-xs font-mono">{bookingReady.date} · {bookingReady.time}</span>
        </div>
        <div className="flex flex-col gap-1 terminal-line pl-3 col-span-2">
          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest font-bold">Indication</span>
          <span className="text-slate-700 text-xs font-mono italic truncate">"{bookingReady.reason}"</span>
        </div>
      </div>

      {status === 'error' && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-red-400 text-[18px]">gpp_bad</span>
          <span className="text-red-400 text-[10px] uppercase tracking-widest font-mono">Initialization Failed: Error 0x442</span>
        </div>
      )}


      <div className="flex gap-4 items-center justify-end border-t border-slate-100 pt-6">
        <button
          onClick={onCancel}
          disabled={status === 'confirming'}
          className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white/[0.03] hover:bg-white/[0.06] transition-all text-slate-600 hover:text-slate-800 text-[10px] font-mono uppercase tracking-widest disabled:opacity-50"
        >
          Abort
        </button>
        <button
          onClick={() => onConfirm(bookingReady)}
          disabled={status === 'confirming'}
          className="group flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 transition-all text-slate-900 font-bold text-[11px] font-mono tracking-widest shadow-[0_0_25px_rgba(13,148,136,0.25)] hover:shadow-[0_0_40px_rgba(13,148,136,0.4)] disabled:opacity-50"
        >
          {status === 'confirming' ? (
            <span className="animate-pulse">Commiting...</span>
          ) : (
            <>
              CONFIRM_PROTOCOL
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" style={{ fontSize: 16 }}>arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}