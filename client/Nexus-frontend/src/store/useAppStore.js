import { create } from 'zustand'

export const useAppStore = create((set) => ({
  token: localStorage.getItem('nexus_token') || null,
  roles: JSON.parse(localStorage.getItem('nexus_roles')) || [],
  user: null,
  
  setAuth: (token, roles) => {
    if (token) {
      localStorage.setItem('nexus_token', token)
      localStorage.setItem('nexus_roles', JSON.stringify(roles || []))
    } else {
      localStorage.removeItem('nexus_token')
      localStorage.removeItem('nexus_roles')
    }
    set({ token, roles: roles || [] })
  },
  
  setUser: (user) => set({ user }),
  
  logout: () => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_roles')
    set({ token: null, roles: [], user: null })
  }
}))
