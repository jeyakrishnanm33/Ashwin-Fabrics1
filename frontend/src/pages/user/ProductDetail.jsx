// src/pages/user/ProductDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '@utils/api';
import { useCart } from '@context/CartContext';
import ProductCard from '@components/common/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const p = await api.get(`/products/${id}`);
      setProduct(p);
      setSelectedColor(p.colors?.[0]?.name || '');
      setSelectedSize('');
      try {
        const rec = await api.get(`/recommendations/product/${id}`);
        const ids = rec.similar || [];
        if (ids.length > 0) {
          const prods = await Promise.all(ids.slice(0, 4).map(pid => api.get(`/products/${pid}`)));
          setSimilar(prods.filter(Boolean));
        }
      } catch (_) {}
      try { await api.post('/recommendations/log', { productId: id, action: 'view' }); } catch (_) {}
    } catch (err) {
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    addItem(product, selectedSize, selectedColor, qty);
    toast.success('Added to cart!');
  };

  const discount = product?.price && product?.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  if (loading) return (
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />)}
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-24">
      <p className="text-gray-400 text-xl">Product not found</p>
      <Link to="/shop" className="text-gray-600 underline mt-4 block">Back to Shop</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link> /
          <Link to="/shop" className="hover:text-gray-700 mx-1">Shop</Link> /
          <Link to={`/shop?category=${product.category}`} className="hover:text-gray-700 mx-1 capitalize">{product.category}</Link> /
          <span className="text-gray-700 ml-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div className="flex gap-3">
            <div className="flex flex-col gap-2">
              {(product.images || []).map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${selectedImg === i ? 'border-gray-900' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <motion.div key={selectedImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 rounded-3xl overflow-hidden bg-gray-100 aspect-[3/4]">
              <img src={product.images?.[selectedImg] || 'https://picsum.photos/400/500'} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wide mb-2 capitalize">{product.subCategory}</p>
            <h1 className="text-3xl font-black mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black">₹{product.discountPrice || product.price}</span>
              {discount > 0 && <>
                <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded-full">{discount}% OFF</span>
              </>}
            </div>

            {product.colors?.length > 0 && (
              <div className="mb-5">
                <p className="font-semibold text-sm mb-2">Color: <span className="font-normal">{selectedColor}</span></p>
                <div className="flex gap-2">
                  {product.colors.map(c => (
                    <button key={c.name} onClick={() => setSelectedColor(c.name)} title={c.name}
                      className={`w-8 h-8 rounded-full border-2 transition ${selectedColor === c.name ? 'border-gray-900 scale-110' : 'border-gray-300'}`}
                      style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="font-semibold text-sm mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || ['S','M','L','XL']).map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 rounded-xl font-semibold text-sm border-2 transition ${selectedSize === s ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-50">−</button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-10 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-50">+</button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-700 transition">
                <FiShoppingCart /> Add to Cart
              </button>
              <button onClick={() => setWishlisted(w => !w)}
                className={`w-12 h-12 border-2 rounded-xl flex items-center justify-center transition ${wishlisted ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-400'}`}>
                <FiHeart className={wishlisted ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>

            <div className="space-y-2 border-t pt-4">
              {[
                { icon: FiTruck,     text: 'Free delivery on orders above ₹999' },
                { icon: FiRefreshCw, text: '30-day easy returns' },
                { icon: FiShield,    text: '100% authentic products' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                  <Icon size={16} className="text-gray-400" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex gap-6 border-b mb-6">
            {[{ key: 'description', label: 'Description' }, { key: 'shipping', label: 'Shipping' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`pb-3 font-semibold text-sm border-b-2 transition ${activeTab === tab.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'description' && (
            <p className="text-gray-600 leading-relaxed max-w-2xl">
              {product.description || 'A premium quality garment crafted with care and attention to detail. Designed for comfort and style.'}
            </p>
          )}
          {activeTab === 'shipping' && (
            <div className="text-gray-600 space-y-2 text-sm max-w-lg">
              <p>• Standard delivery: 5–7 business days</p>
              <p>• Express delivery: 2–3 business days (₹99 extra)</p>
              <p>• Free shipping on orders above ₹999</p>
              <p>• Ships from our warehouse in Bengaluru</p>
            </div>
          )}
        </div>

        {similar.length > 0 && (
          <div>
            <h2 className="text-2xl font-black mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similar.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
