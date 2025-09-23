"use client";
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { keranjangDb } from '@/lib/database'
import { useCart } from '@/lib/useCart'
import { useFavorites } from '@/lib/useFavorites'

export default function Header() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
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

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    if (isCartOpen && user) {
      refresh()
    }
  }, [isCartOpen, user, refresh])

  // Catatan: badge dan isi cart disuplai oleh useCart (realtime + count),
  // sehingga tidak perlu efek manual untuk setCartCount/setCartItems di sini.

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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-heading font-bold text-2xl tracking-wide text-black">MEORIS</span>
            <span className="text-xs tracking-[0.3em] uppercase text-gray-600 font-body">Footwear</span>
          </Link>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-black transition-colors" aria-label="Search">
              <Image src="/images/search.png" alt="Search" width={20} height={20} />
            </button>

            {/* Favorites */}
            <button
              className="relative p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Favorites"
              onClick={() => setIsFavOpen(true)}
            >
              <Image src="/images/favorit.png" alt="Favorites" width={20} height={20} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-black text-white text-[10px] leading-[18px] text-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              className="relative p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <Image src="/images/cart.png" alt="Cart" width={20} height={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-black text-white text-[10px] leading-[18px] text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-black transition-colors"
                  aria-label="User menu"
                >
                  <Image src="/images/user.png" alt="User" width={20} height={20} />
                  <span className="text-sm font-body">{user.nama}</span>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/my-account"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Image src="/images/user.png" alt="" width={16} height={16} className="mr-3" />
                        My Account
                      </Link>
                      <Link
                        href="/pesanan"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Image src="/images/shipped.png" alt="" width={16} height={16} className="mr-3" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Image src="/images/user.png" alt="" width={16} height={16} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="p-2 text-gray-600 hover:text-black transition-colors" aria-label="Login">
                <Image src="/images/user.png" alt="Login" width={20} height={20} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
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
            <div className="mt-6">
              <div className="space-y-5">
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
              <div className="mt-2">
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
            </div>
          </aside>
        </div>
      )}

      {/* Favorites Sidebar */}
      {isFavOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseFavSidebar}
            aria-hidden="true"
          />
          <aside className="absolute right-0 top-0 h-full w-96 max-w-[92%] bg-white shadow-2xl p-6">
            {/* Pull-tab close button on the left edge */}
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
                {/* Checkout button removed as requested */}
              </div>
            )}
          </aside>
        </div>
      )}
    </header>
  )
}








