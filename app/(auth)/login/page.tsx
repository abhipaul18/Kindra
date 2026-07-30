'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(data.email, data.password);
      window.location.href = '/';
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize Google Sign-In.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile md:px-margin-desktop">
      <div className="w-full max-w-md flex flex-col gap-md">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary font-extrabold text-2xl flex items-center justify-center shadow-md">
            K
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Sign in to Kindra</h1>
          <p className="text-sm text-on-surface-variant">Together We Act. Together We Build.</p>
        </div>

        {/* Login Card */}
        <Card className="p-lg gap-md border-outline-variant/30">
          {errorMessage && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon="mail"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon="lock"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end">
                <a
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline mt-1"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full font-bold"
            >
              Sign In
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-outline-variant/40 w-full" />
            <span className="bg-surface-container-lowest px-3 text-xs text-outline uppercase font-semibold">
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full flex items-center gap-2 justify-center font-semibold"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
            Don't have an account?{' '}
            <a href="/auth/register" className="font-bold text-primary hover:underline">
              Create a Citizen Account
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
