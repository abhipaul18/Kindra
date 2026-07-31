'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';

import { AuthLoginView } from '@/src/components/views/AuthLoginView';

export default function LoginPage() {
  return (
    <AuthLoginView
      onLoginSuccess={() => {
        window.location.href = '/citizen/dashboard';
      }}
    />
  );
}
