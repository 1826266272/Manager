// Projects.jsx
import { useEffect, useState } from 'react'
import { getProjects, getClients, createProject, deleteProject } from '../Supabase'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const FILTERS = ['All', 'Pending', 'In Progress', 'Completed']

function StatusBadge({ status }) {
  const map = {
    'In Progress': 'badge-blue',
    'Completed':   'badge-green',
    'Pending':     'badge-yellow',
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter]     = useState('All')
  const [toast, setToast]       = useState('')

  async function load() {
    setLoading(true)
    const [{ data: p }, { data: c }] = await Promise.all([getProjects(), getClients()])
    setProjects(p)
    setClients(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function notify(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  function handleAdded(project) {
    setProjects(prev => [project, ...prev])
    setShowForm(false)
    notify('Project created')
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this project?')) return
    const { error } = await deleteProject(id)
    if (error) { notify('Error: ' + error.message); return }
    setProjects(prev => prev.filter(p => p.id !== id))
    notify('Project deleted')
  }

  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter)

  useGSAP(() => {
    if(loading) return

    gsap.from(".project-box", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [loading]);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Project</button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
          >
            {f}
            {f !== 'All' && (
              <span className="ml-1 opacity-60">({projects.filter(p => p.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="project-box bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">

              {/* Top */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.clients?.name || 'No client'}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 line-clamp-2">
                {p.description || 'No description.'}
              </p>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${p.progress || 0}%`,
                      background:
                        p.progress >= 100 ? '#16a34a' :
                        p.progress >= 60  ? '#2563eb' : '#f59e0b'
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{p.progress || 0}%</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {p.deadline
                    ? '📅 ' + new Date(p.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'No deadline'}
                </span>
                <button className="btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <AddProjectForm
          clients={clients}
          onClose={() => setShowForm(false)}
          onAdded={handleAdded}
        />
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function AddProjectForm({ clients, onClose, onAdded }) {
  const [form, setForm]     = useState({ name: '', client_id: '', status: 'Pending', progress: 0, deadline: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit() {
    if (!form.name.trim()) { setError('Project name is required'); return }
    setSaving(true)
    const { data, error: err } = await createProject({
      ...form,
      client_id: form.client_id || null,
      progress:  parseInt(form.progress) || 0,
      deadline:  form.deadline || null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    onAdded(data)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="text-base font-semibold">New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input placeholder="Summer Campaign" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Client</label>
            <select value={form.client_id} onChange={e => set('client_id', e.target.value)}>
              <option value="">No client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Progress %</label>
            <input type="number" min="0" max="100" value={form.progress} onChange={e => set('progress', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea rows={3} placeholder="What does this project involve?" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Projects;