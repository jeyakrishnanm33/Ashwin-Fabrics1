// src/pages/user/Wishlist.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@utils/firebase';
import { useAuth } from '@context/AuthContext';
import { useCart } from '@context/CartContext';
import api from '@utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Wishlist() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [productIds, setProductIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time wishlist sync from Firestore
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const ref = doc(db, 'wishlist', user.uid);
    const unsub = onSnapshot(ref, snap => {
      const ids = snap.exists() ? (snap.data().productIds || []) : [];
      setProductIds(ids);
    });
    return unsub;
  }, [user]);

  // Fetch product details whenever ids change
  useEffect(() => {
    if (productIds.length === 0) { setProducts([]); setLoading(false); return; }

    setLoading(true);
    Promise.all(
      productIds.map(id => api.get(`/products/${id}`).catch(() => null))
    ).then(results => {
      setProducts(results.filter(Boolean));
      setLoading(false);
    });
  }, [productIds]);

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    const newIds = productIds.filter(id => id !== productId);
    await setDoc(doc(db, 'wishlist', user.uid), { productIds: newIds });
    toast.success('Removed from wishlist');
  };

  const moveToCart = (product) => {
    addItem(product, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Default');
    removeFromWishlist(product.id);
    toast.success('Moved to cart!');
  };

  const clearAll = async () => {
    if (!user) return;
    await setDoc(doc(db, 'wishlist', user.uid), { productIds: [] });
    toast.success('Wishlist cleared');
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <FiHeart size={64} className="text-gray-200 mb-6" />
      <h2 className="text-2xl font-black mb-2">Sign in to view wishlist</h2>
      <p className="text-gray-400 mb-8">Save your favourite items and shop later</p>
      <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-700">
        Sign In
      </Link>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );

  if (products.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <FiHeart size={64} className="text-gray-200 mb-6" />
      <h2 className="text-2xl font-black mb-2">Your wishlist is empty</h2>
      <p className="text-gray-400 mb-8">Browse products and tap the ♡ to save them here</p>
      <Link to="/shop" className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-700">
        Browse Products
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">My Wishlist</h1>
            <p className="text-gray-400 mt-1">{products.length} item{products.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button onClick={clearAll}
            className="text-sm text-red-400 hover:text-red-600 flex items-center gap-1 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition">
            <FiTrash2 size={14} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {products.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group"
              >
                {/* Image */}
                <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/300/400`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Discount badge */}
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                    </span>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                  >
                    <FiTrash2 size={14} className="text-red-400" />
                  </button>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs text-gray-400 capitalize mb-1">{product.subCategory}</p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 hover:underline">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1 mb-3">
                    <span className="font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                    {product.discountPrice && product.discountPrice < product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                    )}
                  </div>
                  <button
                    onClick={() => moveToCart(product)}
                    className="w-full bg-gray-900 text-white text-xs py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-700 transition"
                  >
                    <FiShoppingCart size={13} /> Move to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
