// src/pages/user/Cart.jsx
import { Link } from 'react-router-dom';
import { FiTrash2, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@context/CartContext';

export default function Cart() {
  const { items, total, updateQuantity, removeItem } = useCart();

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <FiShoppingBag size={64} className="text-gray-200 mb-6" />
      <h2 className="text-2xl font-black mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-8">Add some items to get started</p>
      <Link to="/shop" className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-700">
        Shop Now
      </Link>
    </div>
  );

  const shipping = total >= 999 ? 0 : 99;
  const finalTotal = total + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-black mb-8">Shopping Cart ({items.length})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm"
                >
                  <Link to={`/product/${item.productId}`}>
                    <img src={item.image || 'https://picsum.photos/100/120'}
                      alt={item.name} className="w-24 h-28 object-cover rounded-xl bg-gray-100" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="font-semibold text-gray-900 hover:underline">{item.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-400 mt-1">
                      Size: <strong>{item.size}</strong> · Color: <strong>{item.color}</strong>
                    </p>
                    <p className="font-bold text-lg mt-2">₹{item.price}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 font-bold">−</button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 font-bold">+</button>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-gray-400 hover:text-red-500 transition">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({items.length} items)</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    Add ₹{999 - total} more for free shipping!
                  </p>
                )}
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4 mb-6">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
              <Link to="/checkout"
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition">
                Proceed to Checkout <FiArrowRight />
              </Link>
              <Link to="/shop" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
