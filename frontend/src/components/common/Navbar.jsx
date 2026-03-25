// src/components/common/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiSearch, FiPackage, FiTruck } from 'react-icons/fi';
import { useAuth } from '@context/AuthContext';
import { useCart } from '@context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Men', href: '/shop?category=men' },
  { label: 'Women', href: '/shop?category=women' },
  { label: 'Kids', href: '/shop?category=kids' },
  { label: 'New Arrivals', href: '/shop?sort=newest' },
  { label: 'Sale', href: '/shop?sale=true', className: 'text-red-500 font-bold' },
];

export default function Navbar() {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?q=${encodeURIComponent(search)}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-gray-900 text-white text-center text-xs py-2">
        <span className="inline-flex items-center gap-1"><FiTruck size={12} className="inline" /> Free shipping on orders above ₹999</span> | 
        <span className="ml-1">59/2 22b, 2nd Street, Kannagi Nagar, Tiruppur-641602, Tamil Nadu</span> |
        <Link to="/bulk-order" className="underline ml-1">Bulk orders available</Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-black tracking-tight">
            Ashwin<span className="text-amber-500"> Fabrics</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <Link
                key={l.label}
                to={l.href}
                className={`text-sm font-medium text-gray-700 hover:text-black transition ${l.className || ''}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/bulk-order"
              className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 border border-amber-300 px-3 py-1 rounded-full"
            >
              <FiPackage size={14} /> Bulk Order
            </Link>
          </div>

          {/* Search + Icons */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden md:flex items-center border border-gray-200 rounded-full px-4 py-2 gap-2">
              <FiSearch className="text-gray-400 text-sm" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clothes..."
                className="text-sm outline-none w-36 bg-transparent"
              />
            </form>

            <Link to="/wishlist" className="p-2 hover:bg-gray-100 rounded-full">
              <FiHeart size={20} />
            </Link>

            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
              <FiShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full">
                  <FiUser size={20} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100">
                  <p className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">{userProfile?.name || user.email}</p>
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50">My Orders</Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">Profile</Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50">Admin Panel</Link>
                  )}
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full font-semibold hover:bg-gray-700">
                Login
              </Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3"
          >
            {NAV_LINKS.map(l => (
              <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium py-2 ${l.className || 'text-gray-700'}`}>
                {l.label}
              </Link>
            ))}
            <Link to="/bulk-order" onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold text-amber-600 py-2">
              📦 Bulk Orders
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
