'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await registerUser(data.email, data.password, data.full_name);
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account. Email may already be registered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile md:px-margin-desktop">
      <div className="w-full max-w-md flex flex-col gap-md">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-secondary text-on-secondary font-extrabold text-2xl flex items-center justify-center shadow-md">
            K
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Join Kindra</h1>
          <p className="text-sm text-on-surface-variant">Create your Citizen Account and start contributing.</p>
        </div>

        {/* Registration Card */}
        <Card className="p-lg gap-md border-outline-variant/30">
          {errorMessage && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-secondary-container/30 text-on-secondary-container border border-secondary/30 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-secondary">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              icon="person"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon="mail"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon="lock"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon="lock_reset"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button
              type="submit"
              variant="secondary"
              isLoading={isLoading}
              className="w-full font-bold mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
            Already have an account?{' '}
            <a href="/auth/login" className="font-bold text-primary hover:underline">
              Sign In
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
