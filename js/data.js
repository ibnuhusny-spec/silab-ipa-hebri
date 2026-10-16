/**
 * SILAB TADRIS IPA - IAI YAPNAS JENEPONTO
 * Master Data & Konfigurasi Laboratorium Terpadu IPA
 */

const CAMPUS_INFO = {
    institution: "INSTITUT AGAMA ISLAM YAPNAS JENEPONTO",
    faculty: "FAKULTAS TARBIYYAH",
    department: "JURUSAN TADRIS IPA",
    labName: "Laboratorium Terpadu Tadris IPA (Fisika, Kimia, Biologi)",
    address: "Jl. Lanto Daeng Pasewang No. KM. 76, Cinong, Kelurahan Tonrokassi, Kecamatan Tamalatea, Kabupaten Jeneponto, Sulawesi Selatan 92351",
    email: "lab.tadrisipa@iaiyapnas.ac.id",
    phone: "(0419) 21455 / +62 821-8899-7600",
    accreditation: "Terakreditasi BAN-PT",
    dean: "Dr. H. Abd. Rahman, M.Pd.I",
    headOfDept: "Nurul Mukhlisah, M.Pd.",
    headOfLab: "Dr. H. Muhammad Ilyas, M.Pd.",
    laboran: "Ahmad Fadhlillah, S.Si.",
    academicYear: "2026/2027",
    logo: "yapnas.png"
};

const ORGANIZATION_STRUCTURE = [
    {
        role: "Pelindung & Dekan",
        name: "Dr. H. Abd. Rahman, M.Pd.I",
        nip: "19750812 200212 1 003",
        unit: "Fakultas Tarbiyyah IAI YAPNAS",
        photo: "dean"
    },
    {
        role: "Ketua Jurusan Tadris IPA",
        name: "Nurul Mukhlisah, M.Pd.",
        nip: "19840315 201001 2 018",
        unit: "Program Studi Tadris IPA",
        photo: "kajur"
    },
    {
        role: "Kepala Laboratorium Terpadu",
        name: "Dr. H. Muhammad Ilyas, M.Pd.",
        nip: "19800620 200801 1 009",
        unit: "Unit Pengelola Lab IPA",
        photo: "kalab"
    },
    {
        role: "Laboran / Pranata Laboratorium",
        name: "Ahmad Fadhlillah, S.Si.",
        nip: "19930418 201903 1 007",
        unit: "Pengelola Teknis & Inventaris",
        photo: "laboran"
    },
    {
        role: "Pembina Praktikum Kimia",
        name: "Siti Rahmawati, M.Si.",
        nip: "19890910 201504 2 005",
        unit: "Bidang Kimia Dasar & Analitik",
        photo: "dosen_kimia"
    },
    {
        role: "Pembina Praktikum Biologi",
        name: "Faisal Amir, M.Pd.",
        nip: "19871104 201402 1 004",
        unit: "Bidang Biologi & Mikrobiologi",
        photo: "dosen_bio"
    },
    {
        role: "Pembina Praktikum Fisika",
        name: "Ilham Syarif, M.Si.",
        nip: "19910214 201801 1 006",
        unit: "Bidang Fisika Dasar & Elektronika",
        photo: "dosen_fis"
    },
    {
        role: "Koordinator Asisten Praktikum",
        name: "Nurhaliza Syam (Mhs. Semester 7)",
        nip: "NIM: 2320401018",
        unit: "Himpunan Mahasiswa Tadris IPA",
        photo: "asisten"
    }
];

