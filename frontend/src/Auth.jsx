
import { useState } from 'react'
import { loginUser, registerUser } from './api'

export default function Auth({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await registerUser(form)
      }

      const result = await loginUser({
        email: form.email,
        password: form.password
      })

      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))

      onAuthSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          DevOps Task Manager
        </h1>

        <p className="mb-8 text-center text-slate-400">
          {isRegister ? 'Create your account' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
          />

          <input
            name="password"
            type="password"
            placeholder="Password (minimum 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
          />

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Create Account'
                : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError('')
            }}
            className="ml-2 font-semibold text-blue-400 hover:text-blue-300"
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}
