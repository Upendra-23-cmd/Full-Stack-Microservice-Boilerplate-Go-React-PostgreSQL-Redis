import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../hooks/useAuthStore'

const styles = {
  nav: {
    background: 'rgba(10,10,15,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  },
  logo: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--accent)',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  link: {
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.88rem',
    color: 'var(--muted)',
    transition: 'all 0.15s',
    fontWeight: 500,
  },
  btn: {
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    fontSize: '0.88rem',
    fontWeight: 600,
    background: 'var(--accent)',
    color: '#fff',
    transition: 'opacity 0.15s',
  },
  logoutBtn: {
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    fontSize: '0.88rem',
    fontWeight: 500,
    background: 'transparent',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    transition: 'all 0.15s',
  }
}

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>⬡ microservice</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <Link to="/products" style={styles.link}>Products</Link>
            <Link to="/orders" style={styles.link}>Orders</Link>
            <Link to="/dashboard" style={styles.link}>{user.name}</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={{ ...styles.link, ...styles.btn }}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  )
}
