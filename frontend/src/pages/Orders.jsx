import { useEffect, useState } from 'react'
import { ordersAPI } from '../api/client'

const s = {
  page: { padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  title: { fontFamily: 'Space Mono, monospace', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.2rem' },
  sub: { color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '2rem' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1rem' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  orderId: { fontFamily: 'Space Mono, monospace', fontSize: '0.78rem', color: 'var(--muted)' },
  badge: (status) => ({
    padding: '0.25rem 0.7rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
    background: status === 'pending' ? 'rgba(108,99,255,0.15)' : 'rgba(67,233,123,0.15)',
    color: status === 'pending' ? 'var(--accent)' : 'var(--accent3)',
  }),
  total: { fontFamily: 'Space Mono, monospace', fontSize: '1.2rem', color: 'var(--accent)' },
  meta: { color: 'var(--muted)', fontSize: '0.82rem' },
  items: { borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' },
  item: { display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.88rem', color: 'var(--muted)' },
  empty: { textAlign: 'center', padding: '4rem', color: 'var(--muted)' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersAPI.list().then(r => setOrders(r.data.data || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '3rem', color: 'var(--muted)' }}>Loading…</div>

  return (
    <div style={s.page}>
      <h1 style={s.title}>Orders</h1>
      <p style={s.sub}>{orders.length} total orders</p>

      {orders.length === 0 ? (
        <div style={s.empty}>No orders yet. Head to Products to place your first order.</div>
      ) : (
        orders.map(o => (
          <div key={o.id} style={s.card}>
            <div style={s.orderHeader}>
              <div>
                <div style={s.orderId}>{o.id}</div>
                <div style={s.meta}>{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={s.total}>${Number(o.total).toFixed(2)}</div>
                <span style={s.badge(o.status)}>{o.status}</span>
              </div>
            </div>
            {o.items?.length > 0 && (
              <div style={s.items}>
                {o.items.map(item => (
                  <div key={item.id} style={s.item}>
                    <span>{item.product_id.slice(0, 8)}… × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
