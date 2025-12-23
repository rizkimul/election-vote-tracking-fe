import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
      username: '',
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
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Periksa Username dan Password anda.');
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-3">
            <img 
              src="/app-logo.jpeg" 
              alt="SABADESA Logo" 
              className="h-16 w-16 rounded-lg object-cover shadow-md"
            />
          </div>
          <CardTitle className="text-xl font-bold text-blue-900">SABADESA</CardTitle>
          <CardDescription className="text-xs">
            Saeful Bachri Dewan Sararea
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {serverError && (
                <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">{serverError}</AlertDescription>
                </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm">Username</Label>
              <Input
                id="username"
                placeholder="Masukkan username"
                {...register('username')}
                className={`h-9 text-sm ${errors.username ? "border-red-500" : ""}`}
              />
              {errors.username && (
                  <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                {...register('password')}
                className={`h-9 text-sm ${errors.password ? "border-red-500" : ""}`}
              />
               {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-sm" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
          <div className="mt-3 text-center text-xs text-gray-500">
            Belum punya akun? Hubungi Administrator
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
