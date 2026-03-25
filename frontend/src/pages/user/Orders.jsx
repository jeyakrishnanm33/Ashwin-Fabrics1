// src/pages/user/Orders.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '@utils/api';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <FiPackage size={64} className="text-gray-200 mb-4" />
      <h2 className="text-2xl font-black mb-2">No orders yet</h2>
      <p className="text-gray-400 mb-6">Your order history will appear here</p>
      <Link to="/shop" className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold">Start Shopping</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-black mb-8">My Orders</h1>
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div>
                  <p className="font-bold">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {order.createdAt?.toDate?.()?.toLocaleDateString() || new Date(order.createdAt?.seconds * 1000 || order.createdAt).toLocaleDateString()}
                    · {order.items?.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                  <span className="font-bold">₹{order.totalAmount}</span>
                  {expanded === order.id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t px-5 py-4 space-y-3 bg-gray-50">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img src={item.image || 'https://picsum.photos/60/70'}
                        alt="" className="w-12 h-14 object-cover rounded-lg bg-gray-200" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">₹{item.price}</p>
                    </div>
                  ))}
                  <div className="border-t pt-3 text-sm text-gray-500">
                    <p>📍 {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
