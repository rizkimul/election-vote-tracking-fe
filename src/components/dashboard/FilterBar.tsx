import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Calendar, Filter } from 'lucide-react';

interface FilterBarProps {
  onFilterChange?: (filters: any) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select defaultValue="30days">
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
          
          <Select defaultValue="all-districts">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Daerah Pemilihan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-districts">Semua Dapil</SelectItem>
              <SelectItem value="district-1">Dapil 1</SelectItem>
              <SelectItem value="district-2">Dapil 2</SelectItem>
              <SelectItem value="district-3">Dapil 3</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all-subdistricts">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-subdistricts">Semua Kecamatan</SelectItem>
              <SelectItem value="subdistrict-a">Kecamatan A</SelectItem>
              <SelectItem value="subdistrict-b">Kecamatan B</SelectItem>
              <SelectItem value="subdistrict-c">Kecamatan C</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="ml-auto">
            <Filter className="mr-2 h-4 w-4" />
            Terapkan Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
