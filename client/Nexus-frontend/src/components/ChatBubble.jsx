import DoctorCard from './DoctorCard'
import BookingConfirm from './BookingConfirm'

export default function ChatBubble({ msg, onDoctorSelect, onConfirmBooking, onCancelBooking, bookingStatus }) {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end w-full animate-fade-in">
        <div className="max-w-[75%] bg-stone-900 border border-white/5 rounded-2xl rounded-tr-sm p-5 shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
          <p className="font-mono text-[13px] md:text-sm text-stone-300 leading-relaxed">
            {msg.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 w-full max-w-[85%] animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.1)] mt-1">
        <span className="material-symbols-outlined text-orange-400 text-[22px]">psychology</span>
      </div>
      <div className="bento-glow rounded-2xl rounded-tl-sm p-6 w-full flex flex-col gap-5 border border-orange-500/10 shadow-[0_0_30px_rgba(249,115,22,0.05)]"
           style={{ background: 'linear-gradient(145deg,rgba(20,22,28,0.9),rgba(12,10,9,0.9))', backdropFilter: 'blur(12px)' }}>
        
        <p className="font-mono text-[13px] md:text-sm text-stone-200 leading-relaxed whitespace-pre-wrap terminal-line pl-3">
          {msg.content}
        </p>

        {msg.doctorList && msg.doctorList.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-2">
            {msg.doctorList.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} onSelect={onDoctorSelect} />
            ))}
          </div>
        )}

        {msg.bookingReady && (
          <BookingConfirm
            bookingReady={msg.bookingReady}
            onConfirm={onConfirmBooking}
            onCancel={onCancelBooking}
            status={bookingStatus}
          />
        )}
      </div>
    </div>
  )
}