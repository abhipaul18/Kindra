import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      console.log('[Auth Debug] OAuth callback exchanging authorization code for session...');
      await supabase.auth.exchangeCodeForSession(code);
      console.log('[Auth Debug] OAuth session exchange completed successfully.');
    } catch (err) {
      console.error('[Auth Debug] OAuth session exchange error (redirecting anyway):', err);
    }
  }

  console.log('[Auth Debug] OAuth callback redirecting to /');
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
