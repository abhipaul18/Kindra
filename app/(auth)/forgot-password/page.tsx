'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await resetPassword(data.email);
      setSuccessMessage('Password reset link sent! Please check your email inbox.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile md:px-margin-desktop">
      <div className="w-full max-w-md flex flex-col gap-md">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-on-tertiary font-extrabold text-2xl flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-3xl">key</span>
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Password Recovery</h1>
          <p className="text-sm text-on-surface-variant">Enter your account email to receive a password reset link.</p>
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
              <span className="material-symbols-outlined text-base text-secondary">mark_email_read</span>
              <span>{successMessage}</span>
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

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full font-bold"
            >
              Send Recovery Link
            </Button>
          </form>

          <div className="text-center text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
            Remembered your password?{' '}
            <a href="/login" className="font-bold text-primary hover:underline">
              Back to Login
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
