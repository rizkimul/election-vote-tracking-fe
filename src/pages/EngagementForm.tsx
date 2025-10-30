import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { UserPlus, Trash2 } from 'lucide-react';

interface EngagementEntry {
  id: string;
  nik: string;
  name: string;
  subdistrict: string;
  village: string;
  hamlet: string;
  rtRw: string;
  source: string;
  potentialVotes: number;
  date: string;
}

const engagementSources = [
  { value: 'recess', label: 'Reses', votes: 150 },
  { value: 'oversight', label: 'Pengawasan Pemerintah', votes: 100 },
  { value: 'education', label: 'Pendidikan Demokrasi', votes: 50 },
  { value: 'dialogue', label: 'Dialog dengan Perwakilan', votes: 100 },
  { value: 'cultural', label: 'Silaturahmi Budaya', votes: 100 },
];

export function EngagementForm() {
  const [entries, setEntries] = useState<EngagementEntry[]>([
    {
      id: '1',
      nik: '3201234567890001',
      name: 'Ahmad Pratama',
      subdistrict: 'Kecamatan A',
      village: 'Desa 1',
      hamlet: 'Dusun 1',
      rtRw: 'RT 01/RW 02',
      source: 'Reses',
      potentialVotes: 150,
      date: '2025-10-28',
    },
    {
      id: '2',
      nik: '3201234567890002',
      name: 'Siti Nurhaliza',
      subdistrict: 'Kecamatan B',
      village: 'Desa 2',
      hamlet: 'Dusun 3',
      rtRw: 'RT 03/RW 04',
      source: 'Pendidikan Demokrasi',
      potentialVotes: 50,
      date: '2025-10-27',
    },
  ]);

  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    subdistrict: '',
    village: '',
    hamlet: '',
    rtRw: '',
    source: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate NIK
    if (entries.some((entry) => entry.nik === formData.nik)) {
      toast.error('NIK sudah terdaftar dalam database');
      return;
    }

    const source = engagementSources.find((s) => s.value === formData.source);
    if (!source) {
      toast.error('Silakan pilih sumber engagement');
      return;
    }

    const newEntry: EngagementEntry = {
      id: Date.now().toString(),
      ...formData,
      source: source.label,
      potentialVotes: source.votes,
      date: new Date().toISOString().split('T')[0],
    };

    setEntries([newEntry, ...entries]);
    setFormData({
      nik: '',
      name: '',
      subdistrict: '',
      village: '',
      hamlet: '',
      rtRw: '',
      source: '',
    });

    toast.success('Data engagement berhasil ditambahkan');
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
    toast.success('Data berhasil dihapus');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Tambah Data Engagement</CardTitle>
          <CardDescription>Daftarkan data partisipan engagement baru</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nik">Nomor Induk Kependudukan (NIK)</Label>
              <Input
                id="nik"
                placeholder="16 digit"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                maxLength={16}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Sumber Engagement</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sumber" />
                </SelectTrigger>
                <SelectContent>
                  {engagementSources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label} ({source.votes} suara)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdistrict">Kecamatan</Label>
              <Input
                id="subdistrict"
                placeholder="Masukkan kecamatan"
                value={formData.subdistrict}
                onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="village">Desa</Label>
              <Input
                id="village"
                placeholder="Masukkan desa"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hamlet">Dusun</Label>
              <Input
                id="hamlet"
                placeholder="Masukkan dusun"
                value={formData.hamlet}
                onChange={(e) => setFormData({ ...formData, hamlet: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rtRw">RT/RW</Label>
              <Input
                id="rtRw"
                placeholder="contoh: RT 01/RW 02"
                value={formData.rtRw}
                onChange={(e) => setFormData({ ...formData, rtRw: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Data Engagement</CardTitle>
          <CardDescription>Pendaftaran partisipan terkini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIK</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Sumber</TableHead>
                  <TableHead className="text-right">Potensi Suara</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-sm">{entry.nik}</TableCell>
                    <TableCell>{entry.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{entry.village}</div>
                        <div className="text-gray-500">
                          {entry.hamlet} • {entry.rtRw}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.source}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{entry.potentialVotes}</TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
