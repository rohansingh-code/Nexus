import DoctorCard from './DoctorCard'
import BookingConfirm from './BookingConfirm'

export default function ChatBubble({ msg, onDoctorSelect, onConfirmBooking, onCancelBooking, bookingStatus }) {
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end w-full animate-fade-in">
        <div className="max-w-[75%] bg-white border border-slate-100 rounded-2xl rounded-tr-sm p-4 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
          <p className="text-sm text-slate-700 leading-relaxed">
            {msg.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 w-full max-w-[90%] animate-fade-in">
      <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20 mt-1">
        <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
      </div>
      <div className="glass-panel rounded-2xl rounded-tl-sm p-6 w-full flex flex-col gap-5">
        
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
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