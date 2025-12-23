import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, UserPlus, Users, IdCard, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getApiUrl, getApiHeaders } from '../lib/api';
import { 
  DAPIL_OPTIONS, 
  KECAMATAN_DATA, 
  getKecamatanByDapil, 
  getDesaByKecamatan, 
  getDapilByKecamatan,
  getKecamatanNames 
} from '../lib/wilayah-data';

// --- SABADESA Local Schemas ---

// Schema for Creating an Event
const createEventSchema = z.object({
  activity_type_id: z.string().min(1, "Jenis kegiatan wajib dipilih"),
  dapil: z.string().optional(),
  kecamatan: z.string().min(1, "Kecamatan wajib dipilih"),
  desa: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),
  target_participants: z.number().min(1, "Target peserta minimal 1"),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

// SABADESA Attendee Schema with new demographic fields
const attendeeInputSchema = z.object({
  nik: z.string().min(1, "NIK/NIS wajib diisi"),
  identifier_type: z.enum(["NIK", "NIS"]),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  kecamatan: z.string().optional(),
  desa: z.string().optional(),
  alamat: z.string().optional(),  // Combined address (replaces kampung + rt_rw)
  jenis_kelamin: z.enum(["L", "P"]).optional(),
  pekerjaan: z.string().optional(),
  usia: z.string().optional(),
});

type AttendeeInputFormValues = z.infer<typeof attendeeInputSchema>;

interface ActivityType {
  id: number;
  name: string;
}

interface Event {
  id: number;
  activity_type_id: number;
  kecamatan?: string;
  desa?: string;
  dapil?: string;
  date: string;
  target_participants: number;
}

interface Attendee {
  id: number;
  nik: string;
  name: string;
  alamat?: string;
  kecamatan?: string;
  desa?: string;
}

export function EngagementForm() {
  const [activeTab, setActiveTab] = useState('events');
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  
  // -- Data State --
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Event form location state
  const [selectedEventDapil, setSelectedEventDapil] = useState<string>('');
  const [selectedEventKecamatan, setSelectedEventKecamatan] = useState<string>('');

  // Attendee form location state
  const [attendeeKecamatan, setAttendeeKecamatan] = useState<string>('');

  // Get filtered options based on selection
  const eventKecamatanOptions = selectedEventDapil 
    ? getKecamatanByDapil(selectedEventDapil).map(k => k.name)
    : getKecamatanNames();
  
  const eventDesaOptions = selectedEventKecamatan 
    ? getDesaByKecamatan(selectedEventKecamatan).map(d => d.name)
    : [];

  const attendeeDesaOptions = attendeeKecamatan 
    ? getDesaByKecamatan(attendeeKecamatan).map(d => d.name)
    : [];

  // -- Forms --
  const eventForm = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      activity_type_id: '',
      dapil: '',
      kecamatan: '',
      desa: '',
      date: '',
      target_participants: 0
    }
  });

  const attendeeForm = useForm<AttendeeInputFormValues>({
    resolver: zodResolver(attendeeInputSchema),
    defaultValues: {
      nik: '',
      identifier_type: 'NIK',
      name: '',
      kecamatan: '',
      desa: '',
      alamat: '',
      jenis_kelamin: undefined,
      pekerjaan: '',
      usia: ''
    }
  });

  // Determine if NIK/NIS toggle should show based on the selected event's activity type
  const selectedEvent = events.find(e => String(e.id) === selectedEventId);
  const selectedEventActivityType = activityTypes.find(t => t.id === selectedEvent?.activity_type_id);
  const isEducationActivity = selectedEventActivityType?.name?.toLowerCase().includes('pendidikan') || 
                               selectedEventActivityType?.name?.toLowerCase().includes('demokrasi');

  useEffect(() => {
    fetchActivityTypes();
    fetchEvents();
    
    // Pre-fill kecamatan from URL parameter (from Jadwalkan button)
    const kecamatanParam = searchParams.get('kecamatan');
    if (kecamatanParam) {
      setSelectedEventKecamatan(kecamatanParam);
      eventForm.setValue('kecamatan', kecamatanParam);
      
      // Auto-set dapil based on kecamatan
      const dapil = getDapilByKecamatan(kecamatanParam);
      if (dapil) {
        setSelectedEventDapil(dapil);
        eventForm.setValue('dapil', dapil);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendees(selectedEventId);
      
      // Auto-populate kecamatan and desa from selected event
      const selectedEvent = events.find(e => String(e.id) === selectedEventId);
      if (selectedEvent) {
        if (selectedEvent.kecamatan) {
          setAttendeeKecamatan(selectedEvent.kecamatan);
          attendeeForm.setValue('kecamatan', selectedEvent.kecamatan);
        }
        if (selectedEvent.desa) {
          attendeeForm.setValue('desa', selectedEvent.desa);
        }
      }
    } else {
      setAttendees([]);
    }
  }, [selectedEventId, events]);

  // --- Fetchers ---
  const fetchActivityTypes = async () => {
    try {
      const res = await fetch(getApiUrl('/activity-types/'), {
        headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
      });
      if (res.ok) setActivityTypes(await res.json());
    } catch(e) { console.error(e); }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(getApiUrl('/events/'), {
        headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.items || []); 
      }
    } catch(e) { console.error(e); }
  };

  const fetchAttendees = async (eventId: string) => {
    try {
      const res = await fetch(getApiUrl(`/events/${eventId}/attendees`), {
        headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
      });
      if (res.ok) setAttendees(await res.json());
    } catch(e) { console.error(e); }
  };

  // --- Handlers ---
  const onCreateEvent = async (data: CreateEventFormValues) => {
    try {
      // Auto-set dapil based on kecamatan if not selected
      const dapil = data.dapil || getDapilByKecamatan(data.kecamatan);
      
      const res = await fetch(getApiUrl('/events/'), {
        method: 'POST',
        headers: getApiHeaders({ 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }),
        body: JSON.stringify({
          ...data,
          dapil: dapil,
          activity_type_id: parseInt(data.activity_type_id)
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Gagal membuat event');
      }
      
      toast.success('Kegiatan berhasil dibuat');
      fetchEvents();
      eventForm.reset();
      setSelectedEventDapil('');
      setSelectedEventKecamatan('');
    } catch(e: any) {
      toast.error(e.message);
    }
  };

  const onAddAttendee = async (data: AttendeeInputFormValues) => {
    if (!selectedEventId) {
      toast.error('Pilih kegiatan terlebih dahulu');
      return;
    }
    
    try {
      const res = await fetch(getApiUrl('/events/attendees'), {
        method: 'POST',
        headers: getApiHeaders({ 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }),
        body: JSON.stringify({
          event_id: parseInt(selectedEventId),
          nik: data.nik,
          identifier_type: data.identifier_type,
          name: data.name,
          kecamatan: data.kecamatan,
          desa: data.desa,
          alamat: data.alamat,
          jenis_kelamin: data.jenis_kelamin,
          pekerjaan: data.pekerjaan,
          usia: data.usia ? parseInt(data.usia) : null
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Gagal menambahkan peserta');
      }
      
      toast.success('Peserta berhasil ditambahkan');
      fetchAttendees(selectedEventId);
      // Reset only the personal data, keep location
      attendeeForm.setValue('nik', '');
      attendeeForm.setValue('name', '');
      attendeeForm.setValue('pekerjaan', '');
      attendeeForm.setValue('usia', '');
    } catch(e: any) {
      toast.error(e.message);
    }
  };

  const handleEventDapilChange = (value: string) => {
    setSelectedEventDapil(value);
    setSelectedEventKecamatan('');
    eventForm.setValue('dapil', value);
    eventForm.setValue('kecamatan', '');
    eventForm.setValue('desa', '');
  };

  const handleEventKecamatanChange = (value: string) => {
    setSelectedEventKecamatan(value);
    eventForm.setValue('kecamatan', value);
    eventForm.setValue('desa', '');
    // Auto-set dapil if not set
    if (!selectedEventDapil) {
      const dapil = getDapilByKecamatan(value);
      if (dapil) {
        setSelectedEventDapil(dapil);
        eventForm.setValue('dapil', dapil);
      }
    }
  };

  const handleAttendeeKecamatanChange = (value: string) => {
    setAttendeeKecamatan(value);
    attendeeForm.setValue('kecamatan', value);
    attendeeForm.setValue('desa', '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Kegiatan</h2>
          <p className="text-muted-foreground">Jadwalkan kegiatan dan input data peserta</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 h-auto">
          <TabsTrigger value="events" className="flex items-center gap-2 px-6 py-2 transition-all shadow-sm">
            <Calendar className="h-4 w-4" />
            Jadwal Kegiatan
          </TabsTrigger>
          <TabsTrigger value="attendees" className="flex items-center gap-2 px-6 py-2 transition-all shadow-sm">
            <Users className="h-4 w-4" />
            Input Peserta
          </TabsTrigger>
        </TabsList>

        {/* --- EVENTS TAB --- */}
        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Buat Kegiatan Baru</CardTitle>
                <CardDescription>Jadwalkan kegiatan baru</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={eventForm.handleSubmit(onCreateEvent)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Jenis Kegiatan</Label>
                    <Controller
                      control={eventForm.control}
                      name="activity_type_id"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={eventForm.formState.errors.activity_type_id ? "border-red-500" : ""}>
                            <SelectValue placeholder="Pilih jenis kegiatan" />
                          </SelectTrigger>
                          <SelectContent>
                            {activityTypes.map(type => (
                              <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {eventForm.formState.errors.activity_type_id && (
                      <p className="text-xs text-red-500">{eventForm.formState.errors.activity_type_id.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Dapil (Opsional)</Label>
                      <Select value={selectedEventDapil} onValueChange={handleEventDapilChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Dapil" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAPIL_OPTIONS.map(dapil => (
                            <SelectItem key={dapil} value={dapil}>{dapil}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Kecamatan <span className="text-red-500">*</span></Label>
                      <Select value={selectedEventKecamatan} onValueChange={handleEventKecamatanChange}>
                        <SelectTrigger className={eventForm.formState.errors.kecamatan ? "border-red-500" : ""}>
                          <SelectValue placeholder="Pilih Kecamatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventKecamatanOptions.map(kec => (
                            <SelectItem key={kec} value={kec}>{kec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {eventForm.formState.errors.kecamatan && (
                        <p className="text-xs text-red-500">{eventForm.formState.errors.kecamatan.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Desa/Kelurahan</Label>
                    <Select 
                      value={eventForm.watch('desa') || ''} 
                      onValueChange={(v: string) => eventForm.setValue('desa', v)}
                      disabled={!selectedEventKecamatan}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedEventKecamatan ? "Pilih Desa" : "Pilih Kecamatan dulu"} />
                      </SelectTrigger>
                      <SelectContent>
                        {eventDesaOptions.map(desa => (
                          <SelectItem key={desa} value={desa}>{desa}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tanggal</Label>
                      <Input 
                        type="date"
                        {...eventForm.register('date')}
                        className={eventForm.formState.errors.date ? "border-red-500" : ""}
                      />
                      {eventForm.formState.errors.date && (
                        <p className="text-xs text-red-500">{eventForm.formState.errors.date.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Target Peserta</Label>
                      <Input 
                        type="number" 
                        {...eventForm.register('target_participants', { valueAsNumber: true })}
                        className={eventForm.formState.errors.target_participants ? "border-red-500" : ""}
                      />
                      {eventForm.formState.errors.target_participants && (
                        <p className="text-xs text-red-500">{eventForm.formState.errors.target_participants.message}</p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full">Buat Kegiatan</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Daftar Kegiatan</CardTitle>
                <CardDescription>Kegiatan yang telah dijadwalkan</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tgl</TableHead>
                      <TableHead>Kegiatan</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">Belum ada kegiatan</TableCell>
                      </TableRow>
                    )}
                    {events.map((ev) => {
                      const activityType = activityTypes.find(t => t.id === ev.activity_type_id);
                      return (
                        <TableRow key={ev.id}>
                          <TableCell>{ev.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{activityType?.name || `ID: ${ev.activity_type_id}`}</Badge>
                          </TableCell>
                          <TableCell>{ev.kecamatan || ev.dapil || '-'}</TableCell>
                          <TableCell>{ev.target_participants}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- ATTENDEES TAB --- */}
        <TabsContent value="attendees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Input Peserta</CardTitle>
                <CardDescription>Pastikan kegiatan sudah dipilih</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pilih Kegiatan</Label>
                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kegiatan aktif..." />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map(ev => {
                          const activityType = activityTypes.find(t => t.id === ev.activity_type_id);
                          const location = ev.kecamatan || ev.dapil || '-';
                          return (
                            <SelectItem key={ev.id} value={String(ev.id)}>
                              {ev.date}, {activityType?.name || 'Unknown Activity'}, {location}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <form onSubmit={attendeeForm.handleSubmit(onAddAttendee)} className="space-y-4 border-t pt-4">
                    {/* NIK/NIS Toggle for Education Activities */}
                    {isEducationActivity && (
                      <div className="space-y-3 mt-4">
                        <Label>Jenis Identitas</Label>
                        <Controller
                          control={attendeeForm.control}
                          name="identifier_type"
                          render={({ field }) => (
                            <RadioGroup 
                              onValueChange={field.onChange} 
                              value={field.value}
                              className="flex flex-row gap-4"
                            >
                              <div className={`flex flex-1 items-center gap-3 rounded-full px-4 py-3 border transition-all cursor-pointer ${field.value === 'NIK' ? 'bg-primary/10 border-primary/20' : 'bg-transparent border-transparent hover:bg-muted/50'}`}>
                                <RadioGroupItem value="NIK" id="nik" className="border-primary border-2" />
                                <Label htmlFor="nik" className="font-medium cursor-pointer w-full">
                                  NIK (KTP)
                                </Label>
                              </div>

                              <div className={`flex flex-1 items-center gap-3 rounded-full px-4 py-3 border transition-all cursor-pointer ${field.value === 'NIS' ? 'bg-primary/10 border-primary/20' : 'bg-transparent border-transparent hover:bg-muted/50'}`}>
                                <RadioGroupItem value="NIS" id="nis" className="border-primary border-2" />
                                <Label htmlFor="nis" className="font-medium cursor-pointer w-full">
                                  NIS (Siswa)
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>
                    )}

                    <div className="space-y-2 mt-4">
                      <Label>
                        {attendeeForm.watch('identifier_type') === 'NIS' && isEducationActivity ? 'NIS' : 'NIK'} 
                        <span className="text-red-500"> *</span>
                      </Label>
                      <Input 
                        placeholder={attendeeForm.watch('identifier_type') === 'NIS' && isEducationActivity 
                          ? "Nomor Induk Siswa" 
                          : "16 digit NIK"
                        }
                        {...attendeeForm.register('nik')}
                        maxLength={attendeeForm.watch('identifier_type') === 'NIK' ? 16 : 20}
                        className={attendeeForm.formState.errors.nik ? "border-red-500" : ""}
                      />
                      {attendeeForm.formState.errors.nik && (
                        <p className="text-xs text-red-500">{attendeeForm.formState.errors.nik.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="Nama Peserta" 
                        {...attendeeForm.register('name')}
                        className={attendeeForm.formState.errors.name ? "border-red-500" : ""}
                      />
                      {attendeeForm.formState.errors.name && (
                        <p className="text-xs text-red-500">{attendeeForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    {/* Location dropdowns */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Kecamatan</Label>
                        <Select value={attendeeKecamatan} onValueChange={handleAttendeeKecamatanChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            {getKecamatanNames().map(kec => (
                              <SelectItem key={kec} value={kec}>{kec}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Desa/Kelurahan</Label>
                        <Select 
                          value={attendeeForm.watch('desa') || ''} 
                          onValueChange={(v: string) => attendeeForm.setValue('desa', v)}
                          disabled={!attendeeKecamatan}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            {attendeeDesaOptions.map(desa => (
                              <SelectItem key={desa} value={desa}>{desa}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Alamat (combined address) */}
                    <div className="space-y-2">
                      <Label>Alamat Lengkap</Label>
                      <Textarea 
                        placeholder="Kampung, RT/RW, Detail Alamat"
                        {...attendeeForm.register('alamat')}
                        className="h-16"
                      />
                    </div>

                    {/* Demographic fields */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label>Jenis Kelamin</Label>
                        <Controller
                          control={attendeeForm.control}
                          name="jenis_kelamin"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="L/P" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="L">Laki-laki</SelectItem>
                                <SelectItem value="P">Perempuan</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pekerjaan</Label>
                        <Input 
                          placeholder="Pekerjaan"
                          {...attendeeForm.register('pekerjaan')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Usia</Label>
                        <Input 
                          type="number"
                          placeholder="Tahun"
                          {...attendeeForm.register('usia')}
                          min={0}
                          max={150}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={!selectedEventId || attendeeForm.formState.isSubmitting}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {attendeeForm.formState.isSubmitting ? 'Menyimpan...' : 'Tambah Peserta'}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Daftar Peserta</CardTitle>
                <CardDescription>Peserta terdaftar untuk kegiatan ini</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NAMA</TableHead>
                      <TableHead>ALAMAT</TableHead>
                      <TableHead>NIK</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          {selectedEventId ? 'Belum ada peserta' : 'Pilih kegiatan untuk melihat peserta'}
                        </TableCell>
                      </TableRow>
                    )}
                    {attendees.map(att => (
                      <TableRow key={att.id}>
                        <TableCell className="font-medium">{att.name}</TableCell>
                        <TableCell>{att.alamat || `${att.kecamatan || ''}, ${att.desa || ''}`.trim() || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{att.nik}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
