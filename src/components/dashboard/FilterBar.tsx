import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Calendar, Filter } from 'lucide-react';
import { DAPIL_OPTIONS, getKecamatanByDapil, getKecamatanNames } from '../../lib/wilayah-data';

interface FilterBarProps {
  onFilterChange?: (filters: any) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedDapil, setSelectedDapil] = React.useState<string>("all-districts");
  const [selectedKecamatan, setSelectedKecamatan] = React.useState<string>("all-subdistricts");
  const [selectedDateRange, setSelectedDateRange] = React.useState<string>("30days");

  // Get dapil options from static wilayah data
  const dapils = DAPIL_OPTIONS;

  // Get kecamatan options based on selected dapil (cascading filter)
  const kecamatans = React.useMemo(() => {
    if (selectedDapil === "all-districts") {
      return getKecamatanNames();
    }
    return getKecamatanByDapil(selectedDapil).map(k => k.name);
  }, [selectedDapil]);

  // Reset kecamatan when dapil changes and current selection is not in new list
  React.useEffect(() => {
    if (selectedKecamatan !== "all-subdistricts" && !kecamatans.includes(selectedKecamatan)) {
      setSelectedKecamatan("all-subdistricts");
    }
  }, [kecamatans, selectedKecamatan]);


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
