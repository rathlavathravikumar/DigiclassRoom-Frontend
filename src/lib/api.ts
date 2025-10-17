const BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||  'http://localhost:3001';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = (typeof window !== 'undefined') ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as any || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`.replace(/\/+$/, '').replace(/(?<!:)\/\/+/, '/'), {
    headers,
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return res.json();
  }
  return (undefined as unknown) as T;
}

export type ApiEnvelope<T> = { statusCode?: number; data: T; message?: string };

export const api = {
  getCourses: async (params?: { teacher_id?: string }) => {
    const qs = params?.teacher_id ? `?teacher_id=${encodeURIComponent(params.teacher_id)}` : '';
    return http<ApiEnvelope<any[]>>(`/api/v1/courses/${qs}`);
  },
  getCourse: async (id: string) => {
    return http<ApiEnvelope<any>>(`/api/v1/courses/${id}`);
  },
  getAssignments: async (params?: { course_id?: string; teacher_id?: string }) => {
    const q: string[] = [];
    if (params?.course_id) q.push(`course_id=${encodeURIComponent(params.course_id)}`);
    if (params?.teacher_id) q.push(`teacher_id=${encodeURIComponent(params.teacher_id)}`);
    const qs = q.length ? `?${q.join('&')}` : '';
    return http<ApiEnvelope<any[]>>(`/api/v1/assignments/${qs}`);
  },
  getAssignment: async (id: string) => {
    return http<ApiEnvelope<any>>(`/api/v1/assignments/${id}`);
  },
  getTests: async () => {
    return http<ApiEnvelope<any[]>>(`/api/v1/tests/`);
  },
  registerStudent: async (payload: { name: string; email: string; password: string; class_id: string }) => {
    return http<ApiEnvelope<any>>(`/api/v1/student/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  teacherLogin: async (payload: { email: string; password: string }) =>
    http<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(`/api/v1/teacher/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  studentLogin: async (payload: { email: string; password: string }) =>
    http<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(`/api/v1/student/login`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  teacherMe: async () => http<ApiEnvelope<any>>(`/api/v1/teacher/me`),
  studentMe: async () => http<ApiEnvelope<any>>(`/api/v1/student/me`),
};
