import { http } from "@/lib/http";

export const adminApi = {
  registerAdmin: (payload: { name: string; clgName: string; email: string; password: string }) =>
    http.post("/api/v1/admin/register", payload).then(r => r.data),
  loginAdmin: (payload: { email: string; password: string }) =>
    http.post("/api/v1/admin/login", payload).then(r => r.data),
  me: () => http.get("/api/v1/admin/me").then(r => r.data),
  createTeacher: (payload: { name: string; email: string; password: string; clg_id?: string }) =>
    http.post("/api/v1/admin/users/teacher", payload).then(r => r.data),
  createStudent: (payload: { name: string; email: string; password: string; clg_id: string }) =>
    http.post("/api/v1/admin/users/student", payload).then(r => r.data),
  listUsers: (role?: "teacher" | "student") =>
    http.get("/api/v1/admin/users", { params: role ? { role } : undefined }).then(r => r.data),

  // Courses
  listCourses: (params?: { teacher_id?: string }) =>
    http.get("/api/v1/courses", { params }).then(r => r.data),
  getCourse: (id: string) => http.get(`/api/v1/courses/${id}`).then(r => r.data),
  createCourse: (payload: { name: string; code: string; description?: string; teacher_id: string }) =>
    http.post("/api/v1/courses", payload).then(r => r.data),
  updateCourse: (id: string, payload: Record<string, any>) =>
    http.patch(`/api/v1/courses/${id}`, payload).then(r => r.data),
  deleteCourse: (id: string) => http.delete(`/api/v1/courses/${id}`).then(r => r.data),

  // Admin-only course management
  assignCourseTeacher: (id: string, teacher_id: string) =>
    http.patch(`/api/v1/courses/${id}/teacher`, { teacher_id }).then(r => r.data),
  updateCourseStudents: (id: string, payload: { add_clg_ids?: string[]; remove_clg_ids?: string[]; set_clg_ids?: string[] }) =>
    http.patch(`/api/v1/courses/${id}/students`, payload).then(r => r.data),
  getCoursePlan: (id: string) => http.get(`/api/v1/courses/${id}/plan`).then(r => r.data),
  setCoursePlan: (id: string, course_plan: string) =>
    http.patch(`/api/v1/courses/${id}/plan`, { course_plan }).then(r => r.data),
};
