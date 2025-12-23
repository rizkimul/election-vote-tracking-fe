import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { ActivityWidget } from '../components/dashboard/ActivityWidget';
import { FilterBar } from '../components/dashboard/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';
import { TOTAL_KECAMATAN, TOTAL_WILAYAH } from '../lib/wilayah-data';

export function Dashboard() {
  const [stats, setStats] = useState({ 
    total_votes: 0, 
    total_votes_web: 0,
    total_votes_import: 0,
    total_events: 0, 
    total_attendees: 0,
    wilayah_count: 0 
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [voteData, setVoteData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [kecamatanData, setKecamatanData] = useState<any[]>([]);  // Participants per Kecamatan
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<{dapil: string | null, kecamatan: string | null, dateRange: string}>({
      dapil: null,
      kecamatan: null,
      dateRange: '30days'
  });

  // Fallback colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4'];

  const handleFilterChange = (newFilters: any) => {
      setFilters(newFilters);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = getApiHeaders({ 'Authorization': `Bearer ${token}` });
        
        const params = new URLSearchParams();
        if (filters.dapil) params.append('dapil', filters.dapil);
        if (filters.kecamatan) params.append('kecamatan', filters.kecamatan);
        const queryString = params.toString() ? `?${params.toString()}` : '';

        // Fetch Global Stats
        const statsRes = await fetch(getApiUrl(`/analytics/global${queryString}`), { headers });
        if (statsRes.ok) setStats(await statsRes.json());

        // Fetch Vote Summary
        const votesRes = await fetch(getApiUrl(`/analytics/votes/summary${queryString}`), { headers });
        if (votesRes.ok) setVoteData(await votesRes.json());
        
        // Fetch Engagement Trends
        const trendsRes = await fetch(getApiUrl(`/analytics/engagement/trends${queryString}`), { headers });
        if (trendsRes.ok) setEngagementData(await trendsRes.json());
        
        // Fetch Recent Activity (Task 1) - Assuming endpoint exists or we use empty for now
        // Fetch Recent Activity
        const activityRes = await fetch(getApiUrl(`/events/recent${queryString}`), { headers });
        if (activityRes.ok) setRecentActivities(await activityRes.json()); 
        
        // Fetch Activity Distribution
        const distRes = await fetch(getApiUrl(`/analytics/activities/distribution${queryString}`), { headers });
        if (distRes.ok) {
            const data = await distRes.json();
            const dataWithColors = data.map((item: any, idx: number) => ({
                ...item,
                color: COLORS[idx % COLORS.length]
            }));
            setSourceData(dataWithColors);
        }

        // Fetch Heatmap data for Participants per Kecamatan chart
        const heatmapRes = await fetch(getApiUrl(`/analytics/heatmap${queryString}`), { headers });
        if (heatmapRes.ok) {
            const data = await heatmapRes.json();
            // Transform heatmap data to bar chart format (sorted by participants)
            const barData = data
                .map((item: any) => ({
                    name: item.kecamatan,
                    peserta: item.intensity || 0
                }))
                .filter((item: any) => item.peserta > 0)
                .sort((a: any, b: any) => b.peserta - a.peserta)
                .slice(0, 10);  // Top 10 Kecamatan
            setKecamatanData(barData);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast.error("Gagal memuat data dashboard. Pastikan backend berjalan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return (
    <div>
      <FilterBar onFilterChange={handleFilterChange} />
      
      {/* SABADESA Stats - Activity focused, no vote data */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Kegiatan"
          value={loading ? "..." : stats.total_events.toLocaleString()}
          icon={Calendar}
          description="Kegiatan Terlaksana"
        />
        <StatCard
          title="Wilayah Tersentuh"
          value={loading ? "..." : `${stats.wilayah_count || 0}/${TOTAL_KECAMATAN}`} 
          icon={MapPin}
          description={`dari ${TOTAL_WILAYAH} Desa/Kelurahan`}
        />
        <StatCard
          title="Total Partisipan"
          value={loading ? "..." : stats.total_attendees.toLocaleString()}
          icon={Users}
          description="Peserta Kegiatan"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Replaced vote chart with activity distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kegiatan per Jenis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => {
                    const truncatedName = name.length > 15 ? name.substring(0, 15) + '...' : name;
                    return `${truncatedName} (${(percent * 100).toFixed(0)}%)`;
                  }}
                  labelLine={{ stroke: '#888', strokeWidth: 1 }}
                >
                  {sourceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Participants per Kecamatan Bar Chart - Required by SABADESA */}
        <Card>
          <CardHeader>
            <CardTitle>Partisipan per Kecamatan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kecamatanData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip />
                <Bar dataKey="peserta" fill="#3b82f6" name="Peserta" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {kecamatanData.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">Belum ada data peserta per kecamatan</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitas Engagement Terkini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Belum ada aktivitas tercatat.</p>
              ) : (
                recentActivities.map((activity, index) => (
                    <div key={index}>
                        <ActivityWidget 
                            date={activity.date}
                            type={activity.type}
                            location={activity.location}
                            participants={activity.participants}
                        />
                    </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sumber Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
