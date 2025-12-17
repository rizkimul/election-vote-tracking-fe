import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Calendar, MapPin, Users } from 'lucide-react';

interface ActivityWidgetProps {
  date: string;
  type: string;
  location: string;
  participants: number;
}

export function ActivityWidget({ date, type, location, participants }: ActivityWidgetProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
            <Calendar className="h-3 w-3" />
            <span>{date}</span>
          </div>
          <p className="font-semibold text-gray-900 line-clamp-1">{type}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
             <MapPin className="h-3 w-3" />
             <span className="line-clamp-1">{location}</span>
          </div>
        </div>
        
        <div className="text-right pl-4 border-l ml-4">
           <div className="flex items-center justify-end gap-1 text-gray-900 font-bold text-lg">
             <Users className="h-4 w-4 text-gray-400" />
             {participants}
           </div>
           <p className="text-[10px] uppercase tracking-wider text-gray-500">Peserta</p>
        </div>
      </CardContent>
    </Card>
  );
}
