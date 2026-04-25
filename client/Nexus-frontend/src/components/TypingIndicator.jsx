export default function TypingIndicator() {
  return (
    <div className="flex gap-4 w-full max-w-[85%] animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-teal-600/10 flex items-center justify-center border border-teal-600/30 shrink-0 shadow-[0_0_15px_rgba(13,148,136,0.1)]">
        <span className="material-symbols-outlined text-teal-500 text-[22px]">psychology</span>
      </div>
      <div className="bg-white/60 border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center backdrop-blur-md">
        <span className="w-1.5 h-1.5 bg-teal-600/60 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-teal-600/60 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-teal-600/60 rounded-full animate-bounce [animation-delay:300ms]" />
        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest ml-2">Processing...</span>
      </div>
    </div>
  )
}