/**
 * SILAB TADRIS IPA - IAI YAPNAS JENEPONTO
 * Supabase Database Integration & Sync Service
 */

const DEFAULT_SUPABASE_CONFIG = {
  url: "https://symrdzypejycfbkdwuzw.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bXJkenlwZWp5Y2Zia2R3dXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxODI0MzMsImV4cCI6MjEwNzc1ODQzM30.hNemeTE92hWoAnhH7tEL0Ssy6rSxoISZznWanHVinsk",
  autoSync: true
};

const SUPABASE_STORAGE_KEY = 'silab_yapnas_supabase_config_v1';

class SupabaseService {
  constructor() {
    this.config = this.loadConfig();
    this.client = null;
    this.status = 'initializing'; // 'connected', 'quota_exceeded', 'tables_missing', 'offline', 'error'
    this.statusMessage = 'Menginisialisasi koneksi cloud...';
    this.initClient();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(SUPABASE_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SUPABASE_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Gagal memuat konfigurasi Supabase dari storage:", e);
    }
    return { ...DEFAULT_SUPABASE_CONFIG };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(this.config));
    this.initClient();
  }

  initClient() {
    if (typeof supabase !== 'undefined' && supabase.createClient && this.config.url && this.config.anonKey) {
      try {
        this.client = supabase.createClient(this.config.url, this.config.anonKey, {
          auth: {
            persistSession: false
          }
        });
      } catch (err) {
        console.error("Gagal inisialisasi Supabase client:", err);
        this.client = null;
        this.status = 'error';
        this.statusMessage = 'Format URL atau Key Supabase tidak valid: ' + err.message;
      }
    } else {
      this.client = null;
      this.status = 'offline';
      this.statusMessage = 'Pustaka Supabase JS belum dimuat atau konfigurasi kosong.';
    }
  }

  // Health check endpoint probe
  async checkConnection() {
    if (!this.client) {
      this.initClient();
      if (!this.client) {
        return {
          ok: false,
          status: 'offline',
          title: 'Supabase Offline',
          message: 'Pustaka Supabase belum tersedia atau URL/Kunci belum diisi.',
          type: 'warning'
        };
      }
    }

    try {
      // Probe REST endpoint using fetch to get exact HTTP status code
      const probeUrl = `${this.config.url}/rest/v1/silab_alat?select=id&limit=1`;
      const response = await fetch(probeUrl, {
        method: 'GET',
        headers: {
          'apikey': this.config.anonKey,
          'Authorization': `Bearer ${this.config.anonKey}`
        }
      });

      if (response.status === 402) {
        const text = await response.text();
        this.status = 'quota_exceeded';
        this.statusMessage = 'Proyek Supabase mencapai batas kuota egress (exceed_egress_quota). Beralih ke LocalStorage.';
        return {
          ok: false,
          status: 'quota_exceeded',
          title: 'Kuota Supabase Terlampaui (exceed_egress_quota)',
          message: 'Proyek ini dibatasi oleh Supabase karena kuota bandwidth habis. Silakan buka Dashboard Supabase untuk melepas pembatasan, atau buat Proyek Baru (Gratis) lalu tempelkan URL & Anon Key di bawah.',
          type: 'error',
          raw: text
        };
      }

      if (response.status === 404 || response.status === 400) {
        const errJson = await response.json().catch(() => ({}));
        if (errJson.message && errJson.message.includes('relation "public.silab_alat" does not exist')) {
          this.status = 'tables_missing';
          this.statusMessage = 'Koneksi ke Supabase aktif, namun tabel belum dibuat di SQL Editor.';
          return {
            ok: false,
            status: 'tables_missing',
            title: 'Tabel Database Belum Dibuat',
            message: 'Koneksi ke Supabase berhasil terhubung, tetapi tabel belum dibuat. Silakan salin & jalankan skrip SQL di menu SQL Editor Supabase Anda.',
            type: 'warning'
          };
        }
      }

      if (response.ok) {
        this.status = 'connected';
        this.statusMessage = '🟢 Terhubung aktif ke Database Supabase Cloud.';
        return {
          ok: true,
          status: 'connected',
          title: 'Terhubung Sempurna ke Cloud',
          message: 'Koneksi ke Supabase Cloud aktif & siap digunakan untuk sinkronisasi real-time.',
          type: 'success'
        };
      }

      const raw = await response.text();
      this.status = 'error';
      this.statusMessage = `HTTP ${response.status}: ${raw.slice(0, 100)}`;
      return {
        ok: false,
        status: 'error',
        title: `Koneksi Supabase Gagal (HTTP ${response.status})`,
        message: raw,
        type: 'danger'
      };

    } catch (err) {
      console.warn("Pemeriksaan koneksi Supabase gagal:", err);
      this.status = 'network_error';
      this.statusMessage = 'Gagal menghubungi server Supabase (Offline atau koneksi internet terputus).';
      return {
        ok: false,
        status: 'network_error',
        title: 'Koneksi Jaringan Terputus',
        message: err.message || 'Tidak dapat menghubungi domain Supabase.',
        type: 'warning'
      };
    }
  }

  // Upload Single Item Asynchronously
  async upsertItem(table, record) {
    if (!this.client || this.status === 'quota_exceeded') return false;
    try {
      const { error } = await this.client.from(table).upsert(record);
      if (error) {
        console.warn(`Gagal upsert ke ${table}:`, error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn(`Error upsert ke ${table}:`, e);
      return false;
    }
  }

  // Delete Single Item Asynchronously
  async deleteItem(table, idField, idValue) {
    if (!this.client || this.status === 'quota_exceeded') return false;
    try {
      const { error } = await this.client.from(table).delete().eq(idField, idValue);
      if (error) {
        console.warn(`Gagal hapus dari ${table}:`, error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn(`Error hapus dari ${table}:`, e);
      return false;
    }
  }

  // Push All Local State to Supabase
  async pushAllLocalToCloud(state) {
    if (!this.client) throw new Error("Supabase client belum diinisialisasi.");

    // Format alat
    const alatPayload = (state.alat || []).map(a => ({
      id: a.id,
      nama: a.nama,
      kode: a.kode,
      kategori: a.kategori,
      merk: a.merk || '',
      ukuran: a.ukuran || '',
      buatan: a.buatan || '',
      stok: a.stok || 0,
      stok_tersedia: (typeof a.stokTersedia !== 'undefined') ? a.stokTersedia : a.stok,
      status: a.status || 'Tersedia',
      lokasi: a.lokasi || '',
      deskripsi: a.deskripsi || '',
      gambar: a.gambar || '',
      updated_at: new Date().toISOString()
    }));

    // Format fasilitas
    const fasilitasPayload = (state.fasilitas || []).map(f => ({
      id: f.id,
      nama: f.nama,
      kode: f.kode,
      kategori: f.kategori,
      stok: f.stok || 0,
      stok_tersedia: (typeof f.stokTersedia !== 'undefined') ? f.stokTersedia : f.stok,
      status: f.status || 'Tersedia',
      lokasi: f.lokasi || '',
      deskripsi: f.deskripsi || '',
      gambar: f.gambar || '',
      updated_at: new Date().toISOString()
    }));

    // Format bahan
    const bahanPayload = (state.bahan || []).map(b => ({
      id: b.id,
      nama: b.nama,
      rumus: b.rumus || '',
      jumlah: b.jumlah || 0,
      satuan: b.satuan || 'mL',
      jenis: b.jenis || '',
      klasifikasi_k3: b.klasifikasiK3 || '',
      lokasi_simpan: b.lokasiSimpan || '',
      status: b.status || 'Tersedia',
      kondisi: b.kondisi || '',
      kegunaan: b.kegunaan || '',
      updated_at: new Date().toISOString()
    }));

    // Format members
    const membersPayload = (state.members || []).map(m => ({
      id: m.id,
      peran: m.peran,
      nama: m.nama,
      nomor_induk: m.nomorInduk || m.nim || '',
      jurusan: m.jurusan || 'Tadris IPA',
      status_semester: m.statusSemester || m.semester || '',
      telepon: m.telepon || '',
      email: m.email || '',
      foto: m.foto || '',
      updated_at: new Date().toISOString()
    }));

    // Format loans
    const loansPayload = (state.loans || []).map(l => ({
      tiket: l.tiket,
      peran: l.peran || 'Mahasiswa',
      nama: l.nama,
      nim: l.nim,
      jurusan: l.jurusan || 'Tadris IPA',
      semester: l.semester || '',
      mata_kuliah: l.mataKuliah || '',
      dosen_pengampu: l.dosenPengampu || '',
      telepon: l.telepon || '',
      tgl_pinjam: l.tglPinjam || '',
      tgl_rencana_kembali: l.tglRencanaKembali || '',
      tgl_kembali_aktual: l.tglKembaliAktual || null,
      items: l.items || [],
      status: l.status || 'Menunggu Verifikasi',
      catatan_pengembalian: l.catatanPengembalian || '',
      foto_pengembalian: l.fotoPengembalian || '',
      status_kondisi: l.statusKondisi || '',
      verifikator_laboran: l.verifikatorLaboran || '',
      updated_at: new Date().toISOString()
    }));

    // Format laboran
    const laboranPayload = [{
      id: 'primary',
      nama: state.laboran?.nama || "Ahmad Fadhlillah, S.Si.",
      nip: state.laboran?.nip || "19930418 201903 1 007",
      jabatan: state.laboran?.jabatan || "Pranata Laboratorium IPA",
      kontak: state.laboran?.kontak || "+62 821-8899-7600",
      updated_at: new Date().toISOString()
    }];

    // Format org structure
    const orgPayload = (state.orgStructure || []).map(o => ({
      id: o.id,
      role: o.role,
      name: o.name,
      nip: o.nip || '',
      unit: o.unit || '',
      photo: o.photo || '',
      level: o.level || 1,
      level_name: o.levelName || '',
      order_num: o.order || 1,
      parent_id: o.parentId || null,
      updated_at: new Date().toISOString()
    }));

    const results = {
      alat: 0,
      fasilitas: 0,
      bahan: 0,
      members: 0,
      loans: 0,
      laboran: 0,
      org: 0,
      errors: []
    };

    if (alatPayload.length) {
      const { error } = await this.client.from('silab_alat').upsert(alatPayload);
      if (error) results.errors.push(`Alat: ${error.message}`);
      else results.alat = alatPayload.length;
    }

    if (fasilitasPayload.length) {
      const { error } = await this.client.from('silab_fasilitas').upsert(fasilitasPayload);
      if (error) results.errors.push(`Fasilitas: ${error.message}`);
      else results.fasilitas = fasilitasPayload.length;
    }

    if (bahanPayload.length) {
      const { error } = await this.client.from('silab_bahan_kimia').upsert(bahanPayload);
      if (error) results.errors.push(`Bahan: ${error.message}`);
      else results.bahan = bahanPayload.length;
    }

    if (membersPayload.length) {
      const { error } = await this.client.from('silab_members').upsert(membersPayload);
      if (error) results.errors.push(`Civitas: ${error.message}`);
      else results.members = membersPayload.length;
    }

    if (loansPayload.length) {
      const { error } = await this.client.from('silab_loans').upsert(loansPayload);
      if (error) results.errors.push(`Peminjaman: ${error.message}`);
      else results.loans = loansPayload.length;
    }

    if (laboranPayload.length) {
      const { error } = await this.client.from('silab_laboran').upsert(laboranPayload);
      if (error) results.errors.push(`Laboran: ${error.message}`);
      else results.laboran = laboranPayload.length;
    }

    if (orgPayload.length) {
      const { error } = await this.client.from('silab_org_structure').upsert(orgPayload);
      if (error) results.errors.push(`Struktur: ${error.message}`);
      else results.org = orgPayload.length;
    }

    return results;
  }

  // Pull All Data from Supabase into Local State
  async pullAllCloudToLocal() {
    if (!this.client) throw new Error("Supabase client belum diinisialisasi.");

    const res = {};

    const [alatRes, fasRes, bahRes, memRes, loaRes, labRes, orgRes] = await Promise.allSettled([
      this.client.from('silab_alat').select('*').order('created_at', { ascending: true }),
      this.client.from('silab_fasilitas').select('*').order('created_at', { ascending: true }),
      this.client.from('silab_bahan_kimia').select('*').order('created_at', { ascending: true }),
      this.client.from('silab_members').select('*').order('created_at', { ascending: true }),
      this.client.from('silab_loans').select('*').order('created_at', { ascending: false }),
      this.client.from('silab_laboran').select('*').limit(1),
      this.client.from('silab_org_structure').select('*').order('level', { ascending: true })
    ]);

    if (alatRes.status === 'fulfilled' && !alatRes.value.error && alatRes.value.data.length > 0) {
      res.alat = alatRes.value.data.map(a => ({
        id: a.id,
        nama: a.nama,
        kode: a.kode,
        kategori: a.kategori,
        merk: a.merk,
        ukuran: a.ukuran,
        buatan: a.buatan,
        stok: a.stok,
        stokTersedia: a.stok_tersedia,
        status: a.status,
        lokasi: a.lokasi,
        deskripsi: a.deskripsi,
        gambar: a.gambar
      }));
    }

    if (fasRes.status === 'fulfilled' && !fasRes.value.error && fasRes.value.data.length > 0) {
      res.fasilitas = fasRes.value.data.map(f => ({
        id: f.id,
        nama: f.nama,
        kode: f.kode,
        kategori: f.kategori,
        stok: f.stok,
        stokTersedia: f.stok_tersedia,
        status: f.status,
        lokasi: f.lokasi,
        deskripsi: f.deskripsi,
        gambar: f.gambar
      }));
    }

    if (bahRes.status === 'fulfilled' && !bahRes.value.error && bahRes.value.data.length > 0) {
      res.bahan = bahRes.value.data.map(b => ({
        id: b.id,
        nama: b.nama,
        rumus: b.rumus,
        jumlah: b.jumlah,
        satuan: b.satuan,
        jenis: b.jenis,
        klasifikasiK3: b.klasifikasi_k3,
        lokasiSimpan: b.lokasi_simpan,
        status: b.status,
        kondisi: b.kondisi,
        kegunaan: b.kegunaan
      }));
    }

    if (memRes.status === 'fulfilled' && !memRes.value.error && memRes.value.data.length > 0) {
      res.members = memRes.value.data.map(m => ({
        id: m.id,
        peran: m.peran,
        nama: m.nama,
        nomorInduk: m.nomor_induk,
        jurusan: m.jurusan,
        statusSemester: m.status_semester,
        telepon: m.telepon,
        email: m.email,
        foto: m.foto
      }));
    }

    if (loaRes.status === 'fulfilled' && !loaRes.value.error && loaRes.value.data.length > 0) {
      res.loans = loaRes.value.data.map(l => ({
        tiket: l.tiket,
        peran: l.peran,
        nama: l.nama,
        nim: l.nim,
        jurusan: l.jurusan,
        semester: l.semester,
        mataKuliah: l.mata_kuliah,
        dosenPengampu: l.dosen_pengampu,
        telepon: l.telepon,
        tglPinjam: l.tgl_pinjam,
        tglRencanaKembali: l.tgl_rencana_kembali,
        tglKembaliAktual: l.tgl_kembali_aktual,
        items: l.items || [],
        status: l.status,
        catatanPengembalian: l.catatan_pengembalian,
        fotoPengembalian: l.foto_pengembalian,
        statusKondisi: l.status_kondisi,
        verifikatorLaboran: l.verifikator_laboran
      }));
    }

    if (labRes.status === 'fulfilled' && !labRes.value.error && labRes.value.data.length > 0) {
      const l = labRes.value.data[0];
      res.laboran = {
        nama: l.nama,
        nip: l.nip,
        jabatan: l.jabatan,
        kontak: l.kontak
      };
    }

    if (orgRes.status === 'fulfilled' && !orgRes.value.error && orgRes.value.data.length > 0) {
      res.orgStructure = orgRes.value.data.map(o => ({
        id: o.id,
        role: o.role,
        name: o.name,
        nip: o.nip,
        unit: o.unit,
        photo: o.photo,
        level: o.level,
        levelName: o.level_name,
        order: o.order_num,
        parentId: o.parent_id
      }));
    }

    return res;
  }
}

// Global Supabase singleton
window.SILAB_SUPABASE = new SupabaseService();
