import React, { useState, useEffect, useMemo } from 'react';
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
import { Combobox } from '../components/ui/combobox';
import { AsyncSearchableCombobox, AsyncComboboxOption } from '../components/ui/async-searchable-combobox';
import { toast } from 'sonner';
import { Calendar, UserPlus, Users, IdCard, GraduationCap, Pencil, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DuplicateNIKConfirmationDialog } from '../components/DuplicateNIKConfirmationDialog';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { useForm, Controller } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getApiUrl, getApiHeaders, authenticatedFetch } from '../lib/api';
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
  alamat: z.string().min(1, "Alamat Lengkap wajib diisi"),  // Combined address (replaces kampung + rt_rw)
  jenis_kelamin: z.enum(["L", "P"], { message: "Jenis Kelamin wajib dipilih" }),
  pekerjaan: z.string().min(1, "Pekerjaan wajib diisi"),
  usia: z.string().min(1, "Usia wajib diisi"),
});

type AttendeeInputFormValues = z.infer<typeof attendeeInputSchema>;

interface ActivityType {
  id: number;
  name: string;
  max_participants: number;
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
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Duplicate NIK confirmation dialog state
  const [duplicateDialog, setDuplicateDialog] = useState<{
    isOpen: boolean;
    nik: string;
    activities: Array<{activity_name: string; date: string; location: string}>;
    pendingData: AttendeeInputFormValues | null;
  }>({ isOpen: false, nik: '', activities: [], pendingData: null });

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: Event | null;
  }>({ isOpen: false, item: null });

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  // Get filtered options based on selection
  const eventKecamatanOptions = getKecamatanNames();
  
  const eventDesaOptions = selectedEventKecamatan 
    ? getDesaByKecamatan(selectedEventKecamatan).map(d => d.name)
    : [];

  const attendeeDesaOptions = attendeeKecamatan 
    ? getDesaByKecamatan(attendeeKecamatan).map(d => d.name)
    : [];

  const filteredAttendees = useMemo(() => {
    if (!searchQuery) return attendees;
    const lowerQuery = searchQuery.toLowerCase();
    return attendees.filter(att => 
      att.name.toLowerCase().includes(lowerQuery) ||
      att.nik.includes(lowerQuery) ||
      (att.alamat?.toLowerCase().includes(lowerQuery)) ||
      (att.kecamatan?.toLowerCase().includes(lowerQuery)) ||
      (att.desa?.toLowerCase().includes(lowerQuery))
    );
  }, [attendees, searchQuery]);



  // Fetch events when page changes
  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

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
      const res = await authenticatedFetch(getApiUrl('/activity-types/'));
      if (res.ok) setActivityTypes(await res.json());
    } catch(e) { console.error(e); }
  };

  const fetchEvents = async (page: number = 1) => {
    try {
      // Server-side pagination with fixed size of 5
      const res = await authenticatedFetch(getApiUrl(`/events/?page=${page}&size=5`));
      if (res.ok) {
        const data = await res.json();
        setEvents(data.items || []);
        setTotalPages(data.pages || 1);
      }
    } catch(e) { console.error(e); }
  };


  const fetchAttendees = async (eventId: string) => {
    try {
      const res = await authenticatedFetch(getApiUrl(`/events/${eventId}/attendees`));
      if (res.ok) setAttendees(await res.json());
    } catch(e) { console.error(e); }
  };

  // --- Handlers ---
  const onCreateEvent = async (data: CreateEventFormValues) => {
    try {
      // Auto-set dapil based on kecamatan if not selected
      const dapil = data.dapil || getDapilByKecamatan(data.kecamatan);
      
      // Validate target participants against max limit
      const activityType = activityTypes.find(t => String(t.id) === data.activity_type_id);
      if (activityType && data.target_participants > activityType.max_participants) {
        toast.error(`Target peserta melebihi batas maksimal (${activityType.max_participants})`);
        return;
      }

      const res = await authenticatedFetch(getApiUrl('/events/'), {
        method: 'POST',
        headers: getApiHeaders({ 
          'Content-Type': 'application/json',
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

  const onAddAttendee = async (data: AttendeeInputFormValues, forceAdd: boolean = false) => {
    if (!selectedEventId) {
      toast.error('Pilih kegiatan terlebih dahulu');
      return;
    }
    
    try {
      const url = forceAdd 
        ? getApiUrl('/events/attendees?force_add=true')
        : getApiUrl('/events/attendees');
      
      console.log('Adding attendee with forceAdd:', forceAdd, 'URL:', url);
        
      const res = await authenticatedFetch(url, {
        method: 'POST',
        headers: getApiHeaders({ 
          'Content-Type': 'application/json',
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
        
        // Handle 409 Conflict - duplicate NIK warning
        if (res.status === 409 && err.detail?.type === 'duplicate_warning') {
          setDuplicateDialog({
            isOpen: true,
            nik: data.nik,
            activities: err.detail.activities || [],
            pendingData: data
          });
          return;
        }
        
        // Handle other errors (including string detail)
        const errorMessage = typeof err.detail === 'string' 
          ? err.detail 
          : err.detail?.message || 'Gagal menambahkan peserta';
        throw new Error(errorMessage);
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

  const onUpdateEvent = async (data: CreateEventFormValues) => {
    if (!editingEventId) return;

    try {
        const dapil = data.dapil || getDapilByKecamatan(data.kecamatan);
        
        // Validate target participants
        const activityType = activityTypes.find(t => String(t.id) === data.activity_type_id);
        if (activityType && data.target_participants > activityType.max_participants) {
          toast.error(`Target peserta melebihi batas maksimal (${activityType.max_participants})`);
          return;
        }

        const res = await authenticatedFetch(getApiUrl(`/events/${editingEventId}`), {
          method: 'PUT',
          headers: getApiHeaders({ 
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            ...data,
            dapil: dapil,
            activity_type_id: parseInt(data.activity_type_id)
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Gagal mengubah event');
        }

        toast.success('Kegiatan berhasil diperbarui');
        fetchEvents();
        cancelEdit();
    } catch(e: any) {
        toast.error(e.message);
    }
  };

  const handleEdit = (event: Event) => {
      setIsEditing(true);
      setEditingEventId(event.id);
      
      eventForm.setValue('activity_type_id', String(event.activity_type_id));
      eventForm.setValue('date', event.date);
      eventForm.setValue('target_participants', event.target_participants);
      
      if (event.kecamatan) {
          setSelectedEventKecamatan(event.kecamatan);
          eventForm.setValue('kecamatan', event.kecamatan);
          if (event.desa) eventForm.setValue('desa', event.desa);
          
          const dapil = getDapilByKecamatan(event.kecamatan);
          if (dapil) {
              setSelectedEventDapil(dapil);
              eventForm.setValue('dapil', dapil);
          }
      }
      
      setActiveTab('events');
      // Scroll to top of form smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
      setIsEditing(false);
      setEditingEventId(null);
      eventForm.reset();
      setSelectedEventDapil('');
      setSelectedEventKecamatan('');
  };

  const handleDeleteClick = (event: Event) => {
      setDeleteDialog({ isOpen: true, item: event });
  };

  const handleConfirmDelete = async () => {
      if (!deleteDialog.item) return;
      
      try {
          const res = await authenticatedFetch(getApiUrl(`/events/${deleteDialog.item.id}`), {
              method: 'DELETE'
          });
          
          if (!res.ok) throw new Error("Gagal menghapus kegiatan");
          
          toast.success("Kegiatan berhasil dihapus");
          fetchEvents();
      } catch (e: any) {
          toast.error(e.message);
      } finally {
          setDeleteDialog({ isOpen: false, item: null });
      }
  };

  const handleDuplicateConfirm = async () => {
    if (duplicateDialog.pendingData) {
      // Close the dialog first
      setDuplicateDialog({ isOpen: false, nik: '', activities: [], pendingData: null });
      // Resubmit with force_add
      await onAddAttendee(duplicateDialog.pendingData, true);
    }
  };

  const handleDuplicateCancel = () => {
    setDuplicateDialog({ isOpen: false, nik: '', activities: [], pendingData: null });
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
    // Auto-set dapil based on kecamatan
    const dapil = getDapilByKecamatan(value);
    if (dapil) {
      setSelectedEventDapil(dapil);
      eventForm.setValue('dapil', dapil);
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
                <CardTitle>{isEditing ? 'Edit Kegiatan' : 'Buat Kegiatan Baru'}</CardTitle>
                <CardDescription>{isEditing ? 'Ubah detail kegiatan' : 'Jadwalkan kegiatan baru'}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={eventForm.handleSubmit(isEditing ? onUpdateEvent : onCreateEvent)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Jenis Kegiatan</Label>
                    <Controller
                      control={eventForm.control}
                      name="activity_type_id"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={eventForm.formState.errors.activity_type_id ? "border-red-600" : ""}>
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
                      <p className="text-xs text-red-600">{eventForm.formState.errors.activity_type_id.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Dapil (Opsional)</Label>
                      <Combobox
                        options={DAPIL_OPTIONS.map(dapil => ({ value: dapil, label: dapil }))}
                        value={selectedEventDapil}
                        onValueChange={handleEventDapilChange}
                        placeholder="Pilih Dapil"
                        searchPlaceholder="Cari dapil..."
                        emptyText="Dapil tidak ditemukan."
                        disabled={true}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Kecamatan <span className="text-red-600">*</span></Label>
                      <Combobox
                        options={eventKecamatanOptions.map(kec => ({ value: kec, label: kec }))}
                        value={selectedEventKecamatan}
                        onValueChange={handleEventKecamatanChange}
                        placeholder="Pilih Kecamatan"
                        searchPlaceholder="Cari kecamatan..."
                        emptyText="Kecamatan tidak ditemukan."
                        className={eventForm.formState.errors.kecamatan ? "border-red-600" : ""}
                      />
                      {eventForm.formState.errors.kecamatan && (
                        <p className="text-xs text-red-600">{eventForm.formState.errors.kecamatan.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Desa/Kelurahan</Label>
                    <Combobox
                      options={eventDesaOptions.map(desa => ({ value: desa, label: desa }))}
                      value={eventForm.watch('desa') || ''}
                      onValueChange={(v: string) => eventForm.setValue('desa', v)}
                      placeholder={selectedEventKecamatan ? "Pilih Desa" : "Pilih Kecamatan dulu"}
                      searchPlaceholder="Cari desa/kelurahan..."
                      emptyText="Desa tidak ditemukan."
                      disabled={!selectedEventKecamatan}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tanggal</Label>
                      <Input 
                        type="date"
                        {...eventForm.register('date')}
                        className={eventForm.formState.errors.date ? "border-red-600" : ""}
                      />
                      {eventForm.formState.errors.date && (
                        <p className="text-xs text-red-600">{eventForm.formState.errors.date.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Target Peserta</Label>
                      <Input 
                        type="number" 
                        {...eventForm.register('target_participants', { valueAsNumber: true })}
                        className={eventForm.formState.errors.target_participants ? "border-red-600" : ""}
                      />
                      {eventForm.formState.errors.target_participants && (
                        <p className="text-xs text-red-600">{eventForm.formState.errors.target_participants.message}</p>
                      )}
                      {/* Max participants hint */}
                      {(() => {
                        const selectedTypeId = eventForm.watch('activity_type_id');
                        const type = activityTypes.find(t => String(t.id) === selectedTypeId);
                        if (type) {
                          return (
                            <p className="text-xs text-muted-foreground mt-1">
                              Maksimal: {type.max_participants} peserta
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {isEditing ? 'Simpan Perubahan' : 'Buat Kegiatan'}
                    </Button>
                    {isEditing && (
                        <Button 
                            type="button" 
                            variant="destructive"
                            onClick={cancelEdit}
                        >
                            <X className="mr-2 h-4 w-4" /> Batal
                        </Button>
                    )}
                  </div>
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
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                            Belum ada kegiatan
                        </TableCell>
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
                          <TableCell>
                            <div className="flex items-center gap-1">
                                <style>{`
                                  .icon-yellow { color: #eab308; transition: color 0.2s; }
                                  .icon-yellow:hover { color: #a16207; }
                                  .icon-red { color: #ef4444; transition: color 0.2s; }
                                  .icon-red:hover { color: #b91c1c; }
                                `}</style>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(ev)}>
                                    <Pencil className="h-4 w-4 icon-yellow" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(ev)}>
                                    <Trash2 className="h-4 w-4 icon-red" />
                                </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex items-center justify-end space-x-1 py-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Number Buttons */}
                  {(() => {
                    const pages: (number | 'ellipsis')[] = [];
                    const maxVisible = 5;
                    
                    if (totalPages <= maxVisible) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      
                      let start = Math.max(2, currentPage - 1);
                      let end = Math.min(totalPages - 1, currentPage + 1);
                      
                      if (start > 2) pages.push('ellipsis');
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (end < totalPages - 1) pages.push('ellipsis');
                      if (totalPages > 1) pages.push(totalPages);
                    }
                    
                    return pages.map((page, idx) => 
                      page === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8"
                        >
                          {page}
                        </Button>
                      )
                    );
                  })()}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

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
                    <AsyncSearchableCombobox
                      value={selectedEventId}
                      onValueChange={setSelectedEventId}
                      placeholder="Pilih kegiatan aktif..."
                      searchPlaceholder="Cari kegiatan atau kecamatan..."
                      emptyText="Tidak ada kegiatan ditemukan."
                      fetchOptions={async ({ page, search }) => {
                        try {
                          const res = await authenticatedFetch(
                            getApiUrl(`/events/?page=${page}&size=10${search ? `&search=${encodeURIComponent(search)}` : ''}`)
                          );
                          if (res.ok) {
                            const data = await res.json();
                            const items: AsyncComboboxOption[] = (data.items || []).map((ev: Event) => {
                              const activityType = activityTypes.find(t => t.id === ev.activity_type_id);
                              const location = ev.kecamatan || ev.dapil || '-';
                              return {
                                value: String(ev.id),
                                label: `${ev.date}, ${activityType?.name || 'Kegiatan'}, ${location}`
                              };
                            });
                            return {
                              items,
                              hasMore: page < (data.pages || 1)
                            };
                          }
                        } catch (e) {
                          console.error('Error fetching events:', e);
                        }
                        return { items: [], hasMore: false };
                      }}
                    />
                  </div>
                  
                  <form onSubmit={attendeeForm.handleSubmit((data) => onAddAttendee(data))} className="space-y-4 border-t pt-4">
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
                        <span className="text-red-600"> *</span>
                      </Label>
                      <Input 
                        placeholder={attendeeForm.watch('identifier_type') === 'NIS' && isEducationActivity 
                          ? "Nomor Induk Siswa" 
                          : "16 digit NIK"
                        }
                        {...attendeeForm.register('nik')}
                        maxLength={attendeeForm.watch('identifier_type') === 'NIK' ? 16 : 20}
                        className={attendeeForm.formState.errors.nik ? "border-red-600" : ""}
                      />
                      {attendeeForm.formState.errors.nik && (
                        <p className="text-xs text-red-600">{attendeeForm.formState.errors.nik.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Nama Lengkap <span className="text-red-600">*</span></Label>
                      <Input 
                        placeholder="Nama Peserta" 
                        {...attendeeForm.register('name')}
                        className={attendeeForm.formState.errors.name ? "border-red-600" : ""}
                      />
                      {attendeeForm.formState.errors.name && (
                        <p className="text-xs text-red-600">{attendeeForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    {/* Location dropdowns */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Kecamatan</Label>
                        <Combobox
                          options={getKecamatanNames().map(kec => ({ value: kec, label: kec }))}
                          value={attendeeKecamatan}
                          onValueChange={handleAttendeeKecamatanChange}
                          placeholder="Pilih Kecamatan"
                          searchPlaceholder="Cari kecamatan..."
                          emptyText="Kecamatan tidak ditemukan."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Desa/Kelurahan</Label>
                        <Combobox
                          options={attendeeDesaOptions.map(desa => ({ value: desa, label: desa }))}
                          value={attendeeForm.watch('desa') || ''}
                          onValueChange={(v: string) => attendeeForm.setValue('desa', v)}
                          placeholder={attendeeKecamatan ? "Pilih Desa" : "Pilih Kecamatan dulu"}
                          searchPlaceholder="Cari desa..."
                          emptyText="Desa tidak ditemukan."
                          disabled={!attendeeKecamatan}
                        />
                      </div>
                    </div>

                    {/* Alamat (combined address) */}
                    <div className="space-y-2">
                      <Label>Alamat Lengkap <span className="text-red-600">*</span></Label>
                      <Textarea 
                        placeholder="Kampung, RT/RW, Detail Alamat"
                        {...attendeeForm.register('alamat')}
                        className={`h-16 ${attendeeForm.formState.errors.alamat ? "border-red-600" : ""}`}
                      />
                      {attendeeForm.formState.errors.alamat && (
                        <p className="text-xs text-red-600">{attendeeForm.formState.errors.alamat.message}</p>
                      )}
                    </div>

                    {/* Demographic fields */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label>Jenis Kelamin <span className="text-red-600">*</span></Label>
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
                        {attendeeForm.formState.errors.jenis_kelamin && (
                          <p className="text-xs text-red-600">{attendeeForm.formState.errors.jenis_kelamin.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Pekerjaan <span className="text-red-600">*</span></Label>
                        <Input 
                          placeholder="Pekerjaan"
                          {...attendeeForm.register('pekerjaan')}
                          className={attendeeForm.formState.errors.pekerjaan ? "border-red-600" : ""}
                        />
                        {attendeeForm.formState.errors.pekerjaan && (
                          <p className="text-xs text-red-600">{attendeeForm.formState.errors.pekerjaan.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Usia <span className="text-red-600">*</span></Label>
                        <Input 
                          type="number"
                          placeholder="Tahun"
                          {...attendeeForm.register('usia')}
                          min={0}
                          max={150}
                          className={attendeeForm.formState.errors.usia ? "border-red-600" : ""}
                        />
                        {attendeeForm.formState.errors.usia && (
                          <p className="text-xs text-red-600">{attendeeForm.formState.errors.usia.message}</p>
                        )}
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <div className="space-y-1">
                  <CardTitle>Daftar Peserta</CardTitle>
                  <CardDescription>Peserta terdaftar untuk kegiatan ini</CardDescription>
                </div>
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                   <Input 
                     placeholder="Cari nama, alamat, NIK..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10"
                   />
                </div>
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
                    {filteredAttendees.map(att => (
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

      {/* Duplicate NIK Confirmation Dialog */}
      <DuplicateNIKConfirmationDialog
        isOpen={duplicateDialog.isOpen}
        onClose={handleDuplicateCancel}
        onConfirm={handleDuplicateConfirm}
        nik={duplicateDialog.nik}
        activities={duplicateDialog.activities}
      />

      <DeleteConfirmationDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={handleConfirmDelete}
        itemName={deleteDialog.item ? 
            `${activityTypes.find(t => t.id === deleteDialog.item?.activity_type_id)?.name} (${deleteDialog.item?.date})` 
            : 'Kegiatan'}
        description="Jika kegiatan ini dihapus, peserta yang mengikuti kegiatan ini juga akan dihapus."
      />
    </div>
  );
}
