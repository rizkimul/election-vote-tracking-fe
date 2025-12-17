import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { User, Shield, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';

interface UserProfile {
  id: number;
  nik: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export function Settings() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(getApiUrl('/auth/me'), {
        headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || ''
        });
      }
    } catch (e) {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(getApiUrl('/auth/me'), {
        method: 'PUT',
        headers: getApiHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }),
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan profil');
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      toast.success('Profil berhasil diperbarui');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(getApiUrl('/auth/me/password'), {
        method: 'PUT',
        headers: getApiHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }),
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal mengubah password');
      }

      toast.success('Password berhasil diubah');
      setShowPasswordForm(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profil Pengguna</CardTitle>
          <CardDescription>Kelola informasi akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {profile?.name ? getInitials(profile.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-lg">{profile?.name}</p>
              <p className="text-sm text-gray-500">NIK: {profile?.nik}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input 
                id="fullName" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62 812 3456 7890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <Input id="role" value={profile?.role || 'user'} disabled />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showPasswordForm ? (
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowPasswordForm(true)}
              >
                Ubah Kata Sandi
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Password Saat Ini</Label>
                  <Input 
                    type="password" 
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password Baru</Label>
                  <Input 
                    type="password" 
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password Baru</Label>
                  <Input 
                    type="password" 
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={changingPassword} size="sm">
                    {changingPassword ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-400"
              disabled
            >
              Aktifkan Autentikasi Dua Faktor (Segera)
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-400"
              disabled
            >
              Lihat Riwayat Login (Segera)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manajemen Pengguna
          </CardTitle>
          <CardDescription>Fitur ini akan tersedia di versi mendatang</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Manajemen pengguna (tambah, edit, hapus user) akan tersedia di pembaruan selanjutnya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
