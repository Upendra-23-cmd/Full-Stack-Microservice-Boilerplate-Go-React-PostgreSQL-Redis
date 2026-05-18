import { useEffect, useState } from 'react'
import { productsAPI, ordersAPI } from '../api/client'

const s = {
  page: { padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' },
  title: { fontFamily: 'Space Mono, monospace', fontSize: '1.6rem', fontWeight: 700 },
  sub: { color: 'var(--muted)', fontSize: '0.88rem', marginTop: '0.2rem' },
  btnPrimary: {
    padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'var(--accent)',
    color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', border: 'none',
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' },
  card: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
  },
  cardName: { fontWeight: 600, fontSize: '1rem', color: 'var(--text)' },
  cardDesc: { color: 'var(--muted)', fontSize: '0.85rem', flexGrow: 1 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' },
  price: { fontFamily: 'Space Mono, monospace', fontSize: '1.1rem', color: 'var(--accent)' },
  stock: { fontSize: '0.8rem', color: 'var(--muted)' },
  orderBtn: {
    marginTop: '0.75rem', padding: '0.55rem 1rem', borderRadius: '7px',
    background: 'var(--surface2)', border: '1px solid var(--border)',
    color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', width: '100%',
  },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem',
  },
  modalCard: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '2rem', width: '100%', maxWidth: '420px',
  },
  modalTitle: { fontFamily: 'Space Mono, monospace', fontSize: '1.1rem', marginBottom: '1.5rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 },
  input: {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: '7px', padding: '0.65rem 0.9rem', color: 'var(--text)', fontSize: '0.92rem',
  },
  modalRow: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  btnSecondary: {
    flex: 1, padding: '0.65rem', borderRadius: '8px', background: 'transparent',
    border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.9rem', cursor: 'pointer',
  },
  success: {
    background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)',
    color: 'var(--accent3)', borderRadius: '8px', padding: '0.7rem 1rem',
    fontSize: '0.88rem', marginBottom: '1rem',
  },
  error: {
    background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
    color: '#ff4d6d', borderRadius: '8px', padding: '0.7rem 1rem',
    fontSize: '0.88rem', marginBottom: '1rem',
  },
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [orderTarget, setOrderTarget] = useState(null)
  const [orderQty, setOrderQty] = useState(1)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' })

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = () => {
    setLoading(true)
    productsAPI.list().then(r => setProducts(r.data.data || [])).finally(() => setLoading(false))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await productsAPI.create({ ...form, price: Number(form.price), stock: Number(form.stock) })
      setShowCreate(false)
      setForm({ name: '', description: '', price: '', stock: '' })
      fetchProducts()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to create product' })
    }
  }

  const handleOrder = async () => {
    try {
      await ordersAPI.create({ items: [{ product_id: orderTarget.id, quantity: Number(orderQty) }] })
      setOrderTarget(null)
      setMsg({ type: 'success', text: `Order placed for ${orderTarget.name}!` })
      fetchProducts()
      setTimeout(() => setMsg(null), 3000)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Order failed' })
      setOrderTarget(null)
    }
  }

  if (loading) return <div style={{ padding: '3rem', color: 'var(--muted)' }}>Loading…</div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Products</h1>
          <p style={s.sub}>{products.length} items in catalog</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setShowCreate(true)}>+ New Product</button>
      </div>

      {msg && <div style={msg.type === 'success' ? s.success : s.error}>{msg.text}</div>}

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
          No products yet. Create one to get started.
        </div>
      ) : (
        <div style={s.grid}>
          {products.map(p => (
            <div key={p.id} style={s.card}>
              <div style={s.cardName}>{p.name}</div>
              <div style={s.cardDesc}>{p.description || 'No description'}</div>
              <div style={s.row}>
                <span style={s.price}>${Number(p.price).toFixed(2)}</span>
                <span style={s.stock}>{p.stock} in stock</span>
              </div>
              <button style={s.orderBtn} onClick={() => { setOrderTarget(p); setOrderQty(1) }}
                disabled={p.stock === 0}>
                {p.stock === 0 ? 'Out of stock' : 'Place order →'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create product modal */}
      {showCreate && (
        <div style={s.modal} onClick={() => setShowCreate(false)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>// new product</h2>
            <form onSubmit={handleCreate}>
              {['name', 'description', 'price', 'stock'].map(f => (
                <div key={f} style={s.field}>
                  <label style={s.label}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                  <input style={s.input} value={form[f]}
                    onChange={e => setForm({ ...form, [f]: e.target.value })}
                    type={['price', 'stock'].includes(f) ? 'number' : 'text'}
                    step={f === 'price' ? '0.01' : '1'} min={0}
                    required={f !== 'description'} />
                </div>
              ))}
              <div style={s.modalRow}>
                <button type="button" style={s.btnSecondary} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" style={{ ...s.btnPrimary, flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order modal */}
      {orderTarget && (
        <div style={s.modal} onClick={() => setOrderTarget(null)}>
          <div style={s.modalCard} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>// place order</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {orderTarget.name} — ${Number(orderTarget.price).toFixed(2)} each
            </p>
            <div style={s.field}>
              <label style={s.label}>Quantity (max {orderTarget.stock})</label>
              <input style={s.input} type="number" min={1} max={orderTarget.stock}
                value={orderQty} onChange={e => setOrderQty(e.target.value)} />
            </div>
            <p style={{ color: 'var(--accent)', fontFamily: 'Space Mono, monospace', marginBottom: '1.5rem' }}>
              Total: ${(Number(orderTarget.price) * Number(orderQty)).toFixed(2)}
            </p>
            <div style={s.modalRow}>
              <button style={s.btnSecondary} onClick={() => setOrderTarget(null)}>Cancel</button>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={handleOrder}>Confirm order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
