// src/components/common/ProductCard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@utils/firebase';
import { useAuth } from '@context/AuthContext';
import { useCart } from '@context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!user || !product?.id) return;
    getDoc(doc(db, 'wishlist', user.uid)).then(snap => {
      if (snap.exists()) setWishlisted((snap.data().productIds || []).includes(product.id));
    });
  }, [user, product?.id]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save items'); return; }
    const ref = doc(db, 'wishlist', user.uid);
    const snap = await getDoc(ref);
    const ids = snap.exists() ? (snap.data().productIds || []) : [];
    const newIds = wishlisted ? ids.filter(id => id !== product.id) : [...ids, product.id];
    await setDoc(ref, { productIds: newIds });
    setWishlisted(!wishlisted);
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Default');
    toast.success('Added to cart!');
  };

  const discount = product?.price && product?.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="product-card group relative"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <Link to={`/product/${product.id}`}>
        {/* Image container */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', background: 'var(--bg-secondary)' }}>
          <img
            src={product.images?.[hovered && product.images?.length > 1 ? 1 : 0]
              || `https://picsum.photos/seed/${product.id}/400/500`}
            alt={product.name}
            className="product-card-img w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge badge-danger" style={{ background: 'var(--danger)', color: '#fff' }}>
                -{discount}%
              </span>
            )}
            {product.isFeatured && (
              <span className="badge badge-accent">Featured</span>
            )}
          </div>

          {/* Hover overlay actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            className="absolute inset-0 flex flex-col justify-end p-3 gap-2"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }}
          >
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition"
              style={{ background: '#fff', color: '#1A1A1A' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1A1A1A'; }}
            >
              <FiShoppingCart size={13} /> Add to Cart
            </button>
          </motion.div>

          {/* Image dots */}
          {product.images?.length > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.slice(0, 4).map((_, i) => (
                <button key={i}
                  onMouseEnter={() => setImgIdx(i)}
                  className="w-1 h-1 rounded-full transition-all"
                  style={{ background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.5)', transform: i === imgIdx ? 'scale(1.5)' : 'scale(1)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 pb-4">
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--accent)' }}>
            {product.subCategory}
          </p>
          <h3 className="text-sm font-medium leading-snug mb-2 line-clamp-2" style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>
              ₹{(product.discountPrice || product.price)?.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-xs line-through" style={{ color: 'var(--text-faint)' }}>₹{product.price?.toLocaleString()}</span>
            )}
          </div>
          {/* Size pills */}
          {product.sizes?.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {product.sizes.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist btn */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition"
        style={{
          background: wishlisted ? 'rgba(214,69,69,0.15)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      >
        <FiHeart size={14} style={{ fill: wishlisted ? '#D64545' : 'none', color: wishlisted ? '#D64545' : '#666' }} />
      </button>
    </motion.div>
  );
}
