import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Calendar, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { attendeeSchema, AttendeeFormValues } from '../lib/validation-schemas';
import { getApiUrl, getApiHeaders } from '../lib/api';

// --- Local Schemas for specific forms in this page ---

// Schema for Creating an Event
const createEventSchema = z.object({
  activity_type_id: z.string().min(1, "Jenis kegiatan wajib dipilih"),
  dapil: z.string().min(1, "Dapil wajib diisi"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),
  target_participants: z.number().min(1, "Target peserta minimal 1"),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

// Extend Attendee Schema with location fields which are strings in the UI but might be optionals
// For this form, let's enforce them roughly or keep them optional
const attendeeInputSchema = attendeeSchema.extend({
  kecamatan: z.string().optional(),
  desa: z.string().optional(),
  kampung: z.string().optional(),
  rt_rw: z.string().optional(),
});
type AttendeeInputFormValues = z.infer<typeof attendeeInputSchema>;


interface ActivityType {
  id: number;
  name: string;
}

interface Event {
  id: number;
  activity_type_id: number;
  dapil: string;
  date: string;
  target_participants: number;
}

interface Attendee {
  id: number;
  nik: string;
  name: string;
  kecamatan: string;
  desa: string;
}

export function EngagementForm() {
  const [activeTab, setActiveTab] = useState('events');
  const { token } = useAuth();
  
  // -- Data State --
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // -- Forms --
  const eventForm = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      activity_type_id: '',
      dapil: '',
      date: '',
      target_participants: 0
    }
  });

  const attendeeForm = useForm<AttendeeInputFormValues>({
    resolver: zodResolver(attendeeInputSchema),
    defaultValues: {
      nik: '',
      name: '',
      kecamatan: '',
      desa: '',
      kampung: '',
      rt_rw: '',
      phone: '' // Add phone if part of logic, defaulting empty
    }
  });

  useEffect(() => {
    fetchActivityTypes();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
        fetchAttendees(selectedEventId);
    } else {
        setAttendees([]);
    }
  }, [selectedEventId]);

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
  }

  // --- Handlers ---
  const onCreateEvent = async (data: CreateEventFormValues) => {
    try {
        const res = await fetch(getApiUrl('/events/'), {
            method: 'POST',
            headers: getApiHeaders({ 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }),
            body: JSON.stringify(data)
        });

        if (!res.ok) {
           const err = await res.json();
           throw new Error(err.detail || 'Gagal membuat event');
        }
        
        toast.success('Event berhasil dibuat');
        fetchEvents();
        eventForm.reset();
    } catch(e: any) {
        toast.error(e.message);
    }
  };

  const onAddAttendee = async (data: AttendeeInputFormValues) => {
    if (!selectedEventId) {
        toast.error('Pilih event terlebih dahulu');
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
                ...data
            })
        });
        
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Gagal menambahkan peserta');
        }
        
        toast.success('Peserta berhasil ditambahkan');
        fetchAttendees(selectedEventId);
        attendeeForm.reset({
            ...attendeeForm.getValues(), // preserve some values if needed?
            nik: '',
            name: '',
            phone: ''
        }); 
        // Or full reset: attendeeForm.reset();
        // But usually operators keep location same. 
        // For now, let's reset sensitive fields only.
        attendeeForm.setValue('nik', '');
        attendeeForm.setValue('name', '');
        attendeeForm.setValue('phone', '');

    } catch(e: any) {
        toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Engagement</h2>
          <p className="text-muted-foreground">Jadwalkan kegiatan dan data peserta</p>
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
                <CardTitle>Buat Event Baru</CardTitle>
                <CardDescription>Rencanakan kegiatan kampanye baru</CardDescription>
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

                  <div className="space-y-2">
                    <Label>Dapil</Label>
                    <Input 
                        placeholder="Contoh: Dapil 1" 
                        {...eventForm.register('dapil')}
                        className={eventForm.formState.errors.dapil ? "border-red-500" : ""}
                    />
                     {eventForm.formState.errors.dapil && (
                        <p className="text-xs text-red-500">{eventForm.formState.errors.dapil.message}</p>
                    )}
                  </div>

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

                  <Button type="submit" className="w-full">Buat Event</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Daftar Event</CardTitle>
                <CardDescription>Kegiatan yang telah dijadwalkan</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tgl</TableHead>
                            <TableHead>Kegiatan</TableHead>
                            <TableHead>Dapil</TableHead>
                            <TableHead>Target</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 && <TableRow><TableCell colSpan={4} className="text-center md:text-gray-500">Belum ada event</TableCell></TableRow>}
                        {events.map((ev) => (
                            <TableRow key={ev.id}>
                                <TableCell>{ev.date}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">ID: {ev.activity_type_id}</Badge>
                                </TableCell>
                                <TableCell>{ev.dapil}</TableCell>
                                <TableCell>{ev.target_participants}</TableCell>
                            </TableRow>
                        ))}
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
                        <CardDescription>Pastikan event sudah dipilih</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Pilih Event</Label>
                                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih event aktif..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {events.map(ev => (
                                            <SelectItem key={ev.id} value={String(ev.id)}>
                                                {ev.date} - Dapil {ev.dapil} (ID: {ev.id})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <form onSubmit={attendeeForm.handleSubmit(onAddAttendee)} className="space-y-4 border-t pt-4">
                                <div className="space-y-2">
                                    <Label>NIK <span className="text-red-500">*</span></Label>
                                    <Input 
                                        placeholder="16 digit NIK" 
                                        {...attendeeForm.register('nik')}
                                        maxLength={16}
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
                                
                                {/* Helper grid for location */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Kecamatan</Label>
                                        <Input {...attendeeForm.register('kecamatan')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Desa</Label>
                                        <Input {...attendeeForm.register('desa')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label>Kampung</Label>
                                        <Input {...attendeeForm.register('kampung')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>RT/RW</Label>
                                        <Input {...attendeeForm.register('rt_rw')} />
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
                        <CardDescription>Peserta terdaftar untuk event ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NIK</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendees.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-gray-500">
                                            {selectedEventId ? 'Belum ada peserta' : 'Pilih event untuk melihat peserta'}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {attendees.map(att => (
                                    <TableRow key={att.id}>
                                        <TableCell className="font-mono">{att.nik}</TableCell>
                                        <TableCell>{att.name}</TableCell>
                                        <TableCell>{att.kecamatan}, {att.desa}</TableCell>
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

