'use client';

import { useState, useEffect } from 'react';
import { getDoctors, getDoctorAvailability, getDoctorMonthAvailability, createAppointment, getSpecialties } from '@/lib/api';
import Calendar from './calendar';

type Step = 'doctor' | 'type' | 'date' | 'slot' | 'confirm';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
}

export default function NewAppointmentFlow({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<Step>('doctor');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [apptType, setApptType] = useState<'presencial' | 'llamada'>('presencial');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [monthAvailability, setMonthAvailability] = useState<Record<string, number>>({});
  const [selectedSlot, setSelectedSlot] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [activeSpecialty, setActiveSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(() => setError('No se pudieron cargar los doctores'));
    getSpecialties()
      .then(setSpecialties)
      .catch(() => {});
  }, []);

  async function filterBySpecialty(specialty: string) {
    setActiveSpecialty(specialty);
    setError('');
    try {
      const docs = await getDoctors(specialty || undefined);
      setDoctors(docs);
    } catch {
      setError('No se pudieron cargar los doctores');
    }
  }

  function selectDoctor(doc: Doctor) {
    setSelectedDoctor(doc);
    setStep('type');
  }

  async function selectType(type: 'presencial' | 'llamada') {
    setApptType(type);
    if (!selectedDoctor) return;
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setLoading(true);
    setError('');
    try {
      const { slots: available } = await getDoctorAvailability(selectedDoctor.id, today);
      setSlots(available);
      if (available.length > 0) {
        setStep('slot');
      } else {
        setStep('date');
      }
    } catch {
      setError('Error al cargar disponibilidad');
      setStep('date');
    }
    setLoading(false);
  }

  async function loadDate(newDate: string) {
    if (!selectedDoctor) return;
    setDate(newDate);
    setLoading(true);
    setError('');
    try {
      const { slots: available } = await getDoctorAvailability(selectedDoctor.id, newDate);
      setSlots(available);
      if (available.length === 0) {
        setError('No hay horarios disponibles en esta fecha');
      } else {
        setStep('slot');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar horarios');
    }
    setLoading(false);
  }

  async function loadMonth(year: number, month: number) {
    if (!selectedDoctor) return;
    try {
      const avail = await getDoctorMonthAvailability(selectedDoctor.id, year, month);
      setMonthAvailability(avail);
    } catch {
      // silently fail, calendar just won't show highlights
    }
  }

  async function handleConfirm() {
    if (!selectedDoctor || !selectedSlot || !date) return;
    setLoading(true);
    setError('');
    try {
      await createAppointment({
        doctorId: selectedDoctor.id,
        date,
        time: selectedSlot,
        reason: 'Consulta médica',
        type: apptType,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Error al crear la cita');
    }
    setLoading(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-celeste-pale">
      <header className="flex items-center justify-between px-6 pt-12 pb-4">
        <button
          type="button"
          onClick={() => {
            if (step === 'doctor' && activeSpecialty) {
              filterBySpecialty('');
            } else if (step === 'doctor') {
              onClose();
            } else if (step === 'type') {
              setStep('doctor');
            } else if (step === 'date') {
              setStep('type');
            } else if (step === 'slot') {
              setStep('date');
            } else {
              setStep('slot');
            }
          }}
          className="rounded-full bg-white p-2 text-slate-600 shadow-sm"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span className="text-lg font-bold text-slate-900">
          {step === 'doctor' && activeSpecialty && activeSpecialty}
          {step === 'doctor' && !activeSpecialty && 'Elegí tu doctor'}
          {step === 'type' && 'Tipo de consulta'}
          {step === 'date' && 'Elegí la fecha'}
          {step === 'slot' && 'Elegí el horario'}
          {step === 'confirm' && 'Confirmar cita'}
        </span>
        <div className="w-10" />
      </header>

      <div className="flex gap-1 px-6 pb-4">
        {(['doctor', 'type', 'date', 'slot', 'confirm'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              i <= (['doctor', 'type', 'date', 'slot', 'confirm'].indexOf(step))
                ? 'bg-celeste'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <main className="flex-1 overflow-auto px-6 pb-8">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-slate-400">Cargando...</p>
          </div>
        )}

        {!loading && step === 'doctor' && (
          <div className="space-y-4">
            {!activeSpecialty ? (
              <>
                <p className="text-center text-sm text-slate-500">¿Qué especialista necesitás?</p>
                <div className="grid grid-cols-2 gap-3">
                  {specialties.map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => filterBySpecialty(sp)}
                      className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm transition active:scale-[0.97]"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-celeste-pale text-celeste-dark">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 text-center leading-tight">{sp}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => filterBySpecialty('')}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition active:bg-slate-50"
                  >
                    &larr; Cambiar
                  </button>
                  <span className="text-sm font-semibold text-celeste-dark">{activeSpecialty}</span>
                </div>

                <div className="space-y-3">
                  {doctors.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => selectDoctor(doc)}
                      className="flex w-full items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition active:scale-[0.98]"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-celeste-pale text-celeste-dark text-lg font-bold">
                        {doc.firstName[0]}{doc.lastName[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-semibold text-slate-900">Dr. {doc.firstName} {doc.lastName}</p>
                        <p className="text-sm font-medium text-celeste-dark">{doc.specialty}</p>
                      </div>
                    </button>
                  ))}
                  {doctors.length === 0 && (
                    <p className="py-16 text-center text-slate-400">No hay doctores de esta especialidad</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {!loading && step === 'type' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => selectType('presencial')}
              className={`flex w-full items-center gap-4 rounded-2xl p-5 shadow-sm transition active:scale-[0.98] ${
                apptType === 'presencial' ? 'bg-emerald-50 border-2 border-emerald-400' : 'bg-white'
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-slate-900">Presencial</p>
                <p className="text-sm text-slate-500">Voy al consultorio</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => selectType('llamada')}
              className={`flex w-full items-center gap-4 rounded-2xl p-5 shadow-sm transition active:scale-[0.98] ${
                apptType === 'llamada' ? 'bg-violet-50 border-2 border-violet-400' : 'bg-white'
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-slate-900">Por llamada</p>
                <p className="text-sm text-slate-500">El doctor me llama</p>
              </div>
            </button>

            <p className="text-center text-sm text-slate-400 pt-2">
              {selectedDoctor?.firstName} {selectedDoctor?.lastName} &middot; {selectedDoctor?.specialty}
            </p>
          </div>
        )}

        {!loading && step === 'date' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm text-center">
              <p className="text-sm text-slate-400">Fecha seleccionada</p>
              <p className="mt-1 text-2xl font-bold text-celeste-dark">{formatDate(date)}</p>
              <p className="mt-1 text-sm text-slate-500">{slots.length} horarios disponibles</p>
            </div>

            <Calendar
              availability={monthAvailability}
              selectedDate={date}
              onSelectDate={loadDate}
              onMonthChange={loadMonth}
            />
          </div>
        )}

        {!loading && step === 'slot' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">{formatDate(date)}</p>
              <p className="text-sm text-slate-500">Seleccioná un horario</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => { setSelectedSlot(slot); setStep('confirm'); }}
                  className="rounded-xl bg-white py-4 text-center text-base font-semibold text-slate-700 shadow-sm transition active:bg-celeste active:text-white"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loading && step === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Resumen de tu cita</h2>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Doctor</span>
                  <span className="text-sm font-semibold text-slate-900">
                    Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                    <span className="block text-xs font-normal text-slate-400">{selectedDoctor?.specialty}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tipo</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {apptType === 'presencial' ? 'Presencial' : 'Por llamada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Fecha</span>
                  <span className="text-sm font-semibold text-slate-900">{formatDate(date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Horario</span>
                  <span className="text-sm font-semibold text-celeste-dark">{selectedSlot}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="w-full rounded-xl bg-celeste px-6 py-4 text-base font-semibold text-white shadow transition active:bg-celeste-dark disabled:opacity-50"
            >
              {loading ? 'Creando cita...' : 'Confirmar cita'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
