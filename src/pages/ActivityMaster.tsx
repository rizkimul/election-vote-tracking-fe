import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl, getApiHeaders } from '../lib/api';

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
  const { token } = useAuth();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch(getApiUrl('/activity-types/'), {
        headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
      });
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
      const res = await fetch(getApiUrl('/activity-types/'), {
        method: 'POST',
        headers: getApiHeaders({ 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }),
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan data');
      }

      const newItem = await res.json();
      setActivities([...activities, newItem]);
      setFormData({ name: '', max_participants: 100 });
      toast.success('Activity Type berhasil ditambahkan');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (activity: ActivityType) => {
    setItemToDelete(activity);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeletingId(itemToDelete.id);
    setShowDeleteDialog(false);

    try {
      const res = await fetch(getApiUrl(`/activity-types/${itemToDelete.id}`), {
        method: 'DELETE',
        headers: getApiHeaders({ 'Authorization': `Bearer ${token}` })
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
          <CardTitle>Tambah Jenis Kegiatan</CardTitle>
          <CardDescription>Buat kategori kegiatan baru</CardDescription>
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
            <Button type="submit" className="w-full" disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah
            </Button>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                    >
                      <Trash2 className={`h-4 w-4 ${deletingId === item.id ? 'text-gray-300' : 'text-red-500 hover:text-red-700'}`} />
                    </Button>
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
      />
    </div>
  );
}
