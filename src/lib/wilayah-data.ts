/**
 * Wilayah Data for Kabupaten Bandung
 * 31 Kecamatan with 270 Desa + 10 Kelurahan = 280 Desa/Kelurahan total
 * 
 * Data source: BPS Kabupaten Bandung
 */

export interface Desa {
  name: string;
  type: 'Desa' | 'Kelurahan';
}

export interface Kecamatan {
  name: string;
  dapil: string;
  villages: Desa[];
}

// Dapil regions for filtering
export const DAPIL_OPTIONS = [
  'DAPIL 1',
  'DAPIL 2', 
  'DAPIL 3',
  'DAPIL 4',
  'DAPIL 5',
  'DAPIL 6',
];

// All 31 Kecamatan with their Desa/Kelurahan
export const KECAMATAN_DATA: Kecamatan[] = [
  {
    name: 'ARJASARI',
    dapil: 'DAPIL 7',
    villages: [
      { name: 'Ancolmekar', type: 'Desa' },
      { name: 'Arjasari', type: 'Desa' },
      { name: 'Baros', type: 'Desa' },
      { name: 'Batukarut', type: 'Desa' },
      { name: 'Lebakwangi', type: 'Desa' },
      { name: 'Mangunjaya', type: 'Desa' },
      { name: 'Mekarjaya', type: 'Desa' },
      { name: 'Patrolsari', type: 'Desa' },
      { name: 'Pinggirsari', type: 'Desa' },
      { name: 'Rancakole', type: 'Desa' },
      { name: 'Wargaluyu', type: 'Desa' },
    ]
  },
  {
    name: 'BALEENDAH',
    dapil: 'DAPIL 6',
    villages: [
      { name: 'Andir', type: 'Kelurahan' },
      { name: 'Baleendah', type: 'Kelurahan' },
      { name: 'Bojongmalaka', type: 'Desa' },
      { name: 'Jelekong', type: 'Kelurahan' },
      { name: 'Malakasari', type: 'Desa' },
      { name: 'Manggahang', type: 'Kelurahan' },
      { name: 'Rancamanyar', type: 'Desa' },
      { name: 'Wargamekar', type: 'Kelurahan' },
    ]
  },
  {
    name: 'BANJARAN',
    dapil: 'DAPIL 7',
    villages: [
      { name: 'Banjaran', type: 'Desa' },
      { name: 'Banjaran Wetan', type: 'Desa' },
      { name: 'Ciapus', type: 'Desa' },
      { name: 'Ciherang', type: 'Desa' },
      { name: 'Kamasan', type: 'Desa' },
      { name: 'Kiangroke', type: 'Desa' },
      { name: 'Margahurip', type: 'Desa' },
      { name: 'Mekarjaya', type: 'Desa' },
      { name: 'Neglasari', type: 'Desa' },
      { name: 'Pasirmulya', type: 'Desa' },
      { name: 'Sindangpanon', type: 'Desa' },
      { name: 'Tarajusari', type: 'Desa' },
    ]
  },
  {
    name: 'BOJONGSOANG',
    dapil: 'DAPIL 3',
    villages: [
      { name: 'Bojongsari', type: 'Desa' },
      { name: 'Bojongsoang', type: 'Desa' },
      { name: 'Buahbatu', type: 'Desa' },
      { name: 'Cipagalo', type: 'Desa' },
      { name: 'Lengkong', type: 'Desa' },
      { name: 'Tegalluar', type: 'Desa' },
    ]
  },
  {
    name: 'CANGKUANG',
    dapil: 'DAPIL 1',
    villages: [
      { name: 'Bandasari', type: 'Desa' },
      { name: 'Cangkuang', type: 'Desa' },
      { name: 'Ciluncat', type: 'Desa' },
      { name: 'Jatisari', type: 'Desa' },
      { name: 'Nagrak', type: 'Desa' },
      { name: 'Pananjung', type: 'Desa' },
      { name: 'Tanjungsari', type: 'Desa' },
    ]
  },
  {
    name: 'CICALENGKA',
    dapil: 'DAPIL 4',
    villages: [
      { name: 'Babakan Peuteuy', type: 'Desa' },
      { name: 'Cicalengka Kulon', type: 'Desa' },
      { name: 'Cicalengka Wetan', type: 'Desa' },
      { name: 'Cikuya', type: 'Desa' },
      { name: 'Dampit', type: 'Desa' },
      { name: 'Margaasih', type: 'Desa' },
      { name: 'Nagrog', type: 'Desa' },
      { name: 'Narawita', type: 'Desa' },
      { name: 'Panenjoan', type: 'Desa' },
      { name: 'Tanjungwangi', type: 'Desa' },
      { name: 'Tenjolaya', type: 'Desa' },
      { name: 'Waluya', type: 'Desa' },
    ]
  },
  {
    name: 'CIKANCUNG',
    dapil: 'DAPIL 4',
    villages: [
      { name: 'Cihanyir', type: 'Desa' },
      { name: 'Cikancung', type: 'Desa' },
      { name: 'Cikasungka', type: 'Desa' },
      { name: 'Ciluluk', type: 'Desa' },
      { name: 'Hegarmanah', type: 'Desa' },
      { name: 'Mandalasari', type: 'Desa' },
      { name: 'Mekarlaksana', type: 'Desa' },
      { name: 'Srirahayu', type: 'Desa' },
      { name: 'Tanjunglaya', type: 'Desa' },
    ]
  },
  {
    name: 'CILENGKRANG',
    dapil: 'DAPIL 3',
    villages: [
      { name: 'Cilengkrang', type: 'Desa' },
      { name: 'Cipanjalu', type: 'Desa' },
      { name: 'Ciporeat', type: 'Desa' },
      { name: 'Girimekar', type: 'Desa' },
      { name: 'Jatiendah', type: 'Desa' },
      { name: 'Melatiwangi', type: 'Desa' },
    ]
  },
  {
    name: 'CILEUNYI',
    dapil: 'DAPIL 3',
    villages: [
      { name: 'Cibiru Hilir', type: 'Desa' },
      { name: 'Cibiru Wetan', type: 'Desa' },
      { name: 'Cileunyi Kulon', type: 'Desa' },
      { name: 'Cileunyi Wetan', type: 'Desa' },
      { name: 'Cimekar', type: 'Desa' },
      { name: 'Cinunuk', type: 'Desa' },
    ]
  },
  {
    name: 'CIMAUNG',
    dapil: 'DAPIL 7',
    villages: [
      { name: 'Campakamulya', type: 'Desa' },
      { name: 'Cikalong', type: 'Desa' },
      { name: 'Cimaung', type: 'Desa' },
      { name: 'Cipinang', type: 'Desa' },
      { name: 'Jagabaya', type: 'Desa' },
      { name: 'Malasari', type: 'Desa' },
      { name: 'Mekarsari', type: 'Desa' },
      { name: 'Pasirhuni', type: 'Desa' },
      { name: 'Sukamaju', type: 'Desa' },
      { name: 'Warjabakti', type: 'Desa' },
    ]
  },
  {
    name: 'CIMENYAN',
    dapil: 'DAPIL 3',
    villages: [
      { name: 'Cibeunying', type: 'Kelurahan' },
      { name: 'Ciburial', type: 'Desa' },
      { name: 'Cikadut', type: 'Desa' },
      { name: 'Cimenyan', type: 'Desa' },
      { name: 'Mandalamekar', type: 'Desa' },
      { name: 'Mekarmanik', type: 'Desa' },
      { name: 'Mekarsaluyu', type: 'Desa' },
      { name: 'Padasuka', type: 'Kelurahan' },
      { name: 'Sindanglaya', type: 'Desa' },
    ]
  },
  {
    name: 'CIPARAY',
    dapil: 'DAPIL 6',
    villages: [
      { name: 'Babakan', type: 'Desa' },
      { name: 'Bumiwangi', type: 'Desa' },
      { name: 'Ciheulang', type: 'Desa' },
      { name: 'Cikoneng', type: 'Desa' },
      { name: 'Ciparay', type: 'Desa' },
      { name: 'Gunungleutik', type: 'Desa' },
      { name: 'Manggungharja', type: 'Desa' },
      { name: 'Mekarlaksana', type: 'Desa' },
      { name: 'Mekarsari', type: 'Desa' },
      { name: 'Pakutandang', type: 'Desa' },
      { name: 'Sagaracipta', type: 'Desa' },
      { name: 'Sarimahi', type: 'Desa' },
      { name: 'Serangmekar', type: 'Desa' },
      { name: 'Sumbersari', type: 'Desa' },
    ]
  },
  {
    name: 'CIWIDEY',
    dapil: 'DAPIL 1',
    villages: [
      { name: 'Ciwidey', type: 'Desa' },
      { name: 'Lebakmuncang', type: 'Desa' },
      { name: 'Nengkelan', type: 'Desa' },
      { name: 'Panundaan', type: 'Desa' },
      { name: 'Panyocokan', type: 'Desa' },
      { name: 'Rawabogo', type: 'Desa' },
      { name: 'Sukawening', type: 'Desa' },
    ]
  },
  {
    name: 'DAYEUHKOLOT',
    dapil: 'DAPIL 2',
    villages: [
      { name: 'Cangkuang Kulon', type: 'Desa' },
      { name: 'Cangkuang Wetan', type: 'Desa' },
      { name: 'Citeureup', type: 'Desa' },
      { name: 'Dayeuhkolot', type: 'Desa' },
      { name: 'Pasawahan', type: 'Kelurahan' },
      { name: 'Sukapura', type: 'Desa' },
    ]
  },
  {
    name: 'IBUN',
    dapil: 'DAPIL 5',
    villages: [
      { name: 'Cibeet', type: 'Desa' },
      { name: 'Dukuh', type: 'Desa' },
      { name: 'Ibun', type: 'Desa' },
      { name: 'Karyalaksana', type: 'Desa' },
      { name: 'Laksana', type: 'Desa' },
      { name: 'Lampegan', type: 'Desa' },
      { name: 'Mekarwangi', type: 'Desa' },
      { name: 'Neglasari', type: 'Desa' },
      { name: 'Pangguh', type: 'Desa' },
      { name: 'Sudi', type: 'Desa' },
      { name: 'Talun', type: 'Desa' },
      { name: 'Tanggulun', type: 'Desa' },
    ]
  },
  {
    name: 'KATAPANG',
    dapil: 'DAPIL 2',
    villages: [
      { name: 'Banyusari', type: 'Desa' },
      { name: 'Cilampeni', type: 'Desa' },
      { name: 'Gandasari', type: 'Desa' },
      { name: 'Katapang', type: 'Desa' },
      { name: 'Pangauban', type: 'Desa' },
      { name: 'Sangkanhurip', type: 'Desa' },
      { name: 'Sukamukti', type: 'Desa' },
    ]
  },
  {
    name: 'KERTASARI',
    dapil: 'DAPIL 6',
    villages: [
      { name: 'Cibeureum', type: 'Desa' },
      { name: 'Cihawuk', type: 'Desa' },
      { name: 'Cikembang', type: 'Desa' },
      { name: 'Neglawangi', type: 'Desa' },
      { name: 'Resmitingal', type: 'Desa' },
      { name: 'Santosa', type: 'Desa' },
      { name: 'Sukapura', type: 'Desa' },
      { name: 'Tarumajaya', type: 'Desa' },
    ]
  },
  {
    name: 'KUTAWARINGIN',
    dapil: 'DAPIL 1',
    villages: [
      { name: 'Buninagara', type: 'Desa' },
      { name: 'Cibodas', type: 'Desa' },
      { name: 'Cilame', type: 'Desa' },
      { name: 'Gajahmekar', type: 'Desa' },
      { name: 'Jatisari', type: 'Desa' },
      { name: 'Jelegong', type: 'Desa' },
      { name: 'Kopo', type: 'Desa' },
      { name: 'Kutawaringin', type: 'Desa' },
      { name: 'Padasuka', type: 'Desa' },
      { name: 'Pameuntasan', type: 'Desa' },
      { name: 'Sukamulya', type: 'Desa' },
    ]
  },
  {
    name: 'MAJALAYA',
    dapil: 'DAPIL 5',
    villages: [
      { name: 'Biru', type: 'Desa' },
      { name: 'Bojong', type: 'Desa' },
      { name: 'Majakerta', type: 'Desa' },
      { name: 'Majalaya', type: 'Desa' },
      { name: 'Majasetra', type: 'Desa' },
      { name: 'Neglasari', type: 'Desa' },
      { name: 'Padaulun', type: 'Desa' },
      { name: 'Padamulya', type: 'Desa' },
      { name: 'Sukamaju', type: 'Desa' },
      { name: 'Sukamukti', type: 'Desa' },
      { name: 'Wangisagara', type: 'Desa' },
    ]
  },
  {
    name: 'MARGAASIH',
    dapil: 'DAPIL 2',
    villages: [
      { name: 'Cigondewah Hilir', type: 'Desa' },
      { name: 'Lagadar', type: 'Desa' },
      { name: 'Margaasih', type: 'Desa' },
      { name: 'Mekar Rahayu', type: 'Desa' },
      { name: 'Nanjung', type: 'Desa' },
      { name: 'Rahayu', type: 'Desa' },
    ]
  },
  {
    name: 'MARGAHAYU',
    dapil: 'DAPIL 2',
    villages: [
      { name: 'Margahayu Selatan', type: 'Desa' },
      { name: 'Margahayu Tengah', type: 'Desa' },
      { name: 'Sayati', type: 'Desa' },
      { name: 'Sukamenak', type: 'Desa' },
      { name: 'Sulaeman', type: 'Kelurahan' },
    ]
  },
  {
    name: 'NAGREG',
    dapil: 'DAPIL 2',
    villages: [
      { name: 'Bojong', type: 'Desa' },
      { name: 'Ciaro', type: 'Desa' },
      { name: 'Ciherang', type: 'Desa' },
      { name: 'Citaman', type: 'Desa' },
      { name: 'Ganjarsabar', type: 'Desa' },
      { name: 'Mandalawangi', type: 'Desa' },
      { name: 'Nagreg', type: 'Desa' },
      { name: 'Nagreg Kendan', type: 'Desa' },
    ]
  },
  {
    name: 'PACET',
    dapil: 'DAPIL 6',
    villages: [
      { name: 'Cikawao', type: 'Desa' },
      { name: 'Cikitu', type: 'Desa' },
      { name: 'Cinanggela', type: 'Desa' },
      { name: 'Cipeujeuh', type: 'Desa' },
      { name: 'Girimulya', type: 'Desa' },
      { name: 'Mandalahaji', type: 'Desa' },
      { name: 'Maruyung', type: 'Desa' },
      { name: 'Mekarjaya', type: 'Desa' },
      { name: 'Mekarsari', type: 'Desa' },
      { name: 'Nagrak', type: 'Desa' },
      { name: 'Pangauban', type: 'Desa' },
      { name: 'Sukarame', type: 'Desa' },
      { name: 'Tanjungwangi', type: 'Desa' },
    ]
  },
  {
    name: 'PAMEUNGPEUK',
    dapil: 'DAPIL 7',
    villages: [
      { name: 'Bojongkunci', type: 'Desa' },
      { name: 'Bojongmanggu', type: 'Desa' },
      { name: 'Langonsari', type: 'Desa' },
      { name: 'Rancamulya', type: 'Desa' },
      { name: 'Rancatungku', type: 'Desa' },
      { name: 'Sukasari', type: 'Desa' },
    ]
  },
  {
    name: 'PANGALENGAN',
    dapil: 'DAPIL 7',
    villages: [
      { name: 'Banjarsari', type: 'Desa' },
      { name: 'Lamajang', type: 'Desa' },
      { name: 'Margaluyu', type: 'Desa' },
      { name: 'Margamekar', type: 'Desa' },
      { name: 'Margamukti', type: 'Desa' },
      { name: 'Margamulya', type: 'Desa' },
      { name: 'Pangalengan', type: 'Desa' },
      { name: 'Pulosari', type: 'Desa' },
      { name: 'Sukaluyu', type: 'Desa' },
      { name: 'Sukamanah', type: 'Desa' },
      { name: 'Tribaktimulya', type: 'Desa' },
      { name: 'Wanasuka', type: 'Desa' },
      { name: 'Warnasari', type: 'Desa' },
    ]
  },
  {
    name: 'PASEH',
    dapil: 'DAPIL 5',
    villages: [
      { name: 'Cigentur', type: 'Desa' },
      { name: 'Cijagra', type: 'Desa' },
      { name: 'Cipaku', type: 'Desa' },
      { name: 'Cipedes', type: 'Desa' },
      { name: 'Drawati', type: 'Desa' },
      { name: 'Karangtunggal', type: 'Desa' },
      { name: 'Loa', type: 'Desa' },
      { name: 'Mekarpawitan', type: 'Desa' },
      { name: 'Sindangsari', type: 'Desa' },
      { name: 'Sukamanah', type: 'Desa' },
      { name: 'Sukamantri', type: 'Desa' },
      { name: 'Tangsimekar', type: 'Desa' },
    ]
  },
  {
    name: 'PASIRJAMBU',
    dapil: 'DAPIL 1',
    villages: [
      { name: 'Cibodas', type: 'Desa' },
      { name: 'Cikoneng', type: 'Desa' },
      { name: 'Cisondari', type: 'Desa' },
      { name: 'Cukanggenteng', type: 'Desa' },
      { name: 'Margamulya', type: 'Desa' },
      { name: 'Mekarmaju', type: 'Desa' },
      { name: 'Mekarsari', type: 'Desa' },
      { name: 'Pasirjambu', type: 'Desa' },
      { name: 'Sugihmukti', type: 'Desa' },
      { name: 'Tenjolaya', type: 'Desa' },
    ]
  },
  {
    name: 'RANCABALI',
    dapil: 'DAPIL 1',
    villages: [
      { name: 'Alamendah', type: 'Desa' },
      { name: 'Cipelah', type: 'Desa' },
      { name: 'Indragiri', type: 'Desa' },
      { name: 'Patengan', type: 'Desa' },
      { name: 'Sukaresmi', type: 'Desa' },
    ]
  },
  {
    name: 'RANCAEKEK',
    dapil: 'DAPIL 4',
    villages: [
      { name: 'Bojongloa', type: 'Desa' },
      { name: 'Bojongsalam', type: 'Desa' },
      { name: 'Cangkuang', type: 'Desa' },
      { name: 'Haurpugur', type: 'Desa' },
      { name: 'Jelegong', type: 'Desa' },
      { name: 'Linggar', type: 'Desa' },
      { name: 'Nanjungmekar', type: 'Desa' },
      { name: 'Rancaekek Kencana', type: 'Kelurahan' },
      { name: 'Rancaekek Kulon', type: 'Desa' },
      { name: 'Rancaekek Wetan', type: 'Desa' },
      { name: 'Sangiang', type: 'Desa' },
      { name: 'Sukamanah', type: 'Desa' },
      { name: 'Sukamulya', type: 'Desa' },
      { name: 'Tegalsumedang', type: 'Desa' },
    ]
  },
  {
    name: 'SOLOKANJERUK',
    dapil: 'DAPIL 5',
    villages: [
      { name: 'Bojongemas', type: 'Desa' },
      { name: 'Cibodas', type: 'Desa' },
      { name: 'Langensari', type: 'Desa' },
      { name: 'Padamukti', type: 'Desa' },
      { name: 'Panyadap', type: 'Desa' },
      { name: 'Rancakasumba', type: 'Desa' },
      { name: 'Solokanjeruk', type: 'Desa' },
    ]
  },
  {
    name: 'SOREANG',
    dapil: 'DAPIL 1',
    villages: [
      { name: 'Cingcin', type: 'Desa' },
      { name: 'Karamatmulya', type: 'Desa' },
      { name: 'Pamekaran', type: 'Desa' },
      { name: 'Panyirapan', type: 'Desa' },
      { name: 'Parungserab', type: 'Desa' },
      { name: 'Sadu', type: 'Desa' },
      { name: 'Sekarwangi', type: 'Desa' },
      { name: 'Soreang', type: 'Desa' },
      { name: 'Sukajadi', type: 'Desa' },
      { name: 'Sukanagara', type: 'Desa' },
    ]
  }
];

