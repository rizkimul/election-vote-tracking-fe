import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, TrendingUp, Calendar, RefreshCw, MapPin } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';

// SABADESA: Activity-focused suggestion interface
interface Suggestion {
  kecamatan: string;
  score: number;
  participant_count: number;  // Replaces actual_votes
  event_count: number;
  reason: string;
}

export function Prioritization() {
  const navigate = useNavigate();
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
    // Navigate to engagement form with pre-filled location
    toast.success(`Membuat kegiatan baru untuk ${kecamatan}`);
    navigate(`/engagement-form?kecamatan=${encodeURIComponent(kecamatan)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Rekomendasi Wilayah</h2>
            <p className="text-gray-500">Analisis wilayah yang sering dikunjungi dan butuh perhatian.</p>
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
                    <p>Belum ada data kegiatan untuk dianalisis.</p>
                    <p className="text-sm">Mulai tambahkan kegiatan untuk mendapatkan rekomendasi.</p>
                </CardContent>
            </Card>
        ) : (
            suggestions.map((item, idx) => (
                <Card key={idx} className="border-l-4 border-l-red-500">
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-lg">{item.kecamatan}</h3>
                                <Badge variant={item.event_count > 3 ? "default" : "destructive"}>
                                    {item.event_count > 3 ? 'Sering dikunjungi' : 'Perlu perhatian'}
                                </Badge>
                            </div>
                            <p className="text-gray-700">{item.reason}</p>
                            <div className="flex gap-4 text-sm text-gray-500 mt-2">
                                <span>Total Peserta: {(item.participant_count || 0).toLocaleString()}</span>
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
                    <li>Analisis Frekuensi: Seberapa sering kegiatan dilakukan di wilayah tersebut.</li>
                    <li>Cakupan Peserta: Jumlah total peserta yang terjangkau.</li>
                    <li>Rekomendasi: Wilayah dengan kegiatan minim atau peserta rendah diprioritaskan.</li>
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

