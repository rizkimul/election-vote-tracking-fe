import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Download, Filter, Users } from 'lucide-react';
import { Combobox } from '../components/ui/combobox';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';
import { DAPIL_OPTIONS, KECAMATAN_DATA, getKecamatanByDapil, getDesaByKecamatan, getGenerationCategory } from '../lib/wilayah-data';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

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
      if (filters.kecamatan) {
        params.append('kecamatan', filters.kecamatan);
      } else if (filters.dapil) {
        // If Dapil is selected but no specific Kecamatan, include ALL Kecamatans in that Dapil
        const dapilKecamatans = getKecamatanByDapil(filters.dapil);
        dapilKecamatans.forEach(k => {
          params.append('kecamatan', k.name);
        });
      }
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

  const getExportFilename = (extension: string) => {
    let filterLabel = '';
    if (filters.kecamatan) {
      filterLabel = `_${filters.kecamatan}`;
    } else if (filters.dapil) {
      filterLabel = `_${filters.dapil}`;
    }
    return `peserta_kegiatan${filterLabel}_${new Date().toISOString().slice(0,10)}.${extension}`;
  };

  // Helper to format full address
  const formatAddress = (att: Attendee) => {
    const parts = [];
    if (att.alamat) parts.push(att.alamat);
    if (att.desa) parts.push(att.desa);
    if (att.kecamatan) parts.push(att.kecamatan);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const handleExportCSV = () => {
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
      `"${formatAddress(row)}"`,
      row.jenis_kelamin === 'L' ? 'Laki-laki' : row.jenis_kelamin === 'P' ? 'Perempuan' : '',
      `"${row.pekerjaan || ''}"`,
      row.usia || '',
      row.usia ? getGenerationCategory(row.usia) : ''
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", getExportFilename('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${attendees.length} data berhasil diekspor ke CSV`);
  };

  const handleExportExcel = () => {
    if (attendees.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const data = attendees.map(row => ({
      "Nama": row.name,
      "NIK": row.nik,
      "Alamat": formatAddress(row),
      "Jenis Kelamin": row.jenis_kelamin === 'L' ? 'Laki-laki' : row.jenis_kelamin === 'P' ? 'Perempuan' : '',
      "Pekerjaan": row.pekerjaan,
      "Usia": row.usia,
      "Generasi": row.usia ? getGenerationCategory(row.usia) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Peserta");
    
    XLSX.writeFile(wb, getExportFilename('xlsx'));
    toast.success(`${attendees.length} data berhasil diekspor ke Excel`);
  };

  const handleExportPDF = () => {
    if (attendees.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text("Data Peserta Kegiatan", 14, 15);
    doc.setFontSize(10);
    doc.text(`Total: ${attendees.length} peserta`, 14, 22);
    
    let filterText = "Semua Data";
    if (filters.kecamatan) filterText = `Kecamatan: ${filters.kecamatan}`;
    else if (filters.dapil) filterText = `Dapil: ${filters.dapil}`;
    
    doc.text(filterText, 14, 27);

    const tableData = attendees.map(row => [
      row.name,
      row.nik,
      formatAddress(row),
      row.jenis_kelamin || '-',
      row.usia || '-'
    ]);

    autoTable(doc, {
      head: [["Nama", "NIK", "Alamat", "L/P", "Usia"]],
      body: tableData,
      startY: 32,
    });

    doc.save(getExportFilename('pdf'));
    toast.success(`${attendees.length} data berhasil diekspor ke PDF`);
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={attendees.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>
              Export ke CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>
              Export ke Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              Export ke PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
              <Combobox
                options={DAPIL_OPTIONS.map(dapil => ({ value: dapil, label: dapil }))}
                value={filters.dapil}
                onValueChange={handleDapilChange}
                placeholder="Semua Dapil"
                searchPlaceholder="Cari dapil..."
                emptyText="Dapil tidak ditemukan."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Kecamatan</Label>
              <Combobox
                options={kecamatanOptions.map(kec => ({ value: kec, label: kec }))}
                value={filters.kecamatan}
                onValueChange={handleKecamatanChange}
                placeholder="Semua Kecamatan"
                searchPlaceholder="Cari kecamatan..."
                emptyText="Kecamatan tidak ditemukan."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Desa/Kelurahan</Label>
              <Combobox
                options={desaOptions.map(desa => ({ value: desa, label: desa }))}
                value={filters.desa}
                onValueChange={handleDesaChange}
                placeholder={filters.kecamatan ? "Pilih Desa" : "Pilih Kecamatan dulu"}
                searchPlaceholder="Cari desa..."
                emptyText="Desa tidak ditemukan."
                disabled={!filters.kecamatan}
              />
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
                      <TableCell>{formatAddress(attendee)}</TableCell>
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
