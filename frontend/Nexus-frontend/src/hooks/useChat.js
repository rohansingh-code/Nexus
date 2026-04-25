import { useState, useCallback, useRef } from 'react'
import { sendMessage, bookAppointment, clearSession } from '../api/agent'

export function useChat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I\'m your Nexus intelligence assistant. Describe your symptoms and I\'ll help you find the right doctor.',
      doctorList: null,
      bookingReady: null,
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [bookingStatus, setBookingStatus] = useState(null) // 'confirming' | 'success' | 'error'
  const sessionId = useRef(crypto.randomUUID())

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const send = useCallback(async (text) => {
    if (!text.trim() || isTyping) return

    addMessage({ role: 'user', content: text })
    setIsTyping(true)

    try {
      const data = await sendMessage({
        message: text,
        sessionId: sessionId.current,
      })

      addMessage({
        role: 'ai',
        content: data.message,
        doctorList: data.doctorList || null,
        bookingReady: data.bookingReady || null,
      })
    } catch {
      addMessage({
        role: 'ai',
        content: 'Connection error. Please try again.',
        doctorList: null,
        bookingReady: null,
      })
    } finally {
      setIsTyping(false)
    }
  }, [isTyping, addMessage])

  const confirmBooking = useCallback(async (bookingReady) => {
    setBookingStatus('confirming')
    try {
      await bookAppointment({
        doctorId: bookingReady.doctorId,
        appointmentTime: `${bookingReady.date}T${bookingReady.time}:00`,
        reason: bookingReady.reason,
      })
      setBookingStatus('success')
      await clearSession({ sessionId: sessionId.current })
      addMessage({
        role: 'ai',
        content: `Your appointment has been confirmed! You'll see Dr. ${bookingReady.doctorId} on ${bookingReady.date} at ${bookingReady.time}.`,
        doctorList: null,
        bookingReady: null,
      })
    } catch (e) {
      if (e.message === 'SLOT_TAKEN') {
        setBookingStatus(null)
        addMessage({
          role: 'ai',
          content: 'That slot was just taken by someone else. Could you suggest a different date or time?',
          doctorList: null,
          bookingReady: null,
        })
      } else {
        setBookingStatus('error')
      }
    }
  }, [addMessage])

  const newChat = useCallback(async () => {
    await clearSession({ sessionId: sessionId.current })
    sessionId.current = crypto.randomUUID()
    setMessages([{
      role: 'ai',
      content: 'Hello! I\'m your Nexus intelligence assistant. Describe your symptoms and I\'ll help you find the right doctor.',
      doctorList: null,
      bookingReady: null,
    }])
    setBookingStatus(null)
  }, [])

  return { messages, isTyping, bookingStatus, send, confirmBooking, newChat }
}