const SECURITY_SCHEMA = [
    {
        step: 1,
        title: "Autentikasi Identitas & TTD Digital",
        badge: "Pilar 1: Validasi Peminjam",
        icon: "fa-signature",
        color: "#10b981",
        desc: "Peminjam menginput identitas resmi (NIM/NIDN terdaftar, No. WhatsApp aktif) dan menandatangani pakta integritas digital via Canvas Signature Pad."
    },
    {
        step: 2,
        title: "Penerbitan E-Tiket & QR Code Terenkode",
        badge: "Pilar 2: Anti-Pemalsuan",
        icon: "fa-qrcode",
        color: "#0284c7",
        desc: "Sistem menerbitkan nomor tiket unik terenkripsi dengan stempel tanggal dan QR Code digital untuk mencegah duplikasi atau klaim fiktif."
    },
    {
        step: 3,
        title: "Dual-Check Serah Terima di Laboratorium",
        badge: "Pilar 3: Pemeriksaan Awal",
        icon: "fa-clipboard-check",
        color: "#8b5cf6",
        desc: "Laboran memindai QR Code peminjam, memeriksa fungsi dan kelengkapan fisik alat di meja serah terima bersama peminjam sebelum mengubah status menjadi 'Dipinjam'."
    },
    {
        step: 4,
        title: "Wajib Unggah Foto Bukti Pengembalian",
        badge: "Pilar 4: Bukti Digital Akurat",
        icon: "fa-camera-retro",
        color: "#f59e0b",
        desc: "Sebelum alat diterima laboran, peminjam wajib mengambil foto langsung alat yang telah dibersihkan sebagai rekaman digital kondisi akhir barang."
    },
    {
        step: 5,
        title: "Audit Fisik & Auto-Sync Stok Inventaris",
        badge: "Pilar 5: Kepastian Stok",
        icon: "fa-boxes-packing",
        color: "#ec4899",
        desc: "Laboran memvalidasi kecocokan foto dan fisik. Jika kondisi baik, stok otomatis pulih. Jika rusak/pecah, sistem otomatis menerbitkan Surat Penggantian Alat (batas 7 hari)."
    }
];

const LAB_RULES = [
    {
        category: "Ketentuan Umum Masuk Laboratorium",
        icon: "fa-door-open",
        items: [
            "Mahasiswa dan Dosen wajib mengisi presensi kehadiran digital/buku tamu sebelum memulai kegiatan di laboratorium.",
            "Wajib mengenakan Jas Laboratorium berwarna putih dengan kancing lengkap, masker pelindung, dan sepatu tertutup (dilarang menggunakan sandal/sepatu terbuka).",
            "Dilarang keras membawa makanan, minuman, kosmetik, serta merokok di dalam seluruh area laboratorium.",
            "Tas ransel, jaket tebal, dan barang bawaan pribadi harus disimpan di loker penyimpanan yang telah disediakan.",
            "Praktikan wajib hadir 10 menit sebelum waktu praktikum dan telah mempelajari modul petunjuk praktikum yang bersangkutan."
        ]
    },
    {
        category: "Tata Tertib Peminjaman & Penggunaan Alat",
        icon: "fa-hand-holding",
        items: [
            "Peminjaman alat untuk keperluan praktikum resmi atau penelitian (skripsi/karya ilmiah) diajukan maksimal H-1 melalui sistem SILAB-IPA ini.",
            "Mahasiswa wajib menyertakan persetujuan Dosen Pembina/Pengampu mata kuliah saat mengajukan peminjaman.",
            "Sebelum membawa alat, peminjam bersama laboran wajib memeriksa kelengkapan, fungsi, dan kondisi fisik alat.",
            "Alat yang dipinjam dilarang keras dipindahtangankan kepada pihak lain tanpa persetujuan tertulis dari Kepala Laboratorium.",
            "Waktu peminjaman maksimal adalah 3 (tiga) hari kerja untuk praktikum mandiri dan 7 (tujuh) hari untuk penelitian skripsi, kecuali ada izin perpanjangan resmi."
        ]
    },
    {
        category: "SOP Pengembalian, Pemeriksaan & Kerusakan",
        icon: "fa-rotate-left",
        items: [
            "Alat harus dikembalikan dalam keadaan bersih, kering, dan berfungsi sempurna sebagaimana kondisi awal saat diterima.",
            "Peminjam wajib mengunggah Foto Bukti Pengembalian di sistem SILAB-IPA dan menandatangani Berita Acara Pengembalian bersama Laboran.",
            "Apabila terjadi kerusakan, pecah alat gelas, atau kehilangan komponen, peminjam WAJIB mengganti dengan alat berspesifikasi, merk, dan kualitas yang sama persis atau setara.",
            "Penggantian alat yang rusak atau hilang harus diselesaikan selambat-lambatnya 7 (tujuh) hari kerja kalender sejak tanggal pelaporan insiden.",
            "Keterlambatan pengembalian tanpa konfirmasi dikenakan penangguhan (blacklist) hak peminjaman selama 1 semester akademik."
        ]
    }
];

