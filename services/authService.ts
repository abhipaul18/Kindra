import { supabase } from '@/src/lib/supabase';
import type { UserRole } from '@/src/types/database';

export async function signUpUser(email: string, password: string, fullName: string) {
  console.log('[Auth Debug] Starting email/password signup for:', email);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    console.log('[Auth Debug] Signup successful for:', email);
    return data;
  } catch (err) {
    console.error('[Auth Debug] Signup error:', err);
    throw err;
  }
}

export async function signInUser(email: string, password: string) {
  console.log('[Auth Debug] Starting email/password login for:', email);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    console.log('[Auth Debug] Login successful for:', email);
    return data;
  } catch (err) {
    console.error('[Auth Debug] Login error:', err);
    throw err;
  }
}

export async function signInWithGoogle() {
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
  console.log('[Auth Debug] Starting Google OAuth login with redirect to:', `${origin}/auth/callback`);
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) throw error;
    console.log('[Auth Debug] Google OAuth redirect initiated');
    return data;
  } catch (err) {
    console.error('[Auth Debug] Google OAuth error:', err);
    throw err;
  }
}

export async function signOutUser() {
  console.log('[Auth Debug] Starting signout...');
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('[Auth Debug] Signout completed');
  } catch (err) {
    console.error('[Auth Debug] Signout error:', err);
    throw err;
  }
}

export async function resetUserPassword(email: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '');
  console.log('[Auth Debug] Requesting password reset for:', email);
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });
    if (error) throw error;
    console.log('[Auth Debug] Password reset email sent to:', email);
    return data;
  } catch (err) {
    console.error('[Auth Debug] Reset password error:', err);
    throw err;
  }
}

export async function getCurrentUserRole(userId: string): Promise<UserRole> {
  console.log('[Auth Debug] Fetching role for user:', userId);
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      console.warn('[Auth Debug] User role query returned fallback citizen role:', error?.message);
      return 'citizen';
    }
    console.log('[Auth Debug] Role resolved:', data.role);
    return data.role as UserRole;
  } catch (err) {
    console.warn('[Auth Debug] Role fetch exception, using fallback citizen role:', err);
    return 'citizen';
  }
}
