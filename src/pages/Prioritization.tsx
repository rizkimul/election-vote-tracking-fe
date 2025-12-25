import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, TrendingUp, Calendar, RefreshCw, MapPin } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

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
  const [filter, setFilter] = useState("all");

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

  // Filter Logic
  const filteredSuggestions = suggestions.filter(item => {
    if (filter === "all") return true;
    if (filter === "overvisited") return item.score >= 90;
    if (filter === "priority") return item.score >= 80 && item.score < 90;
    if (filter === "evaluation") return item.score >= 70 && item.score < 80;
    if (filter === "stable") return item.score < 70;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Rekomendasi Wilayah</h2>
            <p className="text-gray-500">Analisis wilayah yang sering dikunjungi dan butuh perhatian.</p>
        </div>
        <div className="flex gap-3">
             <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="priority">Perlu Perhatian</SelectItem>
                    <SelectItem value="overvisited">Sering Dikunjungi</SelectItem>
                    <SelectItem value="evaluation">Evaluasi</SelectItem>
                    <SelectItem value="stable">Stabil</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <TrendingUp className="mr-2 h-4 w-4" />
                )}
                {refreshing ? 'Memproses...' : 'Refresh'}
            </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
            <p>Memuat analisis...</p>
        ) : filteredSuggestions.length === 0 ? (
            <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <p>Tidak ada data yang sesuai filter / belum ada kegiatan.</p>
                    <p className="text-sm">Ubah filter atau mulai tambahkan kegiatan.</p>
                </CardContent>
            </Card>
        ) : (
            filteredSuggestions.map((item, idx) => (
                <Card key={idx} className="border-l-4 border-l-red-500">
                    <CardContent className="flex items-center justify-between p-6">
                       {/* ... card content same as before ... */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-lg">{item.kecamatan}</h3>
                                {(() => {
                                    let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";
                                    let badgeLabel = "Stabil";

                                    if (item.score >= 90) {
                                        badgeVariant = "default"; // Blue
                                        badgeLabel = "Sering dikunjungi";
                                    } else if (item.score >= 80) {
                                        badgeVariant = "destructive"; // Red
                                        badgeLabel = "Perlu perhatian";
                                    } else if (item.score >= 70) {
                                        badgeVariant = "destructive"; // Red
                                        badgeLabel = "Evaluasi";
                                    } else {
                                        badgeVariant = "secondary"; // Gray
                                        badgeLabel = "Stabil";
                                    }

                                    return (
                                        <Badge variant={badgeVariant}>
                                            {badgeLabel}
                                        </Badge>
                                    );
                                })()}
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
                    <li>Analisis Dinamis: Menggunakan <strong>rata-rata (semua wilayah)</strong> sebagai acuan.</li>
                    <li>Prioritas Utama: Wilayah dengan kegiatan di bawah 50% rata-rata.</li>
                    <li>Over-visited: Wilayah dengan kegiatan &gt; 200% di atas rata-rata.</li>
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

