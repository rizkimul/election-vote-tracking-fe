import { z } from 'zod';

// Helper for NIK validation (16 digits)
const nikSchema = z.string()
  .min(16, "NIK harus terdiri dari 16 digit")
  .max(16, "NIK harus terdiri dari 16 digit")
  .regex(/^\d+$/, "NIK harus berupa angka");

// Helper for NIS validation (flexible digits for education)
const nisSchema = z.string()
  .min(1, "NIS wajib diisi")
  .max(20, "NIS maksimal 20 digit")
  .regex(/^\d+$/, "NIS harus berupa angka");

// SABADESA Login Schema (using username instead of NIK)
export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// SABADESA Attendee Schema (for participants)
export const attendeeSchema = z.object({
  name: z.string().min(2, "Nama harus minimal 2 karakter"),
  nik: z.string().min(1, "NIK/NIS wajib diisi"),  // Can be NIK or NIS
  identifier_type: z.enum(["NIK", "NIS"]).default("NIK"),
  kecamatan: z.string().optional(),
  desa: z.string().optional(),
  alamat: z.string().optional(),  // Combined address
  jenis_kelamin: z.enum(["L", "P"]).optional(),
  pekerjaan: z.string().optional(),
  usia: z.number().min(0).max(150).optional(),
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
