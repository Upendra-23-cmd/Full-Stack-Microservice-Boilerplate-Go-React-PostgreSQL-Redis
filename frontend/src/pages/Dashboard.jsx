import { useEffect, useState } from 'react'
import useAuthStore from '../hooks/useAuthStore'
import { productsAPI, ordersAPI } from '../api/client'

const s = {
  page: { padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  welcome: { marginBottom: '2.5rem' },
  greeting: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '1.8rem',
    fontWeight: 700,
    background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.3rem',
  },
  sub: { color: 'var(--muted)', fontSize: '0.95rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
  },
  cardLabel: { color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' },
  cardValue: { fontSize: '2rem', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--accent)' },
  sectionTitle: { fontFamily: 'Space Mono, monospace', fontSize: '1rem', marginBottom: '1rem', color: 'var(--muted)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.6rem 1rem', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', borderBottom: '1px solid rgba(42,42,58,0.5)' },
  badge: (s) => ({
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: s === 'pending' ? 'rgba(108,99,255,0.15)' : 'rgba(67,233,123,0.15)',
    color: s === 'pending' ? 'var(--accent)' : 'var(--accent3)',
  }),
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([productsAPI.list(), ordersAPI.list()]).then(([p, o]) => {
      setProducts(p.data.data || [])
      setOrders(o.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '3rem', color: 'var(--muted)' }}>Loading…</div>

  const revenue = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div style={s.page}>
      <div style={s.welcome}>
        <h1 style={s.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={s.sub}>Here's what's happening in your store</p>
      </div>

      <div style={s.grid}>
        {[
          { label: 'Products', value: products.length },
          { label: 'Orders', value: orders.length },
          { label: 'Revenue', value: `$${revenue.toFixed(2)}` },
          { label: 'Account', value: user?.email?.split('@')[0] },
        ].map(({ label, value }) => (
          <div key={label} style={s.card}>
            <div style={s.cardLabel}>{label}</div>
            <div style={s.cardValue}>{value}</div>
          </div>
        ))}
      </div>

      {orders.length > 0 && (
        <div style={s.card}>
          <p style={s.sectionTitle}>// recent orders</p>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Order ID</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td style={{ ...s.td, fontFamily: 'Space Mono, monospace', fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {o.id.slice(0, 8)}…
                  </td>
                  <td style={s.td}>${Number(o.total).toFixed(2)}</td>
                  <td style={s.td}><span style={s.badge(o.status)}>{o.status}</span></td>
                  <td style={{ ...s.td, color: 'var(--muted)', fontSize: '0.85rem' }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
