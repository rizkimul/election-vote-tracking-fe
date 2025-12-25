import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl, getApiHeaders, authenticatedFetch } from '../lib/api';

interface User {
  nik: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  useEffect(() => {
    // Check if token exists on mount
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Ideally here we would validate the token with /auth/me or decode it
      // For now, let's assume if token exists, we are "logged in" sufficiently to reach the dashboard
      // You can add a fetch to /auth/me here later
       fetchUser();
    }
  }, []);

  const fetchUser = async () => {
      try {
          // Use authenticatedFetch to handle auto-refresh
          const res = await authenticatedFetch(getApiUrl('/auth/me'));
          if (res.ok) {
              const userData = await res.json();
              setUser(userData);
          } else {
              // Token invalid and refresh failed
              logout();
          }
      } catch (e) {
          console.error("Failed to fetch user", e);
      }
  }

  const login = (newToken: string, newRefreshToken: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    setToken(newToken);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
