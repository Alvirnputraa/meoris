"use client";

import Image from 'next/image';
import { useCart } from '@/lib/useCart';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { produkDb } from '@/lib/database';
import type { Produk } from '@/lib/supabase';
import Link from 'next/link';

export default function ProdukPage() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { count: cartCount } = useCart();
  const [isFavOpen, setIsFavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await produkDb.getAll(50, 0); // Get up to 50 products
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <main className="min-h-screen bg-white">
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
                  <Link href="/produk" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between text-black hover:underline">
                    <span className="font-heading text-base">Produk</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link href="/my-account" className="flex items-center justify-between text-black hover:underline">
                    <span className="font-heading text-base">Informasi Akun</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link href="/produk/pesanan" className="flex items-center justify-between text-black hover:underline" onClick={() => setIsSidebarOpen(false)}>
                    <span>History Pesanan</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
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
            onClick={() => setIsSearchOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute right-0 top-0 h-full w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
            <button
              type="button"
              aria-label="Tutup pencarian"
              className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center"
              onClick={() => setIsSearchOpen(false)}
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
                className="w-full rounded-none border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40"
              />
              <div className="mt-3">
                <button className="w-full rounded-none bg-black text-white px-4 py-2 font-body text-sm hover:opacity-90 transition">Cari</button>
              </div>
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
          <aside className="absolute right-0 top-0 h-full w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
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
              <p className="text-gray-500 text-center">Keranjang kosong</p>
            </div>
          </aside>
        </div>
      )}

      {isFavOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFavOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute right-0 top-0 h-full w-96 max-w-[92%] bg-white shadow-2xl p-6">
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
            <div className="mt-6">
              <p className="text-gray-500 text-center">Belum ada favorit</p>
            </div>
          </aside>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Buka menu"
                className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Image src="/images/sidebar.png" alt="Menu" width={40} height={40} />
              </button>
              <Link href="/" aria-label="Meoris beranda" className="select-none">
                <span className="font-heading font-bold text-3xl tracking-wide text-black">MEORIS</span>
              </Link>
            </div>
            <div className="flex items-center gap-5">
              <button
                type="button"
                aria-label="Cari"
                onClick={() => setIsSearchOpen(true)}
              >
                <Image src="/images/search.png" alt="Search" width={36} height={36} />
              </button>
              <button
                type="button"
                aria-label="Favorit"
                className="relative"
                onClick={() => setIsFavOpen(true)}
              >
                <Image src="/images/favorit.png" alt="Favorit" width={36} height={36} />
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{cartCount}</span>
              </button>
              <button
                type="button"
                aria-label="Keranjang"
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <Image src="/images/cart.png" alt="Cart" width={36} height={36} />
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{cartCount}</span>
              </button>
              <Link href="/my-account" aria-label="Akun">
                <Image src="/images/user.png" alt="User" width={36} height={36} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl text-black mb-4">
            Koleksi Produk
          </h1>
          <p className="font-body text-lg text-gray-600 max-w-2xl mx-auto">
            Temukan koleksi sandal terbaik kami dengan berbagai pilihan ukuran dan model
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-10">
          <span className="font-body text-sm md:text-base text-black">Semua</span>
          <span className="font-body text-sm md:text-base text-gray-500">Populer</span>
          <span className="font-body text-sm md:text-base text-gray-500">Diskon</span>
          <span className="font-body text-sm md:text-base text-gray-500">Terbaik</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="font-body text-gray-600">Memuat produk...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="font-body text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md bg-black text-white px-5 py-3 hover:opacity-90 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-body text-gray-600 mb-4">Belum ada produk tersedia</p>
                <p className="font-body text-sm text-gray-500">
                  Silakan tambahkan produk terlebih dahulu ke database
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 lg:gap-x-6 lg:gap-y-10 xl:gap-x-8 xl:gap-y-12">
                  {products.map((product) => (
                    <div key={product.id} className="flex flex-col gap-3 w-full">
                      <div className="group relative overflow-hidden border border-gray-200 bg-gray-100 aspect-square w-full cursor-pointer">
                        <button
                          type="button"
                          aria-label="Favorit"
                          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/90 shadow-md hover:scale-105 transition"
                        >
                          <Image src="/images/star.png" alt="Favorit" width={28} height={28} />
                        </button>

                        {/* Product Image */}
                        {product.photo1 && (
                          <Image
                            src={product.photo1}
                            alt={product.nama_produk}
                            fill
                            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 24vw, (min-width: 768px) 28vw, 80vw"
                            className="object-cover"
                          />
                        )}

                        <div className="absolute inset-x-0 bottom-3 transition-all duration-300 ease-out opacity-100 translate-y-0 pointer-events-auto md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:pointer-events-none">
                          <div className="mx-auto w-[88%] md:w-[80%] bg-black/90 text-white text-center py-2 rounded-md shadow-lg">
                            <span className="font-body text-xs md:text-sm">Tambah ke keranjang</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left">
                        <p className="font-body text-lg md:text-xl text-gray-500">{product.nama_produk}</p>
                        <p className="font-body text-xl md:text-2xl text-black font-semibold">
                          {formatPrice(product.harga || 0)}
                        </p>
                        {product.stok !== undefined && product.stok > 0 ? (
                          <p className="font-body text-sm text-green-600">Stok: {product.stok}</p>
                        ) : (
                          <p className="font-body text-sm text-red-600">Stok habis</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12 flex items-center justify-center gap-4">
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
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

