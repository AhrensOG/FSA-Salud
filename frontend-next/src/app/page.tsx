import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-celeste-pale px-6">
      <header className="flex items-center gap-3 pt-12 pb-8">
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
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 -mt-12">
        <div className="flex flex-col items-center gap-2">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="48" fill="#e0f7ff" stroke="#4fc3f7" strokeWidth="2" />
            <rect x="42" y="22" width="16" height="56" rx="8" fill="#4fc3f7" />
            <rect x="22" y="42" width="56" height="16" rx="8" fill="#4fc3f7" />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">¡Hola!</h1>
          <p className="mt-2 text-lg text-slate-500">Tu salud, más cerca</p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-celeste px-6 py-4 text-base font-semibold text-white shadow transition active:scale-[0.98] active:bg-celeste-dark"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Iniciar sesión
          </Link>

          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 shadow-sm transition active:scale-[0.98] active:bg-slate-50"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Registrarse
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        FSA Salud &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
