"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/useCart';
import { useFavorites } from '@/lib/useFavorites';
import { keranjangDb, produkDb } from '@/lib/database';

export default function PermintaanReturnsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavOpen, setIsFavOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { items: cartItems, count: cartCount, loading: cartLoading, refresh } = useCart();
  const { favorites, loading: favoritesLoading, toggleFavorite, count: favoritesCount } = useFavorites();
  const [viewItems, setViewItems] = useState<any[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Form state
  const [urlBukti, setUrlBukti] = useState("");
  const [alasan, setAlasan] = useState("");
  const [nomorPesanan, setNomorPesanan] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  // Generate / revoke preview URLs every time files change
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return null; // Show nothing while determining auth or redirecting
  }

  function onPickFiles(e: ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    const incoming = Array.from(list);
    const combined = [...files, ...incoming];
    if (combined.length > 3) {
      const allowed = combined.slice(0, 3);
      setFiles(allowed);
      alert("Maksimal 3 foto.");
    } else {
      setFiles(combined);
    }
    // reset input value so picking the same file triggers onChange again
    e.target.value = "";
  }

  function removeFile(idx: number) {
    const copy = [...files];
    copy.splice(idx, 1);
    setFiles(copy);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // Basic validation
    if (!nomorPesanan.trim()) {
      alert("Nomor pesanan wajib diisi.");
      return;
    }
    if (!alasan.trim()) {
      alert("Alasan pengembalian wajib diisi.");
      return;
    }
    if (files.length === 0 && !urlBukti.trim()) {
      alert("Lampirkan minimal salah satu: URL bukti (YouTube/Drive) atau foto.");
      return;
    }
    // Mock submit (replace with real API call)
    console.log({
      nomorPesanan,
      alasan,
      urlBukti,
      filesCount: files.length,
    });
    alert("Permintaan pengembalian terkirim. Kami akan meninjau dan menghubungi Anda.");
    // reset
    setUrlBukti("");
    setAlasan("");
    setNomorPesanan("");
    setFiles([]);
  }

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
                  <Link href="/my-account" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between text-black hover:underline">
                    <span className="font-heading text-base">Informasi Akun</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </Link>
                </li>
                <li>
                  <Link href="/produk/pesanan" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between text-black hover:underline">
                    <span>History Pesanan</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Right panels: Search, Cart, Favorite */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseSearchSidebar} aria-hidden="true" />
          <aside className="absolute right-0 top-0 h-full w-80 md:w-96 max-w-[92%] bg-white shadow-2xl p-6 flex flex-col">
            <button type="button" aria-label="Tutup pencarian" className="absolute -left-12 top-6 w-14 h-10 bg-white rounded-l-lg rounded-r-none text-black flex items-center justify-center" onClick={handleCloseSearchSidebar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
              <p className="font-heading text-center text-lg text-black"><span className="font-bold">Subtotal</span> : Rp {viewItems.reduce((sum, it:any) => sum + (Number(it.produk?.harga || 0) * Number(it.quantity || 1)), 0).toLocaleString('id-ID')}</p>
              <div className="mt-4 flex flex-col items-stretch gap-3">
                <Link
                  href="/produk/detail-checkout"
                  className="inline-flex items-center justify-center rounded-none border border-black bg-black text-white px-4 py-2 font-body text-sm hover:opacity-90 transition w-full"
                  onClick={() => {
                    setIsCartOpen(false);
                  }}
                >
                  Checkout
                </Link>
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
        <div className="w-full flex items-center justify-between px-6 md:px-8 lg:px-10 py-3">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Buka menu" className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black" onClick={() => setIsSidebarOpen(true)}>
              <Image src="/images/sidebar.png" alt="Menu" width={28} height={28} />
            </button>
            <Link href="/" aria-label="Meoris beranda" className="select-none">
              <span className="font-heading font-bold text-2xl tracking-wide text-black">MEORIS</span>
            </Link>
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
            <Link href="/my-account" aria-label="Akun">
              <Image src="/images/user.png" alt="User" width={28} height={28} />
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

      {/* Section 1: hero with bg22 and center label */}
      <section className="relative overflow-hidden bg-transparent pt-[76px]">
        <div className="absolute inset-0 -z-10 bg-center bg-cover" aria-hidden="true" style={{ backgroundImage: 'url(/images/bg22.png)' }} />
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16 flex flex-col items-center justify-center text-black">
          <h1 className="font-heading text-3xl md:text-4xl text-gray-200">Pengembalian</h1>
          <div className="mt-3 font-body text-sm text-gray-200">
            <span>Beranda</span>
            <span className="mx-1">{'>'}</span>
            <span className="text-gray-200">Pengembalian</span>
          </div>
        </div>
      </section>

      {/* Section 2: Form pengembalian */}
      <section className="bg-white py-10 md:py-14">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="font-heading text-2xl md:text-3xl text-black">Isi detail dibawah</h2>

          <form className="mt-6 space-y-6" onSubmit={onSubmit}>
            {/* URL Youtube/Google Drive */}
            <div>
              <label htmlFor="url-bukti" className="block font-body text-sm text-black mb-2">
                URL Youtube/Google Drive
              </label>
              <input
                id="url-bukti"
                type="url"
                value={urlBukti}
                onChange={(e) => setUrlBukti(e.target.value)}
                placeholder="Tempelkan tautan video unboxing"
                className="w-full rounded-none border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40"
              />
            </div>

            {/* Foto bukti maksimal 3 dengan preview */}
            <div>
              <label className="block font-body text-sm text-black mb-2">
                Pilih Foto (maksimal 3)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPickFiles}
                className="block w-full text-black file:mr-4 file:rounded-none file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm hover:file:bg-gray-50"
                aria-label="Unggah foto bukti, maksimal 3"
              />

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative">
                      <div className="relative w-full aspect-square overflow-hidden border border-gray-200 bg-gray-100">
                        <Image src={src} alt={`Preview ${idx + 1}`} fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 p-1 rounded bg-white/90 border border-gray-300 text-black hover:bg-white"
                        aria-label="Hapus foto ini"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alasan pengembalian */}
            <div>
              <label htmlFor="alasan" className="block font-body text-sm text-black mb-2">
                Alasan pengembalian
              </label>
              <textarea
                id="alasan"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={4}
                placeholder="Jelaskan alasan pengembalian..."
                className="w-full rounded-none border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40"
              />
            </div>

            {/* Nomor pesanan */}
            <div>
              <label htmlFor="nomor" className="block font-body text-sm text-black mb-2">
                Nomor pesanan
              </label>
              <input
                id="nomor"
                type="text"
                value={nomorPesanan}
                onChange={(e) => setNomorPesanan(e.target.value)}
                placeholder="Masukkan nomor pesanan Anda"
                className="w-full rounded-none border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40"
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-none bg-black px-5 py-3 font-body text-sm text-white hover:opacity-90 transition"
                aria-label="Konfirmasi dan kirim permintaan"
              >
                Konfirmasi dan Kirim
              </button>
            </div>
          </form>
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

            {/* Bantuan & Dukungan */}
            <div className="pb-3 md:pb-4">
              <h4 className="font-heading text-xl text-black">Bantuan &amp; Dukungan</h4>
              <div className="mt-2 w-10 h-[2px] bg-black"></div>
              <ul className="mt-4 space-y-3 font-body text-gray-700">
                <li><a href="/docs/pengembalian" className="hover:underline">Pengembalian</a></li>
                <li><a href="/docs/syarat&ketentuan" className="hover:underline">Syarat &amp; Ketentuan</a></li>
                <li><a href="/docs/kebijakan-privacy" className="hover:underline">Kebijakan Privasi</a></li>
              </ul>
            </div>

            {/* Akun Saya */}
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
  );
}


