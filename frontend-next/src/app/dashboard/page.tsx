'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getFutureAppointments, getPendingPrescriptions } from '@/lib/api';
import NewAppointmentFlow from '@/components/new-appointment-flow';

const menuItems = [
  { label: 'Mis datos', href: '/dashboard' },
  { label: 'Consultar tarjeta SIP', href: '/dashboard' },
  { label: 'Centros de salud', href: '/dashboard' },
  { label: 'Preguntas frecuentes', href: '/dashboard' },
  { label: 'Configuraciones', href: '/dashboard' },
  { label: 'Política de protección de datos', href: '/dashboard' },
  { label: 'Condiciones de uso', href: '/dashboard' },
  { label: 'Términos y condiciones', href: '/dashboard' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role === 'doctor') {
      router.push('/doctor');
      return;
    }
    setUser(parsed);
    getFutureAppointments()
      .then(setAppointments)
      .catch(() => {});
    getPendingPrescriptions()
      .then(setPrescriptions)
      .catch(() => {});
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-celeste-pale">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-celeste-pale px-6 pb-24">
      <header className="flex items-center justify-between pt-12 pb-8">
        <div className="flex items-center gap-3">
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
          <span className="text-2xl font-bold text-celeste-dark">FSA Salud</span>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-slate-600 transition active:bg-white"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-8 -mt-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {activeTab === 'home' && <>¡Hola, {user.firstName}!</>}
            {activeTab === 'citas' && 'Mis citas'}
            {activeTab === 'farmacia' && 'Farmacia'}
            {activeTab === 'justificante' && 'Justificante'}
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            {activeTab === 'home' && 'Bienvenido a FSA Salud'}
            {activeTab === 'citas' && 'Consultá tus citas médicas'}
            {activeTab === 'farmacia' && 'Recetas y medicamentos'}
            {activeTab === 'justificante' && 'Tus justificantes médicos'}
          </p>
        </div>

        {activeTab === 'home' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-celeste-pale p-2.5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <span className="text-base font-semibold text-slate-800">Mis citas</span>
              </div>
            </div>

            {appointments.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No tenés citas próximas</p>
            ) : (
              <div className="mt-4 space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{apt.date.split('-').reverse().join('/')}</span>
                      <span className="text-xs font-medium text-celeste-dark bg-celeste-pale rounded-full px-2.5 py-0.5">{apt.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{apt.reason}</p>
                    <p className="mt-1 text-xs text-slate-400 capitalize">Estado: {apt.status}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowNewAppt(true)}
              className="mt-4 w-full rounded-xl border-2 border-dashed border-celeste px-4 py-3 text-sm font-semibold text-celeste-dark transition active:bg-celeste-pale"
            >
              + Solicitar cita nueva
            </button>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-celeste-pale p-2.5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="12" y1="13" x2="12" y2="5" />
                </svg>
              </div>
              <span className="text-base font-semibold text-slate-800">Recetas pendientes</span>
            </div>

            {prescriptions.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No tenés recetas pendientes</p>
            ) : (
              <div className="mt-4 space-y-3">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">
                        Dr. {rx.doctor.firstName} {rx.doctor.lastName}
                      </span>
                      <span className="text-xs font-medium text-celeste-dark bg-celeste-pale rounded-full px-2.5 py-0.5">
                        {new Date(rx.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{rx.diagnosis}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-celeste to-celeste-dark px-5 py-4 text-left shadow-sm transition active:scale-[0.98]"
          >
            <div className="rounded-full bg-white/20 p-2.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <span className="text-base font-semibold text-white">Tarjeta de salud virtual</span>
              <p className="mt-0.5 text-xs text-white/80">Consultá tu cobertura y datos</p>
            </div>
          </button>
        </div>
        )}

        {activeTab === 'citas' && (
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setShowNewAppt(true)}
              className="w-full rounded-xl border-2 border-dashed border-celeste px-4 py-3 text-sm font-semibold text-celeste-dark transition active:bg-celeste-pale"
            >
              + Solicitar cita nueva
            </button>

            {appointments.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p className="text-lg font-medium text-slate-400">No tenés citas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-celeste-dark bg-celeste-pale rounded-full px-3 py-1">{apt.time}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        apt.type === 'llamada' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {apt.type === 'llamada' ? 'Llamada' : 'Presencial'}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-slate-900">{apt.date.split('-').reverse().join('/')}</p>
                    {apt.doctor && (
                      <p className="mt-1 text-sm text-slate-500">Dr. {apt.doctor.firstName} {apt.doctor.lastName}</p>
                    )}
                    <p className="mt-1 text-sm text-slate-500">{apt.reason}</p>
                    <p className="mt-1 text-xs text-slate-400 capitalize">Estado: {apt.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'farmacia' && (
          <div className="flex flex-col gap-4">
            {prescriptions.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="12" y1="13" x2="12" y2="5" />
                </svg>
                <p className="text-lg font-medium text-slate-400">No tenés recetas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-slate-900">{rx.diagnosis}</p>
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 rounded-full px-2.5 py-0.5 capitalize">{rx.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Dr. {rx.doctor.firstName} {rx.doctor.lastName}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(rx.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'justificante' && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-lg font-medium text-slate-400">No tenés justificantes</p>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex w-full max-w-md items-center justify-around border-t border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-celeste-dark' : 'text-slate-400'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-xs font-medium">Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('citas')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'citas' ? 'text-celeste-dark' : 'text-slate-400'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-xs font-medium">Citas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('farmacia')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'farmacia' ? 'text-celeste-dark' : 'text-slate-400'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="12" y1="13" x2="12" y2="5" />
          </svg>
          <span className="text-xs font-medium">Farmacia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('justificante')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'justificante' ? 'text-celeste-dark' : 'text-slate-400'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="text-xs font-medium">Justificante</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <span className="text-lg font-bold text-slate-900">Menú</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition hover:text-slate-600"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col py-4">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(item.href);
                  }}
                  className="px-6 py-3.5 text-left text-base text-slate-700 transition hover:bg-celeste-pale hover:text-celeste-dark"
                >
                  {item.label}
                </button>
              ))}

              <hr className="my-2 border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/');
                }}
                className="px-6 py-3.5 text-left text-base text-red-500 transition hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </nav>
          </div>
        </div>
      )}

      {showNewAppt && (
        <NewAppointmentFlow
          onClose={() => setShowNewAppt(false)}
          onCreated={() => {
            setShowNewAppt(false);
            getFutureAppointments()
              .then(setAppointments)
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}
