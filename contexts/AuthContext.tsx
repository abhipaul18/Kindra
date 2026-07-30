'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import type { UserRole, Profile } from '@/src/types/database';
import {
  signInUser,
  signUpUser,
  signInWithGoogle,
  signOutUser,
  resetUserPassword,
  getCurrentUserRole,
} from '@/services/authService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  login: typeof signInUser;
  register: typeof signUpUser;
  loginWithGoogle: typeof signInWithGoogle;
  logout: () => Promise<void>;
  resetPassword: typeof resetUserPassword;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const userRole = await getCurrentUserRole(session.user.id);
        setRole(userRole);

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole('citizen');
      }
    } catch (err) {
      console.error('Error restoring auth session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const userRole = await getCurrentUserRole(session.user.id);
          setRole(userRole);
        } else {
          setUser(null);
          setProfile(null);
          setRole('citizen');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    setUser(null);
    setProfile(null);
    setRole('citizen');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        login: signInUser,
        register: signUpUser,
        loginWithGoogle: signInWithGoogle,
        logout: handleLogout,
        resetPassword: resetUserPassword,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
