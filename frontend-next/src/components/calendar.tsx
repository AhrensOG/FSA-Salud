'use client';

import { useState, useEffect } from 'react';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

interface CalendarProps {
  availability: Record<string, number>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

export default function Calendar({
  availability,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: CalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  useEffect(() => {
    onMonthChange(currentYear, currentMonth + 1);
  }, [currentYear, currentMonth]);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const todayStr = today.toISOString().split('T')[0];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  function dateStr(day: number): string {
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  }

  function getSlotLevel(date: string): number {
    const count = availability[date];
    if (count === undefined) return 0;
    if (count >= 16) return 3;
    if (count >= 8) return 2;
    if (count > 0) return 1;
    return 0;
  }

  return (
    <div className="select-none rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-base font-semibold text-slate-800">
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center">
        {DAYS.map((day) => (
          <span key={day} className="py-1 text-xs font-medium text-slate-400">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

          const date = dateStr(day);
          const isPast = date < todayStr;
          const isSelected = date === selectedDate;
          const level = isPast ? 0 : getSlotLevel(date);
          const hasSlots = level > 0;

          return (
            <button
              key={date}
              type="button"
              disabled={isPast || !hasSlots}
              onClick={() => onSelectDate(date)}
              className={`relative flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition ${
                isSelected
                  ? 'bg-celeste text-white shadow-sm'
                  : isPast
                    ? 'text-slate-300'
                    : hasSlots
                      ? 'text-slate-700 hover:bg-celeste-pale'
                      : 'text-slate-400'
              }`}
            >
              {day}
              {!isPast && hasSlots && (
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${
                    level >= 3
                      ? 'bg-emerald-500'
                      : level === 2
                        ? 'bg-celeste'
                        : 'bg-amber-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Muchos
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-celeste" /> Algunos
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Pocos
        </span>
      </div>
    </div>
  );
}
