import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { ActivityWidget } from '../components/dashboard/ActivityWidget';
import { FilterBar } from '../components/dashboard/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Vote, Users, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

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
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const params = new URLSearchParams();
        if (filters.dapil) params.append('dapil', filters.dapil);
        if (filters.kecamatan) params.append('kecamatan', filters.kecamatan);
        const queryString = params.toString() ? `?${params.toString()}` : '';

        // Fetch Global Stats
        const statsRes = await fetch(`/api/analytics/global${queryString}`, { headers });
        if (statsRes.ok) setStats(await statsRes.json());

        // Fetch Vote Summary
        const votesRes = await fetch(`/api/analytics/votes/summary${queryString}`, { headers });
        if (votesRes.ok) setVoteData(await votesRes.json());
        
        // Fetch Engagement Trends
        const trendsRes = await fetch(`/api/analytics/engagement/trends${queryString}`, { headers });
        if (trendsRes.ok) setEngagementData(await trendsRes.json());
        
        // Fetch Recent Activity (Task 1) - Assuming endpoint exists or we use empty for now
        // Fetch Recent Activity
        const activityRes = await fetch(`/api/events/recent${queryString}`, { headers });
        if (activityRes.ok) setRecentActivities(await activityRes.json()); 
        
        // Fetch Activity Distribution
        const distRes = await fetch(`/api/analytics/activities/distribution${queryString}`, { headers });
        if (distRes.ok) {
            const data = await distRes.json();
            const dataWithColors = data.map((item: any, idx: number) => ({
                ...item,
                color: COLORS[idx % COLORS.length]
            }));
            setSourceData(dataWithColors);
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
      
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Suara"
          value={loading ? "..." : stats.total_votes.toLocaleString()}
          icon={Vote}
          description={
            <div className="flex gap-3 text-xs mt-1">
                <span className="text-blue-600 font-medium">Web: {loading ? "..." : stats.total_votes_web.toLocaleString()}</span>
                <span className="text-gray-300">|</span>
                <span className="text-purple-600 font-medium">Import: {loading ? "..." : stats.total_votes_import.toLocaleString()}</span>
            </div>
          }
          trend={{ value: 0, label: "vs import terakhir", direction: "neutral" }}
        />
        <StatCard
          title="Total Event"
          value={loading ? "..." : stats.total_events.toLocaleString()}
          icon={TrendingUp}
          description="Kegiatan Terjadwal"
        />
        <StatCard
          title="Wilayah Tersentuh"
          value={loading ? "..." : (stats.wilayah_count || "0")} 
          icon={MapPin}
          description="Kecamatan Aktif"
        />
        <StatCard
          title="Total Partisipan"
          value={loading ? "..." : stats.total_attendees.toLocaleString()}
          icon={Users}
          description="Peserta Terdaftar"
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perolehan Suara per Partai</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={voteData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Jumlah Suara" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="participants" stroke="#3b82f6" strokeWidth={2} name="Partisipan" dot={false} />
              </LineChart>
            </ResponsiveContainer>
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
