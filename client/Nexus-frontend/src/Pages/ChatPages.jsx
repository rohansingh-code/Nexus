import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'

const SUGGESTIONS = [
  'I have chest pain when I breathe deeply',
  'My knee has been swelling for 3 days',
  'I need to see a cardiologist this week',
  "I've had a high fever for two days'",
]

export default function ChatPage() {
  const [input, setInput] = useState('')
  const { messages, isTyping, bookingStatus, send, confirmBooking } = useChat()
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function handleSend(text) {
    const msg = (text ?? input).trim()
    if (!msg || isTyping) return
    send(msg)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full bg-transparent" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div className="flex-1 flex overflow-hidden">

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto bg-white/30">
            {isEmpty ? (

              <div className="h-full flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
                </div>
                <h2 className="text-3xl font-semibold text-slate-900 mb-3">Hi, I'm Nexus</h2>
                <p className="text-slate-500 max-w-md leading-relaxed mb-10 text-lg" style={{ fontWeight: 300 }}>
                  Tell me what you're experiencing and I'll find you the right doctor and book your appointment.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={s} onClick={() => handleSend(s)}
                      className="glass-card text-left px-5 py-4 rounded-2xl border border-white/60 text-sm text-slate-700 leading-snug animate-fade-in hover:border-teal-500/50 transition-all shadow-md hover:shadow-lg"
                      style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (

              <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                <div className="flex justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                    <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 12 }}>lock</span>
                    <span className="text-slate-500 text-xs">End-to-end encrypted session</span>
                  </div>
                </div>

                {messages.map((msg, i) => (
                  <ChatBubble
                    key={i} msg={msg}
                    onDoctorSelect={d => handleSend(`I'd like to book with ${d.name}`)}
                    onConfirmBooking={confirmBooking}
                    onCancelBooking={() => handleSend('Cancel that, I want to choose a different option.')}
                    bookingStatus={bookingStatus}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>


          <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 px-4 py-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-2 bg-white/80 border border-white focus-within:border-teal-400/50 focus-within:ring-4 focus-within:ring-teal-500/5 rounded-2xl px-3 py-2 transition-all shadow-sm">
                <textarea ref={textareaRef} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
                  placeholder="Describe your symptoms…"
                  rows={1} style={{ minHeight: 40, maxHeight: 120, fontFamily: "'DM Sans', sans-serif" }}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-slate-800 placeholder-slate-400 text-sm py-1.5 px-1" />
                <button onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 mb-0.5">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
              <p className="text-center text-slate-400 text-xs mt-2">
                Nexus is an AI assistant. Always verify critical medical information with a qualified professional.
              </p>
            </div>
          </div>
        </div>


        <aside className="w-80 bg-white/50 backdrop-blur-sm border-l border-slate-200 flex flex-col p-6 overflow-y-auto hidden lg:flex">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <span className="material-symbols-outlined text-teal-600" style={{ fontSize: 20 }}>lightbulb</span>
            <h3 className="font-semibold text-sm">Common Inquiries</h3>
          </div>
          
          <div className="space-y-3">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => handleSend(s)}
                className="w-full text-left p-3 rounded-xl bg-white border border-slate-100 hover:border-teal-300 hover:bg-teal-50 transition-all text-xs text-slate-600 leading-normal shadow-sm">
                {s}
              </button>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">How it works</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified_user</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Describe your symptoms in plain language.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>search</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  I'll analyze and suggest the best specialists.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>calendar_add_on</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Book your appointment directly within the chat.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}