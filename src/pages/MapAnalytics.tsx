import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { getApiUrl, getApiHeaders } from '../lib/api';

// Bandung Regency Coordinates
const KECAMATAN_COORDS: Record<string, [number, number]> = {
    "ARJASARI": [-7.0519, 107.6184],
    "BALEENDAH": [-7.0069, 107.6105],
    "BANJARAN": [-7.0427, 107.5927],
    "BOJONGSOANG": [-6.9748, 107.6363],
    "CIPARAY": [-7.0345, 107.7169],
    "CANGKUANG": [-7.0508, 107.5501],
    "CICALENGKA": [-6.9839, 107.8299],
    "CIKANCUNG": [-7.0099, 107.8181],
    "CILENGKRANG": [-6.8929, 107.7088],
    "CILEUNYI": [-6.9366, 107.7381],
    "CIMAUNG": [-7.0882, 107.5670],
    "CIMENYAN": [-6.8648, 107.6587],
    "CIWIDEY": [-7.0933, 107.4475],
    "DAYEUHKOLOT": [-6.9859, 107.6214],
    "IBUN": [-7.1352, 107.7770],
    "KERTASARI": [-7.1895, 107.7126],
    "KATAPANG": [-6.9961, 107.5644],
    "KUTAWARINGIN": [-6.9830, 107.5255],
    "MAJALAYA": [-7.0505, 107.7538],
    "MARGAASIH": [-6.9472, 107.5451],
    "MARGAHAYU": [-6.9631, 107.5796],
    "NAGREG": [-7.0195, 107.8931],
    "PACET": [-7.1130, 107.7299],
    "PAMEUNGPEUK": [-7.0178, 107.6046],
    "PANGALENGAN": [-7.1789, 107.5623],
    "PASEH": [-7.0877, 107.7818],
    "PASIR JAMBU": [-7.0863, 107.4919],
    "PASIRJAMBU": [-7.0863, 107.4919], // Alias
    "RANCABALI": [-7.1517, 107.3996],
    "RANCAEKEK": [-6.9634, 107.7592],
    "SOLOKAN JERUK": [-7.0076, 107.7471],
    "SOLOKANJERUK": [-7.0076, 107.7471], // Alias
    "SOREANG": [-7.0260, 107.5186]
};
// Default fallback
const DEFAULT_CENTER: [number, number] = [-7.0260, 107.5186]; 

// Helper to determine color based on intensity (0-1 range relative to max)
const getColor = (value: number, max: number) => {
    if (max === 0) return '#3b82f6'; // Default blue if no data
    const ratio = value / max;
    
    // Simple Thresholds
    if (ratio < 0.25) return '#10b981'; // Emerald-500 (Low)
    if (ratio < 0.5) return '#eab308'; // Yellow-500 (Low-Mid)
    if (ratio < 0.75) return '#f97316'; // Orange-500 (Mid-High)
    return '#ef4444'; // Red-500 (High)
};

export function MapAnalytics() {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(getApiUrl('/analytics/heatmap'), {
                headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
            });
            if (res.ok) {
                const data = await res.json();
                console.log("Heatmap Data:", data);
                setHeatmapData(data);
            }
        } catch (e) {
            console.error("Map fetch error", e);
            toast.error("Gagal memuat data peta");
        }
    };
    fetchData();
  }, []);

  const maxIntensity = Math.max(...heatmapData.map((d: any) => d.intensity || 0), 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Peta Persebaran Suara & Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
            {/* Map Wrapper */}
            <div className="w-full rounded-md overflow-hidden border relative z-0" style={{ height: '500px' }}>
                <MapContainer 
                    center={DEFAULT_CENTER} 
                    zoom={10} 
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {heatmapData.map((item, idx) => {
                        const rawKey = (item.kecamatan || "").toUpperCase();
                        const key = rawKey.replace("KEC. ", "").replace("KEC ", "").trim();
                        const coords = KECAMATAN_COORDS[key];

                        if (!coords) {
                            // Silently skip or log once in a real app to avoid console spam
                            // console.warn("Unknown location:", item.kecamatan); 
                            return null;
                        }

                        const color = getColor(item.intensity || 0, maxIntensity);

                        return (
                            <CircleMarker 
                                key={idx} 
                                center={coords} 
                                radius={12} // Fixed size dots
                                pathOptions={{
                                    color: '#fff', // White border
                                    weight: 2,
                                    fillColor: color,
                                    fillOpacity: 0.8
                                }}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong className="text-lg">{item.kecamatan}</strong>
                                        <div className="text-sm">Total Suara: <span className="font-bold">{item.intensity?.toLocaleString()}</span></div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        )
                    })}
                </MapContainer>

                {/* Legend Overlay */}
                <div className="absolute bottom-6 left-6 bg-white p-3 rounded-lg shadow-md border border-gray-200 z-[1000] text-xs">
                    <h4 className="font-semibold mb-2">Legenda Intensitas Suara</h4>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span>Tinggi ({">"} 75%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                            <span>Menengah-Tinggi (50-75%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            <span>Menengah-Rendah (25-50%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span>Rendah ({'<'} 25%)</span>
                        </div>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
                Warna titik merepresentasikan intensitas suara relatif terhadap perolehan maksimal di wilayah lain.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