const SAFETY_K3 = [
    {
        code: "GHS-01",
        title: "Bahan Mudah Terbakar (Flammable)",
        symbol: "🔥",
        color: "#ef4444",
        examples: "Etanol, Metanol, Aseton, Dietil Eter",
        handling: "Jauhkan dari nyala api terbuka (Bunsen), sumber listrik, dan panas. Simpan dalam lemari tahan api khusus (Flammable Cabinet)."
    },
    {
        code: "GHS-02",
        title: "Bahan Korosif (Corrosive)",
        symbol: "⚠️🧪",
        color: "#f59e0b",
        examples: "Asam Klorida (HCl), Asam Sulfat (H2SO4), Natrium Hidroksida (NaOH)",
        handling: "Gunakan sarung tangan nitril tebal, kacamata goggle, dan jas lab. Selalu tuangkan asam ke dalam air (jangan sebaliknya). Gunakan di dalam Lemari Asam (Fume Hood)."
    },
    {
        code: "GHS-03",
        title: "Bahan Beracun / Toksik (Toxic)",
        symbol: "☠️",
        color: "#8b5cf6",
        examples: "Kalium Sianida, Raksa / Merkuri, Formalin",
        handling: "Wajib menggunakan masker respirator dan sarung tangan. Dilarang menghirup uap secara langsung. Gunakan teknik 'mengibaskan uap' perlahan ke arah hidung jika mencium bau."
    },
    {
        code: "GHS-04",
        title: "Bahan Pengoksidasi (Oxidizing)",
        symbol: "💥⭕",
        color: "#3b82f6",
        examples: "Kalium Permanganat (KMnO4), Hidrogen Peroksida (H2O2 pekat)",
        handling: "Pisahkan secara ketat dari bahan-bahan yang mudah terbakar, serbuk logam, dan agen pereduksi organik. Simpan di tempat sejuk dan berventilasi."
    },
    {
        code: "GHS-05",
        title: "Bahaya Biologis (Biohazard)",
        symbol: "☣️",
        color: "#10b981",
        examples: "Kultur Bakteri, Jamur Mikrobiologi, Sampel Jaringan",
        handling: "Sterilisasi sebelum dan sesudah penggunaan menggunakan Autoklaf. Buang limbah biologis ke dalam kantong kuning biohazard berlabel."
    },
    {
        code: "GHS-06",
        title: "Bahaya Tegangan Listrik & Optik Laser",
        symbol: "⚡👁️",
        color: "#ec4899",
        examples: "Catu Daya Tegangan Tinggi, Osiloskop, Laser He-Ne Praktikum Optik",
        handling: "Pastikan tangan kering sebelum menyalakan instrumen. Jangan melihat langsung berkas sinar laser atau lampu UV Spektrofotometer tanpa kacamata pelindung khusus."
    }
];

const EMERGENCY_PROTOCOLS = [
    {
        title: "Tumpahan Asam atau Basa Kuat",
        step: "1. Segera beri tahu laboran & evakuasi area sekitar tumpahan. 2. Untuk asam: netralkan dengan natrium bikarbonat (soda kue). Untuk basa: netralkan dengan asam asetat encer. 3. Serap dengan pasir/absorben tumpahan lalu bersihkan."
    },
    {
        title: "Bahan Kimia Terkena Kulit / Mata",
        step: "1. Bawa korban langsung ke Emergency Eye Wash Station / Emergency Shower. 2. Bilas bagian yang terkena dengan air mengalir deras terus-menerus selama minimal 15 menit. 3. Lepaskan pakaian yang terkontaminasi. 4. Bawa ke klinik kampus / RSUD Lanto Dg Pasewang Jeneponto."
    },
    {
        title: "Insiden Kebakaran Kecil di Meja Praktikum",
        step: "1. Tetap tenang dan jangan menyiram air pada kebakaran minyak/zat kimia! 2. Tutup wadah dengan kain lap basah atau gunakan APAR jenis CO2 / Dry Chemical Powder dari jarak 2 meter dengan metode PASS (Pull, Aim, Squeeze, Sweep). 3. Matikan saklar listrik utama."
    }
];

