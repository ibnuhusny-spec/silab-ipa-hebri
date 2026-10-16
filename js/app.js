/**
 * SILAB TADRIS IPA - IAI YAPNAS JENEPONTO
 * Core Application Logic, Sidebar Navigation, Security & Admin Management
 */

// Application State
const STATE = {
  alat: [],
  fasilitas: [],
  bahan: [],
  loans: [],
  cart: [],
  laboran: null,
  isAdminLoggedIn: false,
  currentTheme: 'dark',
  activeReturnTicket: null,
  returnPhotoBase64: null,
  editPhotoBase64: null,
  isDrawingSig: false,
  sigHasContent: false
};

// Canvas Signature References
let sigCanvas, sigCtx;

// Storage Keys
const STORAGE_KEYS = {
  ALAT: 'silab_yapnas_alat_v2',
  FASILITAS: 'silab_yapnas_fasilitas_v2',
  BAHAN: 'silab_yapnas_bahan_v2',
  LOANS: 'silab_yapnas_loans_v2',
  LABORAN: 'silab_yapnas_laboran_v2',
  THEME: 'silab_yapnas_theme_v2',
  ADMIN_SESSION: 'silab_yapnas_admin_session_v2'
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initSplashScreen();
  initTheme();
  loadData();
  initSignaturePad();
  setupEventListeners();
  renderAllViews();
  updateStatistics();
  setDefaultDates();
});

/* ==========================================================================
   1. SPLASH SCREEN CONTROLLER
   ========================================================================== */
function initSplashScreen() {
  const progressBar = document.getElementById('splashProgressBar');
  const statusText = document.getElementById('splashStatusText');
  const splash = document.getElementById('splashScreen');

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (progressBar) progressBar.style.width = `${progress}%`;

    if (progress === 40 && statusText) {
      statusText.textContent = "Memverifikasi Katalog & Instrumen Praktikum...";
    } else if (progress === 70 && statusText) {
      statusText.textContent = "Menghubungkan Skema Keamanan 5 Pilar...";
    } else if (progress >= 100) {
      clearInterval(interval);
      if (statusText) statusText.textContent = "Selesai! Selamat Datang di SILAB-IPA.";
      setTimeout(dismissSplash, 500);
    }
  }, 160);
}

function dismissSplash() {
  const splash = document.getElementById('splashScreen');
  if (splash && !splash.classList.contains('fade-out')) {
    splash.classList.add('fade-out');
  }
}

/* ==========================================================================
   2. DATA & PERSISTENCE
   ========================================================================== */
function loadData() {
  const savedAlat = localStorage.getItem(STORAGE_KEYS.ALAT);
  const savedFasilitas = localStorage.getItem(STORAGE_KEYS.FASILITAS);
  const savedBahan = localStorage.getItem(STORAGE_KEYS.BAHAN);
  const savedLoans = localStorage.getItem(STORAGE_KEYS.LOANS);
  const savedLaboran = localStorage.getItem(STORAGE_KEYS.LABORAN);

  STATE.alat = savedAlat ? JSON.parse(savedAlat) : JSON.parse(JSON.stringify(DEFAULT_ALAT));
  STATE.fasilitas = savedFasilitas ? JSON.parse(savedFasilitas) : JSON.parse(JSON.stringify(DEFAULT_FASILITAS));
  STATE.bahan = savedBahan ? JSON.parse(savedBahan) : JSON.parse(JSON.stringify(DEFAULT_BAHAN_KIMIA));
  STATE.loans = savedLoans ? JSON.parse(savedLoans) : JSON.parse(JSON.stringify(DEFAULT_PEMINJAMAN));

  STATE.laboran = savedLaboran ? JSON.parse(savedLaboran) : {
    nama: "Ahmad Fadhlillah, S.Si.",
    nip: "19930418 201903 1 007",
    jabatan: "Pranata Laboratorium IPA",
    kontak: "+62 821-8899-7600"
  };

  // Check admin session
  STATE.isAdminLoggedIn = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  updateRoleUi();
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.ALAT, JSON.stringify(STATE.alat));
  localStorage.setItem(STORAGE_KEYS.FASILITAS, JSON.stringify(STATE.fasilitas));
  localStorage.setItem(STORAGE_KEYS.BAHAN, JSON.stringify(STATE.bahan));
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(STATE.loans));
  localStorage.setItem(STORAGE_KEYS.LABORAN, JSON.stringify(STATE.laboran));
}

function resetDefaultData() {
  if (confirm("Reset seluruh data inventaris dan peminjaman ke pengaturan awal bawaan kampus?")) {
    localStorage.removeItem(STORAGE_KEYS.ALAT);
    localStorage.removeItem(STORAGE_KEYS.FASILITAS);
    localStorage.removeItem(STORAGE_KEYS.BAHAN);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.LABORAN);
    loadData();
    STATE.cart = [];
    renderAllViews();
    showToast("Data laboratorium berhasil direset ke pengaturan awal.", "info");
  }
}

/* ==========================================================================
   3. THEME & SIDEBAR NAVIGATION
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  setTheme(savedTheme);

  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const nextTheme = STATE.currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });
}

function setTheme(theme) {
  STATE.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  const icon = document.getElementById('themeIcon');
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-moon';
  } else {
    icon.className = 'fa-solid fa-sun';
  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  sidebar.classList.toggle('mobile-open');
  backdrop.classList.toggle('active');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  sidebar.classList.remove('mobile-open');
  backdrop.classList.remove('active');
}

function handleMenuClick(tabId) {
  closeMobileSidebar();
  switchTab(tabId);
}

function switchTab(tabId) {
  // Update sidebar active links
  document.querySelectorAll('.sidebar-menu-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update mobile bottom nav buttons
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Switch content section
  document.querySelectorAll('.content-section').forEach(section => {
    if (section.id === tabId) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // Update Breadcrumb text
  const breadcrumb = document.getElementById('currentBreadcrumb');
  const titles = {
    'tab-dashboard': 'Dashboard & SOP Lab',
    'tab-alat': 'Katalog Alat Laboratorium',
    'tab-fasilitas': 'Fasilitas Umum Laboratorium',
    'tab-bahan': 'Data Bahan Kimia & Reagen',
    'tab-peminjaman': 'Formulir Peminjaman Inventaris',
    'tab-lacak': 'Lacak Tiket & Pengembalian',
    'tab-admin': 'Dashboard Khusus Pengelola Lab (Laboran)'
  };
  if (breadcrumb) breadcrumb.textContent = titles[tabId] || 'Laboratorium IPA';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   4. ADMIN AUTHENTICATION & SEPARATE DASHBOARD
   ========================================================================== */
