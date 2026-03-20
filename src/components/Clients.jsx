// Clients.jsx
import { useEffect, useState, useRef } from 'react'
import { getClients, createClient, deleteClient, getProjects } from '../Supabase'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const PALETTE = [
  { bg: '#eff4ff', tx: '#2d5be3' },
  { bg: '#e8f5f0', tx: '#1a7a5e' },
  { bg: '#fef3c7', tx: '#b45309' },
  { bg: '#fee2e2', tx: '#c53030' },
  { bg: '#f3e8ff', tx: '#7c3aed' },
  { bg: '#fce7f3', tx: '#be185d' },
]

export default function Clients() {
  const [clients, setClients]   = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast]       = useState('')

  async function load() {
    setLoading(true)
    const [{ data: c }, { data: p }] = await Promise.all([getClients(), getProjects()])
    setClients(c)
    setProjects(p)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function notify(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this client?')) return
    const { error } = await deleteClient(id)
    if (error) { notify('Error: ' + error.message); return }
    setClients(prev => prev.filter(c => c.id !== id))
    notify('Client deleted')
  }

  function handleAdded(client) {
    setClients(prev => [client, ...prev])
    setShowForm(false)
    notify('Client added')
  }

  useGSAP(() => {
    if(loading) return

    gsap.from(".client-box", {
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
        <p className="text-gray-500 text-sm">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Client</button>
      </div>

      {/* Grid */}
      {clients.length === 0 ? (
        <div className="empty-state">No clients yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c, i) => {
            const col    = PALETTE[i % PALETTE.length]
            const init   = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            const pCount = projects.filter(p => p.client_id === c.id).length
            return (
              <div key={c.id} className="client-box bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Top */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: col.bg, color: col.tx }}
                  >
                    {init}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.industry || '—'}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.status || 'Active'}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mb-3" />

                {/* Details */}
                <div className="flex flex-col gap-1.5 mb-3 text-xs text-gray-500">
                  {c.contact_name && <span>👤 {c.contact_name}</span>}
                  {c.email        && <span className="truncate">✉ {c.email}</span>}
                  {c.phone        && <span>📞 {c.phone}</span>}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{pCount} project{pCount !== 1 ? 's' : ''}</span>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && <AddClientForm closeModal={() => setShowForm(false)} onAdded={handleAdded} />}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function AddClientForm({ closeModal, onAdded }) {
  const [form, setForm]     = useState({ name: '', industry: 'E-commerce', contact_name: '', email: '', phone: '', status: 'Active' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const modalRef = useRef(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit() {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    const { data, error: err } = await createClient(form)
    setSaving(false)
    if (err) { setError(err.message); return }
    onAdded(data)
  }

  useGSAP(() => {
    gsap.from( modalRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.6,
        ease: "power1.out",
    });
  }, []);
  const handleClose = () => {
    gsap.to( modalRef.current, {
        opacity: 0,
        y: -80,
        duration: 0.5,
        ease: "ease.in",
        onComplete: closeModal,
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box" ref={modalRef}>
        <div className="modal-header">
          <h2 className="text-base font-semibold">Add New Client</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="form-group">
          <label className="form-label">Company Name *</label>
          <input placeholder="Acme Corp" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Industry</label>
            <select value={form.industry} onChange={e => set('industry', e.target.value)}>
              {['E-commerce','Food & Beverage','Technology','Healthcare','Real Estate','Fashion','Finance'].map(i => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Contact Name</label>
            <input placeholder="John Smith" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input placeholder="+1 555 000" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" placeholder="john@acme.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>

        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : 'Add Client'}
          </button>
        </div>
      </div>
    </div>
  )
}