const DEFAULT_FASILITAS = [
    {
        id: "FAS-001",
        nama: "Meja Praktikum Keramik Tahan Asam & Basa",
        kode: "MEJ-LAB-01",
        kategori: "Furnitur Laboratorium",
        stok: 8,
        stokTersedia: 7,
        status: "Tersedia",
        lokasi: "Ruang Utama Lab Terpadu",
        deskripsi: "Meja praktikum berukuran 240x120 cm berlapis keramik tahan bahan kimia korosif, dilengkapi wastafel dan kran gas.",
        gambar: "assets/glassware.jpg"
    },
    {
        id: "FAS-002",
        nama: "Lemari Asam (Exhaust Fume Hood)",
        kode: "FAS-FUM-02",
        kategori: "Peralatan Pendukung & K3",
        stok: 2,
        stokTersedia: 2,
        status: "Tersedia",
        lokasi: "Zona Kimia & Reagen",
        deskripsi: "Lemari asam dengan blower pengisap uap beracun 1 PK, pintu kaca temper vertikal dan lampu tahan ledakan.",
        gambar: "assets/fumehood.jpg"
    },
    {
        id: "FAS-003",
        nama: "Emergency Eye Washer & Safety Shower",
        kode: "FAS-EYE-03",
        kategori: "Alat Keselamatan Kerja (K3)",
        stok: 2,
        stokTersedia: 2,
        status: "Tersedia",
        lokasi: "Samping Pintu Masuk & Zona Basah",
        deskripsi: "Unit bilas mata darurat berbahan stainless steel dengan pedal kaki dan tuas pancuran air deras untuk dekontaminasi.",
        gambar: "assets/fumehood.jpg"
    },
    {
        id: "FAS-004",
        nama: "Tabung Pemadam Api Ringan (APAR) CO2 5 Kg",
        kode: "FAS-APR-04",
        kategori: "Alat Keselamatan Kerja (K3)",
        stok: 4,
        stokTersedia: 4,
        status: "Tersedia",
        lokasi: "Dinding Tiang Zona A, B, C, D",
        deskripsi: "APAR Carbon Dioxide 5 kg siap pakai, efektif untuk kebakaran kelas B (bahan cair mudah terbakar) dan kelas C (listrik).",
        gambar: "assets/fumehood.jpg"
    },
    {
        id: "FAS-005",
        nama: "Smart Projector & Interactive Screen Lab",
        kode: "FAS-PRJ-05",
        kategori: "Media Presentasi & Audio Visual",
        stok: 2,
        stokTersedia: 1,
        status: "Dipinjam",
        lokasi: "Ruang Pengarahan Praktikum",
        deskripsi: "Proyektor resolusi Full HD dengan konektivitas nirkabel dan HDMI untuk presentasi teori praktikum dan mikroskopi digital.",
        gambar: "assets/hero_banner.jpg"
    },
    {
        id: "FAS-006",
        nama: "Lemari Penyimpanan Bahan B3 Tahan Karat",
        kode: "FAS-LMR-06",
        kategori: "Furnitur Laboratorium",
        stok: 3,
        stokTersedia: 3,
        status: "Tersedia",
        lokasi: "Ruang Preparasi Laboran",
        deskripsi: "Lemari besi berlapis epoxy tahan karat dengan kunci ganda untuk penyimpanan bahan kimia pekat golongan B3.",
        gambar: "assets/fumehood.jpg"
    },
    {
        id: "FAS-007",
        nama: "Air Conditioner (AC) Split 2 PK Pengatur Suhu Lab",
        kode: "FAS-AC-07",
        kategori: "Peralatan Pendukung & K3",
        stok: 4,
        stokTersedia: 4,
        status: "Tersedia",
        lokasi: "Ruang Instrumentasi & Optik",
        deskripsi: "Pendingin udara inverter 2 PK untuk menjaga stabilitas suhu dan kelembaban alat-alat optik seperti mikroskop dan spektrofotometer.",
        gambar: "assets/hero_banner.jpg"
    },
    {
        id: "FAS-008",
        nama: "Kotak P3K Lengkap & Tandu Evakuasi Lipat",
        kode: "FAS-P3K-08",
        kategori: "Alat Keselamatan Kerja (K3)",
        stok: 2,
        stokTersedia: 0,
        status: "Habis",
        lokasi: "Meja Petugas Laboran",
        deskripsi: "Kit pertolongan pertama pada kecelakaan lab lengkap dengan obat luka bakar, perban steril, larutan pencuci mata, dan tandu lipat aluminium.",
        gambar: "assets/fumehood.jpg"
    }
];

