// App.jsx
import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Clients   from './components/Clients'
import Projects  from './components/Projects'
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin( useGSAP );

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'clients',   label: 'Clients'   },
  { id: 'projects',  label: 'Projects'  },
]

export default function App() {
  const [page, setPage]           = useState('dashboard')
  const [sidebarOpen, setSidebar] = useState(false)

  function nav(p) {
    setPage(p)
    setSidebar(false)
    window.scrollTo(0, 0)
  }

  return (
    <div className="flex min-h-screen">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}>
        <div className="sidebar-logo">Bytez<span>ERP</span></div>
        <nav className="flex-1 py-4 pr-4 flex flex-col gap-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => nav(item.id)}
              className={`nav-link ${page === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-3 text-xs text-gray-500 border-t border-gray-700">
          Live · Supabase
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col md:ml-56">

        {/* Topbar */}
        <header className="topbar">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1 rounded text-gray-500 hover:bg-gray-100 mr-3"
            onClick={() => setSidebar(o => !o)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="font-semibold text-gray-800 capitalize">{page}</span>
        </header>

        {/* Page */}
        <main className="p-4 md:p-6 flex-1">
          {page === 'dashboard' && <Dashboard onNavigate={nav} />}
          {page === 'clients'   && <Clients />}
          {page === 'projects'  && <Projects />}
        </main>

      </div>
    </div>
  )
}