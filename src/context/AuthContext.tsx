import React, { createContext, useContext, useState, useEffect } from 'react';
import { FamilyUser } from '../types/index.ts';
import { api } from '../api/index.ts';

interface AuthContextType {
  user: FamilyUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; familyName: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FamilyUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.getMe();
      if (res && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.warn('Could not load current user session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('carecircle_token', res.token);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; name: string; familyName?: string }) => {
    const res = await api.register(data);
    localStorage.setItem('carecircle_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('carecircle_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
