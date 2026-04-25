import axios from 'axios'
import { useAppStore } from '../store/useAppStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
})

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export async function sendMessage({ message, sessionId }) {
  const { data } = await api.post('/ai/query', { message, sessionId })
  return data
}

export async function bookAppointment({ doctorId, appointmentTime, reason }) {
  try {
    const { data } = await api.post('/patients/appointments', { doctorId, appointmentTime, reason })
    return data
  } catch (e) {
    if (e.response?.status === 409) throw new Error('SLOT_TAKEN')
    throw new Error('Booking failed')
  }
}

export async function clearSession({ sessionId }) {
  try {
    await api.delete(`/ai/session/${sessionId}`)
  } catch { /* silent fail */ }
}

export async function login({ username, password }) {
  const { data } = await api.post('/auth/login', { username, password })
  return data
}

export async function signup({ username, password, name, birthDate, gender, bloodGroup }) {
  const { data } = await api.post('/auth/signup', { username, password, name, birthDate, gender, bloodGroup })
  return data
}

export async function getProfile() {
  const { data } = await api.get('/patients/profile')
  return data
}

export async function onboardDoctor(payload) {
  // payload expects: userId, name, specialization, experienceYears, qualifications, bio, shiftStart, shiftEnd, workDays
  const { data } = await api.post('/admin/onBoardNewDoctor', payload)
  return data
}

export async function getPatientAppointments() {
  const { data } = await api.get('/patients/appointments')
  return data
}

export async function getDoctorAppointments() {
  const { data } = await api.get('/doctors/appointments')
  return data
}

export async function getAllPatients(page = 0, size = 10) {
  const { data } = await api.get(`/admin/patients?page=${page}&size=${size}`)
  return data
}

export async function getDoctors() {
  const { data } = await api.get('/public/doctors')
  return data
}