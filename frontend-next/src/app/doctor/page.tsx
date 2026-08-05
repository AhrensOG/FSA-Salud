'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDoctorAppointments } from '@/lib/api';
import { authApi, updateStudyResults } from '@/lib/api';
import AttendPanel from '@/components/attend-panel';

export default function DoctorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('citas');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [patientHistory, setPatientHistory] = useState<any>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [attendingAppointment, setAttendingAppointment] = useState<any>(null);
  const [editingResults, setEditingResults] = useState<any>(null);
  const [resultsText, setResultsText] = useState('');

  async function saveResults(studyId: string) {
    if (!resultsText.trim()) return;
    try {
      await updateStudyResults(studyId, resultsText);
      setHistoryRecords((prev) =>
        prev.map((r: any) => ({
          ...r,
          studies: r.studies?.map((s: any) =>
            s.id === studyId ? { ...s, results: resultsText, status: 'completado' } : s,
          ),
        })),
      );
      setEditingResults(null);
      setResultsText('');
    } catch {
      // ignore
    }
  }

  async function viewPatientHistory(patient: any) {
    setPatientHistory(patient);
    setLoadingHistory(true);
    try {
      const records = await authApi<any[]>(`/patients/${patient.id}/medical-records`);
      setHistoryRecords(records);
    } catch {
      setHistoryRecords([]);
    }
    setLoadingHistory(false);
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== 'doctor') {
      router.push('/dashboard');
      return;
    }
    setUser(parsed);
    getDoctorAppointments()
      .then(setAppointments)
      .catch(() => {});
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-slate-200 bg-white transition-all duration-300`}>
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="#4fc3f7" />
            <rect x="17" y="8" width="6" height="24" rx="3" fill="white" />
            <rect x="8" y="17" width="24" height="6" rx="3" fill="white" />
            <rect x="14" y="14" width="12" height="12" rx="4" fill="#0284c7" />
            <text x="20" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">F</text>
          </svg>
          {sidebarOpen && <span className="text-lg font-bold text-celeste-dark">FSA Salud</span>}
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {[
            { key: 'citas', label: 'Citas del día', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { key: 'pacientes', label: 'Pacientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { key: 'recetas', label: 'Recetas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { key: 'historial', label: 'Historial clínico', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { key: 'justificantes', label: 'Justificantes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveSection(item.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                activeSection === item.key
                  ? 'bg-celeste-pale text-celeste-dark'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-3 py-4">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">Dr. {user.firstName} {user.lastName}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-celeste text-white text-sm font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Citas del día</h1>
              <p className="mt-1 text-sm text-slate-500">
                {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Presencial
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                Llamada
              </span>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-lg font-medium text-slate-400">No tenés citas programadas para hoy</p>
              <p className="mt-1 text-sm text-slate-300">Las próximas citas aparecerán acá</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const isPresencial = apt.type === 'presencial';

                return (
                  <div
                    key={apt.id}
                    className="group flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex w-20 flex-shrink-0 flex-col items-center">
                      <span className={`text-lg font-bold ${isPresencial ? 'text-emerald-600' : 'text-violet-600'}`}>
                        {apt.time}
                      </span>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isPresencial ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'
                      }`}>
                        {isPresencial ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                          </svg>
                        )}
                        {isPresencial ? 'Presencial' : 'Llamada'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => viewPatientHistory(apt.patient)}
                          className="text-base font-semibold text-slate-900 text-left hover:text-celeste-dark hover:underline transition"
                        >
                          {apt.patient.firstName} {apt.patient.lastName}
                        </button>
                        <span className="text-xs text-slate-400">DNI {apt.patient.dni}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500 truncate">{apt.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span>{apt.patient.phone}</span>
                        {!isPresencial && <span className="text-violet-500">Paciente recibirá la llamada</span>}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setAttendingAppointment(apt)}
                        className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${
                          isPresencial ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-violet-500 hover:bg-violet-600'
                        }`}
                      >
                        {isPresencial ? 'Atender' : 'Llamar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => viewPatientHistory(apt.patient)}
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {patientHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPatientHistory(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl overflow-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {patientHistory.firstName} {patientHistory.lastName}
                </p>
                <p className="text-sm text-slate-400">DNI {patientHistory.dni} &middot; {patientHistory.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setPatientHistory(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Historial clínico</h3>

              {loadingHistory ? (
                <p className="py-8 text-center text-slate-400">Cargando historial...</p>
              ) : historyRecords.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <p className="text-slate-400">Sin registros médicos previos</p>
                  <p className="mt-1 text-sm text-slate-300">El historial se genera al registrar una consulta</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyRecords.map((record: any) => (
                    <div key={record.id} className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm font-semibold text-celeste-dark bg-celeste-pale rounded-full px-3 py-1">
                          {new Date(record.createdAt).toLocaleDateString('es-AR')}
                        </span>
                        <span className="text-xs text-slate-500">
                          Atendido por Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        <div>
                          <span className="text-xs font-medium text-slate-400">Diagnóstico</span>
                          <p className="mt-0.5 text-base text-slate-900">{record.diagnosis}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-slate-400">Tratamiento</span>
                          <p className="mt-0.5 text-base text-slate-700">{record.treatment}</p>
                        </div>
                        {record.medications && (
                          <div>
                            <span className="text-xs font-medium text-slate-400">Medicamentos e indicaciones</span>
                            <p className="mt-0.5 text-base text-slate-700">{record.medications}</p>
                          </div>
                        )}
                        {record.studies?.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-slate-400">Estudios</span>
                            <div className="mt-1.5 space-y-2">
                              {record.studies.map((study: any) => {
                                const isStudyPending = study.status === 'pendiente';
                                return (
                                  <div key={study.id} className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-slate-700">{study.name}</span>
                                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                                        isStudyPending ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'
                                      }`}>
                                        {isStudyPending ? 'Pendiente' : 'Completado'}
                                      </span>
                                    </div>
                                    {study.results && (
                                      <p className="mt-1 text-sm text-slate-500">{study.results}</p>
                                    )}
                                    {isStudyPending && editingResults?.id === study.id ? (
                                      <div className="mt-2 space-y-2">
                                        <textarea
                                          value={resultsText}
                                          onChange={(e) => setResultsText(e.target.value)}
                                          rows={2}
                                          placeholder="Cargar resultados..."
                                          className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none"
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => saveResults(study.id)}
                                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white"
                                          >
                                            Guardar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => { setEditingResults(null); setResultsText(''); }}
                                            className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs text-amber-600"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      </div>
                                    ) : isStudyPending ? (
                                      <button
                                        type="button"
                                        onClick={() => { setEditingResults(study); setResultsText(''); }}
                                        className="mt-2 w-full rounded-lg border border-dashed border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-50"
                                      >
                                        Cargar resultados
                                      </button>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {record.observations && (
                          <div>
                            <span className="text-xs font-medium text-slate-400">Observaciones</span>
                            <p className="mt-0.5 text-sm text-slate-600">{record.observations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {attendingAppointment && (
        <AttendPanel
          appointment={attendingAppointment}
          onClose={() => setAttendingAppointment(null)}
          onSaved={() => {
            setAttendingAppointment(null);
            getDoctorAppointments()
              .then(setAppointments)
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
}
