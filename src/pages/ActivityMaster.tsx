import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl, getApiHeaders, authenticatedFetch } from '../lib/api';

interface ActivityType {
  id: number;
  name: string;
  max_participants: number;
}

export function ActivityMaster() {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [formData, setFormData] = useState({ name: '', max_participants: 100 });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ActivityType | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [affectedEvents, setAffectedEvents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await authenticatedFetch(getApiUrl('/activity-types/'));
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      toast.error('Gagal mengambil data activity type');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing && editId 
        ? getApiUrl(`/activity-types/${editId}`)
        : getApiUrl('/activity-types/');
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await authenticatedFetch(url, {
        method,
        headers: getApiHeaders({ 
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Gagal ${isEditing ? 'mengubah' : 'menyimpan'} data`);
      }

      const newItem = await res.json();
      
      if (isEditing) {
        setActivities(activities.map(a => a.id === editId ? newItem : a));
        toast.success('Activity Type berhasil diperbarui');
        setIsEditing(false);
        setEditId(null);
      } else {
        setActivities([...activities, newItem]);
        toast.success('Activity Type berhasil ditambahkan');
      }
      
      setFormData({ name: '', max_participants: 100 });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity: ActivityType) => {
    setFormData({
      name: activity.name,
      max_participants: activity.max_participants
    });
    setIsEditing(true);
    setEditId(activity.id);
  };

  const cancelEdit = () => {
    setFormData({ name: '', max_participants: 100 });
    setIsEditing(false);
    setEditId(null);
  };

  const handleDelete = async (activity: ActivityType) => {
    setItemToDelete(activity);
    
    // Fetch impacted events
    try {
        const res = await authenticatedFetch(getApiUrl(`/events/?activity_type_id=${activity.id}`));
        if (res.ok) {
            const data = await res.json();
            if (data.items && data.items.length > 0) {
                // Sort by date descending
                const sortedItems = data.items.sort((a: any, b: any) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                
                const formattedEvents = sortedItems.map((ev: any) => ({
                    activity_name: activity.name,
                    date: ev.date,
                    location: ev.kecamatan || 'Lokasi tidak ada'
                }));
                setAffectedEvents(formattedEvents);
            } else {
                setAffectedEvents([]);
            }
        }
    } catch (e) {
        console.error("Failed to fetch impacted events", e);
        setAffectedEvents([]);
    }
    
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeletingId(itemToDelete.id);
    setShowDeleteDialog(false);

    try {
      const res = await authenticatedFetch(getApiUrl(`/activity-types/${itemToDelete.id}`), {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Gagal menghapus data');
      }

      setActivities(activities.filter(a => a.id !== itemToDelete.id));
      toast.success('Activity Type berhasil dihapus');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Jenis Kegiatan' : 'Tambah Jenis Kegiatan'}</CardTitle>
          <CardDescription>{isEditing ? 'Ubah data kegiatan' : 'Buat kategori kegiatan baru'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kegiatan</Label>
              <Input
                id="name"
                placeholder="Contoh: Reses, Sosialisasi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Maksimal Peserta</Label>
              <Input
                id="max"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {isEditing ? (
                  <>Simpan Perubahan</>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah
                  </>
                )}
              </Button>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Batal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Daftar Jenis Kegiatan</CardTitle>
          <CardDescription>Master data jenis kegiatan yang tersedia</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kegiatan</TableHead>
                <TableHead>Max Peserta</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">Belum ada data</TableCell>
                  </TableRow>
              )}
              {activities.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.max_participants}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(item)}
                        disabled={loading}
                      >
                        <Pencil className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id || loading}
                      >
                        <Trash2 className={`h-4 w-4 ${deletingId === item.id ? 'text-gray-300' : 'text-red-500 hover:text-red-700'}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name}
        description={affectedEvents.length > 0 ? "Menghapus jenis kegiatan ini akan menghapus semua data pada Jadwal Kegiatan yang terkait." : undefined}
        affectedItems={affectedEvents}
      />
    </div>
  );
}
