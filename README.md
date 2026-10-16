# SILAB-IPA: Sistem Informasi Manajemen Inventaris & Peminjaman Laboratorium
### INSTITUT AGAMA ISLAM YAPNAS JENEPONTO
**Fakultas Tarbiyyah — Program Studi Tadris IPA**  
*Alamat: Jl. Lanto Daeng Pasewang No. KM. 76, Cinong, Kelurahan Tonrokassi, Kecamatan Tamalatea, Kabupaten Jeneponto, Sulawesi Selatan 92351*

---

## 🌟 Pembaruan Versi 2.5 (Database Civitas, Import Excel, Discreet Admin & Pengetatan Aset)

Aplikasi **SILAB-IPA** kini telah dilengkapi dengan fitur-fitur mutakhir sesuai kebutuhan operasional kampus:

### 1. 👥 Database Civitas Akademika (Mahasiswa & Dosen) & Auto-Fill Cepat
- **Peminjaman 1-Klik Tanpa Mengetik Ulang**: Di formulir peminjaman, peminjam cukup memilih namanya dari menu dropdown cepat (`Pilih Mahasiswa / Dosen Terdaftar`).
- Sistem seketika mengisi otomatis:
  - Peran Peminjam (Mahasiswa / Dosen)
  - Nama Lengkap & Gelar
  - NIM / NIDN
  - Program Studi (Tadris IPA)
  - Semester / Jabatan
  - Nomor WhatsApp Aktif

### 2. 📊 Input Data Civitas: Manual & Import File Excel / CSV
- **Tambah Satu per Satu**: Form modal cepat untuk mendaftarkan dosen atau mahasiswa baru.
- **Bulk Import Excel / CSV**: Mendukung file `.xlsx`, `.xls`, dan `.csv` secara offline menggunakan pustaka SheetJS lokal (`js/xlsx.full.min.js`).
- **Pratinjau Data Langsung (*Live Preview Table*)**: Memverifikasi baris data sebelum disimpan ke database browser.
- **Pilihan Mode Import**: *Gabungkan (Merge)* data baru atau *Gantikan (Replace)* seluruh database lama.
- **Unduh Format Template Excel**: 1-klik unduh template spreadsheet resmi yang telah siap diisi kolomnya.

### 3. 🔒 Dashboard Admin Disembunyikan (*Discreet / Stealth Mode*)
- **Akses Pengelola Tidak Mencolok**: Menu Admin dihilangkan dari sidebar publik dan bilah navigasi HP agar pengunjung dan mahasiswa fokus pada katalog dan peminjaman.
- **Cara Masuk Pengelola Lab**:
  1. Klik ikon gembok kecil yang samar (*discreet*) di bagian bawah sidebar footer.
  2. Atau gunakan kombinasi tombol cepat: **`Ctrl + Shift + A`** (atau `Ctrl + Shift + L`).
  3. Atau ketuk logo kampus pada sidebar 3 kali berturut-turut.
- **Autentikasi Kuat Berbasis Email & Password**:
  - Email: **`admin.lab@iaiyapnas.ac.id`**
  - Password: **`Yapnas@LabIPA2026!`**
  - Dilengkapi fitur intip password (*eye toggle*) dan tombol kemudahan "*Gunakan Akun Resmi Default*".

### 4. 🛠️ Fitur Edit & Hapus Inventaris Lengkap
- Admin dapat mengedit data dan mengganti foto untuk seluruh item:
  - **Alat Laboratorium** (Kode, Nama, Merk, Ukuran, Buatan, Kategori, Stok, Status, Foto)
  - **Fasilitas Umum** (Kode, Nama, Lokasi, Stok, Status)
  - **Bahan Kimia** (Nama, Rumus Kimia, Satuan, Lokasi Simpan, Jenis Bahan, Stok)
- Tab filter kategori praktis: *Semua*, *Alat Lab*, *Fasilitas*, *Bahan Kimia*.

### 5. ⚖️ Pengetatan SOP Aset & Berita Acara Kerusakan (BAP Ganti Rugi)
- Peminjaman dibuat mudah & nyaman, namun pengembalian diperketat demi menjaga aset milik negara/kampus:
  - **Wajib Foto Bukti Pengembalian**: Menghindari perdebatan kondisi fisik alat.
  - **Pemeriksaan Kondisi**:
    - 🟢 *Baik, Bersih & Lengkap* -> Stok otomatis pulih ke katalog.
    - 🔴 *Pecah / Kerusakan Fisik* -> Status ditandai *Klaim Ganti Rugi*, stok tidak dipulihkan.
  - **Penerbitan Surat Resmi Berita Acara Kerusakan (BAP)**: Berkepala surat resmi IAI YAPNAS JENEPONTO, memuat kewajiban peminjam mengganti alat setara dalam waktu maksimal **7 (tujuh) hari kerja**.
  - **Integrasi Peringatan Resmi WhatsApp**: Mengirim pesan teguran resmi otomatis ke WhatsApp peminjam dengan format baku laboratorium.

---

## 🚀 Akses & Tautan

- **Live URL (Vercel)**: `https://silab-ipa-hebri.vercel.app/`
- **Repository GitHub**: `https://github.com/ibnuhusny-spec/silab-ipa-hebri`

---

## 📁 Struktur Direktori

```text
silab-tadris-ipa/
├── yapnas.png              # Logo resmi kampus dengan animasi bernapas
├── assets/
│   ├── hero_banner.jpg    # Banner laboratorium sains IAI YAPNAS
│   ├── microscope.jpg      # Foto Mikroskop Binokuler Olympus
│   ├── glassware.jpg       # Foto Set Alat Gelas & Buret Titrasi
│   └── fumehood.jpg        # Foto Fasilitas Lemari Asam
├── css/
│   └── style.css           # Desain modern, sidebar layout, mobile nav, discreet admin, excel dropzone
├── js/
│   ├── data.js             # Data master kampus, inventaris, default members civitas, kredensial admin
│   ├── xlsx.full.min.js    # SheetJS local library untuk parsing & download Excel/CSV
│   ├── qrcode.min.js       # Generator QR Code digital
│   └── app.js              # State management, quick-select civitas, import excel, audit BAP
├── index.html              # Antarmuka web responsif utama & print sheets
├── server.js               # Server lokal mandiri (port 5173)
├── run_silab.bat           # Shortcut peluncuran aplikasi satu klik
└── README.md               # Dokumentasi lengkap
```

