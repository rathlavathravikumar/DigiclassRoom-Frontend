import { http } from "@/lib/http";

export const adminApi = {
  registerAdmin: (payload: { name: string; clgName: string; email: string; password: string }) =>
    http.post("/api/v1/admin/register", payload).then(r => r.data),
  loginAdmin: (payload: { email: string; password: string }) =>
    http.post("/api/v1/admin/login", payload).then(r => r.data),
  me: () => http.get("/api/v1/admin/me").then(r => r.data),
  createTeacher: (payload: { name: string; email: string; password: string }) =>
    http.post("/api/v1/admin/users/teacher", payload).then(r => r.data),
  createStudent: (payload: { name: string; email: string; password: string; class_id: string }) =>
    http.post("/api/v1/admin/users/student", payload).then(r => r.data),
  listUsers: (role?: "teacher" | "student") =>
    http.get("/api/v1/admin/users", { params: role ? { role } : undefined }).then(r => r.data),
};
