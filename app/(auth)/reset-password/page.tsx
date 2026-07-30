'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth';
import { supabase } from '@/src/lib/supabase';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

export default function ResetPasswordPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      setSuccessMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password. Please request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile md:px-margin-desktop">
      <div className="w-full max-w-md flex flex-col gap-md">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary font-extrabold text-2xl flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Set New Password</h1>
          <p className="text-sm text-on-surface-variant">Enter your new password below.</p>
        </div>

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
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon="lock"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              icon="lock_reset"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full font-bold mt-2"
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
