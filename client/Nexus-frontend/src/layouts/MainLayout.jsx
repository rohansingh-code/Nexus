import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const ROUTE_LABELS = {
  '/dashboard': 'My Profile',
  '/chat': 'Book Appointment',
  '/doctor-dashboard': 'My Schedule',
  '/admin': 'Admin Panel',
}

export default function MainLayout() {
  const logout = useAppStore(s => s.logout)
  const roles = useAppStore(s => s.roles)
  const user = useAppStore(s => s.user)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  const getNavItems = () => {
    const items = []
    if (roles.includes('ADMIN')) {
      items.push({ to: '/admin', icon: 'shield_person', label: 'Admin Panel' })
    } else if (roles.includes('DOCTOR')) {
      items.push({ to: '/doctor-dashboard', icon: 'calendar_month', label: 'My Schedule' })
    } else if (roles.includes('PATIENT')) {
      items.push({ to: '/dashboard', icon: 'person', label: 'My Profile' })
      items.push({ to: '/chat', icon: 'chat_bubble', label: 'Book Appointment' })
    }
    return items
  }

  const primaryRole = roles.includes('ADMIN') ? 'ADMIN' : roles.includes('DOCTOR') ? 'DOCTOR' : 'PATIENT'
  const navItems = getNavItems()
  const pageTitle = ROUTE_LABELS[location.pathname] ?? 'Nexus'
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : primaryRole[0] ?? 'N'

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="h-screen w-screen flex flex-col md:flex-row overflow-hidden mesh-bg-subtle">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .nav-tip { position:absolute; left:64px; top:50%; transform:translateY(-50%); background:#1e293b; color:#f8fafc;
          font-size:11px; white-space:nowrap; padding:4px 10px; border-radius:6px; opacity:0; pointer-events:none;
          transition:opacity 0.15s ease; z-index:100; }
        .nav-item:hover .nav-tip { opacity:1; }
        .nav-item { position:relative; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
      `}</style>

      {/* ── Desktop Sidebar (240px) ── */}
      <nav className="hidden md:flex w-60 h-full bg-white border-r border-slate-200 flex-col py-6 z-50 flex-shrink-0 shadow-sm">
        {/* Brand */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>local_hospital</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 tracking-tight text-lg leading-none">NEXUS</p>
            <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-0.5">Medical AI</p>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-1.5 flex-1 w-full px-3">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: 20, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="px-3 border-t border-slate-100 pt-6">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 20 }}>logout</span>
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </nav>

      {/* ── Right column ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="text-slate-900 font-semibold text-sm">{pageTitle}</h1>
            {roles.includes('PATIENT') && location.pathname === '/dashboard' && (
              <button onClick={() => navigate('/chat')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600 hover:bg-teal-500 transition-colors text-white text-xs font-medium">
                <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>add</span>
                Book appointment
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Live status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-xs font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                {primaryRole.charAt(0) + primaryRole.slice(1).toLowerCase()}
              </span>
            </div>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Navigation ── */}
        <nav className="md:hidden h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-4 z-50">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-teal-600' : 'text-slate-400'
                }`
              }
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: location.pathname === item.to ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium tracking-tight">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
          <button onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>logout</span>
            <span className="text-[10px] font-medium tracking-tight">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  )
}