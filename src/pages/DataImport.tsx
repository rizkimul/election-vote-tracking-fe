import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, XCircle } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { getApiUrl } from '../lib/api';

interface ImportLog {
    id: number;
    filename: string;
    status: string;
    records_count: number;
    error_message?: string;
    created_at: string;
}

export function DataImport() {
  const { token } = useAuth(); // Get token
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [importHistory, setImportHistory] = useState<ImportLog[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    try {
        const res = await fetch(getApiUrl('/historical-votes/import-history'), {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setImportHistory(data);
        }
    } catch (e) {
        console.error("Failed to fetch history", e);
    }
  };

  React.useEffect(() => {
    if (token) {
        fetchHistory();
    }
  }, [token]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
        toast.error("File harus berformat Excel (.xlsx atau .xls)");
        return;
    }

    setUploadStatus('uploading');
    setProgress(10); // Start progress

    const formData = new FormData();
    formData.append('file', file);

    try {
        // Simulated progress
        const progInterval = setInterval(() => {
            setProgress(p => Math.min(p + 10, 90));
        }, 300);

        const response = await fetch(getApiUrl('/upload/votes-excel'), {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${token}` } // Add token here too just in case
        });
        
        // Note: FormData does not need Content-Type header, fetch sets it with boundary automatically.
        // But Authorization needs to be added. 
        // Wait, passing headers compatible with FormData? Yes.

        clearInterval(progInterval);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengunggah file");
        }

        const result = await response.json();
        setProgress(100);
        setUploadStatus('success');
        toast.success(result.message || "Import berhasil!");
        fetchHistory(); // Refresh history
        
    } catch (error: any) {
        setUploadStatus('error');
        setErrorMessage(error.message);
        toast.error(error.message);
        setProgress(0);
    } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Data Excel</CardTitle>
            <CardDescription>Unggah hasil suara pemilu (Format: Dapil, Kabupaten, Kecamatan, Desa, Partai, Suara)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleFileSelect}>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">Klik untuk memilih file Excel</p>
              <Button variant="secondary" className="mt-4">
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
                  File berhasil diimpor!
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Gagal: {errorMessage}
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
                <li>• Kolom Wajib: dapil, kabupaten, kecamatan, desa, partai, suara</li>
                <li>• Kolom Opsional: tahun (atau election_year)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aturan Validasi Data</CardTitle>
            <CardDescription>Pastikan data Anda memenuhi kriteria berikut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {/* Content remains mostly same, can be updated later */}
               <div className="flex items-start gap-3">
                 <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                 <div>
                   <h4 className="text-sm text-gray-900">Format Data</h4>
                   <p className="text-sm text-gray-600">Kolom header harus sesuai (case-insensitive).</p>
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
            {importHistory.length === 0 && (
                <p className="text-center text-gray-500 py-4">Belum ada riwayat import</p>
            )}
            {importHistory.map((item: ImportLog) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="text-gray-900">{item.filename}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString()} • {item.records_count} data
                    </p>
                    {item.error_message && (
                        <p className="text-xs text-red-500 max-w-[300px] truncate">{item.error_message}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={item.status === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                    {item.status === 'success' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                    {item.status === 'success' ? 'Berhasil' : 'Gagal'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

