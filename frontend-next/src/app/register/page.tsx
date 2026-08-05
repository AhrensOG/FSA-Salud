'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    city: '',
  });
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await register({ ...form, role: 'paciente' });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
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

      <main className="flex flex-1 flex-col gap-6 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Registrarse</h1>
          <p className="mt-2 text-lg text-slate-500">
            Completá tus datos para crear tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Nombre</span>
              <input
                type="text"
                name="firstName"
                required
                value={form.firstName}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Apellido</span>
              <input
                type="text"
                name="lastName"
                required
                value={form.lastName}
                onChange={handleChange}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">DNI</span>
            <input
              type="text"
              name="dni"
              required
              value={form.dni}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              placeholder="12345678"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Teléfono</span>
            <input
              type="tel"
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              placeholder="+543701123456"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              placeholder="tucorreo@ejemplo.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Contraseña</span>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              placeholder="Mínimo 6 caracteres"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Dirección</span>
            <input
              type="text"
              name="address"
              required
              value={form.address}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              placeholder="Calle y número"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Ciudad</span>
            <input
              type="text"
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20"
              placeholder="Formosa"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-celeste px-6 py-4 text-base font-semibold text-white shadow transition active:scale-[0.98] active:bg-celeste-dark disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          ¿Ya tenés cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-celeste-dark underline underline-offset-2"
          >
            Iniciá sesión
          </Link>
        </p>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        FSA Salud &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
