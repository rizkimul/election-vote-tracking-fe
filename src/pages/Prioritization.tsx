import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';

interface Suggestion {
  kecamatan: string;
  score: number;
  actual_votes: number;
  target_votes: number;
  event_count: number;
  reason: string;
}

export function Prioritization() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl('/prioritization/suggest'), {
          headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
      });
      if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
      } else {
          toast.error("Gagal memuat rekomendasi");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    toast.info("Memperbarui analisis...");
    fetchSuggestions();
  };

  const handleSchedule = (kecamatan: string) => {
    // Show message guiding user to schedule via the engagement form
    toast.success(`Buat kegiatan untuk ${kecamatan} di menu "Input Engagement"`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Rekomendasi Prioritas</h2>
            <p className="text-gray-500">Analisis cerdas wilayah yang membutuhkan atensi segera.</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="mr-2 h-4 w-4" />
            )}
            {refreshing ? 'Memproses...' : 'Refresh Analisis'}
        </Button>
      </div>

      <div className="grid gap-6">
        {loading ? (
            <p>Memuat analisis...</p>
        ) : suggestions.length === 0 ? (
            <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <p>Tidak ada rekomendasi prioritas mendesak saat ini.</p>
                    <p className="text-sm">Data suara dan kegiatan tampak seimbang atau data belum cukup.</p>
                </CardContent>
            </Card>
        ) : (
            suggestions.map((item, idx) => (
                <Card key={idx} className="border-l-4 border-l-red-500">
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{item.kecamatan}</h3>
                                <Badge variant="destructive">Score: {item.score}</Badge>
                            </div>
                            <p className="text-gray-700">{item.reason}</p>
                            <div className="flex gap-4 text-sm text-gray-500 mt-2">
                                <span>Suara: {item.actual_votes.toLocaleString()} / {item.target_votes.toLocaleString()}</span>
                                <span>•</span>
                                <span>Kegiatan: {item.event_count}</span>
                            </div>
                        </div>
                        <Button onClick={() => handleSchedule(item.kecamatan)}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Jadwalkan
                        </Button>
                    </CardContent>
                </Card>
            ))
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Metodologi Prioritas</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Gap Analisis: Selisih antara Target (Potensi) dan Suara Aktual.</li>
                    <li>Intensitas Engagement: Jumlah kegiatan yang sudah dilakukan di wilayah tersebut.</li>
                    <li>Skor Urgensi: Semakin tinggi Gap dan semakin rendah Engagement, semakin tinggi prioritas.</li>
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

