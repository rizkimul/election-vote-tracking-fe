import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';

export function DataImport() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const handleFileUpload = () => {
    setUploadStatus('uploading');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const importHistory = [
    { id: 1, filename: 'hasil_suara_q1_2025.xlsx', date: '2025-10-28', records: 1250, status: 'success' },
    { id: 2, filename: 'data_engagement_september.xlsx', date: '2025-10-15', records: 850, status: 'success' },
    { id: 3, filename: 'registrasi_pemilih_batch_3.xlsx', date: '2025-10-01', records: 2100, status: 'success' },
    { id: 4, filename: 'potensi_suara_dapil_2.xlsx', date: '2025-09-20', records: 560, status: 'success' },
  ];

  return (
    <div>
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Data Excel</CardTitle>
            <CardDescription>Unggah hasil suara, data engagement, atau file registrasi pemilih</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">Seret dan lepaskan file Excel Anda di sini</p>
              <p className="text-sm text-gray-500">atau</p>
              <Button onClick={handleFileUpload} className="mt-2">
                Pilih File
              </Button>
            </div>

            {uploadStatus === 'uploading' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Mengunggah dan memproses...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {uploadStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  File berhasil diunggah! 1.250 data berhasil diimpor.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 rounded-lg bg-blue-50 p-4">
              <h4 className="flex items-center gap-2 text-sm text-gray-900">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                Persyaratan File Excel
              </h4>
              <ul className="ml-6 space-y-1 text-sm text-gray-600">
                <li>• Format: .xlsx atau .xls</li>
                <li>• Ukuran maksimal file: 10MB</li>
                <li>• Kolom wajib: NIK, Nama, Dapil, Kecamatan, Desa</li>
                <li>• Kolom opsional: Dusun, RT/RW, Jumlah Suara, Potensi Suara</li>
              </ul>
            </div>

            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Unduh Template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aturan Validasi Data</CardTitle>
            <CardDescription>Pastikan data Anda memenuhi kriteria berikut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <h4 className="text-sm text-gray-900">Validasi NIK</h4>
                  <p className="text-sm text-gray-600">Harus 16 digit, tidak boleh duplikat</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <h4 className="text-sm text-gray-900">Data Geografis</h4>
                  <p className="text-sm text-gray-600">Dapil, kecamatan, dan desa harus sesuai data master</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <h4 className="text-sm text-gray-900">Jumlah Suara</h4>
                  <p className="text-sm text-gray-600">Harus berupa bilangan bulat positif</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <h4 className="text-sm text-gray-900">Format Tanggal</h4>
                  <p className="text-sm text-gray-600">YYYY-MM-DD atau DD/MM/YYYY</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="text-sm text-gray-900">Koreksi Otomatis</h4>
                  <p className="text-sm text-gray-600">Masalah format kecil akan diperbaiki secara otomatis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Import</CardTitle>
          <CardDescription>Riwayat unggahan dan import data terkini</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {importHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="text-gray-900">{item.filename}</p>
                    <p className="text-sm text-gray-500">
                      {item.date} • {item.records.toLocaleString()} data
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Berhasil
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
