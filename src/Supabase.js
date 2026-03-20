// ============================================================
// supabase.js — Bytez ERP Backend Layer
// All Supabase database operations in one place.
// Import this file in your index.html like:
//   <script type="module" src="supabase.js"></script>
// ============================================================

import { createClient as supabaseInit } from 'https://esm.sh/@supabase/supabase-js@2'

// ── CONFIG ───────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.vite.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.vite.VITE_SUPABASE_ANON_KEY;
 
export const supabase = supabaseInit(SUPABASE_URL, SUPABASE_ANON)


// ============================================================
// CLIENTS
// ============================================================

/**
 * Fetch all clients, newest first.
 * @returns {Promise<{data: Array, error: object|null}>}
 */
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('[getClients]', error.message)
  return { data: data || [], error }
}

/**
 * Fetch a single client by ID.
 * @param {string} id - UUID of the client
 */
export async function getClientById(id) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) console.error('[getClientById]', error.message)
  return { data, error }
}

/**
 * Insert a new client row.
 * @param {{
 *   name: string,
 *   industry?: string,
 *   contact_name?: string,
 *   email?: string,
 *   phone?: string,
 *   status?: 'Active'|'Inactive'
 * }} client
 */
export async function createClient(client) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()

  if (error) console.error('[createClient]', error.message)
  return { data: data?.[0] || null, error }
}

/**
 * Update an existing client.
 * @param {string} id - UUID of the client to update
 * @param {object} updates - fields to update
 */
export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) console.error('[updateClient]', error.message)
  return { data: data?.[0] || null, error }
}

/**
 * Delete a client by ID.
 * Note: cascades to projects due to ON DELETE CASCADE.
 * @param {string} id
 */
export async function deleteClient(id) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) console.error('[deleteClient]', error.message)
  return { error }
}


// ============================================================
// PROJECTS
// ============================================================

/**
 * Fetch all projects with their related client name.
 * @returns {Promise<{data: Array, error: object|null}>}
 */
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('created_at', { ascending: false })

  if (error) console.error('[getProjects]', error.message)
  return { data: data || [], error }
}

/**
 * Fetch a single project by ID, including client name.
 * @param {string} id
 */
export async function getProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('id', id)
    .single()

  if (error) console.error('[getProjectById]', error.message)
  return { data, error }
}

/**
 * Fetch all projects belonging to a specific client.
 * @param {string} clientId
 */
export async function getProjectsByClient(clientId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) console.error('[getProjectsByClient]', error.message)
  return { data: data || [], error }
}

/**
 * Insert a new project.
 * @param {{
 *   name: string,
 *   client_id?: string,
 *   status?: 'Pending'|'In Progress'|'Completed',
 *   progress?: number,
 *   deadline?: string,
 *   description?: string
 * }} project
 */
export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select('*, clients(name)')

  if (error) console.error('[createProject]', error.message)
  return { data: data?.[0] || null, error }
}

/**
 * Update a project by ID.
 * @param {string} id
 * @param {object} updates
 */
export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select('*, clients(name)')

  if (error) console.error('[updateProject]', error.message)
  return { data: data?.[0] || null, error }
}

/**
 * Delete a project by ID.
 * Note: cascades to tasks due to ON DELETE CASCADE.
 * @param {string} id
 */
export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) console.error('[deleteProject]', error.message)
  return { error }
}


// ============================================================
// TASKS
// ============================================================

/**
 * Fetch all tasks with their related project name.
 */
export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects(name)')
    .order('created_at', { ascending: false })

  if (error) console.error('[getTasks]', error.message)
  return { data: data || [], error }
}

/**
 * Fetch all tasks for a specific project.
 * @param {string} projectId
 */
export async function getTasksByProject(projectId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects(name)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) console.error('[getTasksByProject]', error.message)
  return { data: data || [], error }
}

/**
 * Insert a new task.
 * @param {{
 *   title: string,
 *   project_id?: string,
 *   assignee?: string,
 *   priority?: 'High'|'Medium'|'Low',
 *   status?: 'todo'|'inprogress'|'completed',
 *   deadline?: string
 * }} task
 */
export async function createTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select('*, projects(name)')

  if (error) console.error('[createTask]', error.message)
  return { data: data?.[0] || null, error }
}

/**
 * Update a task (e.g. move status on kanban).
 * @param {string} id
 * @param {object} updates - e.g. { status: 'inprogress' }
 */
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) console.error('[updateTask]', error.message)
  return { data: data?.[0] || null, error }
}

/**
 * Delete a task by ID.
 * @param {string} id
 */
export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) console.error('[deleteTask]', error.message)
  return { error }
}


// ============================================================
// DASHBOARD STATS (combined query)
// ============================================================

/**
 * Fetch summary counts for the dashboard in one call.
 * Returns: { clientCount, projectCount, activeCount, completedCount, pendingCount }
 */
export async function getDashboardStats() {
  const [clientsRes, projectsRes] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('status')
  ])

  if (clientsRes.error) console.error('[getDashboardStats clients]', clientsRes.error.message)
  if (projectsRes.error) console.error('[getDashboardStats projects]', projectsRes.error.message)

  const projectRows = projectsRes.data || []

  return {
    clientCount:    clientsRes.count || 0,
    projectCount:   projectRows.length,
    activeCount:    projectRows.filter(p => p.status === 'In Progress').length,
    completedCount: projectRows.filter(p => p.status === 'Completed').length,
    pendingCount:   projectRows.filter(p => p.status === 'Pending').length,
  }
}