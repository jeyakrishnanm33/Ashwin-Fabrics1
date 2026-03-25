// src/pages/user/Shop.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import api from '@utils/api';
import ProductCard from '@components/common/ProductCard';

const CATEGORIES   = ['men', 'women', 'kids', 'unisex'];
const SUBCATEGORIES= ['tshirt', 'shirt', 'jeans', 'dress', 'jacket', 'kurta', 'joggers', 'hoodie', 'polo'];
const SIZES        = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const PRICE_RANGES = [
  { label: 'Under ₹500',     min: 0,    max: 500    },
  { label: '₹500 – ₹1000',  min: 500,  max: 1000   },
  { label: '₹1000 – ₹2000', min: 1000, max: 2000   },
  { label: 'Above ₹2000',   min: 2000, max: 999999 },
];
const SORTS = [
  { label: 'Newest',             value: 'newest'     },
  { label: 'Price: Low to High', value: 'price_asc'  },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated',          value: 'rating'     },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // ── Derive filters directly from URL — single source of truth ──────────────
  // Instead of a separate filters state that goes stale, we read searchParams
  // directly everywhere. Any nav link that changes the URL auto-triggers a refetch.
  const category   = searchParams.get('category')    || '';
  const sortVal    = searchParams.get('sort')         || 'newest';
  const q          = searchParams.get('q')            || '';

  // Sidebar-only filters that don't live in the URL
  const [subCategory, setSubCategory] = useState('');
  const [size,        setSize]        = useState('');
  const [priceRange,  setPriceRange]  = useState(null);

  // Refetch whenever the URL changes OR sidebar filters change
  useEffect(() => {
    fetchProducts();
  }, [searchParams, subCategory, size, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category)   params.set('category',    category);
      if (subCategory)params.set('subCategory', subCategory);
      if (sortVal)    params.set('sort',         sortVal);
      if (q)          params.set('q',            q);
      params.set('limit', '40');

      const res = await api.get(`/products?${params}`);
      let prods = res.products || [];

      // Client-side filters
      if (priceRange) prods = prods.filter(p => {
        const price = p.discountPrice || p.price;
        return price >= priceRange.min && price <= priceRange.max;
      });
      if (size) prods = prods.filter(p => p.sizes?.includes(size));

      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle a URL-based filter (category pill buttons)
  const toggleCategory = (c) => {
    const next = new URLSearchParams(searchParams);
    if (category === c) {
      next.delete('category');
    } else {
      next.set('category', c);
    }
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSubCategory('');
    setSize('');
    setPriceRange(null);
  };

  const activeFilterCount = [category, subCategory, size, priceRange].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Sticky header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors">
              <FiFilter size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {/* Category pills — update URL on click */}
            <div className="hidden md:flex gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => toggleCategory(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors
                    ${category === c
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">{products.length} products</p>
            <select value={sortVal}
              onChange={e => {
                const next = new URLSearchParams(searchParams);
                next.set('sort', e.target.value);
                setSearchParams(next);
              }}
              className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full px-3 py-2 focus:outline-none">
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex gap-6">

        {/* Sidebar */}
        {showFilters && (
          <aside className="w-64 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm dark:shadow-black/20 sticky top-36 border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filters</h3>
                <button onClick={clearFilters} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Clear all</button>
              </div>

              {/* Category */}
              <div className="mb-5">
                <p className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">Category</p>
                {CATEGORIES.map(c => (
                  <label key={c} className="flex items-center gap-2 py-1 cursor-pointer capitalize">
                    <input type="checkbox" checked={category === c}
                      onChange={() => toggleCategory(c)}
                      className="rounded accent-gray-900 dark:accent-white" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{c}</span>
                  </label>
                ))}
              </div>

              {/* Sub-category */}
              <div className="mb-5">
                <p className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">Type</p>
                {SUBCATEGORIES.map(s => (
                  <label key={s} className="flex items-center gap-2 py-1 cursor-pointer capitalize">
                    <input type="checkbox" checked={subCategory === s}
                      onChange={() => setSubCategory(prev => prev === s ? '' : s)}
                      className="rounded accent-gray-900 dark:accent-white" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
                  </label>
                ))}
              </div>

              {/* Size */}
              <div className="mb-5">
                <p className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">Size</p>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button key={s} onClick={() => setSize(prev => prev === s ? '' : s)}
                      className={`w-10 h-10 rounded-lg text-xs font-semibold border transition-colors
                        ${size === s
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-2">
                <p className="font-semibold text-sm mb-3 text-gray-900 dark:text-gray-100">Price Range</p>
                {PRICE_RANGES.map(p => (
                  <label key={p.label} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="price" checked={priceRange?.label === p.label}
                      onChange={() => setPriceRange(p)}
                      className="accent-gray-900 dark:accent-white" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {q && (
            <div className="mb-4 flex items-center gap-2">
              <p className="text-gray-600 dark:text-gray-300">Search results for <strong>"{q}"</strong></p>
              <button onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('q');
                setSearchParams(next);
              }} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <FiX />
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-gray-400 dark:text-gray-500">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-xl font-semibold mb-2">No products found</p>
              <button onClick={clearFilters} className="text-gray-600 dark:text-gray-400 underline text-sm">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
