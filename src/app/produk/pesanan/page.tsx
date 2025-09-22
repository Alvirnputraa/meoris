"use client";
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/useCart'
import { useFavorites } from '@/lib/useFavorites'
import { keranjangDb } from '@/lib/database'

export default function OrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isFavOpen, setIsFavOpen] = useState(false)
  const [selectedFavorites, setSelectedFavorites] = useState<Set<string>>(new Set())
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { items: cartItems, count: cartCount, loading: cartLoading, refresh } = useCart()
  const { favorites, loading: favoritesLoading, toggleFavorite, count: favoritesCount } = useFavorites()
  const [viewItems, setViewItems] = useState<any[]>([])

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

  // Sinkronkan tampilan lokal dengan data hook agar bisa optimistik tanpa flicker
  useEffect(() => {
    setViewItems(cartItems || [])
  }, [cartItems])

  useEffect(() => {
    if (isCartOpen) {
      refresh()
    }
  }, [isCartOpen, refresh])

  const handleRemoveCartItem = async (itemId: string) => {
    try {
      setRemovingId(itemId)
      // Optimistic: hilangkan dari tampilan dulu
      setViewItems((items) => items.filter((it: any) => it.id !== itemId))
      await keranjangDb.removeItem(itemId)
      // Jangan panggil refresh untuk menghindari flicker; realtime akan menyinkronkan
    } catch (e) {
      console.error('Gagal menghapus item keranjang', e)
    } finally {
      setRemovingId(null)
    }
  }

  const orders = [
    { id: '3609', date: 'September 19, 2025', status: 'Processing', total: '$40.00 for 1 item' },
    { id: '3610', date: 'September 18, 2025', status: 'Processing', total: '$40.00 for 1 item' },
    { id: '3611', date: 'September 17, 2025', status: 'Processing', total: '$40.00 for 1 item' },
    { id: '3612', date: 'September 16, 2025', status: 'Processing', total: '$40.00 for 1 item' },
  ]

  return (
    <main>
      {/* Left sidebar (menu) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-2xl p-6">
            <div className="mt-6 md:mt-8 flex items-center justify-between">
              <span className="font-heading text-3xl md:text-4xl font-bold text-black">MEORIS</span>
              <button type="button" aria-label="Tutup menu" className="p-2 rounded hover:opacity-80 text-black cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <nav className="mt-10 md:mt-12">
              <ul className="space-y-5 font-body text-gray-800">
                <li>
                  <Link href="/produk" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between text-black hover:underline">
                    <span className="font-heading text-base">Produk</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </Link>
                </li>
                <li>
                  <Link href="/my-account" className="flex items-center justify-between text-black hover:underline" onClick={() => setIsSidebarOpen(false)}>
                    <span className="font-heading text-base">Informasi Akun</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </Link>
                </li>
                <li>
                  <Link href="/produk/pesanan" className="flex items-center justify-between text-black hover:underline" onClick={() => setIsSidebarOpen(false)}>
                    <span>History Pesanan</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Right panels: Search, Cart, Fav (same as other pages) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSearchOpen(false)} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
            <button type="button" aria-label="Tutup pencarian" className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center" onClick={() => setIsSearchOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-center justify-between">
              <span className="font-heading text-xl md:text-2xl text-black">Cari Produk</span>
            </div>
            <div className="mt-6">
              <input type="text" placeholder="Cari produk" className="w-full rounded-none border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
              <div className="mt-3">
                <button className="w-full rounded-none bg-black text-white px-4 py-2 font-body text-sm hover:opacity-90 transition">Cari</button>
              </div>
            </div>
          </aside>
        </div>
      )}
      {isCartOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
            <button type="button" aria-label="Tutup keranjang" className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center" onClick={() => setIsCartOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="flex items-center justify-between">
              <span className="font-heading text-xl md:text-2xl text-black">Item Keranjang</span>
            </div>
            <div className="mt-6 space-y-5">
              {cartLoading && viewItems.length === 0 ? (
                <p className="text-sm text-gray-600">Memuat keranjang...</p>
              ) : viewItems.length === 0 ? (
                <p className="text-sm text-gray-600">Keranjang kosong</p>
              ) : (
                viewItems.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                      {item.produk?.photo1 ? (
                        <Image src={item.produk.photo1} alt={item.produk?.nama_produk || 'Produk'} fill sizes="64px" className="object-cover" />
                      ) : (
                        <Image src="/images/test1p.png" alt="Produk" fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-gray-900 truncate">{item.produk?.nama_produk || 'Produk'}</p>
                      <p className="font-body text-sm text-gray-700 mt-1"><span className="text-black">{item.quantity} x</span> Rp {Number(item.produk?.harga || 0).toLocaleString('id-ID')}{item.size ? <span className="ml-2 text-gray-500">Uk: {item.size}</span> : null}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Hapus item"
                      className="p-2 rounded hover:bg-gray-100 text-black disabled:opacity-50"
                      onClick={() => handleRemoveCartItem(item.id)}
                      disabled={removingId === item.id}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="pt-4">
              <p className="font-heading text-center text-lg text-black"><span className="font-bold">Subtotal</span> : Rp {viewItems.reduce((sum, it:any) => sum + (Number(it.produk?.harga || 0) * Number(it.quantity || 1)), 0).toLocaleString('id-ID')}</p>
              <div className="mt-4 flex flex-col items-stretch gap-3">
                <Link
                  href="/produk/detail-checkout"
                  className="inline-flex items-center justify-center rounded-none border border-black px-4 py-2 font-body text-sm text-black hover:bg-black hover:text-white transition w-full"
                  onClick={() => {
                    setIsCartOpen(false);
                  }}
                >
                  Lihat Detail
                </Link>
                <a href="#" className="inline-flex items-center justify-center rounded-none bg-black px-4 py-2 font-body text-sm text-white hover:opacity-90 transition w-full">
                  Checkout
                </a>
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
          <aside className="absolute right-0 top-0 h-full w-96 max-w-[92%] bg-white shadow-2xl p-6">
            <button
              type="button"
              aria-label="Tutup favorit"
              className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center"
              onClick={handleCloseFavSidebar}
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
                  <div key={favorite.id} className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      aria-label="Pilih item"
                      className="w-5 h-5 accent-black shrink-0"
                      checked={selectedFavorites.has(favorite.id)}
                      onChange={(e) => handleFavoriteCheckbox(favorite.id, e.target.checked)}
                    />
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
                      onClick={async () => {
                        await toggleFavorite(favorite.produk_id);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            {favorites && favorites.length > 0 && (
              <div className="pt-4">
                <button
                  className={`inline-flex items-center justify-center w-full rounded-none px-4 py-2 font-body text-sm transition ${
                    selectedFavorites.size > 0
                      ? 'bg-black text-white hover:opacity-90 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={selectedFavorites.size === 0}
                  onClick={() => {
                    if (selectedFavorites.size > 0) {
                      // Handle checkout logic here
                      console.log('Checkout with selected favorites:', Array.from(selectedFavorites));
                    }
                  }}
                >
                  Checkout ({selectedFavorites.size} item{selectedFavorites.size !== 1 ? 's' : ''})
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full flex items-center justify-between px-6 md:px-8 lg:px-10 py-5">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Buka menu" className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black" onClick={() => setIsSidebarOpen(true)}>
              <Image src="/images/sidebar.png" alt="Menu" width={34} height={34} />
            </button>
            <Link href="/" aria-label="Meoris beranda" className="select-none">
              <span className="font-heading font-bold text-xl md:text-2xl lg:text-3xl tracking-wide text-black">MEORIS</span>
            </Link>
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
            <Link href="/my-account" aria-label="Akun">
              <Image src="/images/user.png" alt="User" width={34} height={34} />
            </Link>
          </div>
        </div>
      </div>

      {/* Section 1: breadcrumb & title */}
      <section className="relative overflow-hidden bg-transparent">
        <div
          className="absolute inset-0 -z-10 bg-center bg-cover"
          aria-hidden="true"
          style={{ backgroundImage: 'url(/images/bg22.png)' }}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16 flex flex-col items-center justify-center text-gray-100">
          <h1 className="font-heading text-3xl md:text-4xl text-gray-100">Pesanan</h1>
          <div className="mt-3 font-body text-sm text-gray-100">
            <span>Produk</span>
            <span className="mx-1">&gt;</span>
            <span className="text-gray-100">Pesanan</span>
          </div>
        </div>
      </section>

      {/* Section 2: orders table */}
      <section className="bg-white py-8 md:py-14 min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="hidden md:grid grid-cols-12 bg-gray-100 px-4 py-3 font-heading text-gray-900 text-sm md:text-base">
            <div className="col-span-2">Order</div>
            <div className="col-span-4">Date</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>
          {/* Rows (desktop) */}
          {orders.map((o) => (
            <div key={o.id} className="hidden md:grid grid-cols-12 items-center px-4 py-4 border-b border-gray-200">
              <div className="col-span-2 font-heading text-gray-900">#{o.id}</div>
              <div className="col-span-4 font-body text-gray-900">{o.date}</div>
              <div className="col-span-3 font-body text-gray-900">{o.status}</div>
              <div className="col-span-2 font-body text-gray-900 text-right">{o.total}</div>
              <div className="col-span-1 text-right">
                <Link href={`/produk/pesanan/${o.id}`} className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-1.5 text-sm hover:opacity-90">Lihat</Link>
              </div>
            </div>
          ))}
          {/* Rows (mobile cards) */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="border border-gray-200 p-3 text-sm space-y-2 rounded-none">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-gray-900">Order</span>
                  <span className="font-body text-gray-800">#{o.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-gray-900">Date</span>
                  <span className="font-body text-gray-800">{o.date.replace('September', 'Sep')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-gray-900">Status</span>
                  <span className="font-body text-gray-800">{o.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-heading text-gray-900">Total</span>
                  <span className="font-body text-gray-800">{o.total.replace(' for ', ' (')})</span>
                </div>
                <div className="pt-1">
                  <Link href={`/produk/pesanan/${o.id}`} className="inline-flex w-full items-center justify-center rounded-none bg-black text-white px-3 py-2 text-sm hover:opacity-90">Lihat</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pager icons */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <button type="button" aria-label="Sebelumnya" className="w-9 h-9 grid place-items-center rounded-full border border-gray-300 text-black hover:bg-gray-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button type="button" aria-label="Berikutnya" className="w-9 h-9 grid place-items-center rounded-full border border-gray-300 text-black hover:bg-gray-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer (four-column) at bottom */}
      <footer className="bg-white py-14 md:py-16">
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
      </footer>
    </main>
  )
}


