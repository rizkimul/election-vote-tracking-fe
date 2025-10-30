import React from 'react';
import { KPICard } from '../components/dashboard/KPICard';
import { FilterBar } from '../components/dashboard/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Vote, Users, MapPin, TrendingUp } from 'lucide-react';

const voteData = [
  { district: 'Dapil 1', votes: 4500, potential: 2300 },
  { district: 'Dapil 2', votes: 3800, potential: 1900 },
  { district: 'Dapil 3', votes: 5200, potential: 2700 },
  { district: 'Dapil 4', votes: 4100, potential: 2100 },
  { district: 'Dapil 5', votes: 3900, potential: 1800 },
];

const engagementData = [
  { month: 'Jan', participants: 1200 },
  { month: 'Feb', participants: 1800 },
  { month: 'Mar', participants: 2200 },
  { month: 'Apr', participants: 2800 },
  { month: 'Mei', participants: 3200 },
  { month: 'Jun', participants: 3800 },
];

const sourceData = [
  { name: 'Reses', value: 150, color: '#3b82f6' },
  { name: 'Pengawasan Pemerintah', value: 100, color: '#10b981' },
  { name: 'Pendidikan Demokrasi', value: 50, color: '#f59e0b' },
  { name: 'Dialog', value: 100, color: '#8b5cf6' },
  { name: 'Silaturahmi Budaya', value: 100, color: '#ec4899' },
];

export function Dashboard() {
  return (
    <div>
      <FilterBar />
      
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Suara"
          value="21,500"
          icon={Vote}
          trend="+12.5% dari bulan lalu"
          trendUp={true}
        />
        <KPICard
          title="Potensi Suara"
          value="10,800"
          icon={TrendingUp}
          trend="+8.3% dari bulan lalu"
          trendUp={true}
        />
        <KPICard
          title="Wilayah Tersentuh"
          value="45"
          icon={MapPin}
          trend="+5 wilayah baru"
          trendUp={true}
        />
        <KPICard
          title="Total Partisipan"
          value="15,000"
          icon={Users}
          trend="+18.2% dari bulan lalu"
          trendUp={true}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perolehan Suara per Dapil</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={voteData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="votes" fill="#3b82f6" name="Suara Aktual" />
                <Bar dataKey="potential" fill="#10b981" name="Potensi Suara" />
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
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="participants" stroke="#3b82f6" strokeWidth={2} name="Partisipan" />
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
              {[
                { location: 'Kecamatan A, Desa 1', participants: 250, date: '2025-10-28', type: 'Reses' },
                { location: 'Kecamatan B, Desa 3', participants: 180, date: '2025-10-27', type: 'Pendidikan Demokrasi' },
                { location: 'Kecamatan C, Desa 2', participants: 320, date: '2025-10-26', type: 'Dialog' },
                { location: 'Kecamatan A, Desa 4', participants: 200, date: '2025-10-25', type: 'Silaturahmi Budaya' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.location}</p>
                    <p className="text-sm text-gray-500">
                      {activity.type} • {activity.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">{activity.participants}</p>
                    <p className="text-sm text-gray-500">partisipan</p>
                  </div>
                </div>
              ))}
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
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="##8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
