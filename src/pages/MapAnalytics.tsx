import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Users } from 'lucide-react';

const locationData = [
  { location: 'Kecamatan A, Desa 1', participants: 850, visits: 12, lat: -6.2, lng: 106.8 },
  { location: 'Kecamatan A, Desa 2', participants: 620, visits: 8, lat: -6.21, lng: 106.81 },
  { location: 'Kecamatan B, Desa 1', participants: 1120, visits: 15, lat: -6.19, lng: 106.82 },
  { location: 'Kecamatan B, Desa 2', participants: 450, visits: 6, lat: -6.22, lng: 106.79 },
  { location: 'Kecamatan C, Desa 1', participants: 980, visits: 11, lat: -6.18, lng: 106.83 },
  { location: 'Kecamatan C, Desa 2', participants: 720, visits: 9, lat: -6.23, lng: 106.78 },
];

const monthlyData = [
  { month: 'Jan', participants: 1200, visits: 18 },
  { month: 'Feb', participants: 1800, visits: 25 },
  { month: 'Mar', participants: 2200, visits: 32 },
  { month: 'Apr', participants: 2800, visits: 38 },
  { month: 'Mei', participants: 3200, visits: 45 },
  { month: 'Jun', participants: 3800, visits: 52 },
];

const regionData = [
  { name: 'Kecamatan A', value: 1470, color: '#3b82f6' },
  { name: 'Kecamatan B', value: 1570, color: '#10b981' },
  { name: 'Kecamatan C', value: 1700, color: '#f59e0b' },
  { name: 'Kecamatan D', value: 980, color: '#8b5cf6' },
];

export function MapAnalytics() {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Select defaultValue="30days">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rentang Waktu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 Hari Terakhir</SelectItem>
            <SelectItem value="30days">30 Hari Terakhir</SelectItem>
            <SelectItem value="90days">90 Hari Terakhir</SelectItem>
            <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all-regions">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Wilayah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-regions">Semua Wilayah</SelectItem>
            <SelectItem value="region-a">Kecamatan A</SelectItem>
            <SelectItem value="region-b">Kecamatan B</SelectItem>
            <SelectItem value="region-c">Kecamatan C</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('bar')}
          >
            Grafik Batang
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Grafik Garis
          </Button>
          <Button
            variant={chartType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChartType('pie')}
          >
            Grafik Pie
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peta Panas Interaktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 to-green-50">
              <div className="absolute inset-0 flex items-center justify-center">
                {locationData.map((location, index) => (
                  <div
                    key={index}
                    className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-125"
                    style={{
                      left: `${15 + index * 13}%`,
                      top: `${20 + (index % 3) * 20}%`,
                      opacity: 0.8,
                    }}
                  >
                    <MapPin className="h-6 w-6" />
                    <div className="absolute -top-8 hidden whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white hover:block">
                      {location.location.split(',')[1]?.trim()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-4 shadow-md backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                    <span className="text-sm">Aktivitas Rendah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                    <span className="text-sm">Aktivitas Sedang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-800"></div>
                    <span className="text-sm">Aktivitas Tinggi</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {chartType === 'bar' && 'Partisipasi per Wilayah'}
              {chartType === 'line' && 'Tren Engagement Bulanan'}
              {chartType === 'pie' && 'Distribusi Regional'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              {chartType === 'bar' && (
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="participants" fill="#3b82f6" name="Partisipan" />
                  <Bar dataKey="visits" fill="#10b981" name="Kunjungan" />
                </BarChart>
              )}
              {chartType === 'line' && (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="participants" stroke="#3b82f6" strokeWidth={2} name="Partisipan" />
                  <Line type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={2} name="Kunjungan" />
                </LineChart>
              )}
              {chartType === 'pie' && (
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Kunjungan Lokasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locationData.map((location, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm text-gray-900">{location.location}</h4>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      Partisipan
                    </span>
                    <Badge variant="outline">{location.participants}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Kunjungan
                    </span>
                    <Badge variant="outline">{location.visits}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
