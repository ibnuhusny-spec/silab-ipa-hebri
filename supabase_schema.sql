-- ==============================================================================
-- SILAB TADRIS IPA - IAI YAPNAS JENEPONTO
-- SUPABASE DATABASE SCHEMA & MIGRATION SCRIPT
-- Jalankan skrip ini di SQL Editor pada Dashboard Supabase Anda:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. TABEL ALAT LABORATORIUM
CREATE TABLE IF NOT EXISTS public.silab_alat (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    kode TEXT,
    kategori TEXT,
    merk TEXT,
    ukuran TEXT,
    buatan TEXT,
    stok INTEGER DEFAULT 0,
    stok_tersedia INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Tersedia',
    lokasi TEXT,
    deskripsi TEXT,
    gambar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL FASILITAS UMUM LABORATORIUM
CREATE TABLE IF NOT EXISTS public.silab_fasilitas (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    kode TEXT,
    kategori TEXT,
    stok INTEGER DEFAULT 0,
    stok_tersedia INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Tersedia',
    lokasi TEXT,
    deskripsi TEXT,
    gambar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL DATA BAHAN KIMIA & REAGEN
CREATE TABLE IF NOT EXISTS public.silab_bahan_kimia (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    rumus TEXT,
    jumlah NUMERIC DEFAULT 0,
    satuan TEXT,
    jenis TEXT,
    klasifikasi_k3 TEXT,
    lokasi_simpan TEXT,
    status TEXT DEFAULT 'Tersedia',
    kondisi TEXT,
    kegunaan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL CIVITAS AKADEMIKA (DOSEN & MAHASISWA)
CREATE TABLE IF NOT EXISTS public.silab_members (
    id TEXT PRIMARY KEY,
    peran TEXT NOT NULL, -- 'Dosen' atau 'Mahasiswa'
    nama TEXT NOT NULL,
    nomor_induk TEXT NOT NULL, -- NIM atau NIDN
    jurusan TEXT DEFAULT 'Tadris IPA',
    status_semester TEXT,
    telepon TEXT,
    email TEXT,
    foto TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL PEMINJAMAN & PENGEMBALIAN BARANG
CREATE TABLE IF NOT EXISTS public.silab_loans (
    tiket TEXT PRIMARY KEY,
    peran TEXT,
    nama TEXT NOT NULL,
    nim TEXT NOT NULL,
    jurusan TEXT DEFAULT 'Tadris IPA',
    semester TEXT,
    mata_kuliah TEXT,
    dosen_pengampu TEXT,
    telepon TEXT,
    tgl_pinjam TEXT,
    tgl_rencana_kembali TEXT,
    tgl_kembali_aktual TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Menunggu Verifikasi', -- 'Menunggu Verifikasi', 'Dipinjam', 'Selesai', 'Ditolak'
    catatan_pengembalian TEXT,
    foto_pengembalian TEXT,
    status_kondisi TEXT,
    verifikator_laboran TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL PROFIL PRANATA LABORATORIUM (LABORAN)
CREATE TABLE IF NOT EXISTS public.silab_laboran (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    nama TEXT NOT NULL,
    nip TEXT,
    jabatan TEXT,
    kontak TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL STRUKTUR ORGANISASI LABORATORIUM
CREATE TABLE IF NOT EXISTS public.silab_org_structure (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    nip TEXT,
    unit TEXT,
    photo TEXT,
    level INTEGER DEFAULT 1,
    level_name TEXT,
    order_num INTEGER DEFAULT 1,
    parent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS) & POLICY AKSES PUBLIK & ANON
-- ==============================================================================

ALTER TABLE public.silab_alat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_bahan_kimia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_laboran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_org_structure ENABLE ROW LEVEL SECURITY;

-- Buat Permissive Policies untuk Public/Anon (Bisa Akses & Simpan dari Web App)
DROP POLICY IF EXISTS "Public Read Alat" ON public.silab_alat;
CREATE POLICY "Public Read Alat" ON public.silab_alat FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert/Update Alat" ON public.silab_alat;
CREATE POLICY "Public Insert/Update Alat" ON public.silab_alat FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Fasilitas" ON public.silab_fasilitas;
CREATE POLICY "Public Read Fasilitas" ON public.silab_fasilitas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert/Update Fasilitas" ON public.silab_fasilitas;
CREATE POLICY "Public Insert/Update Fasilitas" ON public.silab_fasilitas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Bahan" ON public.silab_bahan_kimia;
CREATE POLICY "Public Read Bahan" ON public.silab_bahan_kimia FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert/Update Bahan" ON public.silab_bahan_kimia;
CREATE POLICY "Public Insert/Update Bahan" ON public.silab_bahan_kimia FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Members" ON public.silab_members;
CREATE POLICY "Public Read Members" ON public.silab_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert/Update Members" ON public.silab_members;
CREATE POLICY "Public Insert/Update Members" ON public.silab_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Loans" ON public.silab_loans;
CREATE POLICY "Public Read Loans" ON public.silab_loans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert/Update Loans" ON public.silab_loans;
CREATE POLICY "Public Insert/Update Loans" ON public.silab_loans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Laboran" ON public.silab_laboran;
CREATE POLICY "Public Read Laboran" ON public.silab_laboran FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert/Update Laboran" ON public.silab_laboran;
CREATE POLICY "Public Insert/Update Laboran" ON public.silab_laboran FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Org" ON public.silab_org_structure;
CREATE POLICY "Public Read Org" ON public.silab_org_structure FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert/Update Org" ON public.silab_org_structure;
CREATE POLICY "Public Insert/Update Org" ON public.silab_org_structure FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET UNTUK ASSET FOTO BARANG & BUKTI PENGEMBALIAN
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('silab-assets', 'silab-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Asset Read" ON storage.objects;
CREATE POLICY "Public Asset Read" ON storage.objects FOR SELECT USING (bucket_id = 'silab-assets');

DROP POLICY IF EXISTS "Public Asset Upload" ON storage.objects;
CREATE POLICY "Public Asset Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'silab-assets');

DROP POLICY IF EXISTS "Public Asset Update" ON storage.objects;
CREATE POLICY "Public Asset Update" ON storage.objects FOR UPDATE USING (bucket_id = 'silab-assets');
