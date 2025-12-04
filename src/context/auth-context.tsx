'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, Auth } from 'firebase/auth';
import { initializeFirebase } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | undefined>(undefined);

  useEffect(() => {
    const { auth: firebaseAuth } = initializeFirebase();
    setAuth(firebaseAuth);

    if (firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If auth is not initialized, stop loading and show unauthenticated state.
      setLoading(false);
    }
  }, []);

  const login = (user: User | null) => {
    setUser(user);
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
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
