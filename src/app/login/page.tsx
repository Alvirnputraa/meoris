"use client";
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/') // Redirect to home after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <main>
      <section className="min-h-screen grid grid-cols-1 md:grid-cols-[55%_45%]">
        {/* Left: 60% white with brand on top-left and centered login content */}
        <div className="bg-white flex flex-col min-h-screen">
          {/* Brand (top-left), same style as footer */}
          <div className="px-6 pt-6 md:px-10 md:pt-8">
            <div className="-ml-1 md:-ml-2">
              <span className="font-heading font-bold text-3xl tracking-wide text-black">MEORIS</span>
              <div className="mt-1 text-[11px] tracking-[0.3em] uppercase text-gray-600">Footwear</div>
            </div>
          </div>

          {/* Centered login content */}
          <div className="flex-1 flex items-center justify-center px-6 md:px-10">
            <div className="w-[90vw] md:w-full md:max-w-lg">
              {/* Welcome label */}
              <h2 className="font-heading text-2xl md:text-2xl text-black text-left">
                Selamat datang ! Masuk untuk akses akun anda
              </h2>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                {/* Email */}
                <div className="relative pb-3">
                  <Image src="/images/user.png" alt="" width={24} height={24} className="absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    className="peer w-full border-0 rounded-none pl-10 pr-0 py-3 focus:outline-none focus:ring-0 text-black placeholder-transparent"
                    aria-label="Email"
                    required
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-10 top-3 text-gray-500 transition-all duration-200
                               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                               peer-focus:-top-2 peer-focus:text-xs peer-focus:text-black
                               peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-black pointer-events-none"
                  >
                    Email
                  </label>
                  <span className="pointer-events-none absolute left-10 right-0 bottom-0 h-px bg-black"></span>
                </div>

                {/* Password + Lupa password? */}
                <div>
                  <div className="relative pb-3">
                    <Image src="/images/password.png" alt="" width={24} height={24} className="absolute left-0 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=" "
                      className="peer w-full border-0 rounded-none pl-10 pr-0 py-3 focus:outline-none focus:ring-0 text-black placeholder-transparent"
                      aria-label="Password"
                      required
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-10 top-3 text-gray-500 transition-all duration-200
                                 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                                 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-black
                                 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-black pointer-events-none"
                    >
                      Password
                    </label>
                    <span className="pointer-events-none absolute left-10 right-0 bottom-0 h-px bg-black"></span>
                  </div>
                  <div className="mt-2 text-right">
                    <a href="#" className="font-body text-sm text-blue-600 hover:underline">Lupa password ?</a>
                  </div>
                </div>

                {/* Button Masuk */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-black text-white font-body px-5 py-2 rounded-none hover:opacity-90 transition min-w-[120px] disabled:opacity-50"
                    aria-label="Masuk"
                  >
                    {isLoading ? 'Loading...' : 'Masuk'}
                  </button>
                </div>

                {/* Register prompt */}
                <div className="text-center">
                  <span className="font-body text-sm text-black">
                    belum punya akun ?{' '}
                    <a href="/signup" className="text-blue-600 hover:underline">Daftar</a>
                  </span>
                </div>
                {/* Links: Syarat & Ketentuan, Kebijakan Privasi */}
                <div className="mt-3 flex items-center justify-center gap-4">
                  <a href="/docs" className="flex items-center gap-1 text-sm text-blue-600 hover:underline whitespace-nowrap">
                    <span>Syarat &amp; Ketentuan</span>
                    <Image
                      src="/images/arrow.png"
                      alt=""
                      width={12}
                      height={12}
                      aria-hidden="true"
                      style={{ filter: 'invert(32%) sepia(74%) saturate(2196%) hue-rotate(200deg) brightness(94%) contrast(102%)' }}
                    />
                  </a>
                  <a href="/docs" className="flex items-center gap-1 text-sm text-blue-600 hover:underline whitespace-nowrap">
                    <span>Kebijakan Privasi</span>
                    <Image
                      src="/images/arrow.png"
                      alt=""
                      width={12}
                      height={12}
                      aria-hidden="true"
                      style={{ filter: 'invert(32%) sepia(74%) saturate(2196%) hue-rotate(200deg) brightness(94%) contrast(102%)' }}
                    />
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right: 40% poster image */}
        <div className="hidden md:block relative min-h-screen">
          <Image
            src="/images/poslogreg.png"
            alt="Login poster"
            fill
            sizes="(min-width: 768px) 45vw, 0"
            className="object-cover"
          />
        </div>
      </section>
    </main>
  );
}
