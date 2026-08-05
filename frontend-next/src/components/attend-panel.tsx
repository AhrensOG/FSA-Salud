'use client';

import { useState } from 'react';
import { createMedicalRecord, createPrescription } from '@/lib/api';

interface MedicationItem {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

interface StudyItem {
  name: string;
  results: string;
  done: boolean;
}

interface Props {
  appointment: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function AttendPanel({ appointment, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    diagnosis: '',
    treatment: '',
    medications: '',
    observations: '',
  });
  const [studyItems, setStudyItems] = useState<StudyItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPrescription, setShowPrescription] = useState(false);
  const [rxItems, setRxItems] = useState<MedicationItem[]>([
    { medicationName: '', dosage: '', frequency: '', duration: '', quantity: 1 },
  ]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.diagnosis.trim()) {
      setError('El diagnóstico es obligatorio');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createMedicalRecord(appointment.id, {
        diagnosis: form.diagnosis,
        treatment: form.treatment || undefined,
        medications: form.medications || undefined,
        observations: form.observations || undefined,
        studyItems: studyItems
          .filter((s) => s.name.trim())
          .map((s) => ({
            name: s.name,
            results: s.done && s.results.trim() ? s.results : undefined,
          })),
      });

      const hasRx = rxItems.some((i) => i.medicationName.trim());
      if (hasRx) {
        const validItems = rxItems.filter((i) => i.medicationName.trim());
        await createPrescription({
          patientId: appointment.patient.id,
          diagnosis: form.diagnosis,
          items: validItems.map((i) => ({ ...i, quantity: Number(i.quantity) || 1 })),
        });
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
    setSaving(false);
  }

  function updateRxItem(index: number, field: keyof MedicationItem, value: string | number) {
    const updated = [...rxItems];
    updated[index] = { ...updated[index], [field]: value };
    setRxItems(updated);
  }

  function addRxItem() {
    setRxItems([...rxItems, { medicationName: '', dosage: '', frequency: '', duration: '', quantity: 1 }]);
  }

  function removeRxItem(index: number) {
    if (rxItems.length === 1) return;
    setRxItems(rxItems.filter((_, i) => i !== index));
  }

  function addStudyItem() {
    setStudyItems([...studyItems, { name: '', results: '', done: false }]);
  }

  function updateStudyItem(index: number, field: keyof StudyItem, value: string | boolean) {
    const updated = [...studyItems];
    updated[index] = { ...updated[index], [field]: value };
    setStudyItems(updated);
  }

  function removeStudyItem(index: number) {
    setStudyItems(studyItems.filter((_, i) => i !== index));
  }

  const apt = appointment;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-auto">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registro de consulta</h2>
              <p className="text-sm text-slate-400">{apt.time} — {apt.patient.firstName} {apt.patient.lastName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-celeste-pale text-celeste-dark text-base font-bold">
                {apt.patient.firstName[0]}{apt.patient.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{apt.patient.firstName} {apt.patient.lastName}</p>
                <p className="text-sm text-slate-500">DNI {apt.patient.dni} &middot; {apt.patient.phone}</p>
                <p className="text-sm text-slate-500">{apt.patient.address}, {apt.patient.city}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Diagnóstico <span className="text-red-400">*</span>
              </label>
              <textarea
                name="diagnosis"
                required
                value={form.diagnosis}
                onChange={handleChange}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20 resize-none"
                placeholder="Ingresá el diagnóstico..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Tratamiento</label>
              <textarea
                name="treatment"
                value={form.treatment}
                onChange={handleChange}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20 resize-none"
                placeholder="Indicá el tratamiento..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Medicamentos e indicaciones</label>
              <textarea
                name="medications"
                value={form.medications}
                onChange={handleChange}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20 resize-none"
                placeholder="Medicación, dosis, frecuencia..."
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Estudios solicitados</label>
                <button
                  type="button"
                  onClick={addStudyItem}
                  className="text-xs font-medium text-celeste-dark hover:underline"
                >
                  + Agregar estudio
                </button>
              </div>

              {studyItems.map((item, i) => (
                <div key={i} className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">Estudio {i + 1}</span>
                    <button type="button" onClick={() => removeStudyItem(i)} className="text-xs text-red-400 hover:text-red-600">Quitar</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre del estudio (ej: Radiografía de columna)"
                    value={item.name}
                    onChange={(e) => updateStudyItem(i, 'name', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-celeste"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateStudyItem(i, 'done', !item.done)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                        item.done
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {item.done ? (
                          <polyline points="20 6 9 17 4 12" />
                        ) : (
                          <>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </>
                        )}
                      </svg>
                      {item.done ? 'Ya se realizó' : '¿Ya se hizo el estudio?'}
                    </button>
                  </div>
                  {item.done && (
                    <textarea
                      placeholder="Resultados del estudio..."
                      value={item.results}
                      onChange={(e) => updateStudyItem(i, 'results', e.target.value)}
                      rows={2}
                      className="mt-3 w-full rounded-lg border border-emerald-200 bg-emerald-50/30 px-3 py-2 text-sm outline-none focus:border-emerald-400 resize-none"
                    />
                  )}
                </div>
              ))}

              {studyItems.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                  Tocá &quot;+ Agregar estudio&quot; para solicitar análisis o estudios al paciente
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Observaciones y comentarios</label>
              <textarea
                name="observations"
                value={form.observations}
                onChange={handleChange}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-celeste focus:ring-2 focus:ring-celeste/20 resize-none"
                placeholder="Notas adicionales, comentarios..."
              />
            </div>

            <hr className="border-slate-200" />

            <button
              type="button"
              onClick={() => setShowPrescription(!showPrescription)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-semibold transition ${
                showPrescription
                  ? 'border-celeste bg-celeste-pale text-celeste-dark'
                  : 'border-slate-300 text-slate-500 hover:border-celeste hover:text-celeste-dark'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {showPrescription ? 'Cancelar receta' : 'Generar receta digital'}
            </button>

            {showPrescription && (
              <div className="rounded-2xl border border-celeste bg-celeste-pale/30 p-4 space-y-4">
                <p className="text-sm font-semibold text-celeste-dark">Medicamentos de la receta</p>

                {rxItems.map((item, i) => (
                  <div key={i} className="rounded-xl bg-white p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">Medicamento {i + 1}</span>
                      {rxItems.length > 1 && (
                        <button type="button" onClick={() => removeRxItem(i)} className="text-xs text-red-400 hover:text-red-600">Quitar</button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre del medicamento"
                      value={item.medicationName}
                      onChange={(e) => updateRxItem(i, 'medicationName', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-celeste"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Dosis (ej: 500mg)"
                        value={item.dosage}
                        onChange={(e) => updateRxItem(i, 'dosage', e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-celeste"
                      />
                      <input
                        type="text"
                        placeholder="Frecuencia (ej: c/8hs)"
                        value={item.frequency}
                        onChange={(e) => updateRxItem(i, 'frequency', e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-celeste"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Duración (ej: 7 días)"
                        value={item.duration}
                        onChange={(e) => updateRxItem(i, 'duration', e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-celeste"
                      />
                      <div className="relative">
                        <div className="mb-1 flex items-center gap-1">
                          <span className="text-xs text-slate-500">Cantidad total</span>
                          <span className="group relative cursor-help">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden w-48 rounded-lg bg-slate-800 px-3 py-2 text-xs text-white group-hover:block">
                              Unidades totales que debe dispensar la farmacia. Ej: 1 comprimido c/8hs por 7 días = 21 comprimidos.
                            </span>
                          </span>
                        </div>
                        <input
                          type="number"
                          placeholder="Cantidad"
                          value={item.quantity}
                          min={1}
                          onChange={(e) => updateRxItem(i, 'quantity', Number(e.target.value))}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-celeste"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRxItem}
                  className="w-full rounded-lg border-2 border-dashed border-celeste/40 px-3 py-2 text-sm font-medium text-celeste-dark transition hover:border-celeste"
                >
                  + Agregar otro medicamento
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-celeste px-6 py-4 text-base font-semibold text-white shadow transition hover:bg-celeste-dark active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar registro médico'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
