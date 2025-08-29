import React, { useEffect, useMemo, useState } from 'react'

export type Product = {
  id: string
  name: string
  price: number
  quantity: number
  description?: string
}

const STORAGE_KEY = 'poc_inventario_products'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', price: '', quantity: '', description: '' })
  const [query, setQuery] = useState('')

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
  }, [products, query])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setProducts(JSON.parse(raw))
      } catch {
        setProducts([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [products])

  function resetForm() {
    setForm({ name: '', price: '', quantity: '', description: '' })
    setEditing(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = Number(form.price || 0)
    const quantity = Number(form.quantity || 0)
    if (!form.name.trim()) return alert('El nombre es requerido')
    if (price < 0) return alert('El precio no puede ser negativo')
    if (quantity < 0) return alert('La cantidad no puede ser negativa')

    if (editing) {
      setProducts(p => p.map(x => x.id === editing.id ? { ...x, name: form.name, price, quantity, description: form.description } : x))
      resetForm()
      return
    }

    const newProduct: Product = {
      id: uid(),
      name: form.name,
      price,
      quantity,
      description: form.description || undefined
    }
    setProducts(p => [newProduct, ...p])
    resetForm()
  }

  function handleEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, price: String(p.price), quantity: String(p.quantity), description: p.description || '' })
  }

  function handleDelete(id: string) {
    if (!confirm('\u00bfEliminar producto?')) return
    setProducts(p => p.filter(x => x.id !== id))
  }

  return (
    <div className="app">
      <header>
        <h1>Inventario - POC</h1>
      </header>
      <main>
        <section className="form">
          <h2>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label>
              Precio
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </label>
            <label>
              Cantidad
              <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            </label>
            <label>
              Descripci\u00f3n
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </label>
            <div className="actions">
              <button type="submit">{editing ? 'Guardar' : 'Crear'}</button>
              <button type="button" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </section>

        <section className="list">
          <h2>Productos</h2>
          <div className="search">
            <input
              placeholder="Buscar por nombre o descripci\u00f3n..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          {products.length === 0 && <p>No hay productos.</p>}
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Descripci\u00f3n</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.price.toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td>{p.description || '-'}</td>
                  <td>
                    <button onClick={() => handleEdit(p)}>Editar</button>
                    <button onClick={() => handleDelete(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
