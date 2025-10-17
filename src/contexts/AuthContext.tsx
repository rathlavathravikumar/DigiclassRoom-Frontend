import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '@/lib/adminApi';
import { api } from '@/lib/api';

export type UserRole = 'student' | 'teacher' | 'admin';

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  class_id?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  adminSignup: (payload: { name: string; clgName: string; email: string; password: string }) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  teacherLogin: (email: string, password: string) => Promise<boolean>;
  studentLogin: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setTokens = (accessToken?: string, refreshToken?: string) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Try admin me first (current scope is admin-only flow)
          const resp = await adminApi.me();
          const u = (resp as any)?.data?.user;
          if (u) setUser({ ...u, role: 'admin' });
        }
      } catch (_) {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const teacherLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await api.teacherLogin({ email, password });
      const data: any = (resp as any);
      const tokens = data?.data || data; // support envelope
      if (tokens?.accessToken) {
        setTokens(tokens.accessToken, tokens.refreshToken);
        const me = await api.teacherMe();
        const u = (me as any)?.data?.user;
        if (u) setUser({ ...u, role: 'teacher' });
        setIsLoading(false);
        return true;
      }
    } catch (_) {}
    setIsLoading(false);
    return false;
  };

  const studentLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await api.studentLogin({ email, password });
      const data: any = (resp as any);
      const tokens = data?.data || data;
      if (tokens?.accessToken) {
        setTokens(tokens.accessToken, tokens.refreshToken);
        const me = await api.studentMe();
        const u = (me as any)?.data?.user;
        if (u) setUser({ ...u, role: 'student' });
        setIsLoading(false);
        return true;
      }
    } catch (_) {}
    setIsLoading(false);
    return false;
  };

  const login = (email: string, password: string, role: UserRole) => {
    if (role === 'admin') return adminLogin(email, password);
    if (role === 'teacher') return teacherLogin(email, password);
    return studentLogin(email, password);
  };

  const adminSignup = async (payload: { name: string; clgName: string; email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await adminApi.registerAdmin(payload);
      const data = (resp as any)?.data;
      if (data?.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
        const admin = data.admin;
        if (admin) setUser({ ...admin, role: 'admin' });
        setIsLoading(false);
        return true;
      }
    } catch (_) {}
    setIsLoading(false);
    return false;
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resp = await adminApi.loginAdmin({ email, password });
      const data = (resp as any)?.data;
      if (data?.accessToken) {
        setTokens(data.accessToken, data.refreshToken);
        // fetch me to populate user
        const me = await adminApi.me();
        const u = (me as any)?.data?.user;
        if (u) setUser({ ...u, role: 'admin' });
        setIsLoading(false);
        return true;
      }
    } catch (_) {}
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    clearTokens();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, adminSignup, adminLogin, teacherLogin, studentLogin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};