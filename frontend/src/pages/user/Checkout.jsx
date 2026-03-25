// src/pages/user/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiCheck } from 'react-icons/fi';
import { useCart } from '@context/CartContext';
import { useAuth } from '@context/AuthContext';
import api from '@utils/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const shipping = total >= 999 ? 0 : 99;
  const finalTotal = total + shipping;

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const onSubmit = async (formData) => {
    if (items.length === 0) return;
    setPlacing(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); return; }

      // Create Razorpay order
      const { orderId, amount, currency } = await api.post('/payments/create-order', {
        amount: finalTotal,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount,
        currency,
        name: 'Ashwin Fabrics',
        description: `Order for ${items.length} item(s)`,
        order_id: orderId,
        prefill: { name: formData.name, email: user?.email, contact: formData.phone },
        theme: { color: '#111827' },
        handler: async (response) => {
          try {
            await api.post('/orders', {
              items,
              totalAmount: finalTotal,
              shippingAddress: formData,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            await clearCart();
            toast.success('Order placed successfully!');
            navigate('/orders');
          } catch (err) {
            toast.error('Order placement failed: ' + err.message);
          }
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-black mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg mb-5">Shipping Address</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { name: 'name', label: 'Full Name', type: 'text' },
                { name: 'phone', label: 'Phone Number', type: 'tel' },
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'address', label: 'Address', type: 'text' },
                { name: 'city', label: 'City', type: 'text' },
                { name: 'state', label: 'State', type: 'text' },
                { name: 'pincode', label: 'PIN Code', type: 'text' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-semibold mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    {...register(f.name, { required: `${f.label} is required` })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name].message}</p>}
                </div>
              ))}

              <button type="submit" disabled={placing}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold mt-2 hover:bg-gray-700 disabled:opacity-60">
                {placing ? 'Processing...' : `Pay ₹${finalTotal}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={`${item.productId}-${item.size}`} className="flex gap-3 items-center">
                    <img src={item.image || 'https://picsum.photos/60/70'}
                      alt="" className="w-14 h-16 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.size} · {item.color} · Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{total}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span><span>₹{finalTotal}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-2xl text-sm text-green-700 space-y-1">
              {['Secure SSL payment', '100% authentic products', 'Easy 30-day returns'].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <FiCheck size={14} /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
