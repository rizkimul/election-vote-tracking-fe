import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { Vote, Users, MapPin } from 'lucide-react';

const mockVoteData = [
  { id: 1, district: 'Dapil 1', subdistrict: 'Kecamatan A', village: 'Desa 1', hamlet: 'Dusun 1', rtRw: 'RT 01/RW 02', votes: 450, potential: 230 },
  { id: 2, district: 'Dapil 1', subdistrict: 'Kecamatan A', village: 'Desa 1', hamlet: 'Dusun 2', rtRw: 'RT 02/RW 02', votes: 380, potential: 190 },
  { id: 3, district: 'Dapil 1', subdistrict: 'Kecamatan A', village: 'Desa 2', hamlet: 'Dusun 1', rtRw: 'RT 01/RW 01', votes: 520, potential: 270 },
  { id: 4, district: 'Dapil 1', subdistrict: 'Kecamatan B', village: 'Desa 1', hamlet: 'Dusun 1', rtRw: 'RT 03/RW 04', votes: 410, potential: 210 },
  { id: 5, district: 'Dapil 2', subdistrict: 'Kecamatan C', village: 'Desa 1', hamlet: 'Dusun 1', rtRw: 'RT 01/RW 03', votes: 390, potential: 180 },
  { id: 6, district: 'Dapil 2', subdistrict: 'Kecamatan C', village: 'Desa 2', hamlet: 'Dusun 2', rtRw: 'RT 04/RW 05', votes: 480, potential: 240 },
  { id: 7, district: 'Dapil 2', subdistrict: 'Kecamatan D', village: 'Desa 1', hamlet: 'Dusun 1', rtRw: 'RT 02/RW 02', votes: 560, potential: 290 },
  { id: 8, district: 'Dapil 3', subdistrict: 'Kecamatan E', village: 'Desa 1', hamlet: 'Dusun 1', rtRw: 'RT 01/RW 01', votes: 430, potential: 220 },
  { id: 9, district: 'Dapil 3', subdistrict: 'Kecamatan E', village: 'Desa 2', hamlet: 'Dusun 2', rtRw: 'RT 03/RW 03', votes: 490, potential: 250 },
  { id: 10, district: 'Dapil 3', subdistrict: 'Kecamatan F', village: 'Desa 1', hamlet: 'Dusun 1', rtRw: 'RT 02/RW 04', votes: 520, potential: 260 },
];

export function VoteResults() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const totalVotes = mockVoteData.reduce((sum, item) => sum + item.votes, 0);
  const totalPotential = mockVoteData.reduce((sum, item) => sum + item.potential, 0);
  const totalAreas = new Set(mockVoteData.map(item => `${item.village}-${item.hamlet}`)).size;

  const filteredData = mockVoteData.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div>
      <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Total Suara Terkumpul"
          value={totalVotes.toLocaleString()}
          icon={Vote}
        />
        <KPICard
          title="Total Potensi Suara"
          value={totalPotential.toLocaleString()}
          icon={Users}
        />
        <KPICard
          title="Wilayah Cakupan"
          value={totalAreas}
          icon={MapPin}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hasil Perolehan Suara per Daerah Pemilihan</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Ekspor ke Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan dapil, kecamatan, desa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Dapil</TableHead>
                  <TableHead>Kecamatan</TableHead>
                  <TableHead>Desa</TableHead>
                  <TableHead>Dusun</TableHead>
                  <TableHead>RT/RW</TableHead>
                  <TableHead className="text-right">Suara</TableHead>
                  <TableHead className="text-right">Potensi</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(row.id)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedRows.has(row.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{row.district}</TableCell>
                    <TableCell>{row.subdistrict}</TableCell>
                    <TableCell>{row.village}</TableCell>
                    <TableCell>{row.hamlet}</TableCell>
                    <TableCell>{row.rtRw}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-blue-50">
                        {row.votes}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-green-50">
                        {row.potential}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.votes + row.potential}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
