import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { Vote, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '../lib/api';

interface HistoricalVote {
  id: number;
  dapil: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  total_votes: number;
  data: Record<string, number>;
  election_year: number;
}

export function VoteResults() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [votes, setVotes] = useState<HistoricalVote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl('/historical-votes/?size=1000'), { // Fetch larger set for table
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setVotes(await res.json());
      } else {
        toast.error("Gagal memuat data suara");
      }
    } catch (error) {
      toast.error("Kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = votes.reduce((sum, item) => sum + item.total_votes, 0);
  // Potential is not yet in DB, simulating target as +30% of total
  const totalPotential = Math.round(totalVotes * 1.3); 
  const totalAreas = new Set(votes.map(item => item.desa)).size;

  const filteredData = votes.filter(item =>
    Object.values(item).some(value =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleExport = () => {
    if (filteredData.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
    }

    // CSV Header
    const headers = ["ID", "Tahun", "Dapil", "Kecamatan", "Desa", "Total Suara", "Detail Partai"];
    
    // CSV Rows
    const rows = filteredData.map(row => [
        row.id,
        row.election_year,
        `"${row.dapil}"`, // Quote to handle commas
        `"${row.kecamatan}"`,
        `"${row.desa}"`,
        row.total_votes,
        `"${JSON.stringify(row.data).replace(/"/g, '""')}"` // Escape quotes in JSON
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
    ].join("\n");

    // Download Logic
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vote_results_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data berhasil diekspor ke CSV");
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
          title="Estimasi Potensi Suara"
          value={totalPotential.toLocaleString()}
          icon={Users}
        />
        <KPICard
          title="Wilayah Desa/Kelurahan"
          value={totalAreas}
          icon={MapPin}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hasil Perolehan Suara</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Ekspor ke CSV
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
                  <TableHead className="text-right">Suara Sah</TableHead>
                  <TableHead className="text-right">Est. Potensi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">Memuat data...</TableCell>
                    </TableRow>
                ) : filteredData.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">Tidak ada data ditemukan</TableCell>
                    </TableRow>
                ) : (
                    filteredData.map((row) => (
                    <React.Fragment key={row.id}>
                      <TableRow>
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
                        <TableCell>{row.dapil}</TableCell>
                        <TableCell>{row.kecamatan}</TableCell>
                        <TableCell>{row.desa}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-blue-50">
                            {row.total_votes.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-green-50">
                            {Math.round(row.total_votes * 1.3).toLocaleString()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(row.id) && (
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={6}>
                                <div className="p-4">
                                    <h4 className="font-semibold mb-2 text-sm">Rincian Perolehan Partai</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(row.data).map(([party, count]) => (
                                            <div key={party} className="flex justify-between text-sm bg-white p-2 rounded border">
                                                <span className="font-medium">{party}</span>
                                                <span>{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

