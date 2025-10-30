import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { User, Bell, Shield, Database, Users } from 'lucide-react';

export function Settings() {
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
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">AD</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">Ubah Foto</Button>
              <p className="mt-1 text-sm text-gray-500">JPG, PNG atau GIF (maks. 2MB)</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <Input id="email" type="email" defaultValue="admin@votetrack.id" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input id="phone" defaultValue="+62 812 3456 7890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <Input id="role" defaultValue="Administrator Sistem" disabled />
            </div>
          </div>

          <Button>Simpan Perubahan</Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Notifikasi Email</p>
                <p className="text-sm text-gray-500">Terima pembaruan via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Peringatan Import Data</p>
                <p className="text-sm text-gray-500">Notifikasi saat import selesai</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">Laporan Mingguan</p>
                <p className="text-sm text-gray-500">Terima ringkasan mingguan</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Ubah Kata Sandi
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Aktifkan Autentikasi Dua Faktor
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Lihat Riwayat Login
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manajemen Pengguna
          </CardTitle>
          <CardDescription>Kelola pengguna dan hak akses sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Admin User', email: 'admin@votetrack.id', role: 'Administrator', status: 'Aktif' },
              { name: 'Koordinator Lapangan', email: 'koordinator@votetrack.id', role: 'Koordinator', status: 'Aktif' },
              { name: 'Entry Data', email: 'dataentry@votetrack.id', role: 'Entry Data', status: 'Aktif' },
              { name: 'Analis', email: 'analis@votetrack.id', role: 'Analis', status: 'Nonaktif' },
            ].map((user, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{user.role}</Badge>
                  <Badge variant={user.status === 'Aktif' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline">
            <User className="mr-2 h-4 w-4" />
            Tambah Pengguna Baru
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Info Sistem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Data</span>
            <span className="text-gray-900">32.450</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ukuran Database</span>
            <span className="text-gray-900">2,3 GB</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Backup Terakhir</span>
            <span className="text-gray-900">2025-10-29</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Versi Sistem</span>
            <span className="text-gray-900">v2.1.0</span>
          </div>
          <Button variant="outline" className="mt-4 w-full">
            Backup Database
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
