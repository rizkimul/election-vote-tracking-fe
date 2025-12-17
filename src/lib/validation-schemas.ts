import { z } from 'zod';

// Helper for NIK validation (basic length check, can be expanded)
const nikSchema = z.string()
  .min(16, "NIK harus terdiri dari 16 digit")
  .max(16, "NIK harus terdiri dari 16 digit")
  .regex(/^\d+$/, "NIK harus berupa angka");

// Login Schema
// Login Schema
export const loginSchema = z.object({
  nik: nikSchema,
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Attendee Schema (for Campaign Management)
// Attendee Schema (for Campaign Management)
export const attendeeSchema = z.object({
  name: z.string().min(2, "Nama harus minimal 2 karakter"),
  nik: nikSchema, 
  phone: z.string()
    .min(10, "Nomor HP tidak valid (minimal 10 digit)")
    .regex(/^\d+$/, "Nomor HP harus berupa angka")
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
});

export type AttendeeFormValues = z.infer<typeof attendeeSchema>;

// Event/Engagement Schema
export const eventSchema = z.object({
  title: z.string().min(5, "Judul kegiatan minimal 5 karakter"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),
  location_kecamatan: z.string().min(1, "Kecamatan wajib dipilih"),
  location_kelurahan: z.string().min(1, "Kelurahan/Desa wajib dipilih"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  attendees: z.array(attendeeSchema).optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;