// Helper functions
export const getKecamatanNames = (): string[] => {
  return KECAMATAN_DATA.map(k => k.name);
};

export const getDesaByKecamatan = (kecamatanName: string): Desa[] => {
  const kec = KECAMATAN_DATA.find(k => k.name === kecamatanName);
  return kec?.villages || [];
};

export const getKecamatanByDapil = (dapil: string): Kecamatan[] => {
  return KECAMATAN_DATA.filter(k => k.dapil === dapil);
};

export const getDapilByKecamatan = (kecamatanName: string): string | undefined => {
  const kec = KECAMATAN_DATA.find(k => k.name === kecamatanName);
  return kec?.dapil;
};

// Age category helper (based on usia)
export type GenerationCategory = 'Gen Z' | 'Millennial' | 'Gen X' | 'Boomer' | 'Silent' | 'Unknown';

export const getGenerationCategory = (age: number): GenerationCategory => {
  if (age < 0) return 'Unknown';
  if (age <= 25) return 'Gen Z';        // Born 1997-2012 (approx age 12-27 in 2024)
  if (age <= 41) return 'Millennial';   // Born 1981-1996 (approx age 28-43 in 2024)
  if (age <= 57) return 'Gen X';        // Born 1965-1980 (approx age 44-59 in 2024)
  if (age <= 76) return 'Boomer';       // Born 1946-1964 (approx age 60-78 in 2024)
  return 'Silent';                       // Born before 1946 (age 79+ in 2024)
};

// Total counts for dashboard display
export const TOTAL_KECAMATAN = 31;
export const TOTAL_DESA = 270;
export const TOTAL_KELURAHAN = 10;
export const TOTAL_WILAYAH = TOTAL_DESA + TOTAL_KELURAHAN; // 280
