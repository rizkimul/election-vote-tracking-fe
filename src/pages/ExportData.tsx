import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Download, Filter, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';
import { DAPIL_OPTIONS, KECAMATAN_DATA, getKecamatanByDapil, getDesaByKecamatan, getGenerationCategory } from '../lib/wilayah-data';

interface Attendee {
  id: number;
  nik: string;
  name: string;
  kecamatan: string;
  desa: string;
  alamat: string;
  jenis_kelamin: string;
  pekerjaan: string;
  usia: number;
}

export function ExportData() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dapil: '',
    kecamatan: '',
    desa: ''
  });

  // Get filtered kecamatan options based on selected dapil
  const kecamatanOptions = filters.dapil 
    ? getKecamatanByDapil(filters.dapil).map(k => k.name)
    : KECAMATAN_DATA.map(k => k.name);

  // Get desa options based on selected kecamatan
  const desaOptions = filters.kecamatan 
    ? getDesaByKecamatan(filters.kecamatan).map(d => d.name)
    : [];

  useEffect(() => {
    fetchAttendees();
  }, [filters]);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.kecamatan) params.append('kecamatan', filters.kecamatan);
      if (filters.desa) params.append('desa', filters.desa);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(getApiUrl(`/events/attendees/all${queryString}`), {
        headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAttendees(data);
      } else {
        toast.error("Gagal memuat data peserta");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (attendees.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    // CSV Header
    const headers = ["Nama", "NIK", "Alamat", "Jenis Kelamin", "Pekerjaan", "Usia", "Generasi"];
    
    // CSV Rows
    const rows = attendees.map(row => [
      `"${row.name || ''}"`,
      row.nik || '',
      `"${row.alamat || ''}"`,
      row.jenis_kelamin === 'L' ? 'Laki-laki' : row.jenis_kelamin === 'P' ? 'Perempuan' : '',
      `"${row.pekerjaan || ''}"`,
      row.usia || '',
      row.usia ? getGenerationCategory(row.usia) : ''
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // Download Logic
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filterLabel = filters.kecamatan ? `_${filters.kecamatan}` : '';
    link.setAttribute("download", `peserta_kegiatan${filterLabel}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${attendees.length} data berhasil diekspor ke CSV`);
  };

  const handleDapilChange = (value: string) => {
    const val = value === "ALL" ? "" : value;
    setFilters({ dapil: val, kecamatan: '', desa: '' });
  };

  const handleKecamatanChange = (value: string) => {
    const val = value === "ALL" ? "" : value;
    setFilters({ ...filters, kecamatan: val, desa: '' });
  };

  const handleDesaChange = (value: string) => {
    const val = value === "ALL" ? "" : value;
    setFilters({ ...filters, desa: val });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Export Data Peserta</h2>
          <p className="text-gray-500">Filter dan export data peserta kegiatan</p>
        </div>
        <Button onClick={handleExport} disabled={attendees.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export ke CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-sm">Dapil</Label>
              <Select value={filters.dapil || "ALL"} onValueChange={handleDapilChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Dapil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Dapil</SelectItem>
                  {DAPIL_OPTIONS.map(dapil => (
                    <SelectItem key={dapil} value={dapil}>{dapil}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Kecamatan</Label>
              <Select value={filters.kecamatan || "ALL"} onValueChange={handleKecamatanChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kecamatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kecamatan</SelectItem>
                  {kecamatanOptions.map(kec => (
                    <SelectItem key={kec} value={kec}>{kec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Desa/Kelurahan</Label>
              <Select 
                value={filters.desa || "ALL"} 
                onValueChange={handleDesaChange}
                disabled={!filters.kecamatan}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filters.kecamatan ? "Pilih Desa" : "Pilih Kecamatan dulu"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Desa</SelectItem>
                  {desaOptions.map(desa => (
                    <SelectItem key={desa} value={desa}>{desa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Data Peserta ({attendees.length} orang)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>NIK</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Jenis Kelamin</TableHead>
                  <TableHead>Pekerjaan</TableHead>
                  <TableHead>Usia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Memuat data...</TableCell>
                  </TableRow>
                ) : attendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Tidak ada data peserta
                    </TableCell>
                  </TableRow>
                ) : (
                  attendees.slice(0, 50).map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell className="font-medium">{attendee.name}</TableCell>
                      <TableCell>{attendee.nik}</TableCell>
                      <TableCell>{attendee.alamat || '-'}</TableCell>
                      <TableCell>
                        {attendee.jenis_kelamin === 'L' ? 'Laki-laki' : 
                         attendee.jenis_kelamin === 'P' ? 'Perempuan' : '-'}
                      </TableCell>
                      <TableCell>{attendee.pekerjaan || '-'}</TableCell>
                      <TableCell>{attendee.usia || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {attendees.length > 50 && (
            <p className="text-sm text-gray-500 mt-2">
              Menampilkan 50 dari {attendees.length} data. Export untuk melihat semua data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