function triggerAdminAccess() {
  closeMobileSidebar();
  if (STATE.isAdminLoggedIn) {
    switchTab('tab-admin');
  } else {
    document.getElementById('adminPinInput').value = '';
    document.getElementById('adminLoginModal').classList.add('active');
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const inputPin = document.getElementById('adminPinInput').value.trim();

  // Valid credentials: "1234", "admin", "laboran", "1993"
  if (inputPin === '1234' || inputPin.toLowerCase() === 'admin' || inputPin.toLowerCase() === 'laboran' || inputPin === '1993') {
    STATE.isAdminLoggedIn = true;
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    closeModal('adminLoginModal');
    updateRoleUi();
    switchTab('tab-admin');
    showToast("Selamat datang, Laboran Ahmad Fadhlillah, S.Si. Dashboard Admin aktif.", "success");
    renderAdminViews();
  } else {
    showToast("PIN atau Sandi salah! Gunakan PIN default 1234 atau sandi admin.", "error");
  }
}

function logoutAdminMode() {
  STATE.isAdminLoggedIn = false;
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  updateRoleUi();
  switchTab('tab-dashboard');
  showToast("Anda telah keluar dari Dashboard Admin ke Mode Publik.", "info");
}

function updateRoleUi() {
  const roleIndicator = document.getElementById('topRoleIndicator');
  const roleIcon = document.getElementById('topRoleIcon');
  const roleText = document.getElementById('topRoleText');
  const adminBadge = document.getElementById('adminPendingBadge');

  if (STATE.isAdminLoggedIn) {
    if (roleIndicator) roleIndicator.className = 'btn btn-primary btn-sm';
    if (roleIcon) { roleIcon.className = 'fa-solid fa-user-shield'; roleIcon.style.color = '#ffffff'; }
    if (roleText) roleText.textContent = 'Mode: Laboran Aktif';
    if (adminBadge) { adminBadge.textContent = 'Aktif'; adminBadge.style.background = 'rgba(16, 185, 129, 0.2)'; adminBadge.style.color = '#10b981'; }
  } else {
    if (roleIndicator) roleIndicator.className = 'btn btn-outline btn-sm';
    if (roleIcon) { roleIcon.className = 'fa-solid fa-user-graduate'; roleIcon.style.color = '#38bdf8'; }
    if (roleText) roleText.textContent = 'Akses: Mahasiswa / Dosen';
    if (adminBadge) { adminBadge.textContent = 'Privat'; adminBadge.style.background = 'rgba(245, 158, 11, 0.2)'; adminBadge.style.color = '#fbbf24'; }
  }
}

function switchAdminSubTab(subTabId) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-sub-view').forEach(view => view.style.display = 'none');

  if (subTabId === 'admin-tab-manage') {
    document.getElementById('btnAdminTabManage').classList.add('active');
    document.getElementById('admin-tab-manage').style.display = 'block';
    renderAdminInventoryTable();
  } else if (subTabId === 'admin-tab-approval') {
    document.getElementById('btnAdminTabApproval').classList.add('active');
    document.getElementById('admin-tab-approval').style.display = 'block';
    renderAdminApprovalQueue();
  } else if (subTabId === 'admin-tab-returns') {
    document.getElementById('btnAdminTabReturns').classList.add('active');
    document.getElementById('admin-tab-returns').style.display = 'block';
    renderAdminReturnsQueue();
  }
}

/* ==========================================================================
   5. RENDER ALL VIEWS
   ========================================================================== */
function renderAllViews() {
  renderLaboranProfile();
  renderSecurityPillars();
  renderDashboard();
  renderAlatGrid();
  renderFasilitasGrid();
  renderBahanGrid();
  renderCart();
  renderLoansTable();
  renderAdminViews();
  updateStatistics();
}

function renderLaboranProfile() {
  if (!STATE.laboran) return;
  const adminNama = document.getElementById('adminDisplayNama');
  const adminNip = document.getElementById('adminDisplayNip');
  const adminJabatan = document.getElementById('adminDisplayJabatan');
  const printNama = document.getElementById('printLaboranName');
  const printNip = document.getElementById('printLaboranNip');

  if (adminNama) adminNama.textContent = STATE.laboran.nama;
  if (adminNip) adminNip.textContent = `NIP. ${STATE.laboran.nip}`;
  if (adminJabatan) adminJabatan.innerHTML = `${STATE.laboran.jabatan} • <span id="adminDisplayNip">NIP. ${STATE.laboran.nip}</span>`;
  if (printNama) printNama.textContent = STATE.laboran.nama;
  if (printNip) printNip.textContent = STATE.laboran.nip;
}

function openEditLaboranModal() {
  if (!STATE.laboran) return;
  document.getElementById('laboranInputNama').value = STATE.laboran.nama || '';
  document.getElementById('laboranInputNip').value = STATE.laboran.nip || '';
  document.getElementById('laboranInputJabatan').value = STATE.laboran.jabatan || '';
  document.getElementById('laboranInputKontak').value = STATE.laboran.kontak || '';
  document.getElementById('editLaboranModal').classList.add('active');
}

function saveLaboranProfile(event) {
  event.preventDefault();
  const nama = document.getElementById('laboranInputNama').value.trim();
  const nip = document.getElementById('laboranInputNip').value.trim();
  const jabatan = document.getElementById('laboranInputJabatan').value.trim();
  const kontak = document.getElementById('laboranInputKontak').value.trim();

  STATE.laboran = { nama, nip, jabatan, kontak };
  saveState();
  renderLaboranProfile();
  renderDashboard();
  closeModal('editLaboranModal');
  showToast("Nama dan profil Pranata Laboratorium berhasil diperbarui secara permanen.", "success");
}

function renderSecurityPillars() {
  const container = document.getElementById('securityPillarsGrid');
  if (!container) return;

  container.innerHTML = SECURITY_SCHEMA.map(item => `
    <div class="security-pillar-card" style="border-left: 4px solid ${item.color};">
      <div class="pillar-step-number">${item.step}</div>
      <div class="pillar-icon-box" style="background: ${item.color}22; color: ${item.color};">
        <i class="fa-solid ${item.icon}"></i>
      </div>
      <div>
        <span class="pillar-badge" style="color: ${item.color};">${item.badge}</span>
        <h4 class="pillar-title">${item.title}</h4>
      </div>
      <p class="pillar-desc">${item.desc}</p>
    </div>
  `).join('');
}

