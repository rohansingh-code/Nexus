import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'

const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

export default function MainLayout() {
  const logout = useAppStore(state => state.logout)
  const roles = useAppStore(state => state.roles)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Filter navigation items based on user roles
  const getNavItems = () => {
    const items = []
    if (roles.includes('PATIENT')) {
      items.push({ to: '/dashboard', icon: 'group', label: 'My Profile' })
      items.push({ to: '/chat', icon: 'psychology', label: 'Intelligence', isActiveClass: 'text-orange-500 bg-orange-500/10 border-r-[3px] border-orange-500' })
    }
    
    if (roles.includes('DOCTOR')) {
      items.push({ to: '/doctor-dashboard', icon: 'stethoscope', label: 'My Schedule' })
    }

    if (roles.includes('ADMIN')) {
      items.push({ to: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel' })
    }

    return items
  }

  const navItems = getNavItems()

  return (
    <div className="bg-stone-950 text-stone-200 font-body-sm overflow-hidden h-screen w-screen flex relative">
      
      {/* Base Background Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]"
           style={{ backgroundImage: noiseSvg, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }} />

      {/* SideNavBar */}
      <nav className="relative z-50 w-64 h-full border-r border-white/[0.05] bg-black/60 backdrop-blur-2xl flex flex-col py-8 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="px-6 mb-10 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-orange-500/30 bg-orange-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.15)]">
             <span className="material-symbols-outlined text-orange-500">medical_services</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-[0.2em] font-headline-md leading-none mb-1">NEXUS</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-orange-500/70">Terminal v4.2</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-6 py-4 transition-all font-mono text-[11px] uppercase tracking-[0.15em] group relative ${
                  isActive 
                    ? item.isActiveClass || 'text-orange-500 bg-orange-500/10 border-r-[3px] border-orange-500' 
                    : 'text-stone-500 hover:bg-white/5 hover:text-stone-200 border-r-[3px] border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span 
                    className={`material-symbols-outlined ${!isActive && 'group-hover:text-stone-300 transition-colors'}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* CTA (Only for Patients) */}
        {roles.includes('PATIENT') && (
          <div className="px-6 mb-8">
            <button 
              onClick={() => navigate('/chat')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              START TRIAGE
            </button>
          </div>
        )}

        {/* Footer Links */}
        <div className="flex flex-col border-t border-white/[0.05] pt-4">
          <button className="flex items-center gap-3 px-6 py-4 text-stone-500 hover:bg-white/5 hover:text-stone-200 transition-all active:scale-[0.98] font-mono text-[11px] uppercase tracking-[0.15em] group">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-4 text-stone-500 hover:bg-white/5 hover:text-stone-200 hover:text-red-400 transition-all active:scale-[0.98] font-mono text-[11px] uppercase tracking-[0.15em] group cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* TopAppBar */}
      <header className="fixed top-0 right-0 left-64 h-16 flex justify-between items-center px-8 z-40 bg-black/40 backdrop-blur-md border-b border-white/[0.05]">
        <div className="flex items-center gap-4">
           {/* Breadcrumb or title could go here */}
           <span className="font-mono text-xs text-stone-500 tracking-widest uppercase terminal-cursor">_SYSTEM_ONLINE</span>
        </div>
        <div className="flex items-center gap-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-green-400 text-[10px] uppercase tracking-widest">
              {roles.join(', ')} / ACTIVE
            </span>
          </div>
          {/* Action Icons */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <button className="text-stone-500 hover:text-stone-200 p-2 rounded-lg hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button className="text-stone-500 hover:text-stone-200 p-2 rounded-lg hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[20px]">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mt-16 h-[calc(100vh-4rem)] flex flex-col relative z-10 overflow-hidden bg-stone-950">
         {/* Background Glows */}
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
         <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none"></div>
         
         <div className="flex-1 overflow-auto p-8 relative z-20">
            <Outlet />
         </div>
      </main>
    </div>
  )
}
