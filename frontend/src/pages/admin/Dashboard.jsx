// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiPackage, FiUsers, FiLogOut, FiMenu, FiX, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@context/AuthContext';
import api from '@utils/api';
import ImageUploader from '@components/admin/ImageUploader';


// ── Dashboard Home ─────────────────────────────────────────────────────────

function DashboardHome() {
  const [stats, setStats] = useState({ orders: 0, products: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/orders/all').catch(() => ({ orders: [] })),
      api.get('/products?limit=100').catch(() => ({ products: [] })),
      api.get('/users').catch(() => ({ users: [] })),
    ]).then(([ordersRes, productsRes, usersRes]) => {
      const orders = ordersRes.orders || [];
      setStats({
        orders: orders.length,
        products: productsRes.products?.length || 0,
        users: usersRes.users?.length || 0,
        revenue: orders.reduce((s, o) => s + (o.totalAmount || 0), 0),
      });
      setRecentOrders(orders.slice(0, 5));
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders',   value: stats.orders,                        color: 'bg-blue-50 text-blue-700'   },
          { label: 'Total Revenue',  value: `₹${stats.revenue.toLocaleString()}`, color: 'bg-green-50 text-green-700' },
          { label: 'Products',       value: stats.products,                       color: 'bg-purple-50 text-purple-700'},
          { label: 'Users',          value: stats.users,                          color: 'bg-orange-50 text-orange-700'},
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-5`}>
            <p className="text-sm font-medium opacity-70">{s.label}</p>
            <p className="text-2xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
        {recentOrders.length === 0
          ? <p className="text-gray-400 text-sm py-4 text-center">No orders yet</p>
          : recentOrders.map(o => (
            <div key={o.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">#{o.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-gray-400">{o.items?.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">₹{o.totalAmount}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${o.status==='delivered'?'bg-green-100 text-green-700':o.status==='shipped'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Blank product form ─────────────────────────────────────────────────────

const BLANK_FORM = {
  name: '', category: 'men', subCategory: 'tshirt',
  price: '', discountPrice: '', description: '',
  sizes: ['S','M','L','XL'], isFeatured: false,
  images: [],   // ← Cloudinary URLs go here
  colors: [{ name: 'Black', hex: '#000000' }],
  tags: '',
};

// ── Admin Products ─────────────────────────────────────────────────────────

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);   // product id being edited
  const [form, setForm]         = useState(BLANK_FORM);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    api.get('/products?limit=100')
      .then(r => setProducts(r.products || []))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setForm(BLANK_FORM);
    setEditing(null);
    setShowForm(true);
    setTimeout(() => document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      category: p.category || 'men',
      subCategory: p.subCategory || 'tshirt',
      price: p.price || '',
      discountPrice: p.discountPrice || '',
      description: p.description || '',
      sizes: p.sizes || ['S','M','L','XL'],
      isFeatured: p.isFeatured || false,
      images: p.images || [],
      colors: p.colors || [{ name: 'Black', hex: '#000000' }],
      tags: (p.tags || []).join(', '),
    });
    setEditing(p.id);
    setShowForm(true);
    setTimeout(() => document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { alert('Name and price are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || Number(form.price),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [form.category, form.subCategory],
        ratings: editing
          ? undefined     // don't overwrite existing ratings
          : { average: 0, count: 0 },
        isActive: true,
      };
      if (!editing) delete payload.ratings;

      if (editing) {
        await api.put(`/products/${editing}`, payload);
        setProducts(ps => ps.map(p => p.id === editing ? { ...p, ...payload } : p));
      } else {
        const res = await api.post('/products', { ...payload, ratings: { average: 0, count: 0 } });
        setProducts(ps => [res, ...ps]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, current) => {
    await api.put(`/products/${id}`, { isActive: !current });
    setProducts(ps => ps.map(p => p.id === id ? { ...p, isActive: !current } : p));
  };

  const [confirmDelete, setConfirmDelete] = useState(null); // product to delete

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/products/${confirmDelete.id}`);
      setProducts(ps => ps.filter(p => p.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const SIZES_ALL = ['XS','S','M','L','XL','XXL','3XL'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black">Products</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700">
          <FiPlus /> Add Product
        </button>
      </div>

      {/* ── Product Form ─────────────────────────────────── */}
      {showForm && (
        <div id="product-form" className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-lg">{editing ? 'Edit Product' : 'New Product'}</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><FiX size={20} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Urban Graphic Tee"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="999"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Discount Price (₹)</label>
                  <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                    placeholder="799"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {['men','women','kids','unisex'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Sub-Category</label>
                  <select value={form.subCategory} onChange={e => setForm(f => ({ ...f, subCategory: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    {['tshirt','shirt','jeans','dress','jacket','kurta','joggers','hoodie','polo','shorts','skirt','saree'].map(c =>
                      <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the product..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES_ALL.map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s]
                      }))}
                      className={`w-10 h-10 rounded-lg text-xs font-bold border-2 transition
                        ${form.sizes.includes(s) ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 hover:border-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="summer, casual, trending"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-gray-900' : 'bg-gray-200'}`}
                  onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${form.isFeatured ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-semibold">Featured Product</span>
              </label>
            </div>

            {/* Right column — Image Upload */}
            <div>
              <label className="text-xs font-semibold block mb-2">
                Product Images
                <span className="text-gray-400 font-normal ml-1">(up to 5, first = main image)</span>
              </label>
              <ImageUploader
                value={form.images}
                onChange={urls => setForm(f => ({ ...f, images: urls }))}
                maxImages={5}
              />

              {form.images.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  ⚠️ Upload at least one image before saving
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t">
            <button onClick={handleSave} disabled={saving || form.images.length === 0}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (editing ? '✓ Update Product' : '+ Save Product')}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="border border-gray-200 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Products Table ───────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FiShoppingBag size={28} className="text-gray-300" /></div>
          <p className="font-semibold">No products yet</p>
          <button onClick={openAdd} className="mt-4 text-gray-900 underline text-sm">Add your first product</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['Image','Product','Category','Price','Status','Actions'].map(h =>
                  <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  {/* Image thumbnail */}
                  <td className="px-4 py-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name}
                        className="w-12 h-14 object-cover rounded-lg bg-gray-100" />
                    ) : (
                      <div className="w-12 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.sizes?.join(', ')}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 capitalize">{p.category} / {p.subCategory}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">₹{p.discountPrice || p.price}</p>
                    {p.discountPrice && p.discountPrice < p.price && (
                      <p className="text-xs text-gray-400 line-through">₹{p.price}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                      ${p.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isActive !== false ? '● Active' : '○ Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
                        title="Edit">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => toggleActive(p.id, p.isActive !== false)}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition">
                        {p.isActive !== false ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => setConfirmDelete(p)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                        title="Delete">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-400 border-t">
            {products.length} products total
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={22} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">Delete Product?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              <span className="font-semibold text-gray-800">{confirmDelete.name}</span>
            </p>
            <p className="text-xs text-gray-400 text-center mb-5">
              This action cannot be undone. The product will be permanently removed.
            </p>
            {confirmDelete.images?.[0] && (
              <img src={confirmDelete.images[0]} alt={confirmDelete.name}
                className="w-20 h-24 object-cover rounded-xl mx-auto mb-5 border border-gray-100" />
            )}
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin Orders ───────────────────────────────────────────────────────────

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/all').then(r => setOrders(r.orders || [])).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Orders</h1>
      {loading ? <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" /> : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>{['Order ID','Items','Amount','Status','Update'].map(h =>
                <th key={h} className="px-4 py-3 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">{o.items?.length || 0} items</td>
                  <td className="px-4 py-3 font-semibold">₹{o.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                      ${o.status==='delivered'?'bg-green-100 text-green-700':o.status==='shipped'?'bg-blue-100 text-blue-700':'bg-yellow-100 text-yellow-700'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                      {['pending','confirmed','shipped','delivered','cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-8 text-gray-400">No orders yet</p>}
        </div>
      )}
    </div>
  );
}

// ── Admin Bulk Orders ──────────────────────────────────────────────────────

function AdminBulkOrders() {
  const [orders, setOrders] = useState([]);
  const [quoteInputs, setQuoteInputs] = useState({});

  useEffect(() => { api.get('/bulk-orders').then(r => setOrders(r.orders || [])); }, []);

  const sendQuote = async (id) => {
    const price = quoteInputs[id];
    if (!price) return;
    await api.patch(`/bulk-orders/${id}`, { quotedPrice: Number(price), status: 'quoted' });
    setOrders(o => o.map(x => x.id === id ? { ...x, quotedPrice: Number(price), status: 'quoted' } : x));
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Bulk Orders</h1>
      <div className="space-y-4">
        {orders.length === 0 && <p className="text-gray-400 py-8 text-center">No bulk order inquiries yet</p>}
        {orders.map(o => (
          <div key={o.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold">{o.companyName || 'Unknown Company'}</p>
                <p className="text-sm text-gray-400">{o.contactPerson} · {o.phone} · {o.email}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium
                ${o.status==='quoted'?'bg-blue-100 text-blue-700':o.status==='approved'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                {o.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
              <p><strong>Category:</strong> {o.category}</p>
              <p><strong>Fabric:</strong> {o.fabric}</p>
              <p><strong>Total Qty:</strong> {o.totalQuantity} pcs</p>
              <p><strong>Colors:</strong> {o.colors?.join(', ')}</p>
              <p><strong>Print:</strong> {o.printType}</p>
              <p><strong>Delivery by:</strong> {o.deliveryDate || '—'}</p>
            </div>
            {o.notes && <p className="text-sm text-gray-500 mb-3 italic">"{o.notes}"</p>}
            {o.status === 'inquiry' && (
              <div className="flex gap-2 items-center">
                <span className="text-sm font-semibold">₹</span>
                <input type="number" placeholder="Enter quote price"
                  value={quoteInputs[o.id] || ''}
                  onChange={e => setQuoteInputs(q => ({ ...q, [o.id]: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-gray-900" />
                <button onClick={() => sendQuote(o.id)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700">
                  Send Quote
                </button>
              </div>
            )}
            {o.quotedPrice && (
              <p className="text-sm font-bold text-green-700 mt-2">✓ Quoted: ₹{o.quotedPrice}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Layout ──────────────────────────────────────────────────────

const NAV = [
  { label: 'Dashboard',   href: '/admin',          icon: FiGrid      },
  { label: 'Products',    href: '/admin/products',  icon: FiShoppingBag },
  { label: 'Orders',      href: '/admin/orders',    icon: FiPackage   },
  { label: 'Bulk Orders', href: '/admin/bulk',      icon: FiPackage   },
  { label: 'Users',       href: '/admin/users',     icon: FiUsers     },
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-gray-900 text-white transition-all duration-200 flex flex-col shrink-0`}>
        <div className="p-3 flex justify-end">
          <button onClick={() => setSidebarOpen(s => !s)} className="text-gray-400 hover:text-white p-1">
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link key={href} to={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${location.pathname === href ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 w-full">
            <FiLogOut size={18} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders"   element={<AdminOrders />} />
          <Route path="bulk"     element={<AdminBulkOrders />} />
          <Route path="users"    element={<div className="text-gray-400 py-8 text-center">Users panel — coming soon</div>} />
        </Routes>
      </main>
    </div>
  );
}