function renderDashboard() {
  // Sync laboran person in organization structure
  if (STATE.laboran && typeof ORGANIZATION_STRUCTURE !== 'undefined') {
    const laboranPerson = ORGANIZATION_STRUCTURE.find(p => p.role.includes("Laboran") || p.role.includes("Pranata"));
    if (laboranPerson) {
      laboranPerson.name = STATE.laboran.nama;
      laboranPerson.nip = "NIP: " + STATE.laboran.nip;
    }
  }

  // Org Structure
  const orgGrid = document.getElementById('orgStructureGrid');
  if (orgGrid) {
    orgGrid.innerHTML = ORGANIZATION_STRUCTURE.map(person => `
      <div class="org-card">
        <div class="org-avatar-circle">${person.name.charAt(0)}</div>
        <div class="org-details">
          <h4>${person.name}</h4>
          <div class="org-role">${person.role}</div>
          <div class="org-meta">${person.nip}</div>
          <div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 2px;">${person.unit}</div>
        </div>
      </div>
    `).join('');
  }

  // Rules Accordion
  const rulesContainer = document.getElementById('rulesContainer');
  if (rulesContainer) {
    rulesContainer.innerHTML = LAB_RULES.map((rule, idx) => `
      <div class="rule-accordion-card">
        <div class="rule-accordion-header" onclick="toggleAccordion('rule-body-${idx}', 'rule-icon-${idx}')">
          <div class="rule-header-title">
            <i class="fa-solid ${rule.icon}"></i>
            <span>${rule.category}</span>
          </div>
          <i class="fa-solid fa-chevron-down" id="rule-icon-${idx}"></i>
        </div>
        <div class="rule-accordion-body" id="rule-body-${idx}" style="${idx === 0 ? 'display: block;' : 'display: none;'}">
          <ul class="rule-list">
            ${rule.items.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  // K3 Symbols
  const k3Grid = document.getElementById('k3SymbolsGrid');
  if (k3Grid) {
    k3Grid.innerHTML = SAFETY_K3.map(k3 => `
      <div class="k3-card" style="border-left: 4px solid ${k3.color};">
        <div class="k3-symbol-icon" style="color: ${k3.color};">${k3.symbol}</div>
        <div class="k3-info">
          <h4>${k3.title}</h4>
          <p><strong>Contoh di Lab:</strong> ${k3.examples}</p>
          <div class="k3-handling-tip">
            <strong>SOP K3:</strong> ${k3.handling}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Emergency Protocols
  const emergGrid = document.getElementById('emergencyProtocolsGrid');
  if (emergGrid) {
    emergGrid.innerHTML = EMERGENCY_PROTOCOLS.map(proto => `
      <div class="emergency-box">
        <h4><i class="fa-solid fa-shield-heart"></i> ${proto.title}</h4>
        <p>${proto.step}</p>
      </div>
    `).join('');
  }
}

function toggleAccordion(bodyId, iconId) {
  const body = document.getElementById(bodyId);
  const icon = document.getElementById(iconId);
  if (!body) return;

  if (body.style.display === 'none' || body.style.display === '') {
    body.style.display = 'block';
    if (icon) icon.className = 'fa-solid fa-chevron-up';
  } else {
    body.style.display = 'none';
    if (icon) icon.className = 'fa-solid fa-chevron-down';
  }
}

// Render Alat Laboratorium Grid
function renderAlatGrid() {
  const container = document.getElementById('alatGrid');
  if (!container) return;

  const searchKeyword = (document.getElementById('searchAlatInput')?.value || '').toLowerCase().trim();
  const filterStatus = document.getElementById('filterStatusAlat')?.value || 'ALL';
  const activeCategoryBtn = document.querySelector('#alatCategoryChips .filter-chip.active');
  const activeCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-category') : 'ALL';

  const filtered = STATE.alat.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchKeyword) ||
                          item.kode.toLowerCase().includes(searchKeyword) ||
                          item.merk.toLowerCase().includes(searchKeyword) ||
                          item.buatan.toLowerCase().includes(searchKeyword);
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesCategory = activeCategory === 'ALL' || item.kategori === activeCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i class="fa-solid fa-box-open" style="font-size: 2.5rem; margin-bottom: 10px; color: var(--text-dim);"></i>
        <h4>Tidak ada alat laboratorium yang cocok</h4>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const statusClass = item.status.toLowerCase();
    const isAvailable = item.stokTersedia > 0 && item.status === 'Tersedia';

    return `
      <div class="item-card">
        <div class="item-image-box">
          <img src="${item.gambar || 'assets/glassware.jpg'}" alt="${item.nama}" loading="lazy">
          <div class="item-badge-top">
            <span class="status-badge ${statusClass}">${item.status}</span>
          </div>
          <div class="item-code-tag">${item.kode}</div>
        </div>

        <div class="item-body">
          <div class="item-category-label">${item.kategori}</div>
          <h3 class="item-title" title="${item.nama}">${item.nama}</h3>

          <div class="item-specs-list">
            <div class="spec-row">
              <span class="spec-key"><i class="fa-solid fa-tag"></i> Merk:</span>
              <span class="spec-val">${item.merk}</span>
            </div>
            <div class="spec-row">
              <span class="spec-key"><i class="fa-solid fa-ruler-combined"></i> Ukuran:</span>
              <span class="spec-val">${item.ukuran}</span>
            </div>
            <div class="spec-row">
              <span class="spec-key"><i class="fa-solid fa-earth-asia"></i> Buatan:</span>
              <span class="spec-val">${item.buatan}</span>
            </div>
            <div class="spec-row">
              <span class="spec-key"><i class="fa-solid fa-boxes-stacked"></i> Stok:</span>
              <span class="spec-val" style="color: ${item.stokTersedia > 0 ? '#10b981' : '#ef4444'}; font-weight: 700;">
                ${item.stokTersedia} / ${item.stok} unit
              </span>
            </div>
          </div>

          <div class="item-footer-actions">
            <button class="btn btn-secondary btn-sm" onclick="showItemDetail('ALAT', '${item.id}')">
              <i class="fa-solid fa-circle-info"></i> Detail
            </button>
            <button class="btn btn-primary btn-sm" style="flex: 1;" 
                    onclick="addToCart('ALAT', '${item.id}')" 
                    ${!isAvailable ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              <i class="fa-solid fa-plus"></i> ${isAvailable ? '+ Pinjam' : 'Kosong'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Fasilitas Umum Grid
function renderFasilitasGrid() {
  const container = document.getElementById('fasilitasGrid');
  if (!container) return;

  const searchKeyword = (document.getElementById('searchFasilitasInput')?.value || '').toLowerCase().trim();
  const filterStatus = document.getElementById('filterStatusFasilitas')?.value || 'ALL';

  const filtered = STATE.fasilitas.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchKeyword) ||
                          item.kode.toLowerCase().includes(searchKeyword) ||
                          item.lokasi.toLowerCase().includes(searchKeyword);
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">Fasilitas tidak ditemukan.</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const statusClass = item.status.toLowerCase();
    const isAvailable = item.stokTersedia > 0 && item.status === 'Tersedia';

    return `
      <div class="item-card">
        <div class="item-image-box">
          <img src="${item.gambar || 'assets/fumehood.jpg'}" alt="${item.nama}" loading="lazy">
          <div class="item-badge-top">
            <span class="status-badge ${statusClass}">${item.status}</span>
          </div>
          <div class="item-code-tag">${item.kode}</div>
        </div>

        <div class="item-body">
          <div class="item-category-label">${item.kategori}</div>
          <h3 class="item-title" title="${item.nama}">${item.nama}</h3>

          <div class="item-specs-list">
            <div class="spec-row">
              <span class="spec-key">Lokasi:</span>
              <span class="spec-val">${item.lokasi}</span>
            </div>
            <div class="spec-row">
              <span class="spec-key">Stok:</span>
              <span class="spec-val">${item.stokTersedia} / ${item.stok} unit</span>
            </div>
          </div>

          <div class="item-footer-actions">
            <button class="btn btn-secondary btn-sm" onclick="showItemDetail('FASILITAS', '${item.id}')">Info</button>
            <button class="btn btn-primary btn-sm" style="flex: 1;" 
                    onclick="addToCart('FASILITAS', '${item.id}')"
                    ${!isAvailable ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              ${isAvailable ? '+ Pinjam' : 'Penuh'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Bahan Kimia Grid
function renderBahanGrid() {
  const container = document.getElementById('bahanGrid');
  if (!container) return;

  const searchKeyword = (document.getElementById('searchBahanInput')?.value || '').toLowerCase().trim();
  const filterJenis = document.getElementById('filterJenisBahan')?.value || 'ALL';

  const filtered = STATE.bahan.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchKeyword) ||
                          item.rumus.toLowerCase().includes(searchKeyword);
    const matchesJenis = filterJenis === 'ALL' || item.jenis.toLowerCase().includes(filterJenis.toLowerCase());
    return matchesSearch && matchesJenis;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">Bahan kimia tidak ditemukan.</div>`;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="item-card" style="border-top: 3px solid #8b5cf6;">
      <div class="item-body" style="padding-top: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-family: var(--font-mono); font-weight: 700; color: #10b981; background: var(--primary-glow); padding: 3px 8px; border-radius: 4px; font-size: 0.88rem;">${item.rumus}</span>
          <span style="font-size: 0.72rem; color: #f59e0b; background: rgba(245, 158, 11, 0.15); padding: 2px 7px; border-radius: 4px;">${item.klasifikasiK3}</span>
        </div>

        <h3 class="item-title" style="height: auto; margin-top: 6px;" title="${item.nama}">${item.nama}</h3>
        <div style="font-size: 0.78rem; color: #38bdf8; font-weight: 600;">${item.jenis}</div>

        <div class="item-specs-list">
          <div class="spec-row">
            <span class="spec-key">Stok:</span>
            <span class="spec-val" style="color: #10b981; font-weight: 700; font-family: var(--font-mono);">${item.jumlah} ${item.satuan}</span>
          </div>
          <div class="spec-row">
            <span class="spec-key">Tempat Simpan:</span>
            <span class="spec-val">${item.lokasiSimpan}</span>
          </div>
        </div>

        <div class="item-footer-actions">
          <button class="btn btn-secondary btn-sm" style="width: 100%;" onclick="requestChemicalForPractice('${item.nama}')">
            <i class="fa-solid fa-hand-holding-droplet"></i> Request Reagen
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Update Statistics
function updateStatistics() {
  const totalAlat = STATE.alat.reduce((acc, curr) => acc + curr.stok, 0);
  const totalFasilitas = STATE.fasilitas.reduce((acc, curr) => acc + curr.stok, 0);
  const totalBahan = STATE.bahan.length;
  const activeLoans = STATE.loans.filter(l => l.status === 'Dipinjam' || l.status === 'Menunggu Verifikasi').length;

  const elAlat = document.getElementById('statTotalAlat');
  const elFas = document.getElementById('statTotalFasilitas');
  const elBhn = document.getElementById('statTotalBahan');
  const elPinjam = document.getElementById('statPeminjamanAktif');

  if (elAlat) elAlat.textContent = totalAlat;
  if (elFas) elFas.textContent = totalFasilitas;
  if (elBhn) elBhn.textContent = totalBahan;
  if (elPinjam) elPinjam.textContent = activeLoans;

  const adminAlatCount = document.getElementById('adminAlatCount');
  if (adminAlatCount) adminAlatCount.textContent = STATE.alat.length;
}

/* ==========================================================================
   6. ADMIN WORKSPACE: EDIT INVENTARIS & GANTI GAMBAR
   ========================================================================== */
function renderAdminViews() {
  renderAdminInventoryTable();
  renderAdminApprovalQueue();
  renderAdminReturnsQueue();
}

function renderAdminInventoryTable() {
  const tbody = document.getElementById('adminInventoryTableBody');
  if (!tbody) return;

  const keyword = (document.getElementById('adminSearchItemInput')?.value || '').toLowerCase().trim();
  const filtered = STATE.alat.filter(item => 
    item.nama.toLowerCase().includes(keyword) || 
    item.kode.toLowerCase().includes(keyword) ||
    item.merk.toLowerCase().includes(keyword)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Tidak ada item yang cocok.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td>
        <img src="${item.gambar || 'assets/glassware.jpg'}" alt="${item.nama}" 
             style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
      </td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: #10b981;">${item.kode}</td>
      <td><strong>${item.nama}</strong><br><small style="color: var(--text-dim);">${item.kategori}</small></td>
      <td>${item.merk}<br><small style="color: var(--text-dim);">${item.buatan}</small></td>
      <td><strong>${item.stokTersedia}</strong> / ${item.stok} unit</td>
      <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-secondary btn-sm" onclick="openEditItemModal('ALAT', '${item.id}')" title="Edit Data & Ganti Gambar">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteInventoryItem('ALAT', '${item.id}')" title="Hapus">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openEditItemModal(type, itemId) {
  let item = null;
  if (type === 'ALAT') item = STATE.alat.find(a => a.id === itemId);
  if (!item) return;

  document.getElementById('editItemId').value = item.id;
  document.getElementById('editItemType').value = type;
  document.getElementById('editItemKode').value = item.kode;
  document.getElementById('editItemNama').value = item.nama;
  document.getElementById('editItemMerk').value = item.merk || '';
  document.getElementById('editItemUkuran').value = item.ukuran || '';
  document.getElementById('editItemBuatan').value = item.buatan || '';
  document.getElementById('editItemKategori').value = item.kategori || '';
  document.getElementById('editItemStok').value = item.stok;
  document.getElementById('editItemStatus').value = item.status;
  document.getElementById('editItemImageUrl').value = '';

  const preview = document.getElementById('editItemPreviewImg');
  preview.src = item.gambar || 'assets/glassware.jpg';
  STATE.editPhotoBase64 = null;

  document.getElementById('editItemModal').classList.add('active');
}

function handleEditPhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    STATE.editPhotoBase64 = e.target.result;
    document.getElementById('editItemPreviewImg').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleEditImageUrlInput(url) {
  if (url && url.startsWith('http')) {
    STATE.editPhotoBase64 = url.trim();
    document.getElementById('editItemPreviewImg').src = url.trim();
  }
}

function saveEditedItem(event) {
  event.preventDefault();
  const id = document.getElementById('editItemId').value;
  const item = STATE.alat.find(a => a.id === id);
  if (!item) return;

  item.kode = document.getElementById('editItemKode').value.trim();
  item.nama = document.getElementById('editItemNama').value.trim();
  item.merk = document.getElementById('editItemMerk').value.trim();
  item.ukuran = document.getElementById('editItemUkuran').value.trim();
  item.buatan = document.getElementById('editItemBuatan').value.trim();
  item.kategori = document.getElementById('editItemKategori').value.trim();
  
  const newStok = parseInt(document.getElementById('editItemStok').value) || 0;
  const delta = newStok - item.stok;
  item.stok = newStok;
  item.stokTersedia = Math.max(0, item.stokTersedia + delta);
  item.status = document.getElementById('editItemStatus').value;

  // Update Image if changed
  if (STATE.editPhotoBase64) {
    item.gambar = STATE.editPhotoBase64;
  }

  saveState();
  closeModal('editItemModal');
  renderAllViews();
  showToast(`Item "${item.nama}" berhasil diperbarui (termasuk gambar baru).`, "success");
}

function deleteInventoryItem(type, itemId) {
  const item = STATE.alat.find(a => a.id === itemId);
  if (!item) return;

  if (confirm(`Yakin ingin menghapus item "${item.nama}" dari inventaris laboratorium?`)) {
    STATE.alat = STATE.alat.filter(a => a.id !== itemId);
    saveState();
    renderAllViews();
    showToast(`"${item.nama}" telah dihapus.`, "info");
  }
}

function renderAdminApprovalQueue() {
  const tbody = document.getElementById('adminQueueTableBody');
  if (!tbody) return;

  const pending = STATE.loans.filter(l => l.status === 'Menunggu Verifikasi');
  if (pending.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Tidak ada pengajuan pinjaman menunggu verifikasi.</td></tr>`;
    return;
  }

  tbody.innerHTML = pending.map(loan => {
    const itemsSummary = loan.items.map(i => `${i.nama} (${i.jumlah} unit)`).join(', ');
    return `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700; color: #10b981;">${loan.tiket}</td>
        <td><strong>${loan.nama}</strong><br><small class="badge">${loan.peran}</small></td>
        <td>${loan.nim}</td>
        <td>${loan.mataKuliah}<br><small style="color: var(--text-dim);">${loan.dosenPengampu}</small></td>
        <td>${itemsSummary}</td>
        <td><small>${loan.tglPinjam} s/d<br>${loan.tglRencanaKembali}</small></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-primary btn-sm" onclick="adminApproveLoan('${loan.tiket}')">Setujui</button>
            <button class="btn btn-danger btn-sm" onclick="adminRejectLoan('${loan.tiket}')">Tolak</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function adminApproveLoan(ticket) {
  const loan = STATE.loans.find(l => l.tiket === ticket);
  if (!loan) return;

  loan.status = "Dipinjam";
  loan.verifikatorLaboran = STATE.laboran ? STATE.laboran.nama : "Ahmad Fadhlillah, S.Si.";
  saveState();
  renderAllViews();
  showToast(`Peminjaman tiket ${ticket} disetujui. Mahasiswa dapat mengambil alat di lab.`, "success");
}

function adminRejectLoan(ticket) {
  if (!confirm(`Tolak pengajuan ${ticket}? Stok akan dikembalikan.`)) return;

  const loan = STATE.loans.find(l => l.tiket === ticket);
  if (!loan) return;

  loan.status = "Ditolak";
  // Restore reserved stock
  loan.items.forEach(cartItem => {
    const alat = STATE.alat.find(a => a.id === cartItem.id);
    if (alat) {
      alat.stokTersedia = Math.min(alat.stok, alat.stokTersedia + cartItem.jumlah);
      alat.status = 'Tersedia';
    }
  });

  saveState();
  renderAllViews();
  showToast(`Peminjaman ${ticket} ditolak.`, "info");
}

function renderAdminReturnsQueue() {
  const tbody = document.getElementById('adminReturnsTableBody');
  if (!tbody) return;

  const returnList = STATE.loans.filter(l => l.status === 'Selesai' || l.fotoPengembalian !== null);
  if (returnList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">Belum ada foto bukti pengembalian alat yang diunggah.</td></tr>`;
    return;
  }

  tbody.innerHTML = returnList.map(loan => `
    <tr>
      <td style="font-family: var(--font-mono); font-weight: 700; color: #10b981;">${loan.tiket}</td>
      <td><strong>${loan.nama}</strong> (${loan.nim})</td>
      <td>${loan.items.map(i => `${i.nama} (${i.jumlah})`).join(', ')}</td>
      <td>
        ${loan.fotoPengembalian ? `
          <img src="${loan.fotoPengembalian}" alt="Bukti" style="width: 55px; height: 55px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-subtle); cursor: pointer;" onclick="previewImage('${loan.fotoPengembalian}')" title="Klik untuk perbesar">
        ` : '<span style="color: var(--text-dim);">-</span>'}
      </td>
      <td>
        <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">${loan.statusKondisi || 'Baik'}</span><br>
        <small style="color: var(--text-muted);">${loan.catatanPengembalian || 'Tidak ada catatan'}</small>
      </td>
      <td><span class="status-badge ${loan.status.toLowerCase()}">${loan.status}</span></td>
    </tr>
  `).join('');
}

function previewImage(src) {
  const w = window.open("");
  w.document.write(`<img src="${src}" style="max-width: 90vw; max-height: 90vh; display: block; margin: auto;">`);
}

/* ==========================================================================
   7. CART & LOAN PROCESS
   ========================================================================== */
function addToCart(type, itemId) {
  let item = null;
  if (type === 'ALAT') item = STATE.alat.find(a => a.id === itemId);
  if (type === 'FASILITAS') item = STATE.fasilitas.find(f => f.id === itemId);
  if (!item) return;

  if (item.stokTersedia <= 0) {
    showToast(`Stok ${item.nama} sedang habis.`, 'error');
    return;
  }

  const existing = STATE.cart.find(c => c.id === item.id);
  if (existing) {
    if (existing.jumlah >= item.stokTersedia) {
      showToast(`Jumlah melebihi stok yang ada (${item.stokTersedia} unit).`, 'warning');
      return;
    }
    existing.jumlah += 1;
  } else {
    STATE.cart.push({
      id: item.id,
      nama: item.nama,
      kode: item.kode,
      merk: item.merk || 'Standar Lab',
      buatan: item.buatan || 'Indonesia',
      jenis: type === 'ALAT' ? 'Alat Lab' : 'Fasilitas',
      jumlah: 1,
      stokMaks: item.stokTersedia
    });
  }

  renderCart();
  showToast(`"${item.nama}" dimasukkan ke formulir peminjaman.`, 'success');
}

function updateCartQty(itemId, delta) {
  const item = STATE.cart.find(c => c.id === itemId);
  if (!item) return;

  const newQty = item.jumlah + delta;
  if (newQty <= 0) {
    removeFromCart(itemId);
  } else if (newQty > item.stokMaks) {
    showToast(`Maksimal stok yang tersedia adalah ${item.stokMaks} unit.`, 'warning');
  } else {
    item.jumlah = newQty;
    renderCart();
  }
}

function removeFromCart(itemId) {
  STATE.cart = STATE.cart.filter(c => c.id !== itemId);
  renderCart();
  showToast('Item dihapus dari daftar pinjaman.', 'info');
}

function clearCart() {
  if (STATE.cart.length === 0) return;
  STATE.cart = [];
  renderCart();
  showToast('Keranjang pinjaman dikosongkan.', 'info');
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const sidebarCount = document.getElementById('sidebarCartCount');
  const mobileCount = document.getElementById('mobileCartCount');
  const topCartText = document.getElementById('topCartText');
  const summaryCount = document.getElementById('cartSummaryCount');
  const textBadge = document.getElementById('cartBadgeText');

  const totalCount = STATE.cart.reduce((acc, curr) => acc + curr.jumlah, 0);

  if (sidebarCount) sidebarCount.textContent = totalCount;
  if (mobileCount) mobileCount.textContent = totalCount;
  if (topCartText) topCartText.textContent = `${totalCount} Item`;
  if (summaryCount) summaryCount.textContent = `Total: ${totalCount} unit`;
  if (textBadge) textBadge.textContent = `${STATE.cart.length} barang (${totalCount} unit)`;

  if (!container) return;

  if (STATE.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
        <i class="fa-solid fa-cart-arrow-down" style="font-size: 2.2rem; margin-bottom: 8px; color: var(--text-dim);"></i>
        <p>Keranjang pinjaman kosong.</p>
        <button class="btn btn-secondary btn-sm" onclick="switchTab('tab-alat')" style="margin-top: 8px;">
          Pilih di Katalog Alat
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = STATE.cart.map(item => `
    <div class="cart-item-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); margin-bottom: 8px;">
      <div>
        <div style="font-weight: 700; font-size: 0.88rem;">${item.nama}</div>
        <div style="font-size: 0.74rem; color: var(--text-muted);">${item.kode} • ${item.jenis}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button type="button" class="btn btn-outline btn-sm" style="padding: 2px 7px;" onclick="updateCartQty('${item.id}', -1)">-</button>
        <span style="font-weight: 700; min-width: 18px; text-align: center;">${item.jumlah}</span>
        <button type="button" class="btn btn-outline btn-sm" style="padding: 2px 7px;" onclick="updateCartQty('${item.id}', 1)">+</button>
        <button type="button" style="background: none; border: none; color: #ef4444; margin-left: 4px; cursor: pointer;" onclick="removeFromCart('${item.id}')">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Canvas Signature
function initSignaturePad() {
  sigCanvas = document.getElementById('signatureCanvas');
  if (!sigCanvas) return;

  sigCtx = sigCanvas.getContext('2d');
  
  const resizeCanvas = () => {
    const rect = sigCanvas.getBoundingClientRect();
    if (rect.width > 0) {
      sigCanvas.width = rect.width;
      sigCanvas.height = 120;
      sigCtx.strokeStyle = '#064e3b';
      sigCtx.lineWidth = 2.5;
      sigCtx.lineCap = 'round';
      sigCtx.lineJoin = 'round';
    }
  };

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const getPos = (e) => {
    const rect = sigCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    STATE.isDrawingSig = true;
    STATE.sigHasContent = true;
    const pos = getPos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!STATE.isDrawingSig) return;
    e.preventDefault();
    const pos = getPos(e);
    sigCtx.lineTo(pos.x, pos.y);
    sigCtx.stroke();
  };

  const stopDraw = () => { STATE.isDrawingSig = false; };

  sigCanvas.addEventListener('mousedown', startDraw);
  sigCanvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDraw);

  sigCanvas.addEventListener('touchstart', startDraw, { passive: false });
  sigCanvas.addEventListener('touchmove', draw, { passive: false });
  sigCanvas.addEventListener('touchend', stopDraw);
}

function clearSignature() {
  if (sigCanvas && sigCtx) {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    STATE.sigHasContent = false;
  }
}

function selectFormRole(role) {
  const mhsCard = document.getElementById('roleMhsCard');
  const dosenCard = document.getElementById('roleDosenCard');
  const peranInput = document.getElementById('loanPeran');
  const labelNimNidn = document.getElementById('labelNimNidn');
  const labelSemester = document.getElementById('labelSemester');
  const nimInput = document.getElementById('loanNim');

  peranInput.value = role;

  if (role === 'Mahasiswa') {
    mhsCard.classList.add('active');
    dosenCard.classList.remove('active');
    labelNimNidn.innerHTML = 'NIM (Nomor Induk Mahasiswa) <span class="req">*</span>';
    nimInput.placeholder = 'Contoh: 2320401005';
    labelSemester.textContent = 'Semester';
  } else {
    dosenCard.classList.add('active');
    mhsCard.classList.remove('active');
    labelNimNidn.innerHTML = 'NIDN / NIP Dosen <span class="req">*</span>';
    nimInput.placeholder = 'Contoh: NIDN: 0910098902';
    labelSemester.textContent = 'Status Pengampu';
  }
}

function setDefaultDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const pinjamInput = document.getElementById('loanTglPinjam');
  const kembaliInput = document.getElementById('loanTglKembali');

  if (pinjamInput) pinjamInput.value = todayStr;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);
  const dueYear = dueDate.getFullYear();
  const dueMonth = String(dueDate.getMonth() + 1).padStart(2, '0');
  const dueDay = String(dueDate.getDate()).padStart(2, '0');

  if (kembaliInput) kembaliInput.value = `${dueYear}-${dueMonth}-${dueDay}`;
}

// Submit Application
function submitLoanApplication(event) {
  event.preventDefault();

  if (STATE.cart.length === 0) {
    showToast("Keranjang pinjaman masih kosong! Pilih minimal 1 alat di katalog.", "error");
    switchTab('tab-alat');
    return;
  }

  if (!STATE.sigHasContent) {
    showToast("Harap bubuhkan tanda tangan digital pada kotak yang tersedia.", "warning");
    return;
  }

  const peran = document.getElementById('loanPeran').value;
  const nama = document.getElementById('loanNama').value.trim();
  const nim = document.getElementById('loanNim').value.trim();
  const semester = document.getElementById('loanSemester').value;
  const mataKuliah = document.getElementById('loanMataKuliah').value.trim();
  const dosenPengampu = document.getElementById('loanDosen').value;
  const telepon = document.getElementById('loanTelepon').value.trim();
  const tglPinjam = document.getElementById('loanTglPinjam').value;
  const tglRencanaKembali = document.getElementById('loanTglKembali').value;

  const randomSuffix = String(Math.floor(100 + Math.random() * 900));
  const dateCode = tglPinjam.replace(/-/g, '').slice(0, 6);
  const ticketNum = `PNJ-${dateCode}-${randomSuffix}`;
  const signatureData = sigCanvas.toDataURL('image/png');

  // Deduct available stock
  STATE.cart.forEach(cartItem => {
    const alat = STATE.alat.find(a => a.id === cartItem.id);
    if (alat) {
      alat.stokTersedia = Math.max(0, alat.stokTersedia - cartItem.jumlah);
      if (alat.stokTersedia === 0) alat.status = 'Dipinjam';
    }
  });

  const newLoan = {
    tiket: ticketNum,
    peran,
    nama,
    nim,
    jurusan: "Tadris IPA",
    semester,
    mataKuliah,
    dosenPengampu,
    telepon,
    tglPinjam,
    tglRencanaKembali,
    tglKembaliAktual: null,
    items: JSON.parse(JSON.stringify(STATE.cart)),
    status: "Menunggu Verifikasi",
    catatanPengembalian: null,
    fotoPengembalian: null,
    statusKondisi: "Menunggu Acc Laboran",
    verifikatorLaboran: null,
    signaturePeminjam: signatureData
  };

  STATE.loans.unshift(newLoan);
  saveState();

  STATE.cart = [];
  document.getElementById('loanForm').reset();
  clearSignature();
  setDefaultDates();

  renderAllViews();
  showLoanSuccessModal(newLoan);
}

function showLoanSuccessModal(loan) {
  const modal = document.getElementById('loanSuccessModal');
  const ticketSpan = document.getElementById('successTicketNum');
  const qrContainer = document.getElementById('successQrContainer');

  ticketSpan.textContent = loan.tiket;
  qrContainer.innerHTML = '';

  try {
    new QRCode(qrContainer, {
      text: `SILAB-IAI-YAPNAS:${loan.tiket}:${loan.nim}:${loan.nama}`,
      width: 140,
      height: 140,
      colorDark: "#064e3b",
      colorLight: "#ffffff"
    });
  } catch (err) {}

  STATE.lastCreatedLoan = loan;
  modal.classList.add('active');
}

function printReceiptFromSuccess() {
  closeModal('loanSuccessModal');
  if (STATE.lastCreatedLoan) {
    printLoanReceipt(STATE.lastCreatedLoan.tiket);
  }
}

/* ==========================================================================
   8. TRACKING & RETURN
   ========================================================================== */
function searchTrackingLoan() {
  const query = document.getElementById('trackSearchInput').value.trim().toLowerCase();
  const container = document.getElementById('trackResultContainer');

  if (!query) {
    showToast("Ketik nomor tiket atau NIM peminjam.", "warning");
    return;
  }

  const match = STATE.loans.find(l => 
    l.tiket.toLowerCase() === query || 
    l.nim.toLowerCase() === query
  );

  if (!match) {
    container.style.display = 'block';
    container.innerHTML = `
      <div class="track-result-panel" style="border-left: 4px solid #ef4444; padding: 20px; background: var(--bg-card); border-radius: var(--radius-lg); text-align: center;">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; color: #ef4444; margin-bottom: 8px;"></i>
        <h4>Tiket "${query}" Tidak Ditemukan</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Periksa kembali nomor tiket (contoh: PNJ-202610-001) atau gunakan NIM.</p>
      </div>
    `;
    return;
  }

  renderTrackingDetails(match);
}

function renderTrackingDetails(loan) {
  const container = document.getElementById('trackResultContainer');
  container.style.display = 'block';

  let step1 = true;
  let step2 = loan.status !== 'Menunggu Verifikasi';
  let step3 = loan.status === 'Dipinjam' || loan.status === 'Selesai';
  let step4 = loan.fotoPengembalian !== null || loan.status === 'Selesai';
  let step5 = loan.status === 'Selesai';

  container.innerHTML = `
    <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-left: 5px solid #10b981; border-radius: var(--radius-xl); padding: 24px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">Status Tiket Peminjaman</span>
          <h3 style="font-family: var(--font-mono); color: #10b981; font-size: 1.3rem;">${loan.tiket}</h3>
          <div style="font-size: 0.88rem; font-weight: 600;">${loan.nama} (${loan.nim}) • ${loan.peran}</div>
        </div>
        <div style="text-align: right;">
          <span class="status-badge ${loan.status.toLowerCase().replace(/\s+/g, '-')}">${loan.status}</span>
          <div style="margin-top: 6px;">
            <button class="btn btn-outline btn-sm" onclick="printLoanReceipt('${loan.tiket}')">
              <i class="fa-solid fa-print"></i> Cetak Bukti Pinjam
            </button>
          </div>
        </div>
      </div>

      <!-- Stepper 5 Pilar -->
      <div class="stepper-wrap">
        <div class="step-node ${step1 ? 'completed' : ''}">
          <div class="step-circle"><i class="fa-solid fa-file-signature"></i></div>
          <div class="step-label">Pengajuan</div>
        </div>
        <div class="step-node ${step2 ? 'completed active' : ''}">
          <div class="step-circle"><i class="fa-solid fa-clipboard-check"></i></div>
          <div class="step-label">Approval</div>
        </div>
        <div class="step-node ${step3 ? 'completed active' : ''}">
          <div class="step-circle"><i class="fa-solid fa-hand-holding-hand"></i></div>
          <div class="step-label">Digunakan</div>
        </div>
        <div class="step-node ${step4 ? 'completed active' : ''}">
          <div class="step-circle"><i class="fa-solid fa-camera"></i></div>
          <div class="step-label">Cek Foto</div>
        </div>
        <div class="step-node ${step5 ? 'completed active' : ''}">
          <div class="step-circle"><i class="fa-solid fa-circle-check"></i></div>
          <div class="step-label">Selesai</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 18px;">
        <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); font-size: 0.82rem; color: var(--text-muted); line-height: 1.6;">
          <div><strong>Mata Kuliah:</strong> ${loan.mataKuliah}</div>
          <div><strong>Dosen Pembimbing:</strong> ${loan.dosenPengampu}</div>
          <div><strong>Jadwal Pinjam:</strong> ${loan.tglPinjam} s/d ${loan.tglRencanaKembali}</div>
        </div>
        <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md); font-size: 0.82rem;">
          <strong>Daftar Barang:</strong>
          <ul style="list-style: none; padding: 0; margin-top: 4px;">
            ${loan.items.map(i => `<li>• ${i.nama} (<strong>${i.jumlah} unit</strong>)</li>`).join('')}
          </ul>
        </div>
      </div>

      ${loan.status === 'Dipinjam' ? `
        <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: var(--radius-md); padding: 16px; text-align: center;">
          <h4 style="color: #10b981; margin-bottom: 4px;"><i class="fa-solid fa-camera"></i> Siap Mengembalikan Alat?</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 10px;">
            Unggah foto fisik alat yang telah dibersihkan untuk verifikasi Laboran.
          </p>
          <button class="btn btn-primary btn-sm" onclick="openReturnModal('${loan.tiket}')">
            <i class="fa-solid fa-camera"></i> Unggah Bukti Pengembalian
          </button>
        </div>
      ` : ''}

      ${loan.fotoPengembalian ? `
        <div style="margin-top: 14px; background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md);">
          <div style="font-size: 0.84rem; font-weight: 700; color: #10b981; margin-bottom: 6px;">Foto Bukti Pengembalian:</div>
          <img src="${loan.fotoPengembalian}" alt="Bukti" style="max-height: 160px; border-radius: var(--radius-sm);">
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Kondisi: <strong>${loan.statusKondisi}</strong> | Catatan: ${loan.catatanPengembalian || '-'}</div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderLoansTable() {
  const tbody = document.getElementById('allLoansTableBody');
  if (!tbody) return;

  if (STATE.loans.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px;">Belum ada riwayat transaksi peminjaman.</td></tr>`;
    return;
  }

  tbody.innerHTML = STATE.loans.map(loan => `
    <tr>
      <td style="font-family: var(--font-mono); font-weight: 700; color: #10b981;">${loan.tiket}</td>
      <td><strong>${loan.nama}</strong></td>
      <td><span class="badge">${loan.peran}</span><br><small style="color: var(--text-dim);">${loan.nim}</small></td>
      <td>${loan.mataKuliah}</td>
      <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${loan.items.map(i => `${i.nama} (${i.jumlah})`).join(', ')}</td>
      <td><small>${loan.tglPinjam} - ${loan.tglRencanaKembali}</small></td>
      <td><span class="status-badge ${loan.status.toLowerCase().replace(/\s+/g, '-')}">${loan.status}</span></td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-outline btn-sm" onclick="trackSingleLoan('${loan.tiket}')" title="Lacak"><i class="fa-solid fa-eye"></i></button>
          <button class="btn btn-secondary btn-sm" onclick="printLoanReceipt('${loan.tiket}')" title="Cetak"><i class="fa-solid fa-print"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function trackSingleLoan(ticket) {
  document.getElementById('trackSearchInput').value = ticket;
  switchTab('tab-lacak');
  searchTrackingLoan();
}

// Return Modal
function openReturnModal(ticket) {
  const loan = STATE.loans.find(l => l.tiket === ticket);
  if (!loan) return;

  STATE.activeReturnTicket = ticket;
  STATE.returnPhotoBase64 = null;

  document.getElementById('returnModalTicket').textContent = loan.tiket;
  document.getElementById('returnModalBorrower').textContent = `${loan.nama} (${loan.nim}) - ${loan.peran}`;
  document.getElementById('returnModalItems').textContent = loan.items.map(i => `${i.nama} (${i.jumlah} unit)`).join(', ');

  const preview = document.getElementById('returnPhotoPreview');
  preview.style.display = 'none';
  preview.src = '';
  document.getElementById('returnNotes').value = '';

  document.getElementById('returnFormModal').classList.add('active');
}

function handleReturnPhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    STATE.returnPhotoBase64 = e.target.result;
    const preview = document.getElementById('returnPhotoPreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function submitReturnProof() {
  if (!STATE.activeReturnTicket) return;

  if (!STATE.returnPhotoBase64) {
    showToast("Unggah foto kondisi alat saat dikembalikan.", "warning");
    return;
  }

  const loan = STATE.loans.find(l => l.tiket === STATE.activeReturnTicket);
  if (!loan) return;

  const condition = document.getElementById('returnConditionSelect').value;
  const notes = document.getElementById('returnNotes').value.trim();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  loan.fotoPengembalian = STATE.returnPhotoBase64;
  loan.statusKondisi = condition;
  loan.catatanPengembalian = notes;
  loan.tglKembaliAktual = todayStr;
  loan.status = "Selesai";
  loan.verifikatorLaboran = STATE.laboran ? STATE.laboran.nama : "Ahmad Fadhlillah, S.Si.";

  // Restore inventory stock
  loan.items.forEach(cartItem => {
    const alat = STATE.alat.find(a => a.id === cartItem.id);
    if (alat) {
      alat.stokTersedia = Math.min(alat.stok, alat.stokTersedia + cartItem.jumlah);
      alat.status = 'Tersedia';
    }
  });

  saveState();
  closeModal('returnFormModal');
  renderAllViews();
  searchTrackingLoan();
  showToast("Pengembalian alat berhasil diverifikasi! Stok inventaris otomatis pulih.", "success");
}

/* ==========================================================================
   9. PRINT RECEIPT
   ========================================================================== */
function printLoanReceipt(ticket) {
  const loan = STATE.loans.find(l => l.tiket === ticket);
  if (!loan) return;

  document.getElementById('printTicketNumber').textContent = loan.tiket;
  document.getElementById('printBorrowerName').textContent = loan.nama;
  document.getElementById('printBorrowerRole').textContent = loan.peran;
  document.getElementById('printBorrowerNim').textContent = loan.nim;
  document.getElementById('printBorrowerCourse').textContent = loan.mataKuliah;
  document.getElementById('printBorrowerLecturer').textContent = loan.dosenPengampu;
  document.getElementById('printLoanDate').textContent = loan.tglPinjam;
  document.getElementById('printReturnDueDate').textContent = loan.tglRencanaKembali;
  document.getElementById('printCurrentDate').textContent = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('printSignerName').textContent = `( ${loan.nama} )`;

  const printNama = document.getElementById('printLaboranName');
  const printNip = document.getElementById('printLaboranNip');
  if (printNama && STATE.laboran) printNama.textContent = STATE.laboran.nama;
  if (printNip && STATE.laboran) printNip.textContent = STATE.laboran.nip;

  const sigArea = document.getElementById('printBorrowerSigArea');
  if (loan.signaturePeminjam) {
    sigArea.innerHTML = `<img src="${loan.signaturePeminjam}" style="max-height: 55px; max-width: 150px;">`;
  } else {
    sigArea.innerHTML = `<div style="height: 50px;"></div>`;
  }

  const tbody = document.getElementById('printItemsTableBody');
  tbody.innerHTML = loan.items.map((item, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td style="font-family: monospace;">${item.kode || '-'}</td>
      <td><strong>${item.nama}</strong></td>
      <td>${item.merk || '-'} (${item.buatan || '-'})</td>
      <td style="text-align: center; font-weight: bold;">${item.jumlah} Unit</td>
    </tr>
  `).join('');

  const qrPrintBox = document.getElementById('printQrVerifyBox');
  qrPrintBox.innerHTML = '';
  try {
    new QRCode(qrPrintBox, {
      text: `VERIFIED-IAI-YAPNAS:${loan.tiket}`,
      width: 60,
      height: 60
    });
  } catch (e) {}

  window.print();
}

/* ==========================================================================
   10. MODAL DETAILS, EXPORT & UTILITIES
   ========================================================================== */
function showItemDetail(type, id) {
  let item = null;
  if (type === 'ALAT') item = STATE.alat.find(a => a.id === id);
  if (type === 'FASILITAS') item = STATE.fasilitas.find(f => f.id === id);
  if (!item) return;

  const modal = document.getElementById('detailItemModal');
  document.getElementById('modalItemTitle').textContent = item.nama;

  const body = document.getElementById('modalItemBody');
  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 14px;">
      <img src="${item.gambar || 'assets/glassware.jpg'}" alt="${item.nama}" 
           style="max-height: 190px; max-width: 100%; border-radius: var(--radius-md);">
    </div>
    <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
      <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
      <span class="badge">${item.kode}</span>
      <span class="badge">${item.kategori}</span>
    </div>
    <div class="item-specs-list">
      ${item.merk ? `<div class="spec-row"><span class="spec-key">Merk / Brand:</span><span class="spec-val">${item.merk}</span></div>` : ''}
      ${item.ukuran ? `<div class="spec-row"><span class="spec-key">Ukuran:</span><span class="spec-val">${item.ukuran}</span></div>` : ''}
      ${item.buatan ? `<div class="spec-row"><span class="spec-key">Buatan:</span><span class="spec-val">${item.buatan}</span></div>` : ''}
      <div class="spec-row"><span class="spec-key">Stok Tersedia:</span><span class="spec-val">${item.stokTersedia} dari ${item.stok} unit</span></div>
    </div>
    <p style="font-size: 0.84rem; color: var(--text-muted); margin-top: 10px; line-height: 1.45;">${item.deskripsi || 'Instrumen standar praktikum Tadris IPA.'}</p>
  `;

  const actionBtn = document.getElementById('modalItemActionBtn');
  actionBtn.onclick = () => {
    closeModal('detailItemModal');
    addToCart(type, item.id);
  };

  modal.classList.add('active');
}

function requestChemicalForPractice(chemName) {
  showToast(`Reagen "${chemName}" dimasukkan ke keperluan praktikum.`, 'info');
  const mkInput = document.getElementById('loanMataKuliah');
  if (mkInput && !mkInput.value.includes(chemName)) {
    mkInput.value = (mkInput.value ? mkInput.value + ` + Reagen ${chemName}` : `Praktikum ${chemName}`);
  }
  switchTab('tab-peminjaman');
}

function openAddInventoryModal() {
  document.getElementById('newInventoryForm').reset();
  toggleAddInventoryFields();
  document.getElementById('addInventoryModal').classList.add('active');
}

function toggleAddInventoryFields() {
  const type = document.getElementById('invType').value;
  const alatFields = document.getElementById('alatSpecificFields');
  const bahanFields = document.getElementById('bahanSpecificFields');

  if (type === 'ALAT') {
    alatFields.style.display = 'block';
    bahanFields.style.display = 'none';
  } else if (type === 'BAHAN') {
    alatFields.style.display = 'none';
    bahanFields.style.display = 'block';
  } else {
    alatFields.style.display = 'none';
    bahanFields.style.display = 'none';
  }
}

function saveNewInventoryItem(event) {
  event.preventDefault();

  const type = document.getElementById('invType').value;
  const kode = document.getElementById('invKode').value.trim();
  const nama = document.getElementById('invNama').value.trim();
  const stok = parseInt(document.getElementById('invStok').value) || 1;
  const lokasi = document.getElementById('invLokasi').value.trim() || 'Lab Terpadu';

  if (type === 'ALAT') {
    const merk = document.getElementById('invMerk').value.trim() || '-';
    const ukuran = document.getElementById('invUkuran').value.trim() || '-';
    const buatan = document.getElementById('invBuatan').value.trim() || 'Indonesia';
    const kategori = document.getElementById('invKategoriAlat').value;

    const newAlat = {
      id: `ALT-USR-${Date.now().toString().slice(-4)}`,
      nama,
      kode,
      kategori,
      merk,
      ukuran,
      buatan,
      stok,
      stokTersedia: stok,
      status: "Tersedia",
      lokasi,
      deskripsi: "Item baru ditambahkan oleh Laboran.",
      gambar: "assets/glassware.jpg"
    };
    STATE.alat.unshift(newAlat);
  }

  saveState();
  closeModal('addInventoryModal');
  renderAllViews();
  showToast(`Item baru "${nama}" berhasil disimpan ke sistem.`, "success");
}

function exportDataToCSV() {
  let csv = "data:text/csv;charset=utf-8,KATEGORI,KODE,NAMA,MERK,BUATAN,STOK,TERSEDIA,STATUS\r\n";
  STATE.alat.forEach(a => {
    csv += `Alat Lab,"${a.kode}","${a.nama}","${a.merk}","${a.buatan}",${a.stok},${a.stokTersedia},"${a.status}"\r\n`;
  });
  const encoded = encodeURI(csv);
  const a = document.createElement("a");
  a.setAttribute("href", encoded);
  a.setAttribute("download", `Inventaris_SILAB_IAI_YAPNAS_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("File data inventaris CSV berhasil diunduh.", "success");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function setupEventListeners() {
  document.getElementById('searchAlatInput')?.addEventListener('input', () => renderAlatGrid());
  document.getElementById('filterStatusAlat')?.addEventListener('change', () => renderAlatGrid());
  document.getElementById('searchFasilitasInput')?.addEventListener('input', () => renderFasilitasGrid());
  document.getElementById('filterStatusFasilitas')?.addEventListener('change', () => renderFasilitasGrid());
  document.getElementById('searchBahanInput')?.addEventListener('input', () => renderBahanGrid());
  document.getElementById('filterJenisBahan')?.addEventListener('change', () => renderBahanGrid());

  const chips = document.querySelectorAll('#alatCategoryChips .filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderAlatGrid();
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('active');
    }
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  let icon = 'fa-circle-check';
  let borderColor = '#10b981';

  if (type === 'error') { icon = 'fa-triangle-exclamation'; borderColor = '#ef4444'; }
  else if (type === 'warning') { icon = 'fa-circle-exclamation'; borderColor = '#f59e0b'; }
  else if (type === 'info') { icon = 'fa-circle-info'; borderColor = '#38bdf8'; }

  toast.style.borderLeftColor = borderColor;
  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="color: ${borderColor}; font-size: 1.15rem;"></i>
    <div style="font-size: 0.85rem; font-weight: 500;">${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
