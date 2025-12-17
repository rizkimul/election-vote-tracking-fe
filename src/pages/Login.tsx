import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Vote, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginSchema, LoginFormValues } from '../lib/validation-schemas';
import { getApiUrl, getApiHeaders } from '../lib/api';

export function Login() {
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nik: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setServerError('');

    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          nik: data.nik, // Field matches schema
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Periksa NIK dan Password anda.');
      }

      const resData = await response.json();
      login(resData.access_token);
    } catch (err: any) {
      setServerError(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <Vote className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">VoteTrack</CardTitle>
          <CardDescription>Masuk untuk mengakses Dashboard Pemenangan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="nik">NIK</Label>
              <Input
                id="nik"
                placeholder="Masukkan NIK (16 digit)"
                {...register('nik')}
                className={errors.nik ? "border-red-500" : ""}
                maxLength={16}
              />
              {errors.nik && (
                  <p className="text-xs text-red-500">{errors.nik.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Lupa password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? "border-red-500" : ""}
              />
               {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-500">
            Belum punya akun? Hubungi Administrator
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