const DEFAULT_ALAT = [
    {
        id: "ALT-001",
        nama: "Mikroskop Binokuler Olympus CX23",
        kode: "MC-BIO-01",
        kategori: "Biologi & Histologi",
        merk: "Olympus",
        ukuran: "Lensa Okuler 10x, Objektif 4x, 10x, 40x, 100x (Total 40x - 1000x)",
        buatan: "Jepang (Olympus Corporation)",
        stok: 12,
        stokTersedia: 9,
        status: "Tersedia",
        lokasi: "Lemari Kaca Optik 01",
        deskripsi: "Mikroskop biologi presisi tinggi dengan sistem pencahayaan LED ramah energi, meja mekanik halus, dan optik anti-jamur.",
        gambar: "assets/microscope.jpg"
    },
    {
        id: "ALT-002",
        nama: "Neraca Ohaus 3 Lengan (Triple Beam Balance)",
        kode: "NRC-OHS-02",
        kategori: "Fisika & Pengukuran",
        merk: "Ohaus",
        ukuran: "Kapasitas 610 gram (dapat diekspansi 2610g), Ketelitian 0.1 gram",
        buatan: "Amerika Serikat (Ohaus USA)",
        stok: 8,
        stokTersedia: 6,
        status: "Tersedia",
        lokasi: "Rak Instrumen Fisika A",
        deskripsi: "Timbangan mekanik tiga lengan berlapis agate bearing untuk penimbangan massa benda padat dengan presisi tinggi.",
        gambar: "assets/glassware.jpg"
    },
    {
        id: "ALT-003",
        nama: "Buret Titrasi Asam Basa 50 mL dengan Kran Teflon",
        kode: "BRT-PYR-03",
        kategori: "Kimia Analitik",
        merk: "Pyrex Iwaki",
        ukuran: "Kapasitas 50 mL, Skala Subdivisi 0.10 mL Kelas A",
        buatan: "Jerman / Iwaki Glass",
        stok: 15,
        stokTersedia: 11,
        status: "Tersedia",
        lokasi: "Rak Alat Gelas Khusus Titrasi",
        deskripsi: "Buret kaca borosilikat 3.3 tahan bahan kimia asam dan basa kuat, dilengkapi kran PTFE Teflon anti-bocor tanpa pelumas.",
        gambar: "assets/glassware.jpg"
    },
    {
        id: "ALT-004",
        nama: "Spektrofotometer UV-Vis Single Beam",
        kode: "SPF-SHM-04",
        kategori: "Kimia & Biokimia",
        merk: "Shimadzu",
        ukuran: "Rentang Panjang Gelombang 190 - 1100 nm, Akurasi +/- 0.5 nm",
        buatan: "Jepang (Shimadzu Corp)",
        stok: 1,
        stokTersedia: 0,
        status: "Dipinjam",
        lokasi: "Ruang Instrumentasi Khusus",
        deskripsi: "Instrumen fotometrik canggih untuk analisis kadar senyawa kimia dan absorbansi larutan dengan detektor fotodioda silikon.",
        gambar: "assets/hero_banner.jpg"
    },
    {
        id: "ALT-005",
        nama: "Hotplate Magnetic Stirrer Pemanas Digital",
        kode: "STR-DLB-05",
        kategori: "Kimia & Preparasi",
        merk: "DLAB Scientific",
        ukuran: "Plat Pemanas Keramik 18x18 cm, Suhu max 380°C, Kecepatan 1500 RPM",
        buatan: "Korea Selatan",
        stok: 6,
        stokTersedia: 4,
        status: "Tersedia",
        lokasi: "Zona Pemanasan & Reaksi",
        deskripsi: "Alat pengaduk magnetik otomatis disertai kontrol temperatur digital untuk homogenisasi larutan reagen.",
        gambar: "assets/glassware.jpg"
    },
    {
        id: "ALT-006",
        nama: "Statif Besi & Klem Universal Ganda",
        kode: "STF-PDK-06",
        kategori: "Fasilitas Praktikum",
        merk: "Pudak Scientific",
        ukuran: "Tinggi Batang 60 cm, Alas Besi Tuang 20x15 cm berat 2.5 kg",
        buatan: "Indonesia (Pudak Scientific)",
        stok: 20,
        stokTersedia: 18,
        status: "Tersedia",
        lokasi: "Loker Bawah Meja Lab",
        deskripsi: "Tiang statif kokoh dengan cat anti-karat dan klem universal berlapis gabus penahan buret/kondensor.",
        gambar: "assets/glassware.jpg"
    },
    {
        id: "ALT-007",
        nama: "Set Tabung Reaksi Kaca Borosilikat & Rak Kayu Jati",
        kode: "TBN-DRN-07",
        kategori: "Kimia & Biologi",
        merk: "Duran Schott",
        ukuran: "Diameter 16 mm x Panjang 150 mm (1 set isi 12 tabung + rak 12 lubang)",
        buatan: "Jerman (Duran Group)",
        stok: 25,
        stokTersedia: 20,
        status: "Tersedia",
        lokasi: "Lemari Alat Gelas B",
        deskripsi: "Tabung reaksi kaca borosilikat tahan pemanasan langsung api Bunsen disertai rak kayu jati kokoh.",
        gambar: "assets/glassware.jpg"
    },
    {
        id: "ALT-008",
        nama: "Osiloskop Digital Dual Channel 50 MHz",
        kode: "OSC-RGL-08",
        kategori: "Fisika Elektronika",
        merk: "Rigol",
        ukuran: "Layar TFT 7 inch Warna, 50 MHz Bandwidth, 1 GSa/s Real-time Sample Rate",
        buatan: "China / Rigol Technologies",
        stok: 3,
        stokTersedia: 2,
        status: "Tersedia",
        lokasi: "Lemari Instrumen Fisika 02",
        deskripsi: "Alat ukur visualisasi gelombang listrik sinus, kotak, dan segitiga untuk praktikum gelombang dan elektromagnetika.",
        gambar: "assets/hero_banner.jpg"
    },
    {
        id: "ALT-009",
        nama: "Gelas Ukur Kaca Pyrex 100 mL Skala Biru",
        kode: "GLS-UKR-09",
        kategori: "Kimia & Pengukuran",
        merk: "Pyrex Iwaki",
        ukuran: "Volume 100 mL, Toleransi +/- 0.5 mL dengan alas heksagonal",
        buatan: "Jerman / Pyrex",
        stok: 18,
        stokTersedia: 15,
        status: "Tersedia",
        lokasi: "Lemari Alat Gelas C",
        deskripsi: "Gelas ukur kaca silinder transparan dengan skala garis timbul warna biru tahan gosokan untuk mengukur volume cairan.",
        gambar: "assets/glassware.jpg"
    },
    {
        id: "ALT-010",
        nama: "Pembakar Bunsen Kuningan + Kasa Kawat Asbes & Kaki Tiga",
        kode: "BNS-KNG-10",
        kategori: "Pemanasan Kimia",
        merk: "Pudak Scientific",
        ukuran: "Tinggi 15 cm, Diameter Kasa 14x14 cm, Kaki Tiga Tinggi 20 cm",
        buatan: "Indonesia",
        stok: 10,
        stokTersedia: 0,
        status: "Habis",
        lokasi: "Loker Pemanas 03",
        deskripsi: "Pembakar gas bunsen dengan katup pengatur aliran udara presisi untuk menghasilkan nyala api biru oksidasi optimal.",
        gambar: "assets/glassware.jpg"
    }
];

