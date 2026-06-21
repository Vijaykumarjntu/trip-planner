import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient } from '../lib/api';

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('token');
      if (t) setToken(t);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await apiClient().post('/auth/login', { email, password });
    const t = res.data.token;
    localStorage.setItem('token', t);
    setToken(t);
  }

  async function register(email: string, password: string, name?: string) {
    await apiClient().post('/auth/register', { email, password, name });
    // auto-login after register
    await login(email, password);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
