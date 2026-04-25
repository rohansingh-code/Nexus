export default function TypingIndicator() {
  return (
    <div className="flex gap-4 w-full max-w-[85%] animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
        <span className="material-symbols-outlined text-orange-400 text-[22px]">psychology</span>
      </div>
      <div className="bg-stone-900/60 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center backdrop-blur-md">
        <span className="w-1.5 h-1.5 bg-orange-500/60 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-orange-500/60 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-orange-500/60 rounded-full animate-bounce [animation-delay:300ms]" />
        <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest ml-2">Processing...</span>
      </div>
    </div>
  )
}