'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      const user = JSON.parse(stored);
      router.push(user.role === 'doctor' ? '/doctor' : '/dashboard');
    }
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push(data.user.role === 'doctor' ? '/doctor' : '/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-celeste-pale px-6">
      <header className="flex items-center gap-3 pt-12 pb-8">
        <Link href="/">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="10" fill="#4fc3f7" />
            <rect x="17" y="8" width="6" height="24" rx="3" fill="white" />
            <rect x="8" y="17" width="24" height="6" rx="3" fill="white" />
            <rect x="14" y="14" width="12" height="12" rx="4" fill="#0284c7" />
            <text
              x="20"
              y="22"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="bold"
              fontFamily="Arial"
            >
              F
            </text>
          </svg>
        </Link>
        <span className="text-2xl font-bold text-celeste-dark">FSA Salud</span>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-8 -mt-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="mt-2 text-lg text-slate-500">
            Ingresá tus datos para acceder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              placeholder="tucorreo@ejemplo.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              placeholder="••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-celeste px-6 py-4 text-base font-semibold text-white shadow transition active:scale-[0.98] active:bg-celeste-dark disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          ¿No tenés cuenta?{' '}
          <Link
            href="/register"
            className="font-semibold text-celeste-dark underline underline-offset-2"
          >
            Registrate
          </Link>
        </p>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        FSA Salud &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
