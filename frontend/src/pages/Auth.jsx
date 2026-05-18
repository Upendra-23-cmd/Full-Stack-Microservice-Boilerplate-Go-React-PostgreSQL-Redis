import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../hooks/useAuthStore'

const formStyles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 60% 0%, rgba(108,99,255,0.12) 0%, transparent 60%), var(--bg)',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '2.5rem',
  },
  heading: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '0.4rem',
    color: 'var(--text)',
  },
  sub: { color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '2rem' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 },
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0.7rem 1rem',
    color: 'var(--text)',
    fontSize: '0.95rem',
    transition: 'border-color 0.15s',
  },
  btn: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    marginTop: '0.5rem',
    transition: 'opacity 0.15s',
    cursor: 'pointer',
    border: 'none',
  },
  error: {
    background: 'rgba(255,77,109,0.1)',
    border: '1px solid rgba(255,77,109,0.3)',
    color: '#ff4d6d',
    borderRadius: '8px',
    padding: '0.7rem 1rem',
    fontSize: '0.88rem',
    marginBottom: '1rem',
  },
  footer: { marginTop: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' },
  footerLink: { color: 'var(--accent)', fontWeight: 500 },
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/dashboard')
  }

  return (
    <div style={formStyles.page}>
      <div style={formStyles.card}>
        <h1 style={formStyles.heading}>Welcome back</h1>
        <p style={formStyles.sub}>Sign in to your account to continue</p>
        {error && <div style={formStyles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>Email</label>
            <input style={formStyles.input} type="email" value={email}
              onChange={e => { clearError(); setEmail(e.target.value) }}
              placeholder="you@example.com" required />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>Password</label>
            <input style={formStyles.input} type="password" value={password}
              onChange={e => { clearError(); setPassword(e.target.value) }}
              placeholder="••••••••" required />
          </div>
          <button style={formStyles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p style={formStyles.footer}>
          No account? <Link to="/register" style={formStyles.footerLink}>Create one</Link>
        </p>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { register, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await register(name, email, password)
    if (ok) navigate('/dashboard')
  }

  return (
    <div style={formStyles.page}>
      <div style={formStyles.card}>
        <h1 style={formStyles.heading}>Create account</h1>
        <p style={formStyles.sub}>Get started with your microservice dashboard</p>
        {error && <div style={formStyles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>Name</label>
            <input style={formStyles.input} type="text" value={name}
              onChange={e => { clearError(); setName(e.target.value) }}
              placeholder="Your name" required />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>Email</label>
            <input style={formStyles.input} type="email" value={email}
              onChange={e => { clearError(); setEmail(e.target.value) }}
              placeholder="you@example.com" required />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>Password</label>
            <input style={formStyles.input} type="password" value={password}
              onChange={e => { clearError(); setPassword(e.target.value) }}
              placeholder="min 8 characters" required minLength={8} />
          </div>
          <button style={formStyles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p style={formStyles.footer}>
          Have an account? <Link to="/login" style={formStyles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
