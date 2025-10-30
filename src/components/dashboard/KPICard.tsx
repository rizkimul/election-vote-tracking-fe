import React from 'react';
import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function KPICard({ title, value, icon: Icon, trend, trendUp }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="mt-2 text-3xl text-gray-900">{value}</p>
            {trend && (
              <p className={`mt-2 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
