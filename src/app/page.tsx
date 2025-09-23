"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/useCart';
import { useProducts } from '@/lib/useProducts';
import { useFavorites } from '@/lib/useFavorites';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import { produkDb } from '@/lib/database';
import { useAuth } from '@/lib/auth-context';


export default function Page() {
  const [phase, setPhase] = useState(0);
  const lineRef = useRef<HTMLSpanElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavOpen, setIsFavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFavorites, setSelectedFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { items: homeCartItems, loading: homeCartLoading } = useCart();
  const { count: cartCount } = useCart();
  const { favorites, loading: favoritesLoading, toggleFavorite, isFavorite, count: favoritesCount } = useFavorites();
  const { user } = useAuth();

  // Handle checkbox selection in favorites
  const handleFavoriteCheckbox = (favoriteId: string, checked: boolean) => {
    setSelectedFavorites(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(favoriteId);
      } else {
        newSet.delete(favoriteId);
      }
      return newSet;
    });
  };

  // Clear selected favorites when sidebar closes
  const handleCloseFavSidebar = () => {
    setIsFavOpen(false);
    setSelectedFavorites(new Set());
  };

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await produkDb.search(searchQuery.trim());
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear search when sidebar closes
  const handleCloseSearchSidebar = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const onEnd = () => {
      setPhase((prev) => (prev + 1) % 4);
    };
    el.addEventListener('animationend', onEnd);
    return () => el.removeEventListener('animationend', onEnd);
  }, [phase]);
  const { products } = useProducts(8);

  // Sticky desktop header on scroll
  useEffect(() => {
    const onScroll = () => {
      if (typeof window !== 'undefined') {
        setShowSticky(window.scrollY > 80);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll as any);
  }, []);

  // Reveal-on-scroll for section cards
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
          } else {
            el.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Scroll-driven URL path updates per section
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[data-route]'));
    if (sections.length === 0) return;

    let current = window.location.pathname;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (!vis) return;
        const el = vis.target as HTMLElement;
        const route = el.getAttribute('data-route');
        if (!route || route === current) return;
        window.history.replaceState(null, '', route);
        current = route;
      },
      { threshold: 0.55, rootMargin: '0px 0px -10% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // On initial load, if the path matches a section route, scroll to it
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    const target = document.querySelector<HTMLElement>(`section[data-route="${path}"]`);
    if (target) {
      // slight delay to ensure layout is ready
      setTimeout(() => {
        try {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {
          target.scrollIntoView();
        }
      }, 50);
    }
  }, []);

  const headingSub = phase === 0 ? 'Cloud' : phase === 1 ? 'Leather' : phase === 2 ? 'Shoes' : 'Loafers';
  const description =
    phase === 0
      ? 'Cocok dipakai harian maupun saat santai dan mempunyai bahan lembut'
      : phase === 1
      ? 'Desain minimalis dengan bahan kulit yang berkilau'
      : phase === 2
      ? 'Nyaman dipakai dengan bahan lembut terasa di kaki'
      : 'Tampil keren dengan sepatu nyaman di kaki';
  const activeLabel = phase === 0 ? '01._' : phase === 1 ? '02._' : phase === 2 ? '03._' : '04._';
  const mainImg =
    phase === 0
      ? '/images/test1.png'
      : phase === 1
      ? '/images/test2.png'
      : phase === 2
      ? '/images/test3.png'
      : '/images/test4.png';
  const productImg =
    phase === 0
      ? '/images/test1-produk.png'
      : phase === 1
      ? '/images/test2-produk.png'
      : phase === 2
      ? '/images/test3-produk.png'
      : '/images/test4-produk.png';
  const phaseTitle =
    phase === 0
      ? 'Sock Sneakers Cloud'
      : phase === 1
      ? 'Sock Sneakers Leather'
      : phase === 2
      ? 'Gladiator Sandals Shoes'
      : 'Gladiator Canvas Loafers';

  return (
    <main className="min-h-screen">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl p-6">
            <div className="mt-6 md:mt-8 flex items-center justify-between">
              <span className="font-heading text-3xl md:text-4xl font-bold text-black">MEORIS</span>
              <button
                type="button"
                aria-label="Tutup menu"
                className="p-2 rounded hover:opacity-80 text-black cursor-pointer"
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <nav className="mt-10 md:mt-12">
              <ul className="space-y-5 font-body text-gray-800">
                <li>
                  <a href="#produk" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between text-black hover:underline">
                    <span className="font-heading text-base">Produk</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href={user ? "/my-account" : "/login"} className="flex items-center justify-between text-black hover:underline">
                    <span className="font-heading text-base">Informasi Akun</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href={user ? "/produk/pesanan" : "/login"} className="flex items-center justify-between text-black hover:underline">
                    <span>History Pesanan</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      )}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseSearchSidebar}
            aria-hidden="true"
          />
          <aside className="absolute right-0 top-0 h-full w-80 md:w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
            {/* Pull-tab close button on the left edge */}
            <button
              type="button"
              aria-label="Tutup pencarian"
              className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center"
              onClick={handleCloseSearchSidebar}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center justify-between">
              <span className="font-heading text-xl md:text-2xl text-black">Cari Produk</span>
            </div>
            <div className="mt-6">
              <input
                type="text"
                placeholder="Cari produk"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-none border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40"
              />
              <div className="mt-3">
                <button
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="w-full rounded-none bg-black text-white px-4 py-2 font-body text-sm hover:opacity-90 transition disabled:opacity-50"
                >
                  {searchLoading ? 'Mencari...' : 'Cari'}
                </button>
              </div>
            </div>
            <div className="mt-6">
              <p className="font-heading text-black">Hasil pencarian</p>
            </div>
              <div className="mt-4 flex-1 overflow-y-auto space-y-5">
                {searchLoading ? (
                  <p className="text-sm text-gray-600">Mencari produk...</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product: any) => (
                    <Link key={product.id} href={`/produk/${product.id}/detail`} className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded cursor-pointer">
                      <div className="relative w-16 h-16 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                        {product.photo1 ? (
                          <Image src={product.photo1} alt={product.nama_produk} fill sizes="64px" className="object-cover" />
                        ) : (
                          <Image src="/images/test1p.png" alt="Produk" fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-gray-900 truncate">{product.nama_produk}</p>
                        <p className="font-body text-sm text-gray-700 mt-1">
                          Rp {Number(product.harga || 0).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : searchQuery ? (
                  <p className="text-sm text-gray-600">Tidak ada hasil untuk "{searchQuery}"</p>
                ) : (
                  <p className="text-sm text-gray-600">Masukkan kata kunci untuk mencari produk</p>
                )}
              </div>
          </aside>
        </div>
      )}
      {isCartOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsCartOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute right-0 top-0 h-full w-80 md:w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
            {/* Pull-tab close button on the left edge */}
            <button
              type="button"
              aria-label="Tutup keranjang"
              className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center"
              onClick={() => setIsCartOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center justify-between">
              <span className="font-heading text-xl md:text-2xl text-black">Item Keranjang</span>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">
              <div className="space-y-5">
                {homeCartLoading && (!homeCartItems || homeCartItems.length === 0) ? (
                  <p className="text-sm text-gray-600">Memuat keranjang...</p>
                ) : (!homeCartItems || homeCartItems.length === 0) ? (
                  <p className="text-sm text-gray-600">Keranjang kosong</p>
                ) : (
                  homeCartItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                        {item.produk?.photo1 ? (
                          <Image src={item.produk.photo1} alt={item.produk?.nama_produk || "Produk"} fill sizes="64px" className="object-cover" />
                        ) : (
                          <Image src="/images/test1p.png" alt="Produk" fill sizes="64px" className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-gray-900 truncate">{item.produk?.nama_produk || "Produk"}</p>
                        <p className="font-body text-sm text-gray-700 mt-1"><span className="text-black">{item.quantity} x</span> Rp {Number(item.produk?.harga || 0).toLocaleString("id-ID")} {item.size ? <span className="ml-2 text-gray-500">Uk: {item.size}</span> : null}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Subtotal + actions */}
              <div className="mt-2">
                <p className="font-heading text-center text-lg text-black"><span className="font-bold">Subtotal</span> : Rp {homeCartItems?.reduce((sum:any, it:any) => sum + (Number(it.produk?.harga || 0) * Number(it.quantity || 1)), 0).toLocaleString("id-ID")}</p>
                <div className="mt-4">
                  <Link href="/produk/detail-checkout" className="inline-flex items-center justify-center rounded-none border border-black bg-black text-white px-4 py-2 font-body text-sm hover:opacity-90 transition w-full">
                    Checkout
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
      {isFavOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseFavSidebar}
            aria-hidden="true"
          />
          <aside className="absolute right-0 top-0 h-full w-80 md:w-96 max-w-[92%] bg-white shadow-2xl p-6">
            {/* Pull-tab close button on the left edge */}
            <button
              type="button"
              aria-label="Tutup favorit"
              className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center"
              onClick={() => setIsFavOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center justify-between">
              <span className="font-heading text-xl md:text-2xl text-black">Favorit</span>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto space-y-5">
              {favoritesLoading && (!favorites || favorites.length === 0) ? (
                <p className="text-sm text-gray-600">Memuat favorit...</p>
              ) : (!favorites || favorites.length === 0) ? (
                <p className="text-sm text-gray-600">Belum ada favorit</p>
              ) : (
                favorites.map((favorite) => (
                  <Link key={favorite.id} href={`/produk/${favorite.produk_id}/detail`} className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded cursor-pointer">
                    <div className="relative w-16 h-16 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                      {favorite.produk?.photo1 ? (
                        <Image src={favorite.produk.photo1} alt={favorite.produk?.nama_produk || "Produk"} fill sizes="64px" className="object-cover" />
                      ) : (
                        <Image src="/images/test1p.png" alt="Produk favorit" fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-gray-900 truncate">{favorite.produk?.nama_produk || "Produk"}</p>
                      <p className="font-body text-sm text-gray-700 mt-1">Rp {Number(favorite.produk?.harga || 0).toLocaleString("id-ID")}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Hapus item"
                      className="p-2 rounded hover:bg-gray-100 text-black"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await toggleFavorite(favorite.produk_id);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </Link>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
      {/* Sticky header (desktop) */}
      {showSticky && (
        <div className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="w-full flex items-center justify-between px-6 md:px-8 lg:px-10 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Buka menu"
                className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Image src="/images/sidebar.png" alt="Menu" width={28} height={28} />
              </button>
              <a href="/" aria-label="Meoris beranda" className="select-none">
                <span className="font-heading font-bold text-2xl tracking-wide text-black">MEORIS</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Cari" onClick={(e) => { e.preventDefault(); setIsSearchOpen(true); }}>
                <Image src="/images/search.png" alt="Search" width={28} height={28} />
              </a>
              <a href="#" aria-label="Favorit" className="relative" onClick={(e) => { e.preventDefault(); setIsFavOpen(true); }}>
                <Image src="/images/favorit.png" alt="Favorit" width={28} height={28} />
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{favoritesCount}</span>
              </a>
              <a href="#" aria-label="Keranjang" className="relative" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}>
                <Image src="/images/cart.png" alt="Cart" width={28} height={28} />
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{cartCount}</span>
              </a>
              <a href={user ? "/my-account" : "/login"} aria-label="Akun">
                <Image src="/images/user.png" alt="User" width={28} height={28} />
              </a>
            </div>
          </div>
        </div>
      )}
      {/* Section Pertama: mengikuti split background dari body */}
      <section className="relative grid h-[55vh] md:h-[60vh] lg:h-[80vh] grid-cols-2 split-bg pt-[64px] md:pt-0" data-route="/home">
        {/* Desktop header row: brand left, icons right (aligned) */}
        <div className="hidden md:flex absolute top-12 left-6 right-10 z-40 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Buka menu"
              className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="inline-flex items-center justify-center bg-white rounded-lg shadow-md border border-gray-200 p-1.5">
                <Image src="/images/sidebar.png" alt="Menu" width={34} height={34} />
              </span>
            </button>
            <a href="/" aria-label="Meoris beranda" className="select-none">
              <span className="font-heading font-bold text-xl md:text-2xl lg:text-3xl tracking-wide text-black">MEORIS</span>
            </a>
          </div>
          <div className="flex items-center gap-4 lg:gap-5">
            <a href="#" aria-label="Cari" onClick={(e) => { e.preventDefault(); setIsSearchOpen(true); }}>
              <Image src="/images/search.png" alt="Search" width={34} height={34} />
            </a>
            <a href="#" aria-label="Favorit" className="relative" onClick={(e) => { e.preventDefault(); setIsFavOpen(true); }}>
              <Image src="/images/favorit.png" alt="Favorit" width={34} height={34} />
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{favoritesCount}</span>
            </a>
            <a href="#" aria-label="Keranjang" className="relative" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}>
              <Image src="/images/cart.png" alt="Cart" width={34} height={34} />
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{cartCount}</span>
            </a>
            <a href={user ? "/my-account" : "/login"} aria-label="Akun" className="cursor-pointer">
              <Image src="/images/user.png" alt="User" width={34} height={34} />
            </a>
          </div>
        </div>
        {/* Mobile header: MEORIS left, icons right */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white md:bg-white/95 md:backdrop-blur-sm border-b border-gray-200 transform-gpu">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Buka menu"
                className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Image src="/images/sidebar.png" alt="Menu" width={28} height={28} />
              </button>
              <span className="font-heading font-bold text-xl tracking-wide text-black select-none">MEORIS</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Cari" onClick={(e) => { e.preventDefault(); setIsSearchOpen(true); }}>
                <Image src="/images/search.png" alt="Search" width={26} height={26} />
              </a>
              <a href="#" aria-label="Favorit" className="relative" onClick={(e) => { e.preventDefault(); setIsFavOpen(true); }}>
                <Image src="/images/favorit.png" alt="Favorit" width={26} height={26} />
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{favoritesCount}</span>
              </a>
              <a href="#" aria-label="Keranjang" className="relative" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}>
                <Image src="/images/cart.png" alt="Cart" width={26} height={26} />
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{cartCount}</span>
              </a>
              <a href={user ? "/my-account" : "/login"} aria-label="Akun" className="cursor-pointer">
                <Image src="/images/user.png" alt="User" width={26} height={26} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Kiri (50%) - abu cerah: gambar test1.png di tengah */}
        <div className="relative z-0 flex items-center justify-center p-0 sm:p-0 md:p-10 bg-[#f3f4f6] md:bg-transparent">
          {/* Vertical deal labels (desktop/tablet only) */}
          <div className="hidden md:flex flex-col gap-2 absolute left-6 top-1/2 -translate-y-1/2 z-10">
            <span className={`font-heading ${phase === 0 ? 'text-black text-xl lg:text-2xl xl:text-3xl' : 'text-gray-500 text-base lg:text-xl xl:text-2xl'}`}>01._</span>
            <span className={`font-heading ${phase === 1 ? 'text-black text-xl lg:text-2xl xl:text-3xl' : 'text-gray-500 text-base lg:text-xl xl:text-2xl'}`}>02._</span>
            <span className={`font-heading ${phase === 2 ? 'text-black text-xl lg:text-2xl xl:text-3xl' : 'text-gray-500 text-base lg:text-xl xl:text-2xl'}`}>03._</span>
            <span className={`font-heading ${phase === 3 ? 'text-black text-xl lg:text-2xl xl:text-3xl' : 'text-gray-500 text-base lg:text-xl xl:text-2xl'}`}>04._</span>
          </div>
          <div className="relative w-full h-[55vh] md:h-[60vh] lg:h-[75vh] max-w-none md:max-w-[500px] lg:max-w-none mx-auto overflow-hidden">
            <Image
              src={mainImg}
              alt={`Model memakai ${phaseTitle}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 40vw, 45vw"
              className={`object-cover scale-[0.85] sm:scale-[0.70] md:scale-[0.70] lg:scale-100 will-change-transform ${phase === 1 ? 'fade-switch' : ''}`}
              priority
            />
          </div>
        </div>

        {/* Kanan (50%) - ganti background image bgsec1.png */}
        <div
          className="relative flex items-stretch bg-transparent bg-center bg-cover h-[55vh] md:h-[60vh] lg:h-[80vh]"
          style={{
            backgroundImage: 'url(/images/bgsec1.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="grid w-full grid-cols-1 items-stretch lg:grid-cols-[0.8fr_1.2fr] xl:grid-cols-[0.75fr_1.25fr] relative z-20 h-full">
            {/* Kolom teks */}
            <div className="flex h-full flex-col justify-center gap-6 lg:gap-0 p-6 md:py-10 md:pl-0 md:pr-12 md:-ml-8 lg:pl-0 lg:pr-8 xl:pr-10 lg:-ml-16 xl:-ml-20 2xl:-ml-24">
              {/* Garis animasi di atas heading (desktop) */}
              <div className="block mb-0">
                <span
                  ref={lineRef}
                  key={phase}
                  className="block h-[2px] bg-black line-reveal w-56 xl:w-64 relative top-[14px] -ml-8 md:ml-0"
                  ></span>
              </div>

              {/* Viewport + Track: geser vertikal dari konten produk 1 ke produk 2 */}
              <div className="slide-viewport h-[280px] md:h-[240px] lg:h-[320px] xl:h-[360px] lg:-mt-1">
                <div className="slide-track" style={{ transform: `translateY(-${(phase / 4) * 100}%)` }}>
                  {/* Pane Produk 1 */}
                  <div className="flex flex-col gap-6 justify-center h-[280px] md:h-[240px] lg:h-[320px] xl:h-[360px]">
                    <h1 className="font-heading text-xl leading-tight tracking-tight text-black md:text-4xl lg:text-[38px] xl:text-[44px]">
                      <span className="block">Sock Sneakers</span>
                      <span className="block">Cloud</span>
                    </h1>

                    <p className="font-body text-xs leading-relaxed text-gray-700 md:text-base lg:text-lg xl:text-lg">
                      Cocok dipakai harian maupun saat santai dan mempunyai bahan lembut
                    </p>

                    <a
                      href="#"
                      className="inline-flex w-fit items-center gap-2 rounded border border-black px-5 py-3 font-body text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      aria-label="Lihat detail produk Sock Sneakers Cloud"
                    >
                      <span>Lihat detail</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* Pane Produk 2 */}
                  <div className="flex flex-col gap-6 justify-center h-[280px] md:h-[240px] lg:h-[320px] xl:h-[360px]">
                    <h1 className="font-heading text-xl leading-tight tracking-tight text-black md:text-4xl lg:text-[38px] xl:text-[44px]">
                      <span className="block">Sock Sneakers</span>
                      <span className="block">Leather</span>
                    </h1>

                    <p className="font-body text-xs leading-relaxed text-gray-700 md:text-base lg:text-lg xl:text-lg">
                      Desain minimalis dengan bahan kulit yang berkilau
                    </p>

                    <a
                      href="#"
                      className="inline-flex w-fit items-center gap-2 rounded border border-black px-5 py-3 font-body text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      aria-label="Lihat detail produk Sock Sneakers Leather"
                    >
                      <span>Lihat detail</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* Pane Produk 3 */}
                  <div className="flex flex-col gap-6 justify-center h-[280px] md:h-[240px] lg:h-[320px] xl:h-[360px]">
                    <h1 className="font-heading text-xl leading-tight tracking-tight text-black md:text-4xl lg:text-[38px] xl:text-[44px]">
                      <span className="block">Gladiator Sandals</span>
                      <span className="block">Shoes</span>
                    </h1>

                    <p className="font-body text-xs leading-relaxed text-gray-700 md:text-base lg:text-lg xl:text-lg">
                      Nyaman dipakai dengan bahan lembut terasa di kaki
                    </p>

                    <a
                      href="#"
                      className="inline-flex w-fit items-center gap-2 rounded border border-black px-5 py-3 font-body text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      aria-label="Lihat detail produk Gladiator Sandals Shoes"
                    >
                      <span>Lihat detail</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* Pane Produk 4 */}
                  <div className="flex flex-col gap-6 justify-center h-[280px] md:h-[240px] lg:h-[320px] xl:h-[360px]">
                    <h1 className="font-heading text-xl leading-tight tracking-tight text-black md:text-4xl lg:text-[38px] xl:text-[44px]">
                      <span className="block">Gladiator Canvas</span>
                      <span className="block">Loafers</span>
                    </h1>

                    <p className="font-body text-xs leading-relaxed text-gray-700 md:text-base lg:text-lg xl:text-lg">
                      Tampil keren dengan sepatu nyaman di kaki
                    </p>

                    <a
                      href="#"
                      className="inline-flex w-fit items-center gap-2 rounded border border-black px-5 py-3 font-body text-sm font-medium text-black transition-colors hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      aria-label="Lihat detail produk Gladiator Canvas Loafers"
                    >
                      <span>Lihat detail</span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                
                </div>
                
                
                
                
                
                
              </div>
            </div>

            {/* Kolom gambar produk (sejajar dengan heading) */}
            <div className="hidden lg:flex h-full items-start lg:items-center justify-center lg:justify-start p-6 lg:p-10">
              <div className="relative w-full lg:h-[56vh] xl:h-[52vh] 2xl:h-[48vh] max-w-none">
                <Image
                  src={productImg}
                  alt={`${phaseTitle} - tampak produk`}
                  fill
                  sizes="(min-width: 1536px) 31vw, (min-width: 1280px) 31vw, (min-width: 1024px) 30vw, 0px"
                  className={`object-contain ${phase === 1 ? 'fade-switch' : ''}`}
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Section Desktop: putih penuh, kiri 1 besar (center), kanan 4 kotak (2x2, center) */}
        <section
          className="hidden lg:block mt-1"
          style={{
            backgroundImage: 'url(/images/bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          data-route="/home"
        >
          <div className="grid grid-cols-2 gap-0">
            {/* Kiri (50%) abu cerah) */}
            <div className="flex items-center justify-end py-16 pr-6 xl:pr-8">
              <div className="relative overflow-hidden border border-gray-200 bg-gray-100 aspect-square w-[80%] max-w-[680px] reveal-on-scroll" data-reveal style={{ transitionDelay: '60ms' }}>
                <Image
                  src="/images/poster.png"
                  alt="Poster koleksi"
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 35vw, 90vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>
            {/* Kanan (50%) putih) */}
            <div className="flex items-center justify-start py-16 pl-6 xl:pl-8">
              <div className="grid grid-cols-2 gap-6 w-[75%] max-w-[720px]">
                <div className="border border-gray-200 bg-gray-100 aspect-square reveal-on-scroll" data-reveal style={{ transitionDelay: '100ms' }}></div>
                <div className="border border-gray-200 bg-gray-100 aspect-square reveal-on-scroll" data-reveal style={{ transitionDelay: '180ms' }}></div>
                <div className="border border-gray-200 bg-gray-100 aspect-square reveal-on-scroll" data-reveal style={{ transitionDelay: '260ms' }}></div>
                <div className="border border-gray-200 bg-gray-100 aspect-square reveal-on-scroll" data-reveal style={{ transitionDelay: '340ms' }}></div>
              </div>
            </div>
          </div>
          
        </section>

        {/* Section 2 - Mobile: vertical layout */}
        <section
          className="lg:hidden mt-1 px-4 py-12"
          style={{
            backgroundImage: 'url(/images/bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          data-route="/home"
        >
          <div className="mt-8 flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
            {/* Kiri (md): poster besar, Mobile: tetap atas */}
            <div className="flex items-center justify-center md:justify-end">
              <div className="relative overflow-hidden border border-gray-200 bg-gray-100 aspect-square w-full max-w-[340px] md:w-[80%] md:max-w-[680px] reveal-on-scroll" data-reveal style={{ transitionDelay: '60ms' }}>
                <Image
                  src="/images/poster.png"
                  alt="Poster koleksi"
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 35vw, (min-width: 640px) 420px, 90vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Kanan (md): 4 kotak; Mobile: tetap di bawah poster */}
            <div className="flex items-center justify-center md:justify-start">
              <div className="w-full max-w-[340px] md:w-[75%] md:max-w-[720px] grid grid-cols-2 gap-4 md:gap-6">
                <div className="border border-gray-200 bg-gray-100 aspect-square w-full reveal-on-scroll" data-reveal style={{ transitionDelay: '120ms' }}></div>
                <div className="border border-gray-200 bg-gray-100 aspect-square w-full reveal-on-scroll" data-reveal style={{ transitionDelay: '180ms' }}></div>
                <div className="border border-gray-200 bg-gray-100 aspect-square w-full reveal-on-scroll" data-reveal style={{ transitionDelay: '240ms' }}></div>
                <div className="border border-gray-200 bg-gray-100 aspect-square w-full reveal-on-scroll" data-reveal style={{ transitionDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Diskon */}
        <section className="bg-white py-12 md:py-16" data-route="/home">
          <div className="max-w-[120rem] mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-[0.2fr_1.1fr] xl:grid-cols-[0.2fr_1.4fr] 2xl:grid-cols-[0.2fr_1.7fr] items-stretch gap-8 md:gap-10">
              {/* Left 20%: centered labels */}
              <div className="hidden md:flex items-center justify-start text-left -ml-2 md:-ml-3">
                <div>
                  <h2 className="font-heading text-sm md:text-base lg:text-lg text-gray-500 tracking-wide">DISKON PRODUK</h2>
                  <div className="mt-1.5 flex items-baseline justify-start gap-1.5 font-body text-xl md:text-2xl lg:text-3xl text-black">
                    <span className="whitespace-nowrap">Sampai dengan</span>
                    <span className="whitespace-nowrap underline decoration-2 underline-offset-4">70%Off</span>
                  </div>
                </div>
                
              </div>
              {/* Right 80%: banner only on mobile, banner + labels on desktop */}
              <div className="flex items-center justify-center md:justify-end pr-0 md:pr-6 xl:pr-8">
                <div className="relative w-full md:w-[98%] aspect-[24/4] md:aspect-[32/4] overflow-hidden bg-gray-200 translate-x-0 md:translate-x-4 xl:translate-x-6">
                  <Image
                    src="/images/diskon_banner.png"
                    alt="Diskon sampai dengan 70%"
                    fill
                    sizes="(min-width: 1536px) 75vw, (min-width: 1280px) 70vw, (min-width: 768px) 80vw, 100vw"
                    className="object-cover"
                  />
                </div>
                
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Koleksi Utama Kami */}
        <section id="produk" className="bg-white py-12 md:py-14" data-route="/home">
          <div className="px-6 md:px-8">
            <div className="section3-layout items-start">
              {/* Left sidebar (very wide screens only) */}
              <aside className="section3-sidebar">
                <div className="mt-5 md:mt-7 border border-gray-300 rounded-lg p-4 md:p-5 bg-white">
                  <h3 className="font-heading text-xl lg:text-2xl text-black mb-4">Produk terbaru</h3>
                  <ul className="font-body text-base text-gray-700 space-y-3 md:space-y-4">
                    <li className="flex items-center justify-between">
                      <span>Aero Knit Sneakers</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Urban Canvas Loafers</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Vintage Leather Oxfords</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Trail Runner Pro</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Minimalist Slip-Ons</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Classic Court Trainers</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Everyday Mesh Walkers</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Heritage Suede Boots</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Active Flex Runners</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Premium City Derbies</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0 text-gray-500">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                  </ul>
                </div>

                {/* Terlaris list (horizontal, no rounded) */}
                <div className="mt-8 pl-4 md:pl-5">
                  <h4 className="font-heading text-xl lg:text-2xl text-black mb-4">Terlaris</h4>
                  <ul className="space-y-4">
                    <li>
                      <a href="#" className="flex items-center gap-5 group">
                        <div className="relative w-20 h-20 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          <Image src="/images/test1p.png" alt="Sock Sneakers Cloud" fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-lg md:text-xl text-gray-800 truncate group-hover:underline">Sock Sneakers Cloud</p>
                          <p className="font-body text-base md:text-lg text-black font-semibold mt-0.5">Rp 250.000</p>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-5 group">
                        <div className="relative w-20 h-20 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          <Image src="/images/test1p.png" alt="Sock Sneakers Cloud" fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-lg md:text-xl text-gray-800 truncate group-hover:underline">Sock Sneakers Cloud</p>
                          <p className="font-body text-base md:text-lg text-black font-semibold mt-0.5">Rp 250.000</p>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-5 group">
                        <div className="relative w-20 h-20 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          <Image src="/images/test1p.png" alt="Sock Sneakers Cloud" fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-lg md:text-xl text-gray-800 truncate group-hover:underline">Sock Sneakers Cloud</p>
                          <p className="font-body text-base md:text-lg text-black font-semibold mt-0.5">Rp 250.000</p>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-5 group">
                        <div className="relative w-20 h-20 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          <Image src="/images/test1p.png" alt="Sock Sneakers Cloud" fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-lg md:text-xl text-gray-800 truncate group-hover:underline">Sock Sneakers Cloud</p>
                          <p className="font-body text-base md:text-lg text-black font-semibold mt-0.5">Rp 250.000</p>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              </aside>
              {/* Main content */}
              <div className="w-full">
                <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl text-center text-black">
                  Koleksi Utama
                </h2>
                <div className="mt-6 flex items-center justify-center gap-4 md:gap-6">
                  <span className="font-body text-sm md:text-base text-black">Semua</span>
                  <span className="font-body text-sm md:text-base text-black">Populer</span>
                  <span className="font-body text-sm md:text-base text-black">Diskon</span>
                  <span className="font-body text-sm md:text-base text-black">Terbaik</span>
                </div>

                                {/* Grid koleksi: 4 kolom (desktop), 8 item total */}
                <div className="mt-10 max-w-[90rem] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 lg:gap-x-6 lg:gap-y-10 xl:gap-x-8 xl:gap-y-12">
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <div key={product.id} className="flex flex-col gap-3 w-full">
                        <div className="group relative overflow-hidden border border-gray-200 bg-gray-100 aspect-square w-full cursor-pointer">
                          <button
                            type="button"
                            aria-label={isFavorite(product.id) ? "Hapus dari favorit" : "Tambah ke favorit"}
                            className={`absolute top-2 right-2 z-10 p-1 rounded-full shadow-md hover:scale-105 transition ${
                              isFavorite(product.id)
                                ? 'bg-red-500/90 text-white'
                                : 'bg-white/90 text-gray-700'
                            }`}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await toggleFavorite(product.id);
                            }}
                          >
                            <Image
                              src="/images/star.png"
                              alt="Favorit"
                              width={28}
                              height={28}
                              className={`transition-all ${isFavorite(product.id) ? 'brightness-0 invert' : ''}`}
                            />
                          </button>
                          <Link href={`/produk/${product.id}/detail`} className="absolute inset-0 block" aria-label={`Lihat detail ${product.nama_produk}`}>
                            {product.photo1 ? (
                              <Image src={product.photo1} alt={product.nama_produk} fill sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 24vw, (min-width: 768px) 28vw, 80vw" className="object-cover" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-gray-400">No image</span>
                            )}
                          </Link>
                          <div className="absolute inset-x-0 bottom-3 transition-all duration-300 ease-out opacity-100 translate-y-0 pointer-events-auto md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:pointer-events-none">
                            <div className="mx-auto w-[88%] md:w-[80%] bg-black/90 text-white text-center py-2 rounded-md shadow-lg">
                              <span className="font-body text-xs md:text-sm">Tambah ke keranjang</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-body text-lg md:text-xl text-gray-500">{product.nama_produk}</p>
                          <p className="font-body text-xl md:text-2xl text-black font-semibold">Rp {Number(product.harga || 0).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500">Tidak ada produk</div>
                  )}
                </div>{/* Panah bawah grid (Koleksi Utama) */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    aria-label="Sebelumnya"
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-transparent text-black border border-black hover:bg-black hover:text-white transition"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Berikutnya"
                    className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-transparent text-black border border-black hover:bg-black hover:text-white transition"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 5: Kotak Landscape di Tengah */}
        <section className="relative overflow-hidden bg-gray-100 py-12 md:py-16" data-route="/home">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex items-center justify-center">
              <div className="relative w-[97%] max-w-[1100px] aspect-[16/5.2] md:aspect-[32/8] bg-white border border-black rounded-md flex items-center justify-center">
                <div className="w-full px-6 md:px-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 items-center justify-items-center">
                    <div className="flex flex-col items-center text-center gap-2">
                      <Image src="/images/shipped.png" alt="Diskon Pengiriman" width={56} height={56} />
                      <p className="font-heading text-base md:text-lg text-black">Diskon Pengiriman</p>
                      <p className="font-heading text-sm text-gray-600">pada semua pesanan</p>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                      <Image src="/images/support.png" alt="24/7 Dukungan Langsung" width={56} height={56} />
                      <p className="font-heading text-base md:text-lg text-black">24/7 Dukungan Langsung</p>
                      <p className="font-heading text-sm text-gray-600">pada semua pesanan</p>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                      <Image src="/images/payment.png" alt="Pembayaran Mudah" width={56} height={56} />
                      <p className="font-heading text-base md:text-lg text-black">Pembayaran Mudah</p>
                      <p className="font-heading text-sm text-gray-600">pada semua pesanan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Section 6: Scroll Test (Transparent with background image) */}
        <section className="relative overflow-hidden bg-transparent py-16 md:py-6 lg:py-16" data-route="/home">
          {/* Background image layer behind for cool scrolling effect */}
          <div
            className="absolute inset-0 -z-10 bg-center bg-cover bg-fixed"
            aria-hidden="true"
            style={{ backgroundImage: "url(/images/bgg.png)" }}
          />
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="h-[35vh] md:h-[18vh] lg:h-[35vh] flex items-center justify-start">
              <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[48%] max-w-xl">
                <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl text-black">Kabar Spesial!</h3>
                <p className="font-body text-sm md:text-base text-gray-800 mt-3">
                  Hanya perlu sedetik untuk jadi yang pertama mengetahui kabar terbaru dari kami.
                </p>
                <form className="mt-5 flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    required
                    placeholder="Masukkan email Anda"
                    className="font-body w-full sm:flex-1 rounded-md sm:rounded-l-md sm:rounded-r-none border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/50"
                  />
                  <button
                    type="submit"
                    className="font-body whitespace-nowrap rounded-md sm:rounded-r-md sm:rounded-l-none bg-black text-white px-5 py-3 hover:opacity-90 transition"
                    aria-label="Kirim email berlangganan"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
        {/* Section 7: Footer-style info blocks */}
        <section className="bg-white py-14 md:py-16" data-route="/home">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
              {/* Brand + contact */}
              <div className="space-y-5">
                <div className="-ml-1 md:-ml-2">
                  <span className="font-heading font-bold text-3xl tracking-wide text-black">MEORIS</span>
                  <div className="mt-1 text-[11px] tracking-[0.3em] uppercase text-gray-600">Footwear</div>
                </div>
                <ul className="space-y-3 font-body text-gray-700">
                  <li className="grid grid-cols-[20px_1fr] md:grid-cols-[28px_1fr] items-start gap-3">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black w-5 h-5 md:w-7 md:h-7"><path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 10.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill="currentColor"/></svg>
                    <span className="text-sm md:text-sm leading-snug">Sambong mangkubumi Rt 001/Rw 002, Kota Tasikmalaya, Jawa Barat</span>
                  </li>
                  <li className="grid grid-cols-[20px_1fr] md:grid-cols-[28px_1fr] items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black w-5 h-5 md:w-6 md:h-6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 11.19 19a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.59 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.16a2 2 0 0 1 2.11-.45c.85.27 1.73.47 2.63.59A2 2 0 0 1 22 16.92z" fill="currentColor"/></svg>
                    <span>+6289695971729</span>
                  </li>
                  <li className="grid grid-cols-[20px_1fr] md:grid-cols-[28px_1fr] items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black w-5 h-5 md:w-6 md:h-6"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm16 2l-8 5-8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>info@meoris.erdanpee.com</span>
                  </li>
                </ul>
              </div>

              {/* Information */}
              <div className="pb-3 md:pb-4">
                <h4 className="font-heading text-xl text-black">Informasi</h4>
                <div className="mt-2 w-10 h-[2px] bg-black"></div>
                <ul className="mt-4 space-y-3 font-body text-gray-700">
                  <li><a href="/docs/notifikasi" className="hover:underline">Notifikasi</a></li>
                </ul>
              </div>

              {/* My Account */}
              <div className="pb-3 md:pb-4">
                <h4 className="font-heading text-xl text-black">Bantuan &amp; Dukungan</h4>
                <div className="mt-2 w-10 h-[2px] bg-black"></div>
                <ul className="mt-4 space-y-3 font-body text-gray-700">
                  <li><a href="/docs/pengembalian" className="hover:underline">Pengembalian</a></li>
                  <li><a href="/docs/syarat&ketentuan" className="hover:underline">Syarat &amp; Ketentuan</a></li>
                  <li><a href="/docs/kebijakan-privacy" className="hover:underline">Kebijakan Privasi</a></li>
                </ul>
              </div>

              {/* Help & Support */}
              <div className="pb-3 md:pb-4">
                <h4 className="font-heading text-xl text-black">Akun Saya</h4>
                <div className="mt-2 w-10 h-[2px] bg-black"></div>
                <ul className="mt-4 space-y-3 font-body text-gray-700">
                  <li><a href="/my-account" className="hover:underline">Detail Akun</a></li>
                  <li><a href="#" aria-label="Buka keranjang" className="hover:underline" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}>Keranjang</a></li>
                  <li><a href="#" aria-label="Buka favorit" className="hover:underline" onClick={(e) => { e.preventDefault(); setIsFavOpen(true); }}>Favorit</a></li>
                  <li><a href="/produk/pesanan" className="hover:underline">Pesanan</a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}















