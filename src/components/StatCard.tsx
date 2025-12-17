import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../lib/utils'; // Assuming cn utility exists in lib/utils or similar

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string | React.ReactNode;
  trend?: {
    value: number; // percentage or absolute change
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string; // For custom styling
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">{value}</h2>
            {description && (
                <div className="text-xs text-muted-foreground">{description}</div>
            )}
            
            {trend && (
                <div className="flex items-center mt-1 text-xs">
                     {trend.direction === 'up' && <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />}
                     {trend.direction === 'down' && <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />}
                     {trend.direction === 'neutral' && <Minus className="mr-1 h-3 w-3 text-gray-500" />}
                     <span className={cn(
                        trend.direction === 'up' ? "text-green-500" : 
                        trend.direction === 'down' ? "text-red-500" : "text-gray-500",
                        "font-medium"
                     )}>
                        {trend.value}%
                     </span>
                     <span className="ml-1 text-muted-foreground">{trend.label}</span>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