const DEFAULT_BAHAN_KIMIA = [
    {
        id: "BHK-001",
        nama: "Asam Klorida (HCl 37% Pro Analisis)",
        rumus: "HCl",
        jumlah: 1500,
        satuan: "mL",
        jenis: "Asam Kuat / Korosif (B3)",
        klasifikasiK3: "GHS-02 Korosif & Iritan",
        lokasiSimpan: "Lemari Asam Fume Hood (Bawah)",
        status: "Tersedia",
        kondisi: "Segel Baik, Kadaluarsa: 2028",
        kegunaan: "Titrasiasidimetri, praktikum hidrolisis garam, larutan pencuci endapan."
    },
    {
        id: "BHK-002",
        nama: "Natrium Hidroksida (NaOH Pellet 99%)",
        rumus: "NaOH",
        jumlah: 750,
        satuan: "gram",
        jenis: "Basa Kuat / Korosif Higroskopis",
        klasifikasiK3: "GHS-02 Korosif",
        lokasiSimpan: "Lemari Bahan Padat Tahan Lembab",
        status: "Tersedia",
        kondisi: "Kering Padat, Kadaluarsa: 2029",
        kegunaan: "Pembuatan larutan standar alkali, saponifikasi, reaksi hidrolisis lemak."
    },
    {
        id: "BHK-003",
        nama: "Etanol / Alkohol 96% Teknis & PA",
        rumus: "C2H5OH",
        jumlah: 3500,
        satuan: "mL",
        jenis: "Pelarut Organik / Mudah Terbakar (Flammable)",
        klasifikasiK3: "GHS-01 Flammable",
        lokasiSimpan: "Lemari Flammable Tahan Api",
        status: "Tersedia",
        kondisi: "Cairan Jernih, Kadaluarsa: 2028",
        kegunaan: "Ekstraksi klorofil daun, desinfeksi alat, fiksasi preparat biologi."
    },
    {
        id: "BHK-004",
        nama: "Indikator Fenolftalein (PP) 1% dalam Etanol",
        rumus: "C20H14O4",
        jumlah: 350,
        satuan: "mL",
        jenis: "Indikator Asam-Basa Analitik",
        klasifikasiK3: "GHS-01 Cairan Beralkohol",
        lokasiSimpan: "Rak Reagen Indikator",
        status: "Tersedia",
        kondisi: "Jernih, Trayek pH 8.3 - 10.0 (Tak Berwarna ke Merah Muda)",
        kegunaan: "Menentukan titik akhir titrasi asam-basa kuat."
    },
    {
        id: "BHK-005",
        nama: "Reagen Biuret (Uji Protein)",
        rumus: "CuSO4 + NaOH + NaK-Tartrat",
        jumlah: 800,
        satuan: "mL",
        jenis: "Reagen Biokimia Analisis",
        klasifikasiK3: "GHS-02 Iritan Ringan",
        lokasiSimpan: "Kulkas Khusus Reagen Biologi",
        status: "Tersedia",
        kondisi: "Larutan Biru Jernih",
        kegunaan: "Uji kualitatif ikatan peptida dan protein pada ekstrak bahan makanan."
    },
    {
        id: "BHK-006",
        nama: "Reagen Benedict (Uji Gula Pereduksi)",
        rumus: "CuSO4 + Na-Sitrat + Na2CO3",
        jumlah: 950,
        satuan: "mL",
        jenis: "Reagen Biokimia Analisis",
        klasifikasiK3: "GHS-02 Aman Terkendali",
        lokasiSimpan: "Rak Reagen Biologi Meja A",
        status: "Tersedia",
        kondisi: "Larutan Biru Terang",
        kegunaan: "Uji keberadaan glukosa menghasilkan endapan merah bata setelah dipanaskan."
    },
    {
        id: "BHK-007",
        nama: "Kalium Permanganat (KMnO4 Kristal Ungu)",
        rumus: "KMnO4",
        jumlah: 250,
        satuan: "gram",
        jenis: "Oksidator Kuat / Kristal Padat",
        klasifikasiK3: "GHS-04 Oksidator",
        lokasiSimpan: "Botol Cokelat Gelap Kedap Udara",
        status: "Tersedia",
        kondisi: "Kristal Ungu Mengkilap, Kadaluarsa: 2029",
        kegunaan: "Titrasi permanganometri, oksidasi senyawa organik alkohol."
    },
    {
        id: "BHK-008",
        nama: "Kertas Indikator Universal pH 0 - 14",
        rumus: "Multi-indicator strips",
        jumlah: 8,
        satuan: "Box (800 strip)",
        jenis: "Indikator pH Cepat",
        klasifikasiK3: "Aman Non-Reaktif",
        lokasiSimpan: "Kotak Kering Desikator",
        status: "Tersedia",
        kondisi: "Strip Bersih, Lengkap Tabel Warna",
        kegunaan: "Pengukuran derajat keasaman (pH) cepat larutan kimia praktikum."
    }
];

