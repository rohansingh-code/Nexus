import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const { messages, isTyping, bookingStatus, send, confirmBooking } = useChat()
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    if (!input.trim() || isTyping) return
    send(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleDoctorSelect(doctor) {
    send(`I'd like to book with ${doctor.name}`)
  }

  function handleCancelBooking() {
    send('Cancel that, I want to choose a different option.')
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-[20%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] bg-teal-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-24 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Context Chip */}
        <div className="flex justify-center w-full animate-fade-in">
          <div className="px-4 py-1.5 rounded-full border border-teal-600/20 bg-teal-600/5 backdrop-blur-md shadow-[0_0_15px_rgba(13,148,136,0.1)]">
            <span className="font-mono text-[10px] text-teal-500 tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[12px]">security</span>
              Triage Session Initialized • HIPAA Protected
            </span>
          </div>
        </div>

        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            msg={msg}
            onDoctorSelect={handleDoctorSelect}
            onConfirmBooking={confirmBooking}
            onCancelBooking={handleCancelBooking}
            bookingStatus={bookingStatus}
          />
        ))}

        {isTyping && <TypingIndicator />}
        
        <div ref={bottomRef} className="h-4 w-full shrink-0" />
      </div>

      {/* Input Area (Fixed at bottom) */}
      <div className="p-4 md:p-6 lg:px-24 border-t border-slate-200 bg-white backdrop-blur-2xl shrink-0 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 border border-slate-200 focus-within:border-teal-600/50 focus-within:shadow-[0_0_20px_rgba(13,148,136,0.15)] focus-within:bg-white rounded-2xl p-2 flex items-end gap-3 transition-all duration-300">
            <button className="p-2.5 text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100 shrink-0 flex items-center justify-center cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="w-full bg-transparent border-none text-slate-800 font-body-lg text-sm md:text-base focus:ring-0 outline-none resize-none py-2.5 px-1 placeholder-slate-400 overflow-y-auto transition-all"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              placeholder="Enter diagnostic query, symptoms, or command..."
              rows={1}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />

            <div className="flex items-center gap-2 shrink-0 pb-1.5 pr-1.5">
              <button className="p-2.5 text-slate-500 hover:text-teal-400 transition-colors rounded-xl hover:bg-teal-500/10 flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="bg-teal-600 text-slate-900 p-2.5 rounded-xl hover:bg-teal-500 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(13,148,136,0.3)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-3 px-3">
            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest hidden md:inline flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-teal-600/50">info</span>
              NEXUS AI IS ASSISTIVE. VERIFY CRITICAL DATA.
            </span>
            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-teal-500/50">lock</span> END-TO-END ENCRYPTED
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}