import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Calendar, Filter } from 'lucide-react';
import { getApiUrl } from '../../lib/api';

interface FilterBarProps {
  onFilterChange?: (filters: any) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [dapils, setDapils] = React.useState<string[]>([]);
  const [kecamatans, setKecamatans] = React.useState<string[]>([]);
  
  const [selectedDapil, setSelectedDapil] = React.useState<string>("all-districts");
  const [selectedKecamatan, setSelectedKecamatan] = React.useState<string>("all-subdistricts");
  const [selectedDateRange, setSelectedDateRange] = React.useState<string>("30days");


  React.useEffect(() => {
      const fetchFilters = async () => {
          try {
              const token = localStorage.getItem('token');
              const headers = { 'Authorization': `Bearer ${token}` };
              // Initial fetch with no dapil selected to get all options
              const res = await fetch(getApiUrl('/historical-votes/filters'), { headers });
              if (res.ok) {
                  const data = await res.json();
                  setDapils(data.dapils || []);
                  setKecamatans(data.kecamatans || []);
              }
          } catch (e) {
              console.error("Failed to fetch filters", e);
          }
      };
      fetchFilters();
  }, []);

  // Effect to refetch kecamatans when dapil changes (cascading)
  React.useEffect(() => {
      if (selectedDapil === "all-districts") return;
      
      const fetchKecamatans = async () => {
           try {
              const token = localStorage.getItem('token');
              const headers = { 'Authorization': `Bearer ${token}` };
              const res = await fetch(getApiUrl(`/historical-votes/filters?dapil=${encodeURIComponent(selectedDapil)}`), { headers });
              if (res.ok) {
                  const data = await res.json();
                  setKecamatans(data.kecamatans || []);
                  // Reset kecamatan if current selection is not in new list
                  if (!data.kecamatans.includes(selectedKecamatan) && selectedKecamatan !== "all-subdistricts") {
                      setSelectedKecamatan("all-subdistricts");
                  }
              }
          } catch (e) {
              console.error("Failed to fetch kecamatans", e);
          }
      }
      fetchKecamatans();
  }, [selectedDapil]);


  const handleApply = () => {
      if (onFilterChange) {
          onFilterChange({
              dapil: selectedDapil === "all-districts" ? null : selectedDapil,
              kecamatan: selectedKecamatan === "all-subdistricts" ? null : selectedKecamatan,
              dateRange: selectedDateRange
          });
      }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
{/* Source filter removed as requested */}
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                <SelectItem value="90days">90 Hari Terakhir</SelectItem>
                <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={selectedDapil} onValueChange={setSelectedDapil}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Daerah Pemilihan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-districts">Semua Dapil</SelectItem>
              {dapils.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedKecamatan} onValueChange={setSelectedKecamatan}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-subdistricts">Semua Kecamatan</SelectItem>
               {kecamatans.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="ml-auto" onClick={handleApply}>
            <Filter className="mr-2 h-4 w-4" />
            Terapkan Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