const DEFAULT_PEMINJAMAN = [
    {
        tiket: "PNJ-202610-001",
        peran: "Mahasiswa",
        nama: "Muh. Ikhsan Basir",
        nim: "2320401005",
        jurusan: "Tadris IPA",
        semester: "Semester 5",
        mataKuliah: "Praktikum Mikrobiologi Lingkungan",
        dosenPengampu: "Faisal Amir, M.Pd.",
        telepon: "081244556677",
        tglPinjam: "2026-10-14",
        tglRencanaKembali: "2026-10-17",
        tglKembaliAktual: "2026-10-16",
        items: [
            { id: "ALT-001", nama: "Mikroskop Binokuler Olympus CX23", jumlah: 1, jenis: "Alat Laboratorium" },
            { id: "ALT-007", nama: "Set Tabung Reaksi Kaca Borosilikat & Rak Kayu Jati", jumlah: 1, jenis: "Alat Laboratorium" }
        ],
        status: "Selesai",
        catatanPengembalian: "Alat telah dikembalikan dalam kondisi lensa bersih, lampu berfungsi baik, tabung reaksi lengkap tanpa retak.",
        fotoPengembalian: "assets/microscope.jpg",
        statusKondisi: "Baik & Lengkap",
        verifikatorLaboran: "Ahmad Fadhlillah, S.Si."
    },
    {
        tiket: "PNJ-202610-002",
        peran: "Dosen",
        nama: "Siti Rahmawati, M.Si.",
        nim: "NIDN: 0910098902",
        jurusan: "Tadris IPA",
        semester: "Dosen Pengampu",
        mataKuliah: "Riset Spektrometri Kimia Bahan Alam",
        dosenPengampu: "Siti Rahmawati, M.Si.",
        telepon: "085299887766",
        tglPinjam: "2026-10-15",
        tglRencanaKembali: "2026-10-20",
        tglKembaliAktual: null,
        items: [
            { id: "ALT-004", nama: "Spektrofotometer UV-Vis Single Beam", jumlah: 1, jenis: "Alat Laboratorium" },
            { id: "FAS-005", nama: "Smart Projector & Interactive Screen Lab", jumlah: 1, jenis: "Fasilitas Umum" }
        ],
        status: "Dipinjam",
        catatanPengembalian: null,
        fotoPengembalian: null,
        statusKondisi: "Sedang Digunakan di Ruang Instrumentasi",
        verifikatorLaboran: "Ahmad Fadhlillah, S.Si."
    },
    {
        tiket: "PNJ-202610-003",
        peran: "Mahasiswa",
        nama: "Andi Reski Amelia",
        nim: "2320401022",
        jurusan: "Tadris IPA",
        semester: "Semester 3",
        mataKuliah: "Praktikum Kimia Dasar II (Titrasi)",
        dosenPengampu: "Dr. H. Muhammad Ilyas, M.Pd.",
        telepon: "082345678901",
        tglPinjam: "2026-10-16",
        tglRencanaKembali: "2026-10-18",
        tglKembaliAktual: null,
        items: [
            { id: "ALT-003", nama: "Buret Titrasi Asam Basa 50 mL dengan Kran Teflon", jumlah: 2, jenis: "Alat Laboratorium" },
            { id: "ALT-006", nama: "Statif Besi & Klem Universal Ganda", jumlah: 2, jenis: "Alat Laboratorium" }
        ],
        status: "Menunggu Verifikasi",
        catatanPengembalian: null,
        fotoPengembalian: null,
        statusKondisi: "Menunggu Acc Laboran",
        verifikatorLaboran: null
    }
];
