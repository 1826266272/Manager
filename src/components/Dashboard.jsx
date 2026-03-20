// Dashboard.jsx
import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { getClients, getProjects } from '../Supabase'

function StatusBadge({ status }) {
  const map = {
    'In Progress': 'badge-blue',
    'Completed':   'badge-green',
    'Pending':     'badge-yellow',
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

export default function Dashboard({ onNavigate }) {
  const [clients, setClients]   = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  async function load() {
    setLoading(true)
    const [{ data: c }, { data: p }] = await Promise.all([getClients(), getProjects()])
    setClients(c)
    setProjects(p)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const active    = projects.filter(p => p.status === 'In Progress').length
  const completed = projects.filter(p => p.status === 'Completed').length
  const pending   = projects.filter(p => p.status === 'Pending').length

useGSAP(() => {
  if (loading) return

    const tl = gsap.timeline();

    tl.from(".stat-card, .project-box", {
      opacity: 0,
      y: 30,
      stagger: 0.15,
      duration: 0.8,
      ease: "power2.out",
    });
    tl.from(".table-data thead", {
      opacity: 0,
      x: 40,
      stagger: 0.2,
      duration: 0.6,
      ease: "power2.out",
    }, "-=0.5");
    tl.from(".table-data tbody tr", {
      opacity: 0,
      x: 40,
      stagger: 0.1,
      duration: 0.6,
      ease: "ease.out",
    }, "-=0.5");

}, [loading]);


  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>

  return (
    <section className="data">
        <div className="flex flex-col gap-6">

        {/* Stat cards */}
        <div className="stat-cards grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
            { label: 'Total Clients',  value: clients.length,  color: 'text-blue-600'   },
            { label: 'Total Projects', value: projects.length, color: 'text-gray-800'   },
            { label: 'In Progress',    value: active,          color: 'text-yellow-600' },
            { label: 'Completed',      value: completed,       color: 'text-green-600'  },
            ].map(s => (
            <div key={s.label} className="stat-card">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
            ))}
        </div>

        {/* Recent projects table */}
        <div className="card">
            <div className="card-header">
            <h3 className="text-sm font-semibold">Recent Projects</h3>
            <button className="btn-secondary btn-sm" onClick={() => onNavigate('projects')}>
                View all →
            </button>
            </div>

            {projects.length === 0 ? (
            <div className="empty-state">No projects yet.</div>
            ) : (
            <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                <table className='table-data'>
                    <thead>
                    <tr>
                        <th>Project</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Deadline</th>
                    </tr>
                    </thead>
                    <tbody>
                    {projects.slice(0, 5).map(p => (
                        <tr key={p.id}>
                        <td className="font-medium">{p.name}</td>
                        <td className="text-gray-500">{p.clients?.name || '—'}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td>
                            <div className="flex items-center gap-2">
                            <div className="progress-track">
                                <div
                                className="progress-fill"
                                style={{
                                    width: `${p.progress || 0}%`,
                                    background: p.progress >= 100 ? '#16a34a' : '#2563eb'
                                }}
                                />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{p.progress || 0}%</span>
                            </div>
                        </td>
                        <td className="text-gray-500">
                            {p.deadline
                            ? new Date(p.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                {/* Mobile cards */}
                <div className="project-box md:hidden flex flex-col divide-y divide-gray-100">
                {projects.slice(0, 5).map(p => (
                    <div key={p.id} className="p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                        <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.clients?.name || '—'}</p>
                        </div>
                        <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${p.progress || 0}%`, background: '#2563eb' }}
                        />
                        </div>
                        <span className="text-xs text-gray-500">{p.progress || 0}%</span>
                    </div>
                    {p.deadline && (
                        <p className="text-xs text-gray-400">
                        Due: {new Date(p.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    )}
                    </div>
                ))}
                </div>
            </>
            )}
        </div>

        </div>
    </section>
  )
}