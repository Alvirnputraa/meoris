"use client";
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { keranjangDb, produkDb } from '@/lib/database'
import { useCart } from '@/lib/useCart'
import { useFavorites } from '@/lib/useFavorites'
import type { Produk } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useParams, useRouter } from 'next/navigation'

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [product, setProduct] = useState<Produk | null>(null)
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const sizes = useMemo(() => (
    [product?.size1, product?.size2, product?.size3, product?.size4, product?.size5].filter(Boolean) as string[]
  ), [product])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [qty, setQty] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'info'>('desc')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isFavOpen, setIsFavOpen] = useState(false)
  const [selectedFavorites, setSelectedFavorites] = useState<Set<string>>(new Set())
  const { count: cartCount } = useCart()
  const { favorites, loading: favoritesLoading, toggleFavorite, count: favoritesCount } = useFavorites()
  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartLoading, setCartLoading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

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
  // Ambil data produk
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await produkDb.getById(id)
        setProduct(data)
      } catch (e) {
        console.error('Gagal memuat produk', e)
      }
    }
    fetch()
  }, [id])
  // Set default size saat data tersedia
  useEffect(() => {
    if (!selectedSize && sizes.length > 0) {
      setSelectedSize(sizes[0])
    }
  }, [sizes, selectedSize])
  // Realtime: dengarkan perubahan pada produk ini
  useEffect(() => {
    const channel = supabase
      .channel(`produk-detail-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produk', filter: `id=eq.${id}` }, (payload: any) => {
        if (payload?.new) {
          setProduct(payload.new as Produk)
        }
      })
      .subscribe()
    return () => {
      try { supabase.removeChannel(channel) } catch {}
    }
  }, [id])
  // Galeri berdasarkan photo1-3
  const images = [product?.photo1, product?.photo2, product?.photo3].filter(Boolean) as string[]
  const fallbackImages = ['/images/test1p.png']
  const gallery = images.length > 0 ? images : fallbackImages
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const goPrev = () => setCurrentIndex((i) => (i === 0 ? (gallery.length - 1) : i - 1))
  const goNext = () => setCurrentIndex((i) => (i === (gallery.length - 1) ? 0 : i + 1))

  const title = product?.nama_produk ?? 'Detail Produk'
  const shortId = (product?.id ?? id)?.split('-')[0] ?? '-'

  const handleAddToCart = async () => {
    try {
      if (!user) {
        if (isLoading) return
        router.push(`/login?redirect=/produk/${id}/detail`)
        return
      }
      if (!product) return
      await keranjangDb.addItem(user.id, product.id, qty, selectedSize ?? undefined)
      await loadCart()
      setIsCartOpen(true)
    } catch (e) {
      console.error('Gagal menambahkan ke keranjang', e)
      alert('Gagal menambahkan ke keranjang')
    }
  }

  const loadCart = async () => {
    if (!user) return
    try {
      setCartLoading(true)
      const data = await keranjangDb.getByUserId(user.id)
      setCartItems(data || [])
    } catch (e) {
      console.error('Gagal memuat keranjang', e)
    } finally {
      setCartLoading(false)
    }
  }

  // Refresh tanpa mengubah indikator loading agar tidak menimbulkan flicker
  const silentRefreshCart = async () => {
    if (!user) return
    try {
      const data = await keranjangDb.getByUserId(user.id)
      setCartItems(data || [])
    } catch (e) {
      console.error('Gagal memuat keranjang (silent)', e)
    }
  }

  useEffect(() => {
    if (isCartOpen && user) {
      loadCart()
    }
  }, [isCartOpen, user])

  const handleRemoveCartItem = async (itemId: string) => {
    // Optimistic UI: hilangkan item
    const prev = cartItems
    setCartItems((items) => items.filter((it: any) => it.id !== itemId))
    try {
      setRemovingId(itemId)
      await keranjangDb.removeItem(itemId)
      // Sinkronisasi data terbaru tanpa mengubah state loading
      silentRefreshCart()
    } catch (e) {
      console.error('Gagal menghapus item keranjang', e)
      // Revert jika gagal
      setCartItems(prev)
    } finally {
      setRemovingId(null)
    }
  }
  return (
    <main>
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
                  <Link href="/my-account" className="flex items-center justify-between text-black hover:underline" onClick={() => setIsSidebarOpen(false)}>
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
              {cartLoading ? (
                <p className="text-sm text-gray-600">Memuat keranjang...</p>
              ) : cartItems.length === 0 ? (
                <p className="text-sm text-gray-600">Keranjang kosong</p>
              ) : (
                cartItems.map((item: any) => (
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
            {/* Subtotal + actions */}
            <div className="pt-4">
              <p className="font-heading text-center text-lg text-black"><span className="font-bold">Subtotal</span> : Rp {cartItems.reduce((sum, it:any) => sum + (Number(it.produk?.harga || 0) * Number(it.quantity || 1)), 0).toLocaleString('id-ID')}</p>
              <div className="mt-4 flex flex-col items-stretch gap-3">
                <a href="#" className="inline-flex items-center justify-center rounded-none border border-black px-4 py-2 font-body text-sm text-black hover:bg-black hover:text-white transition w-full">
                  Lihat Detail
                </a>
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
      {/* Header (same style as my-account header) */}
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
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16 flex flex-col items-center justify-center">
          <h1 className="font-heading text-3xl md:text-4xl text-gray-300">Produk</h1>
          <div className="mt-3 font-body text-sm text-gray-300">
            <span className="text-gray-300">Produk</span>
            <span className="mx-1">&gt;</span>
            <span className="uppercase">{shortId}</span>
            <span className="mx-1">&gt;</span>
            <span className="text-gray-300">Detail</span>
          </div>
        </div>
      </section>
      {/* Section 3: main product content */}
      <section className="bg-white py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: main image + thumbs */}
            <div>
              <div className="relative w-full aspect-square border border-gray-200 bg-gray-100 overflow-hidden">
                <Image src={gallery[currentIndex]} alt={title} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover select-none" />
                {/* Left arrow */}
                <button
                  type="button"
                  aria-label="Gambar sebelumnya"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {/* Right arrow */}
                <button
                  type="button"
                  aria-label="Gambar berikutnya"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                {gallery.slice(0,3).map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`relative w-20 sm:w-24 md:w-28 aspect-square border ${currentIndex===i ? 'border-black' : 'border-gray-300'} bg-gray-100 overflow-hidden`}
                    aria-label={`Lihat gambar ${i+1}`}
                  >
                    <Image src={src} alt={`${title} preview ${i+1}`} fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: info */}
            <div>
              <h2 className="font-heading text-2xl md:text-3xl text-black">{title}</h2>
              <p className="font-heading text-xl md:text-2xl text-black mt-2">{product?.harga ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.harga) : '-'}</p>

              <div className="mt-3 text-sm text-gray-600 font-body">
                <span className="mr-4">Nomor produk : {shortId}</span>
                <span>Tersedia : {product?.stok ?? 0}</span>
              </div>

              <div className="mt-3 text-sm text-gray-600 font-body">
                <p>Kategori: {product?.kategori ?? '-'}</p>
              </div>

              <hr className="my-4 border-gray-200" />

              <p className="font-body text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {product?.deskripsi ?? '-'}
              </p>

              

              {/* Ukuran (selectable) */}
              <div className="mt-4">
                <p className="font-body text-sm text-black mb-2">Ukuran</p>
                <div className="flex items-center gap-3">
                  {sizes.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSelectedSize(n)}
                      className={`px-4 py-2 text-sm border transition ${
                        selectedSize === n
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-black hover:border-black'
                      }`}
                      aria-pressed={selectedSize === n}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price example removed per request */}

              {/* Add to cart row (static) */}
              <div className="mt-4 flex items-stretch gap-3">
                <div className="flex items-center border border-black text-black select-none">
                  <button
                    className="px-3 py-2 text-black"
                    aria-label="kurangi"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 text-black min-w-[2rem] text-center">{qty}</span>
                  <button
                    className="px-3 py-2 text-black"
                    aria-label="tambah"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="px-5 py-2 bg-black text-white disabled:opacity-60"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !product || isLoading}
                >
                  ADD TO CART
                </button>
              </div>
            </div>
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
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black w-5 h-5 md:w-6 md:h-6"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm16 2l-8 5-8-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
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




