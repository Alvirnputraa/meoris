"use client";
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function MyAccountPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const tab = (searchParams?.tab || 'detail') as 'detail' | 'alamat'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
                  <a href="#" className="flex items-center justify-between text-black hover:underline">
                    <span className="font-heading text-base">Informasi Akun</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between text-black hover:underline">
                    <span>Pengiriman</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between text-black hover:underline">
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
      {/* Top header (same style as homepage header) */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full flex items-center justify-between px-6 md:px-8 lg:px-10 py-5">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Buka menu" className="p-1 rounded hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
              <Image src="/images/sidebar.png" alt="Menu" width={34} height={34} />
            </button>
            <Link href="/" aria-label="Meoris beranda" className="select-none">
              <span className="font-heading font-bold text-xl md:text-2xl lg:text-3xl tracking-wide text-black">MEORIS</span>
            </Link>
          </div>
          <div className="flex items-center gap-4 lg:gap-5">
            <a href="#" aria-label="Cari">
              <Image src="/images/search.png" alt="Search" width={34} height={34} />
            </a>
            <a href="#" aria-label="Favorit" className="relative">
              <Image src="/images/favorit.png" alt="Favorit" width={34} height={34} />
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">0</span>
            </a>
            <a href="#" aria-label="Keranjang" className="relative">
              <Image src="/images/cart.png" alt="Cart" width={34} height={34} />
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-black text-white text-[10px] leading-4 text-center">0</span>
            </a>
            <Link href="/my-account" aria-label="Akun">
              <Image src="/images/user.png" alt="User" width={34} height={34} />
            </Link>
          </div>
        </div>
      </div>
      {/* Hero with title + breadcrumb */}
      <section className="relative overflow-hidden bg-transparent">
        {/* Background image with fixed effect */}
        <div
          className="absolute inset-0 -z-10 bg-center bg-cover bg-fixed"
          aria-hidden="true"
          style={{ backgroundImage: 'url(/images/bgg1.png)' }}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-14 min-h-[24vh] md:min-h-[30vh] flex flex-col items-center justify-center">
          <h1 className="font-heading text-3xl md:text-4xl text-black text-center">My Account</h1>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 font-body">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-black">My Account</span>
          </div>
        </div>
      </section>
      

      {/* Dashboard layout */}
      <section className="bg-white py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
            {/* Sidebar */}
            <aside>
              <ul className="border border-gray-200 divide-y divide-gray-200">
                <li>
                  <Link
                    href="/my-account?tab=detail"
                    className={`block px-4 py-3 font-body ${tab === 'detail' ? 'bg-black text-white' : 'text-gray-800 hover:bg-gray-50'}`}
                    aria-current={tab === 'detail' ? 'page' : undefined}
                  >
                    Detail Akun
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-account?tab=alamat"
                    className={`block px-4 py-3 font-body ${tab === 'alamat' ? 'bg-black text-white' : 'text-gray-800 hover:bg-gray-50'}`}
                    aria-current={tab === 'alamat' ? 'page' : undefined}
                  >
                    Alamat
                  </Link>
                </li>
                <li>
                  <a href="#" className="block px-4 py-3 font-body text-gray-800 hover:bg-gray-50">Logout</a>
                </li>
              </ul>
            </aside>

            {/* Content */}
            <div>
              {tab === 'alamat' ? (
                <>
                  <h2 className="font-heading text-2xl md:text-3xl text-black">Alamat</h2>
                  <div className="mt-6 max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        {/* Nama Penerima */}
                        <div>
                          <label className="block font-body text-sm text-gray-700 mb-1">Nama Penerima</label>
                          <div className="relative">
                            <input type="text" defaultValue="Budi Santoso" className="w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                            <span className="absolute inset-y-0 right-2 my-auto p-2 rounded">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                            </span>
                          </div>
                        </div>
                        {/* Nama Jalan */}
                        <div>
                          <label className="block font-body text-sm text-gray-700 mb-1">Nama Jalan, gedung, nomor rumah</label>
                          <div className="relative">
                            <input type="text" defaultValue="Jl. Melati No. 123, RT 01/RW 02" className="w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                            <span className="absolute inset-y-0 right-2 my-auto p-2 rounded">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                            </span>
                          </div>
                        </div>
                        {/* Kecamatan/Desa */}
                        <div>
                          <label className="block font-body text-sm text-gray-700 mb-1">Kecamatan/Desa</label>
                          <div className="relative">
                            <input type="text" defaultValue="Kec. Setiabudi / Desa Mekar" className="w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                            <span className="absolute inset-y-0 right-2 my-auto p-2 rounded">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-5">
                        {/* Provinsi */}
                        <div>
                          <label className="block font-body text-sm text-gray-700 mb-1">Provinsi</label>
                          <div className="relative">
                            <input type="text" defaultValue="Jawa Barat" className="w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                            <span className="absolute inset-y-0 right-2 my-auto p-2 rounded">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                            </span>
                          </div>
                        </div>
                        {/* Postal code */}
                        <div>
                          <label className="block font-body text-sm text-gray-700 mb-1">Postal Code</label>
                          <div className="relative">
                            <input type="text" defaultValue="40123" className="w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                            <span className="absolute inset-y-0 right-2 my-auto p-2 rounded">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                            </span>
                          </div>
                        </div>
                        {/* Negara */}
                        <div>
                          <label className="block font-body text-sm text-gray-700 mb-1">Negara</label>
                          <input type="text" defaultValue="Indonesia" className="w-full rounded-md border border-gray-300 px-4 py-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button className="inline-flex items-center gap-2 rounded-md bg-black text-white px-5 py-3">Save</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-2xl md:text-3xl text-black">Detail Akun</h2>
                  <div className="mt-6 space-y-5 max-w-xl">
                    {/* Nama */}
                    <div>
                      <label className="block font-body text-sm text-gray-700 mb-1">Nama</label>
                      <div className="relative">
                        <input type="text" defaultValue="John Doe" className="w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                        <span className="absolute inset-y-0 right-2 my-auto p-2 rounded">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                        </span>
                      </div>
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block font-body text-sm text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <input type="email" defaultValue="john@example.com" className="w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                        <span className="absolute inset-y-0 right-2 my-auto p-2 rounded">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                        </span>
                      </div>
                    </div>
                    {/* Password */}
                    <div>
                      <label className="block font-body text-sm text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input type="password" defaultValue="********" className="w-full rounded-md border border-gray-300 px-4 py-3 pr-10 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/40" />
                        <span className="absolute inset-y-0 right-2 my-auto p-2 rounded">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button className="inline-flex items-center gap-2 rounded-md bg-black text-white px-5 py-3">Save</button>
                    </div>
                  </div>
                </>
              )}
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
              <div>
                <span className="font-heading font-bold text-3xl tracking-wide text-black">MEORIS</span>
                <div className="mt-1 text-[11px] tracking-[0.3em] uppercase text-gray-600">Footwear</div>
              </div>
              <ul className="space-y-3 font-body text-gray-700">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 text-black"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/></svg>
                  <span>59 Street, Newyork City, Rose Town, 05 Rive House</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.09 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.59 2.63a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.45-1.16a2 2 0 0 1 2.11-.45c.85.27 1.73.47 2.63.59A2 2 0 0 1 22 16.92z" fill="currentColor"/></svg>
                  <span>+123 456 7890</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm16 2l-8 5-8-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span>info@example.com</span>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="font-heading text-xl text-black">Information</h4>
              <div className="mt-2 w-10 h-[2px] bg-black"></div>
              <ul className="mt-4 space-y-3 font-body text-gray-700">
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Latest Post</a></li>
                <li><a href="#" className="hover:underline">Selling Tips</a></li>
                <li><a href="#" className="hover:underline">Advertising</a></li>
                <li><a href="#" className="hover:underline">Contact Us</a></li>
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h4 className="font-heading text-xl text-black">My Account</h4>
              <div className="mt-2 w-10 h-[2px] bg-black"></div>
              <ul className="mt-4 space-y-3 font-body text-gray-700">
                <li><a href="#" className="hover:underline">My Account</a></li>
                <li><a href="#" className="hover:underline">Login/Register</a></li>
                <li><a href="#" className="hover:underline">Cart</a></li>
                <li><a href="#" className="hover:underline">Wishlist</a></li>
                <li><a href="#" className="hover:underline">Order History</a></li>
              </ul>
            </div>

            {/* Help & Support */}
            <div>
              <h4 className="font-heading text-xl text-black">Help &amp; Support</h4>
              <div className="mt-2 w-10 h-[2px] bg-black"></div>
              <ul className="mt-4 space-y-3 font-body text-gray-700">
                <li><a href="#" className="hover:underline">How To Shop</a></li>
                <li><a href="#" className="hover:underline">Payment</a></li>
                <li><a href="#" className="hover:underline">Returns</a></li>
                <li><a href="#" className="hover:underline">Delivery</a></li>
                <li><a href="#" className="hover:underline">Privacy &amp; Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
