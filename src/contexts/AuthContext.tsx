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
  clgName?: string;
  clg_id?: string;
  admin_id?: string;
  createdAt?: string;
  updatedAt?: string;
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
  updateUser: (updatedUserData: Partial<User>) => void;
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
          const u = (resp as any)?.data?.user || (resp as any)?.data;
          if (u) {
            const userData = {
              ...u,
              role: 'admin',
              name: u.name || u.username || u.fullName || u.email?.split('@')[0] || 'Admin'
            };
            setUser(userData as User);
          }
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
        const u = (me as any)?.data?.user || (me as any)?.data;
        if (u) {
          const userData = {
            ...u,
            role: 'teacher',
            name: u.name || u.username || u.fullName || email.split('@')[0]
          };
          console.log('Teacher user data:', userData);
          setUser(userData as User);
        }
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.error('Teacher login error:', err);
    }
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
        const u = (me as any)?.data?.user || (me as any)?.data;
        if (u) {
          const userData = {
            ...u,
            role: 'student',
            name: u.name || u.username || u.fullName || email.split('@')[0]
          };
          console.log('Student user data:', userData);
          setUser(userData as User);
        }
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.error('Student login error:', err);
    }
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
        if (admin) {
          const userData = {
            ...admin,
            role: 'admin',
            name: admin.name || payload.name
          };
          setUser(userData as User);
        }
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
        const u = (me as any)?.data?.user || (me as any)?.data;
        if (u) {
          const userData = {
            ...u,
            role: 'admin',
            name: u.name || u.username || u.fullName || email.split('@')[0]
          };
          console.log('Admin user data:', userData);
          setUser(userData as User);
        }
        setIsLoading(false);
        return true;
      }
    } catch (err) {
      console.error('Admin login error:', err);
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    clearTokens();
  };

  const updateUser = (updatedUserData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedUserData };
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, adminSignup, adminLogin, teacherLogin, studentLogin, login, logout, updateUser }}>
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