const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { headers: extraHeaders, ...rest } = options;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error del servidor' }));
    throw new Error(error.message || `Error ${res.status}`);
  }

  return res.json();
}

export async function login(email: string, password: string) {
  return api<{ user: any; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  address: string;
  city: string;
  role: string;
}) {
  return api<{ user: any; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export async function authApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return api<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function getFutureAppointments() {
  return authApi<any[]>('/appointments/mine');
}

export async function getPendingPrescriptions() {
  return authApi<any[]>('/prescriptions/pending');
}

export async function getDoctorAppointments() {
  return authApi<any[]>('/appointments/doctor');
}

export async function getDoctors(specialty?: string) {
  const query = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
  return authApi<any[]>(`/doctors${query}`);
}

export async function getSpecialties() {
  return authApi<string[]>('/specialties');
}

export async function getDoctorAvailability(doctorId: string, date: string) {
  return authApi<{ date: string; slots: string[] }>(
    `/doctors/${doctorId}/availability?date=${date}`,
  );
}

export async function getDoctorMonthAvailability(
  doctorId: string,
  year: number,
  month: number,
) {
  return authApi<Record<string, number>>(
    `/doctors/${doctorId}/availability/month?year=${year}&month=${month}`,
  );
}

export async function createAppointment(data: {
  date: string;
  time: string;
  reason: string;
  type: string;
  doctorId: string;
}) {
  return authApi<any>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createMedicalRecord(appointmentId: string, data: {
  diagnosis: string;
  treatment?: string;
  observations?: string;
  medications?: string;
  studyItems?: { name: string; results?: string }[];
}) {
  return authApi<any>(`/appointments/${appointmentId}/medical-record`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createPrescription(data: {
  patientId: string;
  diagnosis: string;
  items: { medicationName: string; dosage: string; frequency: string; duration: string; quantity: number }[];
}) {
  return authApi<any>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStudyResults(studyId: string, results: string) {
  return authApi<any>(`/studies/${studyId}/results`, {
    method: 'PATCH',
    body: JSON.stringify({ results }),
  });
}
