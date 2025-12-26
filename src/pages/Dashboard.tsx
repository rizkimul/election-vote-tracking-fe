import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { ActivityWidget } from '../components/dashboard/ActivityWidget';
import { FilterBar } from '../components/dashboard/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';
import { TOTAL_KECAMATAN, TOTAL_WILAYAH, getKecamatanNames } from '../lib/wilayah-data';

export function Dashboard() {
  const [stats, setStats] = useState({ 
    total_votes: 0, 
    total_votes_web: 0,
    total_votes_import: 0,
    total_events: 0, 
    total_attendees: 0,
    wilayah_count: 0,
    desa_count: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [voteData, setVoteData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [ageData, setAgeData] = useState<any[]>([]);
  const [activitiesPerKecamatanData, setActivitiesPerKecamatanData] = useState<any[]>([]);
  const [kecamatanData, setKecamatanData] = useState<any[]>([]);  // Participants per Kecamatan
  const [loading, setLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<'kecamatan' | 'desa' | 'all'>('kecamatan');
  
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
        if (viewLevel) params.append('level', viewLevel);
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

        // Fetch Gender Distribution
        const genderRes = await fetch(getApiUrl(`/analytics/participants/gender`), { headers });
        if (genderRes.ok) {
            const data = await genderRes.json();
            const genderColors = ['#3b82f6', '#ec4899']; // Blue for male, Pink for female
            const dataWithColors = data.map((item: any, idx: number) => ({
                ...item,
                color: genderColors[idx % genderColors.length]
            }));
            setGenderData(dataWithColors);
        }

        // Fetch Age Distribution
        const ageRes = await fetch(getApiUrl(`/analytics/participants/age`), { headers });
        if (ageRes.ok) {
            const data = await ageRes.json();
            const ageColors = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
            const dataWithColors = data.map((item: any, idx: number) => ({
                ...item,
                color: ageColors[idx % ageColors.length]
            }));
            setAgeData(dataWithColors);
        }

        // Fetch Activities per Kecamatan
        const activitiesKecRes = await fetch(getApiUrl(`/analytics/activities/per-kecamatan`), { headers });
        if (activitiesKecRes.ok) {
            const data = await activitiesKecRes.json();
            const dataWithColors = data.map((item: any, idx: number) => ({
                ...item,
                color: COLORS[idx % COLORS.length]
            }));
            setActivitiesPerKecamatanData(dataWithColors);
        }

        // Fetch Heatmap data for Participants per Kecamatan chart
        const heatmapRes = await fetch(getApiUrl(`/analytics/heatmap${queryString}`), { headers });
        if (heatmapRes.ok) {
            const data = await heatmapRes.json();
            
            // Get valid Kecamatan names for comparison (normalized to uppercase)
            const validKecamatanNames = getKecamatanNames().map(name => name.toUpperCase());

            // Transform heatmap data to bar chart format (sorted by participants)
            const barData = data
                .map((item: any) => {
                    const rawName = item.kecamatan || "";
                    // Clean up conventional prefixes if they exist in the data (e.g. "KEC. BOJONGSOANG")
                    const cleanName = rawName.replace(/^(KEC\.?\s*)/i, '').trim().toUpperCase();
                    
                    // Determine type based on view context or data source
                    const isKecamatanView = viewLevel === 'kecamatan';
                    const isAllView = viewLevel === 'all';

                    // Get type from backend (if available) or infer
                    let type = item.type || (isKecamatanView ? 'Kecamatan' : 'Desa');
                    
                    // If backend returns lowercase, title case it
                    if (type === 'participants') type = isKecamatanView ? 'Kecamatan' : 'Desa';

                    // Differentiate name if it's a Desa with same name as Kecamatan
                    let displayName = cleanName;
                    
                    // Only add suffix if looking at mixed data or desa view, and name conflicts
                    if ((!isKecamatanView || isAllView) && validKecamatanNames.includes(cleanName) && type === 'Desa') {
                        displayName = `${cleanName} (DESA)`;
                    }

                    const isKecamatanType = type === 'Kecamatan';

                    return {
                        name: displayName, // Display name with potential suffix
                        originalName: rawName,
                        peserta: item.intensity || 0,
                        type: type,
                        fill: isKecamatanType ? '#3b82f6' : '#10b981' // Blue for Kecamatan, Emerald for Desa
                    };
                })
                .filter((item: any) => item.peserta > 0)
                .sort((a: any, b: any) => b.peserta - a.peserta);
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
  }, [filters, viewLevel]);

  return (
    <div>
      <FilterBar onFilterChange={handleFilterChange} />
      
      {/* SABADESA Stats */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Kegiatan"
          value={loading ? "..." : stats.total_events.toLocaleString()}
          icon={Calendar}
          description="Kegiatan Terlaksana"
        />
        <StatCard
          title="Kecamatan yang Tersentuh"
          value={loading ? "..." : `${stats.wilayah_count || 0}/${TOTAL_KECAMATAN}`} 
          icon={MapPin}
          description={`dari ${TOTAL_KECAMATAN} Kecamatan`}
        />
        <StatCard
          title="Desa/Kelurahan yang Tersentuh"
          value={loading ? "..." : `${stats.desa_count || 0}/${TOTAL_WILAYAH}`}
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

      {/* Main Charts: Participants per Wilayah and Age Generation (Side by Side) */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Partisipan per Wilayah */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Partisipan per Wilayah</CardTitle>
            <Select value={viewLevel} onValueChange={(v: any) => setViewLevel(v)}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Pilih Level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="kecamatan">Per Kecamatan</SelectItem>
                    <SelectItem value="desa">Per Desa</SelectItem>
                    <SelectItem value="all">Gabungan</SelectItem>
                </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div style={{ minWidth: Math.max(kecamatanData.length * 60, 400), height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kecamatanData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        interval={0}
                        tick={{ dy: 10 }}
                        height={70}
                        angle={-45}
                        textAnchor="end"
                    />
                    <YAxis 
                        type="number" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                        width={35}
                    />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm">
                                        <p className="font-semibold">{label}</p>
                                        <p className="text-gray-500 text-xs mb-1">{data.type}</p>
                                        <p className="text-blue-600 font-medium">
                                            {payload[0].value} Peserta
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    {viewLevel === 'all' && (
                        <Legend 
                            verticalAlign="top" 
                            height={36}
                            payload={[
                                { value: 'Kecamatan', type: 'rect', color: '#3b82f6', id: 'kecamatan' },
                                { value: 'Desa', type: 'rect', color: '#10b981', id: 'desa' }
                            ]}
                        />
                    )}
                    <Bar dataKey="peserta" name="Peserta" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {kecamatanData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {kecamatanData.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">Belum ada data peserta per kecamatan</p>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Partisipan per Usia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Partisipan per Usia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="label" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ dy: 5 }}
                />
                <YAxis 
                    type="number" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                    width={35}
                />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm">
                                    <p className="text-gray-500 text-xs mb-1">Usia {data.label} tahun</p>
                                    <p className="text-blue-600 font-medium">
                                        {payload[0].value} Peserta
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="value" name="Peserta" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {ageData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {ageData.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">Belum ada data peserta per generasi</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity and Pie Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Col 1: Aktivitas Engagement Terkini */}
        <Card>
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

        {/* Col 2-3: 2x2 Grid of Pie Charts */}
        <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
          {/* Chart 1: Sumber Engagement (Activity Distribution) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sumber Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = sourceData.reduce((sum: number, item: any) => sum + item.value, 0);
                        const percent = ((payload[0].value as number / total) * 100).toFixed(1);
                        return (
                          <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm">
                            <p className="font-semibold">{payload[0].name}</p>
                            <p className="text-gray-600">{percent}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Jenis Kelamin Peserta */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Jenis Kelamin Peserta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {genderData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = genderData.reduce((sum: number, item: any) => sum + item.value, 0);
                        const percent = ((payload[0].value as number / total) * 100).toFixed(1);
                        return (
                          <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm">
                            <p className="font-semibold">{payload[0].name}</p>
                            <p className="text-gray-600">{percent}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
              {genderData.length === 0 && (
                <p className="text-center text-gray-500 text-sm">Belum ada data</p>
              )}
            </CardContent>
          </Card>

          {/* Chart 3: Usia Peserta (Age Distribution) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Usia Peserta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ageData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = ageData.reduce((sum: number, item: any) => sum + item.value, 0);
                        const percent = ((payload[0].value as number / total) * 100).toFixed(1);
                        return (
                          <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm">
                            <p className="font-semibold">{payload[0].name}</p>
                            <p className="text-gray-600">{percent}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
              {ageData.length === 0 && (
                <p className="text-center text-gray-500 text-sm">Belum ada data</p>
              )}
            </CardContent>
          </Card>

          {/* Chart 4: Kegiatan per Kecamatan */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kegiatan per Kecamatan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={activitiesPerKecamatanData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {activitiesPerKecamatanData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const total = activitiesPerKecamatanData.reduce((sum: number, item: any) => sum + item.value, 0);
                        const percent = ((payload[0].value as number / total) * 100).toFixed(1);
                        return (
                          <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md text-sm">
                            <p className="font-semibold">{payload[0].name}</p>
                            <p className="text-gray-600">{percent}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
              {activitiesPerKecamatanData.length === 0 && (
                <p className="text-center text-gray-500 text-sm">Belum ada data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
