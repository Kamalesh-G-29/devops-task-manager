import { useEffect, useMemo, useState } from 'react'
import Auth from './Auth'
import {
  LayoutDashboard, ListTodo, ChartNoAxesCombined,
  Settings, Search, Plus, CheckCircle2, Clock3,
  CircleAlert, Pencil, Trash2, X, Menu, Activity
} from 'lucide-react'

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts'

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as removeTask
} from './api'

const emptyForm = {
  title: '',
  description: '',
  status: 'Pending',
  priority: 'Medium',
  dueDate: ''
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('token'))
  )

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
  }

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [menu, setMenu] = useState('Dashboard')
  const [mobileMenu, setMobileMenu] = useState(false)

  // Load tasks from MongoDB
  const loadTasks = async () => {
    try {
      setError('')
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      console.error(err)
      setError('Unable to load tasks. Check your backend connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true)
      loadTasks()
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [isAuthenticated])

  // Dashboard statistics
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    progress: tasks.filter(t => t.status === 'In Progress').length,
    pending: tasks.filter(t => t.status === 'Pending').length
  }), [tasks])

  // Search and filter
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'All' || task.status === filter)
  )

  const chartData = [
    { name: 'Pending', count: stats.pending },
    { name: 'In Progress', count: stats.progress },
    { name: 'Completed', count: stats.completed }
  ]

  // Open create form
  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModal(true)
  }

  // Open edit form
  function openEdit(task) {
    setEditingId(task._id)
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'Pending',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate
        ? String(task.dueDate).slice(0, 10)
        : ''
    })
    setModal(true)
  }

  // Create or update task in MongoDB
  async function saveTask(e) {
    e.preventDefault()

    if (!form.title.trim()) return

    try {
      setSaving(true)
      setError('')

      const taskData = {
        ...form,
        dueDate: form.dueDate || null
      }

      if (editingId) {
        await updateTask(editingId, taskData)
      } else {
        await createTask(taskData)
      }

      await loadTasks()

      setModal(false)
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      console.error(err)
      setError('Unable to save task. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Delete task from MongoDB
  async function handleDelete(id) {
    if (!window.confirm('Delete this task?')) return

    try {
      setError('')
      await removeTask(id)
      setTasks(old => old.filter(task => task._id !== id))
    } catch (err) {
      console.error(err)
      setError('Unable to delete task.')
    }
  }

  const cards = [
    {
      name: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'text-blue-400'
    },
    {
      name: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-green-400'
    },
    {
      name: 'In Progress',
      value: stats.progress,
      icon: Clock3,
      color: 'text-yellow-400'
    },
    {
      name: 'Pending',
      value: stats.pending,
      icon: CircleAlert,
      color: 'text-red-400'
    }
  ]

  if (!isAuthenticated) {
    return (
      <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800 bg-[#111a2e] p-5 transition-transform lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center gap-3">
          <Activity className="text-blue-400" size={30} />
          <div>
            <h1 className="text-xl font-bold">DevOpsFlow</h1>
            <p className="text-xs text-slate-400">Task Management</p>
          </div>
        </div>

        <p className="mb-4 text-xs uppercase text-slate-500">Workspace</p>

        {[
          ['Dashboard', LayoutDashboard],
          ['My Tasks', ListTodo],
          ['Analytics', ChartNoAxesCombined],
          ['Settings', Settings]
        ].map(([name, Icon]) => (
          <button
            key={name}
            onClick={() => {
              setMenu(name)
              setMobileMenu(false)
            }}
            className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              menu === name
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Icon size={19} /> {name}
          </button>
        ))}

        <div className="absolute bottom-6 left-5 right-5 rounded-xl bg-slate-800 p-4">
          <p className="font-semibold">Project Progress</p>
          <div className="mt-3 h-2 rounded-full bg-slate-700">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{
                width: `${stats.total ? stats.completed / stats.total * 100 : 0}%`
              }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {stats.completed} / {stats.total} completed
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-800 px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
              <Menu />
            </button>
            <div>
              <h2 className="font-semibold">{menu}</h2>
              <p className="text-xs text-slate-500">DevOps workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
              {(user?.name || 'K').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{user?.name || 'Developer'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'Administrator'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-5 md:p-8">

          {/* Welcome */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-400">Project Management</p>
              <h1 className="mt-2 text-3xl font-bold">
                Welcome Back! 👋
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Track and manage your development tasks.
              </p>
            </div>

            <button
              onClick={openCreate}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
            >
              <Plus size={19} /> Create New Task
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
              <button
                onClick={loadTasks}
                className="ml-3 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ name, value, icon: Icon, color }) => (
              <div key={name} className="rounded-2xl border border-slate-800 bg-[#111a2e] p-5">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-400">{name}</p>
                  <Icon className={color} size={23} />
                </div>
                <h2 className="mt-4 text-3xl font-bold">{value}</h2>
                <p className="mt-2 text-xs text-slate-500">
                  Current task count
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mt-7 rounded-2xl border border-slate-800 bg-[#111a2e] p-5">
            <h3 className="font-semibold">Task Analytics</h3>
            <p className="mt-1 text-xs text-slate-400">Task status overview</p>

            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#263449" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#111a2e',
                      border: '1px solid #334155',
                      borderRadius: 10
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task List */}
          <div className="mt-7 rounded-2xl border border-slate-800 bg-[#111a2e] p-5">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <h3 className="font-semibold">My Tasks</h3>
                <p className="mt-1 text-xs text-slate-400">Manage your activities</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 px-3">
                  <Search size={17} className="text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search tasks"
                    className="w-full bg-transparent py-2 text-sm outline-none"
                  />
                </div>

                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-[#111a2e] px-3 py-2 text-sm"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400">
                    <th className="pb-4">Task</th>
                    <th className="pb-4">Priority</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Due Date</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        Loading tasks from MongoDB...
                      </td>
                    </tr>
                  ) : filteredTasks.map(task => (
                    <tr key={task._id} className="border-b border-slate-800">
                      <td className="py-4 pr-3">
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{task.description}</p>
                      </td>
                      <td className="py-4">{task.priority}</td>
                      <td className="py-4">
                        <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
                          {task.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-slate-400">
                        {task.dueDate
                          ? String(task.dueDate).slice(0, 10)
                          : 'Not set'}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(task)}
                            className="rounded-lg p-2 text-blue-400 hover:bg-blue-500/10"
                            title="Edit task"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        No tasks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
            DevOpsFlow - DevOps Task Manager
          </footer>
        </div>
      </main>

      {/* Mobile sidebar backdrop */}
      {mobileMenu && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Task Form Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={saveTask} className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#111a2e] p-6">

            <div className="mb-6 flex justify-between">
              <h2 className="text-xl font-bold">
                {editingId ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button type="button" onClick={() => setModal(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm">Task Title *</label>
                <input
                  required
                  maxLength={100}
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-[#0b1120] p-3 outline-none focus:border-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-[#0b1120] p-3 outline-none focus:border-blue-500"
                  placeholder="Enter description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-[#0b1120] p-3"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-[#0b1120] p-3"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-[#0b1120] p-3"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-xl border border-slate-700 px-5 py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
