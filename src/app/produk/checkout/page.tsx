"use client";
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/useCart'
import { useFavorites } from '@/lib/useFavorites'
import { keranjangDb, praCheckoutDb } from '@/lib/database'
import { useSearchParams, useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const praCheckoutId = searchParams?.get('pra_checkout_id')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isFavOpen, setIsFavOpen] = useState(false)
  const [selectedFavorites, setSelectedFavorites] = useState<Set<string>>(new Set())
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { items: cartItems, count: cartCount, loading: cartLoading } = useCart()
  const { favorites, loading: favoritesLoading, toggleFavorite, count: favoritesCount } = useFavorites()
  const [viewItems, setViewItems] = useState<any[]>([])
  const [praCheckoutData, setPraCheckoutData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])
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

  // Load pra-checkout data jika ada pra_checkout_id
  useEffect(() => {
    const loadPraCheckout = async () => {
      if (praCheckoutId && user) {
        setLoading(true)
        try {
          const data = await praCheckoutDb.getById(praCheckoutId)
          setPraCheckoutData(data)
          
          // Map pra_checkout_items ke format yang sama dengan cart items
          const mappedItems = data.pra_checkout_items.map((item: any) => ({
            id: item.id,
            produk_id: item.produk_id,
            quantity: item.quantity,
            size: item.size,
            produk: item.produk
          }))
          setViewItems(mappedItems)
        } catch (error) {
          console.error('Error loading pra-checkout data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadPraCheckout()
  }, [praCheckoutId, user])

  // Sinkronkan tampilan lokal dengan data hook agar bisa optimistik tanpa flicker (jika tidak ada pra_checkout_id)
  useEffect(() => {
    if (!praCheckoutId) {
      setViewItems(cartItems || [])
    }
  }, [cartItems, praCheckoutId])

  if (isLoading) {
    return null
  }

  if (!user) {
    return null // Show nothing while redirecting
  }
  const handleRemoveCartItem = async (itemId: string) => {
    try {
      setRemovingId(itemId)
      // Optimistic: hilangkan dari tampilan dulu
      setViewItems((items) => items.filter((it: any) => it.id !== itemId))
      await keranjangDb.removeItem(itemId)
      // Jangan panggil refresh untuk menghindari flicker; realtime akan menyinkronkan
    } catch (e) {
      console.error('Gagal menghapus item keranjang', e)
      // Revert optimistic update jika error
      setViewItems(cartItems || [])
    } finally {
      setRemovingId(null)
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user, router])

  if (!user) {
    return null // Show nothing while redirecting
  }

  // Gunakan data dari pra_checkout jika ada, atau hitung dari cart items
  const subtotal = praCheckoutData ? Number(praCheckoutData.subtotal) : viewItems.reduce((sum, it:any) => sum + (Number(it.produk?.harga || 0) * Number(it.quantity || 1)), 0)
  const discountAmount = praCheckoutData ? Number(praCheckoutData.discount_amount || 0) : 0
  const totalAmount = praCheckoutData ? Number(praCheckoutData.total_amount) : subtotal
  const voucherCode = praCheckoutData?.voucher_code

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

      {/* Search sidebar */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSearchOpen(false)} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-80 md:w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
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
            <div className="mt-6">
              <p className="font-heading text-black">Hasil pencarian</p>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                  <Image src="/images/test1p.png" alt="Hasil produk" fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-gray-900 truncate">Nama Produk Contoh</p>
                  <p className="font-body text-sm text-gray-700 mt-1">Rp 250.000</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Favorites sidebar */}
      {isFavOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseFavSidebar} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-80 md:w-96 max-w-[92%] bg-white shadow-2xl p-6">
            <button type="button" aria-label="Tutup favorit" className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center" onClick={handleCloseFavSidebar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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

      {/* Desktop header */}
      <div className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="w-full flex items-center justify-between px-6 md:px-8 lg:px-10 py-5">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Buka menu" className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black" onClick={() => setIsSidebarOpen(true)}>
              <Image src="/images/sidebar.png" alt="Menu" width={40} height={40} />
            </button>
            <Link href="/" aria-label="Meoris beranda" className="select-none">
              <span className="font-heading font-bold text-3xl tracking-wide text-black">MEORIS</span>
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Cari" onClick={(e) => { e.preventDefault(); setIsSearchOpen(true); }}>
              <Image src="/images/search.png" alt="Search" width={36} height={36} />
            </a>
            <a href="#" aria-label="Favorit" className="relative" onClick={(e) => { e.preventDefault(); setIsFavOpen(true); }}>
              <Image src="/images/favorit.png" alt="Favorit" width={36} height={36} />
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{favoritesCount}</span>
            </a>
            <a href="#" aria-label="Keranjang" className="relative" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}>
              <Image src="/images/cart.png" alt="Cart" width={36} height={36} />
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">{cartCount}</span>
            </a>
            <Link href="/my-account" aria-label="Akun">
              <Image src="/images/user.png" alt="User" width={36} height={36} />
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Buka menu" className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black" onClick={() => setIsSidebarOpen(true)}>
              <Image src="/images/sidebar.png" alt="Menu" width={28} height={28} />
            </button>
            <Link href="/" aria-label="Meoris beranda" className="select-none">
              <span className="font-heading font-bold text-xl tracking-wide text-black">MEORIS</span>
            </Link>
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
            <Link href="/my-account" aria-label="Akun">
              <Image src="/images/user.png" alt="User" width={26} height={26} />
            </Link>
          </div>
        </div>
      </div>

      {/* Cart sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCartOpen(false)} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-80 md:w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
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
              <p className="font-heading text-center text-lg text-black"><span className="font-bold">Subtotal</span> : Rp {subtotal.toLocaleString('id-ID')}</p>
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


      {/* Section 1: breadcrumb & title */}
      <section className="relative overflow-hidden bg-transparent pt-[76px]">
        <div
          className="absolute inset-0 -z-10 bg-center bg-cover"
          aria-hidden="true"
          style={{ backgroundImage: 'url(/images/bg22.png)' }}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16 flex flex-col items-center justify-center text-gray-100">
          <h1 className="font-heading text-3xl md:text-4xl text-gray-100">Checkout</h1>
          <div className="mt-3 font-body text-sm text-gray-100">
            <span>Produk</span>
            <span className="mx-1">&gt;</span>
            <span>Keranjang</span>
            <span className="mx-1">&gt;</span>
            <span className="text-gray-100">Checkout</span>
          </div>
        </div>
      </section>

      {/* Section 2: Checkout form */}
      <section className="bg-white py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Left side: Billing Details */}
            <div>
              <h2 className="font-heading text-xl md:text-2xl text-black mb-4">Alamat Pengiriman</h2>
              <div className="border border-gray-300 rounded-lg p-5 bg-gray-50/50">

                {/* Personal Information */}
                <div className="mb-6">
                  <h3 className="font-body text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informasi Penerima
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-body text-sm text-gray-700 mb-1">Nama Depan *</label>
                        <input type="text" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40 bg-white" />
                      </div>
                      <div>
                        <label className="block font-body text-sm text-gray-700 mb-1">Nama Belakang *</label>
                        <input type="text" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-body text-sm text-gray-700 mb-1">Email *</label>
                      <input type="email" required defaultValue={user?.email} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40 bg-white" />
                    </div>
                    <div>
                      <label className="block font-body text-sm text-gray-700 mb-1">Nomor Telepon *</label>
                      <input type="tel" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40 bg-white" />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-6">
                  <h3 className="font-body text-sm font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Alamat Lengkap
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-body text-sm text-gray-700 mb-1">Alamat Lengkap *</label>
                      <textarea required rows={3} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40 bg-white resize-none" placeholder="Jl. Contoh No. 123, RT/RW 001/002"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-body text-sm text-gray-700 mb-1">Kota *</label>
                        <input type="text" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40 bg-white" />
                      </div>
                      <div>
                        <label className="block font-body text-sm text-gray-700 mb-1">Provinsi *</label>
                        <input type="text" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40 bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-body text-sm text-gray-700 mb-1">Kode Pos *</label>
                        <input type="text" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40 bg-white" />
                      </div>
                      <div>
                        <label className="block font-body text-sm text-gray-700 mb-1">Negara</label>
                        <input type="text" value="Indonesia" readOnly className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-black bg-gray-100 cursor-not-allowed" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right side: Order Summary */}
            <div>
              <h2 className="font-heading text-xl md:text-2xl text-black mb-4">Ringkasan Pesanan</h2>
              
              {/* Order items */}
              <div className="border border-gray-300 rounded-lg p-5 mb-4 bg-gray-50/50">
                <h3 className="font-heading text-base text-black mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Produk yang Dipesan
                </h3>
                <div className="space-y-3">
                  {viewItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="relative w-16 h-16 overflow-hidden border border-gray-200 bg-gray-100 shrink-0 rounded-md">
                        {item.produk?.photo1 ? (
                          <Image src={item.produk.photo1} alt={item.produk?.nama_produk || 'Produk'} fill sizes="64px" className="object-cover rounded-md" />
                        ) : (
                          <Image src="/images/test1p.png" alt="Produk" fill sizes="64px" className="object-cover rounded-md" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-gray-900 font-medium truncate">{item.produk?.nama_produk || 'Produk'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-body text-sm text-gray-600">
                            {item.quantity} x Rp {Number(item.produk?.harga || 0).toLocaleString('id-ID')}
                          </span>
                          {item.size && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Ukuran: {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-body text-gray-900 font-semibold">Rp {(Number(item.produk?.harga || 0) * Number(item.quantity || 1)).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Shipping section */}
              <div className="border border-gray-300 rounded-lg p-5 mb-4 bg-gray-50/50">
                <h3 className="font-heading text-base text-black mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Pengiriman
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors">
                    <input type="radio" name="shipping" className="w-4 h-4 accent-black" defaultChecked />
                    <div className="flex items-center justify-between flex-1">
                      <div className="flex items-center gap-3">
                        <Image src="/images/j&t.png" alt="J&T Express" width={70} height={35} className="object-contain" />
                        <div>
                          <span className="font-body text-gray-900 font-medium">J&T Express</span>
                          <p className="text-xs text-gray-600 mt-1">Estimasi 2-3 hari kerja</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-body text-sm font-medium text-black">Gratis</span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors">
                    <input type="radio" name="shipping" className="w-4 h-4 accent-black" />
                    <div className="flex items-center justify-between flex-1">
                      <div className="flex items-center gap-3">
                        <Image src="/images/jne.png" alt="JNE" width={70} height={35} className="object-contain" />
                        <div>
                          <span className="font-body text-gray-900 font-medium">JNE</span>
                          <p className="text-xs text-gray-600 mt-1">Estimasi 3-5 hari kerja</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-body text-sm font-medium text-black">Gratis</span>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-xs text-blue-800 font-medium">Info Pengiriman</p>
                      <p className="text-xs text-blue-700 mt-1">Pengiriman gratis untuk semua pesanan di atas Rp 50.000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Order - Full width below the grid */}
          <div className="mt-8">
            <div className="border border-gray-300">
              <div className="bg-gray-50 px-4 py-3">
                <h3 className="font-heading text-lg text-black">Detail Order</h3>
              </div>
              
              {/* Header */}
              <div className="bg-gray-100 px-4 py-2">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm font-medium text-black">Product</span>
                  <span className="font-body text-sm font-medium text-black">Subtotal</span>
                </div>
              </div>

              {/* Products */}
              <div className="px-4 py-3 space-y-2">
                {loading ? (
                  <div className="text-center py-4">
                    <span className="font-body text-sm text-gray-500">Memuat data pesanan...</span>
                  </div>
                ) : viewItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-1">
                    <span className="font-body text-sm text-black">
                      {item.produk?.nama_produk || 'Produk'} × {item.quantity}
                    </span>
                    <span className="font-body text-sm text-black">
                      Rp {(Number(item.produk?.harga || 0) * Number(item.quantity || 1)).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                <div className="border-b border-gray-300 mt-2"></div>
              </div>

              {/* Biaya Jasa Kirim */}
              <div className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-black">Biaya Jasa Kirim</span>
                  <span className="font-body text-sm text-black">Rp 0</span>
                </div>
                <div className="border-b border-gray-300 mt-2"></div>
              </div>

              {/* Subtotal */}
              <div className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm font-medium text-black">Subtotal</span>
                  <span className="font-body text-sm font-medium text-black">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-b border-gray-300 mt-2"></div>
              </div>

              {/* Potongan Voucher (jika ada) */}
              {discountAmount > 0 && (
                <div className="px-4 py-3">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-black">Potongan Voucher ({voucherCode})</span>
                    <span className="font-body text-sm text-green-600">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="border-b border-gray-300 mt-2"></div>
                </div>
              )}

              {/* Total */}
              <div className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm font-bold text-black">Total</span>
                  <span className="font-body text-sm font-bold text-black">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Place order button */}
            <div className="mt-4">
              <button type="button" className="w-full bg-black text-white py-4 px-6 font-body text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors">
                Lanjutkan Pembayaran
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-center">
            
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

            {/* Help & Support */}
            <div className="pb-3 md:pb-4">
              <h4 className="font-heading text-xl text-black">Bantuan &amp; Dukungan</h4>
              <div className="mt-2 w-10 h-[2px] bg-black"></div>
              <ul className="mt-4 space-y-3 font-body text-gray-700">
                <li><a href="/docs/pengembalian" className="hover:underline">Pengembalian</a></li>
                <li><a href="/docs/syarat&ketentuan" className="hover:underline">Syarat &amp; Ketentuan</a></li>
                <li><a href="/docs/kebijakan-privacy" className="hover:underline">Kebijakan Privasi</a></li>
              </ul>
            </div>

            {/* My Account */}
            <div className="pb-3 md:pb-4 ml-8 md:ml-12">
              <h4 className="font-heading text-xl text-black">Akun Saya</h4>
              <div className="mt-2 w-10 h-[2px] bg-black"></div>
              <ul className="mt-4 space-y-3 font-body text-gray-700">
                <li><a href="/my-account" className="hover:underline">Detail Akun</a></li>
                <li><a href="/produk/pesanan" className="hover:underline">Pesanan</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

