# SILAB-IPA: Sistem Informasi Manajemen Inventaris & Peminjaman Laboratorium
### INSTITUT AGAMA ISLAM YAPNAS JENEPONTO
**Fakultas Tarbiyyah — Program Studi Tadris IPA**  
*Alamat: Jl. Lanto Daeng Pasewang No. KM. 76, Cinong, Kelurahan Tonrokassi, Kecamatan Tamalatea, Kabupaten Jeneponto, Sulawesi Selatan 92351*

---

## 🌟 Pembaruan Versi 2.0 (Desain Modern Sidebar & Keamanan Tingkat Tinggi)

Aplikasi **SILAB-IPA** kini telah diperbarui secara menyeluruh sesuai kebutuhan terbaru:

### 1. 📱 Tampilan Responsif (Laptop & HP Friendly)
- **Menu Sidebar di Samping (Desktop/Laptop)**: Navigasi vertikal terstruktur dan bersih di sisi kiri, membedakan antara Portal Akses Mahasiswa & Dosen dengan Portal Khusus Pengelola Lab (Admin).
- **Mobile Off-Canvas Drawer & Bottom Navigation Bar (Tampilan HP)**:
  - Pada layar smartphone/tablet, sidebar otomatis menjadi drawer yang dapat dibuka/tutup via tombol menu hamburger (`☰`).
  - Dilengkapi **Bottom Navigation Bar** di bagian bawah layar untuk akses satu jempol yang sangat cepat (*Beranda, Alat, Pinjam, Lacak, Admin*).

### 2. 💫 Splash Screen dengan Animasi Bernapas (*Breathing Effect*)
- Memuat logo resmi kampus **`yapnas.png`** di bagian atas dengan animasi bernapas dinamis (*breathing / pulsing glow*).
- Menampilkan nama resmi **INSTITUT AGAMA ISLAM YAPNAS JENEPONTO** dan **FAKULTAS TARBIYYAH • JURUSAN TADRIS IPA**.
- Alamat lengkap kampus di bagian bawah dengan tulisan kecil yang rapi dan elegan.
- Indikator pemuatan otomatis dan tombol "*Masuk Langsung*".

### 3. 🛡️ Skema Peminjaman & Pengembalian yang Mudah tapi SANGAT AMAN (5 Pilar)
1. **Pilar 1: Validasi Identitas & TTD Digital**: Peminjam terverifikasi via NIM/NIDN & WhatsApp, membubuhkan tanda tangan digital berkekuatan hukum internal.
2. **Pilar 2: E-Tiket & QR Code Terenkode**: Nomor tiket unik terenkripsi dengan stempel tanggal dan QR Code anti-pemalsuan.
3. **Pilar 3: Dual-Check Serah Terima**: Laboran dan peminjam bersama-sama menginspeksi kondisi fisik alat sebelum diserahkan di lab.
4. **Pilar 4: Wajib Unggah Foto Bukti Pengembalian**: Peminjam wajib mengunggah foto fisik kebersihan & keutuhan alat sebelum diserahkan, menghindari klaim sepihak.
5. **Pilar 5: Audit Fisik & Auto-Sync Stok**: Stok inventaris terkunci otomatis dan hanya pulih setelah diverifikasi tuntas oleh laboran.

### 4. 🔐 Pemisahan Dashboard Akses Umum vs Dashboard Admin
- **Dashboard Akses Umum**: Untuk mahasiswa dan dosen melihat katalog alat, fasilitas, bahan kimia, pengajuan peminjaman, pelacakan tiket, SOP, dan K3.
- **Dashboard Khusus Admin / Laboran**:
  - Diproteksi modal login PIN (Default PIN: **`1234`** atau sandi **`admin`** / **`laboran`**).
  - Profil Laboran Resmi: **Ahmad Fadhlillah, S.Si.** (Pranata Laboratorium).
  - **Kelola Inventaris & Edit Gambar**: Admin dapat mengubah Nama, Kode, Merk, Ukuran, Buatan, Stok, Status, serta **mengunggah atau mengganti foto alat** langsung dari file komputer/HP peminjam.
  - **Antrean Persetujuan (Approval Queue)**: Menyetujui atau menolak peminjaman masuk.
  - **Validasi Foto Pengembalian**: Memeriksa foto bukti fisik alat saat dikembalikan oleh peminjam.
  - **Ekspor Data CSV & Reset Data Bawaan**.

---

## 🚀 Cara Menjalankan

1. **Jalankan via Script Langsung**:
   - Cukup klik ganda file [`run_silab.bat`](file:///C:/Users/AsusV16/.gemini/antigravity-ide/scratch/silab-tadris-ipa/run_silab.bat).
   - Browser akan otomatis terbuka ke alamat: `http://localhost:5173`.

2. **Atau Buka Langsung File HTML**:
   - Anda juga dapat langsung membuka file [`index.html`](file:///C:/Users/AsusV16/.gemini/antigravity-ide/scratch/silab-tadris-ipa/index.html) di browser Google Chrome atau Microsoft Edge di Laptop maupun HP.

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
│   └── style.css           # Desain modern, sidebar layout, mobile bottom nav, splash screen
├── js/
│   ├── data.js             # Data master kampus, K3, skema keamanan 5 pilar, inventaris
│   ├── qrcode.min.js       # Generator QR Code digital
│   └── app.js              # State management, sidebar nav, admin auth, upload foto, edit gambar
├── index.html              # Antarmuka web responsif utama
├── server.js               # Server lokal mandiri (port 5173)
├── run_silab.bat           # Shortcut peluncuran aplikasi satu klik
└── README.md               # Dokumentasi lengkap
```
