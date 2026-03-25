// src/pages/user/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiPackage, FiTruck, FiRefreshCw, FiLock, FiPhone, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api, { mlApi } from '@utils/api';
import { useAuth } from '@context/AuthContext';
import ProductCard from '@components/common/ProductCard';

const HERO_SLIDES = [
  {
    title: "New Summer\nCollection",
    subtitle: "Fresh styles crafted for the bold",
    cta: "Shop Men",
    link: "/shop?category=men",
    img: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1200&auto=format&fit=crop",
    accent: "#C9A96E",
    tag: "NEW ARRIVALS",
  },
  {
    title: "Women's\nEthnic Wear",
    subtitle: "Grace meets contemporary design",
    cta: "Shop Women",
    link: "/shop?category=women",
    img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&auto=format&fit=crop",
    accent: "#E8A598",
    tag: "TRENDING NOW",
  },
  {
    title: "Bulk Orders\nMade Simple",
    subtitle: "Custom clothing for your business",
    cta: "Get a Quote",
    link: "/bulk-order",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop",
    accent: "#8AB4A0",
    tag: "WHOLESALE",
  },
];

const CATEGORIES = [
  { name: "Men",        link: "/shop?category=men",    img: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop" },
  { name: "Women",      link: "/shop?category=women",  img: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&auto=format&fit=crop" },
  { name: "Kids",       link: "/shop?category=kids",   img: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop" },
  { name: "Unisex",     link: "/shop?category=unisex", img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop" },
  { name: "Ethnic",     link: "/shop?category=ethnic", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop" },
  { name: "Bulk Orders",link: "/bulk-order",           img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop" },
];

const FEATURES = [
  { icon: FiTruck,      title: "Free Shipping",   sub: "On orders above ₹999"    },
  { icon: FiRefreshCw,  title: "Easy Returns",    sub: "30-day return policy"    },
  { icon: FiLock,       title: "Secure Payment",  sub: "100% safe checkout"      },
  { icon: FiPhone,      title: "24/7 Support",    sub: "Always here to help"     },
];

export default function Home() {
  const { user } = useAuth();
  const [heroIdx, setHeroIdx]       = useState(0);
  const [featured, setFeatured]     = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [autoplay, setAutoplay]     = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [autoplay]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/products?featured=true&limit=8');
        setFeatured(res.products || []);
      } catch (_) {}
      if (user) {
        try {
          const rec = await mlApi.get(`/recommend/user/${user.uid}?limit=8`);
          setRecommended(rec.data?.recommendations || []);
        } catch (_) {}
      }
      setLoading(false);
    })();
  }, [user]);

  const slide = HERO_SLIDES[heroIdx];
  const prev = () => { setAutoplay(false); setHeroIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); };
  const next = () => { setAutoplay(false); setHeroIdx(i => (i + 1) % HERO_SLIDES.length); };

  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative h-[92vh] overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <AnimatePresence mode="wait">
          <motion.div key={heroIdx}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            {/* Background image */}
            <div className="absolute inset-0">
              <img src={slide.img} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(15,15,15,0.85) 0%, rgba(15,15,15,0.4) 55%, rgba(15,15,15,0.1) 100%)' }} />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                <motion.div
                  initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="max-w-xl"
                >
                  <span className="inline-block text-[10px] font-bold tracking-[0.25em] uppercase mb-6 px-3 py-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {slide.tag}
                  </span>
                  <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff' }}
                    className="text-6xl md:text-7xl font-light leading-[1.05] mb-5 whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <p className="text-base text-white/70 mb-8 font-light">{slide.subtitle}</p>
                  <div className="flex items-center gap-4">
                    <Link to={slide.link}
                      className="inline-flex items-center gap-3 px-7 py-3.5 rounded-lg font-semibold text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5"
                      style={{ background: '#fff', color: '#1A1A1A', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = slide.accent; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1A1A1A'; }}
                    >
                      {slide.cta} <FiArrowRight size={16} />
                    </Link>
                    <Link to="/shop" className="text-white/70 text-sm font-medium hover:text-white transition underline underline-offset-4">
                      View all
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute bottom-8 left-6 md:left-12 flex items-center gap-4">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition">
            <FiChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => { setAutoplay(false); setHeroIdx(i); }}
                className="transition-all duration-300 rounded-full"
                style={{ background: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.4)', width: i === heroIdx ? 24 : 6, height: 6 }} />
            ))}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition">
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* Slide counter */}
        <div className="absolute bottom-8 right-6 md:right-12 text-white/50 text-sm font-mono">
          0{heroIdx + 1} <span className="text-white/20">/</span> 0{HERO_SLIDES.length}
        </div>
      </section>

      {/* ── Bulk order banner ───────────────────────────────── */}
      <section style={{ background: 'var(--text)' }} className="py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <FiPackage size={18} color="#fff" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--bg)' }}>Need Bulk Orders?</p>
              <p className="text-xs opacity-60" style={{ color: 'var(--bg)' }}>Custom designs, fabrics & quantities for your business</p>
            </div>
          </div>
          <Link to="/bulk-order"
            className="text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg transition"
            style={{ background: 'var(--accent)', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get a Quote
          </Link>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: 'var(--accent)' }}>Browse</p>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }} className="text-4xl font-light">
              Shop by Category
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-medium flex items-center gap-2 hover:opacity-70 transition" style={{ color: 'var(--text-muted)' }}>
            All Products <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.name} to={cat.link}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
                className="group rounded-2xl overflow-hidden cursor-pointer"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <div className="overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <img src={cat.img} alt={cat.name}
                    className="w-full h-full object-cover product-card-img" />
                </div>
                <div className="px-3 py-2.5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text)' }}>{cat.name}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: 'var(--accent)' }}>Handpicked</p>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }} className="text-4xl font-light">
              Featured Collection
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-medium flex items-center gap-2 hover:opacity-70 transition" style={{ color: 'var(--text-muted)' }}>
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 'var(--radius)' }} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <p className="text-lg">No featured products yet</p>
            <p className="text-sm mt-1">Add products from the admin panel</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* ── Editorial banner ─────────────────────────────────── */}
      <section className="py-6 px-6">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative h-72"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&auto=format&fit=crop"
            alt="Collection"
            className="w-full h-full object-cover opacity-60"
            style={{ filter: 'saturate(0.8)' }}
          />
          <div className="absolute inset-0 flex items-center px-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: 'var(--accent)' }}>Limited Edition</p>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }} className="text-5xl font-light mb-5">
                Curated for You
              </h3>
              <Link to="/shop" className="btn-primary">Explore Now <FiArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ML Recommendations ───────────────────────────────── */}
      {user && recommended.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: 'var(--accent)' }}>Personalised</p>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }} className="text-4xl font-light">
              Recommended for You
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {recommended.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Features strip ───────────────────────────────────── */}
      <section className="py-16" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {FEATURES.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--accent-light)', border: '1px solid var(--border)' }}>
                <Icon size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
