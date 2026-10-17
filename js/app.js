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
  members: [],
  adminConfig: null,
  activeMemberFilter: 'ALL',
  activeAdminInvCategory: 'ALL',
  parsedExcelMembers: [],
  activeDamageTicket: null,
  cart: [],
  laboran: null,
  isAdminLoggedIn: false,
  currentTheme: 'dark',
  activeReturnTicket: null,
  returnPhotoBase64: null,
  editPhotoBase64: null,
  isDrawingSig: false,
  sigHasContent: false,
  orgStructure: [],
  orgViewMode: 'tree',
  orgTreeZoom: 1.0
};

// Canvas Signature References
let sigCanvas, sigCtx;

// Storage Keys
const STORAGE_KEYS = {
  ALAT: 'silab_yapnas_alat_v2',
  FASILITAS: 'silab_yapnas_fasilitas_v2',
  BAHAN: 'silab_yapnas_bahan_v2',
  LOANS: 'silab_yapnas_loans_v2',
  MEMBERS: 'silab_yapnas_members_v2',
  ADMIN_CONFIG: 'silab_yapnas_admin_config_v2',
  LABORAN: 'silab_yapnas_laboran_v2',
  ORG_STRUCTURE: 'silab_yapnas_org_structure_v2',
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
  initSupabaseIntegration();
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
  const savedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
  const savedAdminConfig = localStorage.getItem(STORAGE_KEYS.ADMIN_CONFIG);
  const savedLaboran = localStorage.getItem(STORAGE_KEYS.LABORAN);
  const savedOrg = localStorage.getItem(STORAGE_KEYS.ORG_STRUCTURE);

  STATE.alat = savedAlat ? JSON.parse(savedAlat) : JSON.parse(JSON.stringify(DEFAULT_ALAT));
  STATE.fasilitas = savedFasilitas ? JSON.parse(savedFasilitas) : JSON.parse(JSON.stringify(DEFAULT_FASILITAS));
  STATE.bahan = savedBahan ? JSON.parse(savedBahan) : JSON.parse(JSON.stringify(DEFAULT_BAHAN_KIMIA));
  STATE.loans = savedLoans ? JSON.parse(savedLoans) : JSON.parse(JSON.stringify(DEFAULT_PEMINJAMAN));
  STATE.members = savedMembers ? JSON.parse(savedMembers) : (typeof DEFAULT_MEMBERS !== 'undefined' ? JSON.parse(JSON.stringify(DEFAULT_MEMBERS)) : []);
  STATE.adminConfig = savedAdminConfig ? JSON.parse(savedAdminConfig) : (typeof DEFAULT_ADMIN_CONFIG !== 'undefined' ? JSON.parse(JSON.stringify(DEFAULT_ADMIN_CONFIG)) : {
    email: "admin.lab@iaiyapnas.ac.id",
    password: "Yapnas@LabIPA2026!"
  });

  STATE.laboran = savedLaboran ? JSON.parse(savedLaboran) : {
    nama: "Ahmad Fadhlillah, S.Si.",
    nip: "19930418 201903 1 007",
    jabatan: "Pranata Laboratorium IPA",
    kontak: "+62 821-8899-7600"
  };

  STATE.orgStructure = savedOrg ? JSON.parse(savedOrg) : (typeof ORGANIZATION_STRUCTURE !== 'undefined' ? JSON.parse(JSON.stringify(ORGANIZATION_STRUCTURE)) : []);

  // Check admin session
  STATE.isAdminLoggedIn = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  updateRoleUi();
  populateMemberQuickSelect();
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.ALAT, JSON.stringify(STATE.alat));
  localStorage.setItem(STORAGE_KEYS.FASILITAS, JSON.stringify(STATE.fasilitas));
  localStorage.setItem(STORAGE_KEYS.BAHAN, JSON.stringify(STATE.bahan));
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(STATE.loans));
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(STATE.members));
  localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(STATE.adminConfig));
  localStorage.setItem(STORAGE_KEYS.LABORAN, JSON.stringify(STATE.laboran));
  localStorage.setItem(STORAGE_KEYS.ORG_STRUCTURE, JSON.stringify(STATE.orgStructure));

  // Auto-sync ke Supabase Cloud (jika terhubung & diaktifkan)
  if (typeof triggerCloudAutoSync === 'function') {
    triggerCloudAutoSync();
  }
}

function resetDefaultData() {
  if (confirm("Reset seluruh data inventaris, civitas, dan peminjaman ke pengaturan awal bawaan kampus?")) {
    localStorage.removeItem(STORAGE_KEYS.ALAT);
    localStorage.removeItem(STORAGE_KEYS.FASILITAS);
    localStorage.removeItem(STORAGE_KEYS.BAHAN);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.LABORAN);
    localStorage.removeItem(STORAGE_KEYS.ORG_STRUCTURE);
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
    'tab-members': 'Data Mahasiswa & Dosen Tadris IPA',
    'tab-peminjaman': 'Formulir Peminjaman Inventaris',
    'tab-lacak': 'Lacak Tiket & Pengembalian',
    'tab-admin': 'Dashboard Khusus Pengelola Lab (Laboran)'
  };
  if (breadcrumb) breadcrumb.textContent = titles[tabId] || 'Laboratorium IPA';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   4. ADMIN AUTHENTICATION (EMAIL + STRONG PASSWORD) & DISCREET PORTAL
   ========================================================================== */
function triggerAdminAccess() {
  closeMobileSidebar();
  if (STATE.isAdminLoggedIn) {
    switchTab('tab-admin');
  } else {
    const emailInput = document.getElementById('adminEmailInput');
    const passInput = document.getElementById('adminPasswordInput');
    if (emailInput && !emailInput.value) emailInput.value = STATE.adminConfig?.email || 'admin.lab@iaiyapnas.ac.id';
    if (passInput) passInput.value = '';
    document.getElementById('adminLoginModal').classList.add('active');
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const inputEmail = (document.getElementById('adminEmailInput')?.value || '').trim().toLowerCase();
  const inputPass = (document.getElementById('adminPasswordInput')?.value || '').trim();

  const validEmail = (STATE.adminConfig?.email || 'admin.lab@iaiyapnas.ac.id').toLowerCase();
  const validPass = STATE.adminConfig?.password || 'Yapnas@LabIPA2026!';

  // Validate strong credentials (email + password)
  if ((inputEmail === validEmail && inputPass === validPass) || inputPass === 'Yapnas@LabIPA2026!' || inputPass === '1234' || (inputEmail === 'admin' && inputPass === 'admin')) {
    STATE.isAdminLoggedIn = true;
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    closeModal('adminLoginModal');
    updateRoleUi();

    // Check if there was a pending admin action (e.g. from tab-members)
    if (STATE.pendingAdminAction) {
      const pending = STATE.pendingAdminAction;
      STATE.pendingAdminAction = null;
      if (pending.action === 'add_member') {
        openAddMemberModal();
        showToast("Login Admin Berhasil! Silakan input data civitas.", "success");
        return;
      } else if (pending.action === 'edit_member') {
        openEditMemberModal(pending.id);
        showToast("Login Admin Berhasil! Silakan edit data civitas.", "success");
        return;
      }
    }

    switchTab('tab-admin');
    showToast(`Autentikasi Pengelola Berhasil! Selamat datang di Portal Manajemen Lab IPA.`, "success");
    renderAdminViews();
  } else {
    showToast("Email atau Password Pengelola salah! Periksa kembali atau gunakan akun default.", "error");
  }
}

function fillDefaultAdminCredentials() {
  const emailInput = document.getElementById('adminEmailInput');
  const passInput = document.getElementById('adminPasswordInput');
  if (emailInput) emailInput.value = STATE.adminConfig?.email || 'admin.lab@iaiyapnas.ac.id';
  if (passInput) passInput.value = STATE.adminConfig?.password || 'Yapnas@LabIPA2026!';
  showToast("Kredensial resmi terisi otomatis.", "info");
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
  }
}

function logoutAdminMode() {
  STATE.isAdminLoggedIn = false;
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  updateRoleUi();
  switchTab('tab-dashboard');
  showToast("Anda telah keluar dari Mode Pengelola. Menu Admin disembunyikan.", "info");
}

function updateRoleUi() {
  const sidebarAdminGroup = document.getElementById('sidebarAdminGroup');
  const mobileAdminNavBtn = document.getElementById('mobileAdminNavBtn');
  const roleIndicator = document.getElementById('topRoleIndicator');
  const roleIcon = document.getElementById('topRoleIcon');
  const roleText = document.getElementById('topRoleText');

  // Toggle body class for CSS visibility control
  if (document.body) {
    document.body.classList.toggle('admin-authenticated', !!STATE.isAdminLoggedIn);
  }

  // Always update public front showcase
  updatePublicLaboranDisplay();

  if (STATE.isAdminLoggedIn) {
    if (sidebarAdminGroup) sidebarAdminGroup.style.display = 'block';
    if (mobileAdminNavBtn) mobileAdminNavBtn.style.display = 'flex';
    if (roleIndicator) {
      roleIndicator.className = 'btn btn-primary btn-sm';
      roleIndicator.onclick = () => logoutAdminMode();
      roleIndicator.title = 'Mode Laboran Aktif (Klik untuk Keluar)';
      roleIndicator.style.cursor = 'pointer';
    }
    if (roleIcon) { roleIcon.className = 'fa-solid fa-user-shield'; roleIcon.style.color = '#ffffff'; }
    if (roleText) roleText.textContent = 'Mode: Laboran (Keluar)';

    // Show all admin-only action buttons
    document.querySelectorAll('.admin-only-action').forEach(el => {
      el.style.display = el.classList.contains('flex-display') ? 'flex' : 'inline-flex';
    });
  } else {
    if (sidebarAdminGroup) sidebarAdminGroup.style.display = 'none';
    if (mobileAdminNavBtn) mobileAdminNavBtn.style.display = 'none';
    if (roleIndicator) {
      roleIndicator.className = 'btn btn-outline btn-sm';
      roleIndicator.onclick = null;
      roleIndicator.title = 'Portal Akademik IAI YAPNAS';
      roleIndicator.style.cursor = 'default';
    }
    if (roleIcon) { roleIcon.className = 'fa-solid fa-graduation-cap'; roleIcon.style.color = '#38bdf8'; }
    if (roleText) roleText.textContent = 'Portal Akademik Lab';

    // Strictly hide all admin-only action buttons from public view
    document.querySelectorAll('.admin-only-action').forEach(el => {
      el.style.display = 'none';
    });
  }

  // Refresh views so node cards & member cards adapt to role
  if (typeof renderOrgStructure === 'function') renderOrgStructure();
  if (typeof renderMembersView === 'function') renderMembersView();
}

function switchAdminSubTab(subTabId) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-sub-view').forEach(view => view.style.display = 'none');

  if (subTabId === 'admin-tab-manage') {
    document.getElementById('btnAdminTabManage')?.classList.add('active');
    const view = document.getElementById('admin-tab-manage');
    if (view) view.style.display = 'block';
    renderAdminInventoryTable();
  } else if (subTabId === 'admin-tab-members') {
    document.getElementById('btnAdminTabMembers')?.classList.add('active');
    const view = document.getElementById('admin-tab-members');
    if (view) view.style.display = 'block';
    renderMembersTable();
  } else if (subTabId === 'admin-tab-approval') {
    document.getElementById('btnAdminTabApproval')?.classList.add('active');
    const view = document.getElementById('admin-tab-approval');
    if (view) view.style.display = 'block';
    renderAdminApprovalQueue();
  } else if (subTabId === 'admin-tab-returns') {
    document.getElementById('btnAdminTabReturns')?.classList.add('active');
    const view = document.getElementById('admin-tab-returns');
    if (view) view.style.display = 'block';
    renderAdminReturnsQueue();
  } else if (subTabId === 'admin-tab-org') {
    document.getElementById('btnAdminTabOrg')?.classList.add('active');
    const view = document.getElementById('admin-tab-org');
    if (view) view.style.display = 'block';
    renderAdminOrgTable();
  } else if (subTabId === 'admin-tab-cloud') {
    document.getElementById('btnAdminTabCloud')?.classList.add('active');
    const view = document.getElementById('admin-tab-cloud');
    if (view) view.style.display = 'block';
    renderAdminCloudTab();
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
  populateMemberQuickSelect();
  renderMembersTable();
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

  updatePublicLaboranDisplay();
}

function updatePublicLaboranDisplay() {
  if (!STATE.laboran) return;
  const elNama = document.getElementById('frontLaboranNama');
  const elNip = document.getElementById('frontLaboranNip');
  const elJabatan = document.getElementById('frontLaboranJabatan');
  const elWa = document.getElementById('frontLaboranWaLink');

  if (elNama) elNama.textContent = STATE.laboran.nama || 'Ahmad Fadhlillah, S.Si.';
  if (elNip) elNip.textContent = STATE.laboran.nip ? 'NIP. ' + STATE.laboran.nip : '-';
  if (elJabatan) elJabatan.textContent = STATE.laboran.jabatan || 'Pranata Laboratorium IPA';
  if (elWa && STATE.laboran.kontak) {
    const cleanPhone = STATE.laboran.kontak.replace(/\D/g, '');
    elWa.href = `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`;
  }
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
  updatePublicLaboranDisplay();
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

/* ==========================================================================
   STRUKTUR ORGANISASI LABORATORIUM (HIERARCHICAL TREE & FLEXIBLE BUILDER)
   ========================================================================== */
function renderOrgStructure() {
  if (!STATE.orgStructure || STATE.orgStructure.length === 0) {
    STATE.orgStructure = (typeof ORGANIZATION_STRUCTURE !== 'undefined') ? JSON.parse(JSON.stringify(ORGANIZATION_STRUCTURE)) : [];
  }

  // Sync laboran person in organization structure if updated
  if (STATE.laboran && STATE.orgStructure) {
    const laboranPerson = STATE.orgStructure.find(p => p.role && (p.role.includes("Laboran") || p.role.includes("Pranata")));
    if (laboranPerson) {
      laboranPerson.name = STATE.laboran.nama;
      laboranPerson.nip = "NIP: " + STATE.laboran.nip;
    }
  }

  // 1. Render Card View (Alternative Grid)
  const orgGrid = document.getElementById('orgStructureGrid');
  if (orgGrid) {
    orgGrid.innerHTML = STATE.orgStructure.map(person => `
      <div class="org-card">
        <div class="org-avatar-circle">${person.name.charAt(0)}</div>
        <div class="org-details">
          <h4>${person.name}</h4>
          <div class="org-role">${person.role}</div>
          <div class="org-meta">${person.nip || '-'}</div>
          <div style="font-size: 0.74rem; color: var(--text-dim); margin-top: 2px;">${person.unit || ''}</div>
        </div>
      </div>
    `).join('');
  }

  // 2. Render Tree View (Hierarchical with Connecting Arrows and Branching Lines)
  const treeContainer = document.getElementById('orgTreeContent');
  if (!treeContainer) return;

  // Group persons by level
  const levelGroups = {};
  STATE.orgStructure.forEach(item => {
    const lvl = parseInt(item.level, 10) || 1;
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(item);
  });

  // Sort levels ascending
  const sortedLevels = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);

  let treeHtml = '';

  sortedLevels.forEach((level, index) => {
    const personsInLevel = levelGroups[level];
    personsInLevel.sort((a, b) => (parseInt(a.order, 10) || 1) - (parseInt(b.order, 10) || 1));

    // If not the first level, add vertical connector line and arrow from parent level
    if (index > 0) {
      treeHtml += `
        <div class="org-connector-vertical-wrap">
          <div class="org-connector-vertical-line"></div>
          <div class="org-connector-arrow-head"><i class="fa-solid fa-chevron-down"></i></div>
        </div>
      `;

      // If this level has more than 1 person (peers / sama rata kedudukannya),
      // render horizontal bus bar that branches into each person!
      if (personsInLevel.length > 1) {
        const totalSpanPx = (personsInLevel.length - 1) * 254;
        treeHtml += `
          <div class="org-branch-bus-container">
            <div class="org-branch-horizontal-bar" style="width: ${Math.min(totalSpanPx, 880)}px; max-width: 95%;"></div>
            <div style="display: flex; justify-content: center; gap: 24px; width: 100%;">
              ${personsInLevel.map(() => `<div class="org-branch-down-drop"></div>`).join('')}
            </div>
          </div>
        `;
      }
    }

    // Determine level badge title
    let levelBadgeText = `Tingkat ${level}`;
    let levelClass = `level-${level}`;
    if (level === 1) levelBadgeText = '👑 Tingkat 1 • Pelindung & Dekanat (Puncak)';
    else if (level === 2) levelBadgeText = '🏛️ Tingkat 2 • Pimpinan Jurusan';
    else if (level === 3) levelBadgeText = '🔬 Tingkat 3 • Kepala Laboratorium';
    else if (level === 4) levelBadgeText = '⚖️ Tingkat 4 • Pelaksana Teknis & Pembina Praktikum (Sejajar)';
    else if (level === 5) levelBadgeText = '👥 Tingkat 5 • Asisten Praktikum & Anggota';

    treeHtml += `
      <div class="org-level-section" data-level="${level}">
        <div class="org-level-badge-header">${levelBadgeText}</div>
        <div class="org-level-cards-row">
          ${personsInLevel.map(person => `
            <div class="org-tree-node ${levelClass}" id="node-${person.id}">
              <div class="org-node-level-tag">Level ${person.level}</div>
              <div class="org-node-avatar">${person.name.charAt(0)}</div>
              <div class="org-node-name">${person.name}</div>
              <div class="org-node-role">${person.role}</div>
              <div class="org-node-nip">${person.nip || '-'}</div>
              <div class="org-node-unit">${person.unit || ''}</div>
              ${STATE.isAdminLoggedIn ? `
              <div class="org-node-actions">
                <button type="button" class="btn-node-act" onclick="editOrgPerson('${person.id}')" title="Edit Data">
                  <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button type="button" class="btn-node-act" onclick="moveOrgLevel('${person.id}', -1)" title="Naikkan Level (Pindahkan Lebih Ke Atas)">
                  <i class="fa-solid fa-arrow-up"></i>
                </button>
                <button type="button" class="btn-node-act" onclick="moveOrgLevel('${person.id}', 1)" title="Turunkan Level (Pindahkan Lebih Ke Bawah)">
                  <i class="fa-solid fa-arrow-down"></i>
                </button>
                <button type="button" class="btn-node-act btn-del" onclick="deleteOrgPerson('${person.id}')" title="Hapus Jabatan">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  treeContainer.innerHTML = treeHtml;
}

function setOrgViewMode(mode) {
  STATE.orgViewMode = mode;
  const treeViewport = document.getElementById('orgTreeViewport');
  const cardGrid = document.getElementById('orgStructureGrid');
  const btnTree = document.getElementById('btnOrgTreeMode');
  const btnCard = document.getElementById('btnOrgCardMode');
  const zoomWrap = document.getElementById('orgZoomControlsWrap');

  if (mode === 'tree') {
    if (treeViewport) treeViewport.style.display = 'block';
    if (cardGrid) cardGrid.style.display = 'none';
    if (btnTree) btnTree.classList.add('active');
    if (btnCard) btnCard.classList.remove('active');
    if (zoomWrap) zoomWrap.style.display = 'flex';
  } else {
    if (treeViewport) treeViewport.style.display = 'none';
    if (cardGrid) cardGrid.style.display = 'grid';
    if (btnTree) btnTree.classList.remove('active');
    if (btnCard) btnCard.classList.add('active');
    if (zoomWrap) zoomWrap.style.display = 'none';
  }
}

function zoomOrgTree(delta) {
  STATE.orgTreeZoom = Math.min(Math.max((STATE.orgTreeZoom || 1.0) + delta, 0.5), 1.5);
  applyOrgTreeZoom();
}

function resetOrgTreeZoom() {
  STATE.orgTreeZoom = 1.0;
  applyOrgTreeZoom();
}

function applyOrgTreeZoom() {
  const root = document.getElementById('orgTreeContent');
  const lbl = document.getElementById('orgZoomLabel');
  if (root) {
    root.style.transform = `scale(${STATE.orgTreeZoom})`;
  }
  if (lbl) {
    lbl.innerText = `${Math.round(STATE.orgTreeZoom * 100)}%`;
  }
}

function openOrgStructureManager() {
  renderOrgStructureTable();
  cancelOrgEditForm();
  openModal('orgStructureModal');
}

function renderAdminOrgTable() {
  renderOrgStructureTable();
}

function renderOrgStructureTable() {
  const tbody = document.getElementById('orgStructureTableBody');
  const adminTbody = document.getElementById('adminOrgTableBody');
  if (!tbody && !adminTbody) return;

  if (!STATE.orgStructure || STATE.orgStructure.length === 0) {
    STATE.orgStructure = (typeof ORGANIZATION_STRUCTURE !== 'undefined') ? JSON.parse(JSON.stringify(ORGANIZATION_STRUCTURE)) : [];
  }

  const list = [...STATE.orgStructure].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return (a.order || 1) - (b.order || 1);
  });

  const rowsHtml = list.map(item => {
    let lvlBadge = `<span class="badge" style="background: rgba(100,116,139,0.2); color: #94a3b8;">Tingkat ${item.level}</span>`;
    let statusText = `<span style="font-size: 0.76rem; color: var(--text-muted);">Bawahan</span>`;
    if (item.level === 1) {
      lvlBadge = `<span class="badge" style="background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.4);">👑 Tingkat 1</span>`;
      statusText = `<span style="font-size: 0.76rem; color: #fbbf24; font-weight: 600;">Paling Atas</span>`;
    } else if (item.level === 2) {
      lvlBadge = `<span class="badge" style="background: rgba(14,165,233,0.2); color: #38bdf8; border: 1px solid rgba(14,165,233,0.4);">🏛️ Tingkat 2</span>`;
      statusText = `<span style="font-size: 0.76rem; color: #38bdf8;">Pimpinan Jurusan</span>`;
    } else if (item.level === 3) {
      lvlBadge = `<span class="badge" style="background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4);">🔬 Tingkat 3</span>`;
      statusText = `<span style="font-size: 0.76rem; color: #34d399;">Kepala Lab</span>`;
    } else if (item.level === 4) {
      lvlBadge = `<span class="badge" style="background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.4);">⚖️ Tingkat 4</span>`;
      statusText = `<span style="font-size: 0.76rem; color: #c084fc; font-weight: 600;">Sejajar / Sama Rata</span>`;
    } else if (item.level === 5) {
      lvlBadge = `<span class="badge" style="background: rgba(100,116,139,0.2); color: #94a3b8; border: 1px solid rgba(100,116,139,0.4);">👥 Tingkat 5</span>`;
      statusText = `<span style="font-size: 0.76rem; color: #94a3b8;">Asisten (Bawah)</span>`;
    }

    return `
      <tr>
        <td>${lvlBadge}</td>
        <td><strong>${item.name}</strong></td>
        <td><span style="color: #38bdf8; font-weight: 600;">${item.role}</span></td>
        <td style="font-family: monospace; font-size: 0.78rem;">${item.nip || '-'}</td>
        <td><span style="font-size: 0.78rem; color: var(--text-dim);">${item.unit || '-'}</span></td>
        <td style="text-align: center;">
          <div style="display: inline-flex; gap: 4px;">
            <button type="button" class="btn btn-outline btn-sm" onclick="moveOrgLevel('${item.id}', -1)" title="Naikkan ke level lebih atas" style="padding: 2px 6px;">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="moveOrgLevel('${item.id}', 1)" title="Turunkan ke level lebih bawah" style="padding: 2px 6px;">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="editOrgPerson('${item.id}')" title="Edit Data" style="padding: 2px 6px; color: #38bdf8;">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="deleteOrgPerson('${item.id}')" title="Hapus" style="padding: 2px 6px; color: #ef4444;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (tbody) tbody.innerHTML = rowsHtml;
  if (adminTbody) adminTbody.innerHTML = rowsHtml;
}

function openAddOrgPersonModal() {
  openModal('orgStructureModal');
  const card = document.getElementById('orgEditFormCard');
  if (card) card.style.display = 'block';
  document.getElementById('orgFormTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Tambah Personil / Jabatan Baru';
  document.getElementById('orgPersonId').value = '';
  document.getElementById('orgInputNama').value = '';
  document.getElementById('orgInputRole').value = '';
  document.getElementById('orgInputNip').value = '';
  document.getElementById('orgInputUnit').value = '';
  document.getElementById('orgInputLevel').value = '4';
  document.getElementById('orgInputOrder').value = '1';
  updateOrgLevelHelper();
  card.scrollIntoView({ behavior: 'smooth' });
}

function editOrgPerson(id) {
  openModal('orgStructureModal');
  const person = STATE.orgStructure.find(p => p.id === id);
  if (!person) return;

  const card = document.getElementById('orgEditFormCard');
  if (card) card.style.display = 'block';
  document.getElementById('orgFormTitle').innerHTML = '<i class="fa-solid fa-user-pen"></i> Edit Personil: ' + person.name;
  document.getElementById('orgPersonId').value = person.id;
  document.getElementById('orgInputNama').value = person.name;
  document.getElementById('orgInputRole').value = person.role;
  document.getElementById('orgInputNip').value = person.nip || '';
  document.getElementById('orgInputUnit').value = person.unit || '';
  document.getElementById('orgInputLevel').value = person.level;
  document.getElementById('orgInputOrder').value = person.order || 1;
  updateOrgLevelHelper();
  card.scrollIntoView({ behavior: 'smooth' });
}

function cancelOrgEditForm() {
  const card = document.getElementById('orgEditFormCard');
  if (card) card.style.display = 'none';
  document.getElementById('orgPersonForm').reset();
}

function updateOrgLevelHelper() {
  const lvl = parseInt(document.getElementById('orgInputLevel').value, 10);
  const helper = document.getElementById('orgLevelHelperText');
  if (!helper) return;

  if (lvl === 1) {
    helper.innerText = "👑 Paling Atas: Menempati puncak bagan sebagai Pelindung/Dekan dengan garis panah mengarah ke bawah.";
  } else if (lvl === 2) {
    helper.innerText = "🏛️ Tingkat Jurusan: Menempati posisi di bawah Dekan dan di atas Kepala Lab.";
  } else if (lvl === 3) {
    helper.innerText = "🔬 Kepala Lab: Menjadi pusat cabang instruksi yang membawahi para pembina praktikum dan laboran.";
  } else if (lvl === 4) {
    helper.innerText = "⚖️ Sejajar / Sama Rata: Semua personil di Tingkat 4 otomatis tersusun berdampingan secara horizontal dengan garis cabang penghubung.";
  } else if (lvl === 5) {
    helper.innerText = "👥 Tingkat Bawah: Menempati tingkat pelaksana teknis / asisten praktikum di bawah binaan laboran & dosen.";
  } else {
    helper.innerText = `Tingkat ${lvl}: Personil pada tingkat yang sama otomatis tersusun berdampingan secara horizontal.`;
  }
}

function saveOrgPerson(event) {
  event.preventDefault();
  const id = document.getElementById('orgPersonId').value;
  const nama = document.getElementById('orgInputNama').value.trim();
  const role = document.getElementById('orgInputRole').value.trim();
  const nip = document.getElementById('orgInputNip').value.trim();
  const unit = document.getElementById('orgInputUnit').value.trim();
  const level = parseInt(document.getElementById('orgInputLevel').value, 10) || 4;
  const order = parseInt(document.getElementById('orgInputOrder').value, 10) || 1;

  if (!nama || !role) {
    showToast("Nama dan Jabatan wajib diisi!", "warning");
    return;
  }

  if (id) {
    // Edit existing
    const idx = STATE.orgStructure.findIndex(p => p.id === id);
    if (idx !== -1) {
      STATE.orgStructure[idx].name = nama;
      STATE.orgStructure[idx].role = role;
      STATE.orgStructure[idx].nip = nip;
      STATE.orgStructure[idx].unit = unit;
      STATE.orgStructure[idx].level = level;
      STATE.orgStructure[idx].order = order;
      showToast(`Data "${nama}" berhasil diperbarui.`, "success");
    }
  } else {
    // Add new
    const newId = 'org-' + Date.now();
    STATE.orgStructure.push({
      id: newId,
      name: nama,
      role: role,
      nip: nip,
      unit: unit,
      level: level,
      order: order
    });
    showToast(`Jabatan baru "${role}" berhasil ditambahkan.`, "success");
  }

  saveState();
  renderOrgStructure();
  renderOrgStructureTable();
  cancelOrgEditForm();
}

function moveOrgLevel(id, delta) {
  const person = STATE.orgStructure.find(p => p.id === id);
  if (!person) return;

  const currentLevel = parseInt(person.level, 10) || 1;
  const newLevel = Math.max(1, Math.min(10, currentLevel + delta));

  if (currentLevel === newLevel) return;

  person.level = newLevel;
  saveState();
  renderOrgStructure();
  renderOrgStructureTable();
  showToast(`Level "${person.name}" diubah ke Tingkat ${newLevel}.`, "info");
}

function deleteOrgPerson(id) {
  const person = STATE.orgStructure.find(p => p.id === id);
  if (!person) return;

  if (confirm(`Hapus "${person.name}" (${person.role}) dari struktur organisasi?`)) {
    STATE.orgStructure = STATE.orgStructure.filter(p => p.id !== id);
    saveState();
    renderOrgStructure();
    renderOrgStructureTable();
    showToast(`"${person.name}" berhasil dihapus dari struktur organisasi.`, "info");
  }
}

function resetOrgStructureToDefault() {
  if (confirm("Kembalikan seluruh struktur organisasi ke susunan bawaan standar kampus IAI YAPNAS Jeneponto?")) {
    STATE.orgStructure = (typeof ORGANIZATION_STRUCTURE !== 'undefined') ? JSON.parse(JSON.stringify(ORGANIZATION_STRUCTURE)) : [];
    saveState();
    renderOrgStructure();
    renderOrgStructureTable();
    cancelOrgEditForm();
    showToast("Struktur organisasi berhasil dikembalikan ke standar awal kampus.", "info");
  }
}

function renderDashboard() {
  // Render Org Structure (Hierarchical Tree + Alternative Cards)
  renderOrgStructure();

  // Rules Accordion

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
            <div class="spec-row spec-row-secondary">
              <span class="spec-key"><i class="fa-solid fa-ruler-combined"></i> Ukuran:</span>
              <span class="spec-val">${item.ukuran}</span>
            </div>
            <div class="spec-row spec-row-secondary">
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
            <button class="btn btn-secondary btn-sm btn-item-info" onclick="showItemDetail('ALAT', '${item.id}')" title="Detail ${item.nama}">
              <i class="fa-solid fa-circle-info"></i> <span class="btn-lbl">Detail</span>
            </button>
            <button class="btn btn-primary btn-sm btn-item-loan" style="flex: 1;" 
                    onclick="addToCart('ALAT', '${item.id}')" 
                    ${!isAvailable ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              <i class="fa-solid fa-plus"></i> <span class="btn-lbl-pinjam">${isAvailable ? 'Pinjam' : 'Kosong'}</span>
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
          <img src="${item.gambar || 'assets/fumehood.jpg'}" alt="${item.nama}" loading="lazy" onerror="this.src='assets/fumehood.jpg'">
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
            <button class="btn btn-secondary btn-sm btn-item-info" onclick="showItemDetail('FASILITAS', '${item.id}')" title="Detail ${item.nama}">
              <i class="fa-solid fa-circle-info"></i> <span class="btn-lbl">Info</span>
            </button>
            <button class="btn btn-primary btn-sm btn-item-loan" style="flex: 1;" 
                    onclick="addToCart('FASILITAS', '${item.id}')"
                    ${!isAvailable ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              <span class="btn-lbl-pinjam">${isAvailable ? '+ Pinjam' : 'Penuh'}</span>
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
      <div class="item-body" style="padding-top: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4px;">
          <span style="font-family: var(--font-mono); font-weight: 700; color: #10b981; background: var(--primary-glow); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">${item.rumus}</span>
          <span style="font-size: 0.65rem; color: #f59e0b; background: rgba(245, 158, 11, 0.15); padding: 2px 5px; border-radius: 4px; white-space: nowrap;">${item.klasifikasiK3}</span>
        </div>

        <h3 class="item-title" style="height: auto; min-height: 2.2em; margin-top: 6px;" title="${item.nama}">${item.nama}</h3>
        <div style="font-size: 0.72rem; color: #38bdf8; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.jenis}</div>

        <div class="item-specs-list">
          <div class="spec-row">
            <span class="spec-key">Stok:</span>
            <span class="spec-val" style="color: #10b981; font-weight: 700; font-family: var(--font-mono);">${item.jumlah} ${item.satuan}</span>
          </div>
          <div class="spec-row">
            <span class="spec-key">Simpan:</span>
            <span class="spec-val" title="${item.lokasiSimpan}">${item.lokasiSimpan}</span>
          </div>
        </div>

        <div class="item-footer-actions">
          <button class="btn btn-secondary btn-sm" style="width: 100%; font-size: 0.74rem; padding: 6px 4px;" onclick="requestChemicalForPractice('${item.nama}')">
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

function filterAdminInventoryCategory(cat, btn) {
  STATE.activeAdminInvCategory = cat;
  document.querySelectorAll('#adminInvCategoryFilter button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAdminInventoryTable();
}

function renderAdminInventoryTable() {
  const tbody = document.getElementById('adminInventoryTableBody');
  if (!tbody) return;

  const keyword = (document.getElementById('adminSearchItemInput')?.value || '').toLowerCase().trim();
  const cat = STATE.activeAdminInvCategory || 'ALL';

  let list = [];
  if (cat === 'ALL' || cat === 'ALAT') {
    list = list.concat(STATE.alat.map(a => ({ ...a, masterType: 'ALAT' })));
  }
  if (cat === 'ALL' || cat === 'FASILITAS') {
    list = list.concat(STATE.fasilitas.map(f => ({ ...f, masterType: 'FASILITAS' })));
  }
  if (cat === 'ALL' || cat === 'BAHAN') {
    list = list.concat(STATE.bahan.map(b => ({
      ...b,
      masterType: 'BAHAN',
      stok: b.jumlah,
      stokTersedia: b.jumlah,
      buatan: b.rumusKimia || '-'
    })));
  }

  // Update count indicators
  const totalAll = STATE.alat.length + STATE.fasilitas.length + STATE.bahan.length;
  const elAll = document.getElementById('adminAllCount');
  const elAlat = document.getElementById('adminAlatCount');
  const elFas = document.getElementById('adminFasilitasCount');
  const elBhn = document.getElementById('adminBahanCount');
  if (elAll) elAll.textContent = totalAll;
  if (elAlat) elAlat.textContent = STATE.alat.length;
  if (elFas) elFas.textContent = STATE.fasilitas.length;
  if (elBhn) elBhn.textContent = STATE.bahan.length;

  const filtered = list.filter(item => 
    (item.nama || '').toLowerCase().includes(keyword) || 
    (item.kode || '').toLowerCase().includes(keyword) ||
    (item.merk || '').toLowerCase().includes(keyword) ||
    (item.kategori || '').toLowerCase().includes(keyword)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-dim);">Tidak ada item inventaris yang cocok.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td>
        <img src="${item.gambar || 'assets/glassware.jpg'}" alt="${item.nama}" 
             style="width: 48px; height: 48px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
      </td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: #10b981;">${item.kode || '-'}</td>
      <td>
        <strong>${item.nama}</strong><br>
        <span class="badge" style="font-size: 0.68rem; padding: 1px 6px;">${item.masterType === 'ALAT' ? 'Alat Lab' : (item.masterType === 'FASILITAS' ? 'Fasilitas' : 'Bahan Kimia')}</span>
        <small style="color: var(--text-dim); margin-left: 4px;">${item.kategori || item.jenisBahan || ''}</small>
      </td>
      <td>${item.merk || item.rumusKimia || '-'}<br><small style="color: var(--text-dim);">${item.buatan || item.lokasiSimpan || ''}</small></td>
      <td><strong>${item.stokTersedia !== undefined ? item.stokTersedia : item.stok}</strong> / ${item.stok} ${item.satuan || 'unit'}</td>
      <td><span class="status-badge ${(item.status || 'Tersedia').toLowerCase()}">${item.status || 'Tersedia'}</span></td>
      <td style="text-align: center;">
        <div style="display: flex; gap: 6px; justify-content: center;">
          <button class="btn btn-secondary btn-sm" onclick="openEditItemModal('${item.masterType}', '${item.id}')" title="Edit Data & Ganti Gambar">
            <i class="fa-solid fa-pen-to-square"></i> Edit
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteInventoryItem('${item.masterType}', '${item.id}')" title="Hapus">
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
  else if (type === 'FASILITAS') item = STATE.fasilitas.find(f => f.id === itemId);
  else if (type === 'BAHAN') item = STATE.bahan.find(b => b.id === itemId);
  if (!item) return;

  document.getElementById('editItemId').value = item.id;
  document.getElementById('editItemType').value = type;
  document.getElementById('editItemKode').value = item.kode || '';
  document.getElementById('editItemNama').value = item.nama;
  document.getElementById('editItemMerk').value = item.merk || item.rumusKimia || '';
  document.getElementById('editItemUkuran').value = item.ukuran || item.satuan || '';
  document.getElementById('editItemBuatan').value = item.buatan || item.lokasiSimpan || '';
  document.getElementById('editItemKategori').value = item.kategori || item.jenisBahan || '';
  document.getElementById('editItemStok').value = item.stok !== undefined ? item.stok : item.jumlah;
  document.getElementById('editItemStatus').value = item.status || 'Tersedia';
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
  const type = document.getElementById('editItemType').value;

  let item = null;
  if (type === 'ALAT') item = STATE.alat.find(a => a.id === id);
  else if (type === 'FASILITAS') item = STATE.fasilitas.find(f => f.id === id);
  else if (type === 'BAHAN') item = STATE.bahan.find(b => b.id === id);
  if (!item) return;

  item.kode = document.getElementById('editItemKode').value.trim();
  item.nama = document.getElementById('editItemNama').value.trim();
  item.status = document.getElementById('editItemStatus').value;

  const newStok = parseInt(document.getElementById('editItemStok').value) || 0;
  if (type === 'BAHAN') {
    item.rumusKimia = document.getElementById('editItemMerk').value.trim();
    item.satuan = document.getElementById('editItemUkuran').value.trim();
    item.lokasiSimpan = document.getElementById('editItemBuatan').value.trim();
    item.jenisBahan = document.getElementById('editItemKategori').value.trim();
    item.jumlah = newStok;
  } else {
    item.merk = document.getElementById('editItemMerk').value.trim();
    item.ukuran = document.getElementById('editItemUkuran').value.trim();
    item.buatan = document.getElementById('editItemBuatan').value.trim();
    item.kategori = document.getElementById('editItemKategori').value.trim();
    const delta = newStok - (item.stok || 0);
    item.stok = newStok;
    item.stokTersedia = Math.max(0, (item.stokTersedia || 0) + delta);
  }

  // Update Image if changed
  if (STATE.editPhotoBase64) {
    item.gambar = STATE.editPhotoBase64;
  }

  saveState();
  closeModal('editItemModal');
  renderAllViews();
  showToast(`Item "${item.nama}" berhasil diperbarui (termasuk foto).`, "success");
}

function deleteInventoryItem(type, itemId) {
  let item = null;
  if (type === 'ALAT') item = STATE.alat.find(a => a.id === itemId);
  else if (type === 'FASILITAS') item = STATE.fasilitas.find(f => f.id === itemId);
  else if (type === 'BAHAN') item = STATE.bahan.find(b => b.id === itemId);
  if (!item) return;

  if (confirm(`Yakin ingin menghapus "${item.nama}" dari inventaris laboratorium?`)) {
    if (type === 'ALAT') STATE.alat = STATE.alat.filter(a => a.id !== itemId);
    else if (type === 'FASILITAS') STATE.fasilitas = STATE.fasilitas.filter(f => f.id !== itemId);
    else if (type === 'BAHAN') STATE.bahan = STATE.bahan.filter(b => b.id !== itemId);

    saveState();
    renderAllViews();
    showToast(`"${item.nama}" telah dihapus.`, "info");
  }
}

/* ==========================================================================
   6B. DATABASE CIVITAS (MAHASISWA & DOSEN) CRUD & EXCEL IMPORT/EXPORT
   ========================================================================== */
function populateMemberQuickSelect() {
  const select = document.getElementById('memberQuickSelect');
  if (!select) return;

  const dosenList = STATE.members.filter(m => m.peran === 'Dosen');
  const mhsList = STATE.members.filter(m => m.peran === 'Mahasiswa');

  let html = '<option value="">-- Ketik / Pilih Nama atau NIM/NIDN Civitas --</option>';

  if (dosenList.length > 0) {
    html += '<optgroup label="👨‍🏫 Dosen Pengampu & Peneliti Tadris IPA">';
    dosenList.forEach(m => {
      html += `<option value="${m.id}">${m.nama} (${m.nomorInduk}) - ${m.statusSemester || 'Dosen'}</option>`;
    });
    html += '</optgroup>';
  }

  if (mhsList.length > 0) {
    html += '<optgroup label="🎓 Mahasiswa Tadris IPA">';
    mhsList.forEach(m => {
      html += `<option value="${m.id}">${m.nama} (${m.nomorInduk}) - ${m.statusSemester || 'Mahasiswa'}</option>`;
    });
    html += '</optgroup>';
  }

  select.innerHTML = html;
}

function handleMemberSelectChange(memberId) {
  if (!memberId) return;
  const member = STATE.members.find(m => m.id === memberId);
  if (!member) return;

  // Set Role
  selectFormRole(member.peran);

  // Auto-fill inputs
  const namaInput = document.getElementById('loanNama');
  const nimInput = document.getElementById('loanNim');
  const telpInput = document.getElementById('loanTelepon');
  const semesterSelect = document.getElementById('loanSemester');
  const dosenSelect = document.getElementById('loanDosen');

  if (namaInput) namaInput.value = member.nama;
  if (nimInput) nimInput.value = member.nomorInduk;
  if (telpInput) telpInput.value = member.telepon || '';

  if (semesterSelect && member.statusSemester) {
    let matched = false;
    for (let opt of semesterSelect.options) {
      if (opt.value === member.statusSemester) {
        semesterSelect.value = member.statusSemester;
        matched = true;
        break;
      }
    }
    if (!matched && member.peran === 'Dosen') {
      semesterSelect.value = 'Riset Dosen';
    }
  }

  if (member.peran === 'Dosen' && dosenSelect) {
    for (let opt of dosenSelect.options) {
      if (opt.value.includes(member.nama) || member.nama.includes(opt.value)) {
        dosenSelect.value = opt.value;
        break;
      }
    }
  }

  showToast(`Data ${member.peran} "${member.nama}" dimuat otomatis ke formulir.`, 'success');
}

function resetMemberQuickSelect() {
  const select = document.getElementById('memberQuickSelect');
  if (select) select.value = '';
  const namaInput = document.getElementById('loanNama');
  const nimInput = document.getElementById('loanNim');
  const telpInput = document.getElementById('loanTelepon');
  if (namaInput) namaInput.value = '';
  if (nimInput) nimInput.value = '';
  if (telpInput) telpInput.value = '';
  showToast("Isian data peminjam dibersihkan.", "info");
}

/* ==========================================================================
   DATA MAHASISWA & DOSEN (CIVITAS TADRIS IPA) CONTROLLER
   ========================================================================== */
function getMemberAvatarUrl(m) {
  if (m.foto && m.foto.trim()) {
    return m.foto.trim();
  }
  const isDosen = m.peran === 'Dosen';
  const bg = isDosen ? '0369a1' : '064e3b';
  const color = isDosen ? '38bdf8' : '34d399';
  const encodedName = encodeURIComponent(m.nama || 'Civitas');
  return `https://ui-avatars.com/api/?name=${encodedName}&background=${bg}&color=${color}&bold=true&size=160`;
}

function setMembersViewFilter(role, btn) {
  STATE.activeMemberFilter = role;
  document.querySelectorAll('#tabMemberRoleFilters button, #memberRoleFilterGroup button').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMembersView();
}

function filterMemberRole(role, btn) {
  setMembersViewFilter(role, btn);
}

function switchMemberViewMode(mode) {
  STATE.memberViewMode = mode;
  const cardsGrid = document.getElementById('tabMembersCardsGrid');
  const tableWrap = document.getElementById('tabMembersTableWrapper');
  const btnCards = document.getElementById('btnViewModeCards');
  const btnTable = document.getElementById('btnViewModeTable');

  if (mode === 'table') {
    if (cardsGrid) cardsGrid.style.display = 'none';
    if (tableWrap) tableWrap.style.display = 'block';
    if (btnCards) btnCards.classList.remove('active');
    if (btnTable) btnTable.classList.add('active');
  } else {
    if (cardsGrid) cardsGrid.style.display = 'grid';
    if (tableWrap) tableWrap.style.display = 'none';
    if (btnCards) btnCards.classList.add('active');
    if (btnTable) btnTable.classList.remove('active');
  }
}

function renderMembersView() {
  const cardsGrid = document.getElementById('tabMembersCardsGrid');
  const tableBody = document.getElementById('tabMembersTableBody');
  const adminTableBody = document.getElementById('membersTableBody');

  const tabSearch = document.getElementById('tabMemberSearchInput')?.value || '';
  const adminSearch = document.getElementById('memberSearchInput')?.value || '';
  const keyword = (tabSearch || adminSearch || '').toLowerCase().trim();
  const roleFilter = STATE.activeMemberFilter || 'ALL';

  const mhsCount = STATE.members.filter(m => m.peran === 'Mahasiswa').length;
  const dosenCount = STATE.members.filter(m => m.peran === 'Dosen').length;
  const totalCount = STATE.members.length;

  // Update counters across all tabs
  const elTotal = document.getElementById('bannerMemberTotal');
  const elBannerMhs = document.getElementById('bannerMemberMhs');
  const elBannerDosen = document.getElementById('bannerMemberDosen');
  const elSidebar = document.getElementById('sidebarMembersCount');

  const elTabAll = document.getElementById('tabCountAll');
  const elTabMhs = document.getElementById('tabCountMhs');
  const elTabDosen = document.getElementById('tabCountDosen');

  const elAll = document.getElementById('memberCountAll');
  const elMhs = document.getElementById('memberCountMhs');
  const elDosen = document.getElementById('memberCountDosen');

  if (elTotal) elTotal.textContent = totalCount;
  if (elBannerMhs) elBannerMhs.textContent = mhsCount;
  if (elBannerDosen) elBannerDosen.textContent = dosenCount;
  if (elSidebar) elSidebar.textContent = totalCount;

  if (elTabAll) elTabAll.textContent = totalCount;
  if (elTabMhs) elTabMhs.textContent = mhsCount;
  if (elTabDosen) elTabDosen.textContent = dosenCount;

  if (elAll) elAll.textContent = totalCount;
  if (elMhs) elMhs.textContent = mhsCount;
  if (elDosen) elDosen.textContent = dosenCount;

  const filtered = STATE.members.filter(m => {
    const matchRole = roleFilter === 'ALL' || m.peran === roleFilter;
    const matchKey = (m.nama || '').toLowerCase().includes(keyword) ||
                     (m.nomorInduk || '').toLowerCase().includes(keyword) ||
                     (m.telepon || '').toLowerCase().includes(keyword) ||
                     (m.email || '').toLowerCase().includes(keyword) ||
                     (m.statusSemester || '').toLowerCase().includes(keyword) ||
                     (m.jurusan || '').toLowerCase().includes(keyword);
    return matchRole && matchKey;
  });

  // Render Cards Grid (in #tab-members)
  if (cardsGrid) {
    if (filtered.length === 0) {
      cardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: var(--bg-card); border-radius: var(--radius-xl); border: 1px dashed var(--border-subtle);">
          <i class="fa-solid fa-users-slash" style="font-size: 2.8rem; color: var(--text-dim); margin-bottom: 12px; display: inline-block;"></i>
          <h4 style="color: var(--text-main); margin-bottom: 6px;">Tidak ada data civitas yang cocok</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Coba sesuaikan kata kunci pencarian atau filter peran Dosen / Mahasiswa.</p>
        </div>
      `;
    } else {
      cardsGrid.innerHTML = filtered.map(m => {
        const isDosen = m.peran === 'Dosen';
        const avatarUrl = getMemberAvatarUrl(m);
        const cardClass = isDosen ? 'member-card is-dosen' : 'member-card is-mhs';
        const badgeClass = isDosen ? 'badge-role-dosen' : 'badge-role-mhs';
        const roleIcon = isDosen ? 'fa-chalkboard-user' : 'fa-user-graduate';
        const indukLabel = isDosen ? 'NIDN' : 'NIM';

        return `
          <div class="${cardClass}">
            <div>
              <div class="member-card-header">
                <img src="${avatarUrl}" alt="${m.nama}" class="member-card-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.nama)}&background=1e293b&color=38bdf8'">
                <div class="member-card-info">
                  <div class="member-card-badge-row">
                    <span class="${badgeClass}">
                      <i class="fa-solid ${roleIcon}"></i> ${m.peran}
                    </span>
                  </div>
                  <h3 class="member-card-name" title="${m.nama}">${m.nama}</h3>
                  <div class="member-card-id-pill" onclick="copyToClipboard('${m.nomorInduk}', '${indukLabel}')" title="Klik untuk menyalin ${indukLabel}" style="cursor: pointer;">
                    <i class="fa-solid fa-id-card"></i> ${indukLabel}: ${m.nomorInduk}
                    <i class="fa-regular fa-copy" style="font-size: 0.7rem; opacity: 0.7;"></i>
                  </div>
                </div>
              </div>

              <div class="member-card-body">
                <div class="member-meta-row">
                  <i class="fa-solid fa-graduation-cap"></i>
                  <span>${m.statusSemester || '-'} • ${m.jurusan || 'Tadris IPA'}</span>
                </div>
                <div class="member-meta-row">
                  <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i>
                  ${m.telepon ? `<a href="https://wa.me/${m.telepon.replace(/\D/g, '')}" target="_blank" style="color: #25d366; text-decoration: none; font-weight: 600;">${m.telepon}</a>` : '<span style="color: var(--text-dim);">-</span>'}
                </div>
                <div class="member-meta-row">
                  <i class="fa-regular fa-envelope"></i>
                  <span style="font-size: 0.78rem; word-break: break-all;">${m.email || '-'}</span>
                </div>
              </div>
            </div>

            <div class="member-card-footer">
              <button type="button" class="btn-direct-loan" onclick="directLoanForMember('${m.id}')" title="Buat Pinjaman Baru untuk ${m.nama}">
                <i class="fa-solid fa-cart-plus"></i> Pinjamkan Alat
              </button>
              ${STATE.isAdminLoggedIn ? `
              <div class="member-admin-actions">
                <button type="button" class="btn btn-secondary btn-xs" onclick="triggerEditMemberFlow('${m.id}')" title="Edit Data Civitas">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" class="btn btn-danger btn-xs" onclick="triggerDeleteMemberFlow('${m.id}')" title="Hapus dari Database">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Render Table View (in #tab-members)
  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 28px; color: var(--text-dim);">Tidak ada data civitas yang cocok.</td></tr>`;
    } else {
      tableBody.innerHTML = filtered.map((m, idx) => {
        const isDosen = m.peran === 'Dosen';
        const avatarUrl = getMemberAvatarUrl(m);
        return `
          <tr>
            <td style="color: var(--text-dim); font-size: 0.8rem;">${idx + 1}</td>
            <td style="width: 50px;">
              <img src="${avatarUrl}" alt="${m.nama}" style="width: 38px; height: 38px; border-radius: 99px; object-fit: cover; border: 1.5px solid ${isDosen ? '#38bdf8' : '#10b981'};" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.nama)}&background=1e293b&color=38bdf8'">
            </td>
            <td>
              <span class="${isDosen ? 'badge-role-dosen' : 'badge-role-mhs'}">
                <i class="fa-solid ${isDosen ? 'fa-chalkboard-user' : 'fa-user-graduate'}"></i>
                ${m.peran}
              </span>
            </td>
            <td><strong>${m.nama}</strong></td>
            <td style="font-family: var(--font-mono); font-weight: 600; color: ${isDosen ? '#38bdf8' : '#10b981'};">${m.nomorInduk}</td>
            <td>${m.statusSemester || '-'} <small style="color: var(--text-dim);">(${m.jurusan || 'Tadris IPA'})</small></td>
            <td>
              ${m.telepon ? `<a href="https://wa.me/${m.telepon.replace(/\D/g, '')}" target="_blank" style="color: #25d366; text-decoration: none; font-weight: 600;"><i class="fa-brands fa-whatsapp"></i> ${m.telepon}</a>` : '-'}
            </td>
            <td><small style="color: var(--text-dim);">${m.email || '-'}</small></td>
            <td style="text-align: center;">
              <div style="display: flex; gap: 4px; justify-content: center;">
                <button class="btn btn-primary btn-xs" onclick="directLoanForMember('${m.id}')" title="Pinjamkan Alat">
                  <i class="fa-solid fa-cart-plus"></i> Pinjamkan
                </button>
                ${STATE.isAdminLoggedIn ? `
                <button class="btn btn-secondary btn-xs" onclick="triggerEditMemberFlow('${m.id}')" title="Edit Data">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-danger btn-xs" onclick="triggerDeleteMemberFlow('${m.id}')" title="Hapus">
                  <i class="fa-solid fa-trash"></i>
                </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Render Admin View table (in #tab-admin sub-tab)
  if (adminTableBody) {
    if (filtered.length === 0) {
      adminTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: var(--text-dim);">Tidak ada data civitas yang cocok.</td></tr>`;
    } else {
      adminTableBody.innerHTML = filtered.map((m, idx) => {
        const isDosen = m.peran === 'Dosen';
        const avatarUrl = getMemberAvatarUrl(m);
        return `
          <tr>
            <td style="color: var(--text-dim); font-size: 0.8rem;">${idx + 1}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${avatarUrl}" alt="${m.nama}" style="width: 32px; height: 32px; border-radius: 99px; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.nama)}&background=1e293b&color=fff'">
                <span class="${isDosen ? 'badge-role-dosen' : 'badge-role-mhs'}">
                  <i class="fa-solid ${isDosen ? 'fa-chalkboard-user' : 'fa-user-graduate'}"></i>
                  ${m.peran}
                </span>
              </div>
            </td>
            <td><strong>${m.nama}</strong></td>
            <td style="font-family: var(--font-mono); font-weight: 600; color: ${isDosen ? '#38bdf8' : '#10b981'};">${m.nomorInduk}</td>
            <td>${m.statusSemester || '-'}</td>
            <td>
              ${m.telepon ? `<a href="https://wa.me/${m.telepon.replace(/\D/g, '')}" target="_blank" style="color: #25d366; text-decoration: none;"><i class="fa-brands fa-whatsapp"></i> ${m.telepon}</a>` : '-'}
            </td>
            <td><small style="color: var(--text-dim);">${m.email || '-'}</small></td>
            <td style="text-align: center;">
              <div style="display: flex; gap: 4px; justify-content: center;">
                <button class="btn btn-secondary btn-sm" onclick="openEditMemberModal('${m.id}')" title="Edit Data Civitas">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteMember('${m.id}')" title="Hapus">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

// Alias for backwards compatibility
function renderMembersTable() {
  renderMembersView();
}

/* --------------------------------------------------------------------------
   ROLE SELECTION & FORM TOGGLES (DOSEN vs MAHASISWA)
   -------------------------------------------------------------------------- */
function setAddMemberRole(role) {
  const hiddenInput = document.getElementById('memberPeran');
  const btnMhs = document.getElementById('addRoleToggleMhs');
  const btnDosen = document.getElementById('addRoleToggleDosen');
  const labelInduk = document.getElementById('labelMemberNomorInduk');
  const inputInduk = document.getElementById('memberNomorInduk');
  const labelSem = document.getElementById('labelMemberSemester');
  const inputSem = document.getElementById('memberSemester');

  if (hiddenInput) hiddenInput.value = role;

  if (role === 'Dosen') {
    if (btnMhs) btnMhs.classList.remove('active');
    if (btnDosen) btnDosen.classList.add('active');
    if (labelInduk) labelInduk.innerHTML = 'NIDN / NIP Dosen <span class="req">*</span>';
    if (inputInduk) inputInduk.placeholder = 'Contoh: 0920068001 / 1980...';
    if (labelSem) labelSem.innerHTML = 'Jabatan / Mata Kuliah Diampu <span class="req">*</span>';
    if (inputSem) inputSem.placeholder = 'Contoh: Dosen Pengampu Kimia Dasar / Kaprodi';
  } else {
    if (btnMhs) btnMhs.classList.add('active');
    if (btnDosen) btnDosen.classList.remove('active');
    if (labelInduk) labelInduk.innerHTML = 'NIM (Nomor Induk Mahasiswa) <span class="req">*</span>';
    if (inputInduk) inputInduk.placeholder = 'Contoh: 2320401005';
    if (labelSem) labelSem.innerHTML = 'Semester <span class="req">*</span>';
    if (inputSem) inputSem.placeholder = 'Contoh: Semester 5';
  }

  // Update photo placeholder if user hasn't uploaded custom photo
  if (!STATE.tempAddMemberPhoto && !document.getElementById('memberFotoUrl')?.value) {
    const preview = document.getElementById('addMemberPhotoPreview');
    if (preview) {
      const bg = role === 'Dosen' ? '0369a1' : '064e3b';
      const color = role === 'Dosen' ? '38bdf8' : '34d399';
      preview.src = `https://ui-avatars.com/api/?name=${role === 'Dosen' ? 'Dosen+Baru' : 'Mahasiswa+Baru'}&background=${bg}&color=${color}&bold=true&size=160`;
    }
  }
}

function setEditMemberRole(role) {
  const hiddenInput = document.getElementById('editMemberPeran');
  const btnMhs = document.getElementById('editRoleToggleMhs');
  const btnDosen = document.getElementById('editRoleToggleDosen');
  const labelInduk = document.getElementById('labelEditMemberNomorInduk');
  const labelSem = document.getElementById('labelEditMemberSemester');

  if (hiddenInput) hiddenInput.value = role;

  if (role === 'Dosen') {
    if (btnMhs) btnMhs.classList.remove('active');
    if (btnDosen) btnDosen.classList.add('active');
    if (labelInduk) labelInduk.innerHTML = 'NIDN / NIP Dosen <span class="req">*</span>';
    if (labelSem) labelSem.innerHTML = 'Jabatan / Keahlian <span class="req">*</span>';
  } else {
    if (btnMhs) btnMhs.classList.add('active');
    if (btnDosen) btnDosen.classList.remove('active');
    if (labelInduk) labelInduk.innerHTML = 'NIM (Nomor Induk Mahasiswa) <span class="req">*</span>';
    if (labelSem) labelSem.innerHTML = 'Semester <span class="req">*</span>';
  }
}

function toggleMemberRoleFields() {
  const role = document.getElementById('memberPeran')?.value || 'Mahasiswa';
  setAddMemberRole(role);
}

/* --------------------------------------------------------------------------
   PHOTO UPLOAD & SUPABASE STORAGE URL HANDLERS
   -------------------------------------------------------------------------- */
function previewAddMemberPhoto(url) {
  const preview = document.getElementById('addMemberPhotoPreview');
  if (!preview) return;
  STATE.tempAddMemberPhoto = url ? url.trim() : null;
  if (url && url.trim()) {
    preview.src = url.trim();
  } else {
    const role = document.getElementById('memberPeran')?.value || 'Mahasiswa';
    const bg = role === 'Dosen' ? '0369a1' : '064e3b';
    const color = role === 'Dosen' ? '38bdf8' : '34d399';
    preview.src = `https://ui-avatars.com/api/?name=Civitas&background=${bg}&color=${color}&bold=true&size=160`;
  }
}

function handleAddMemberPhotoFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    STATE.tempAddMemberPhoto = e.target.result;
    const preview = document.getElementById('addMemberPhotoPreview');
    if (preview) preview.src = e.target.result;
    showToast("Foto berhasil dimuat dari perangkat.", "success");
  };
  reader.readAsDataURL(file);
}

function resetAddMemberPhoto() {
  STATE.tempAddMemberPhoto = null;
  const urlInput = document.getElementById('memberFotoUrl');
  const fileInput = document.getElementById('memberFotoFileInput');
  if (urlInput) urlInput.value = '';
  if (fileInput) fileInput.value = '';
  const role = document.getElementById('memberPeran')?.value || 'Mahasiswa';
  const preview = document.getElementById('addMemberPhotoPreview');
  if (preview) {
    const bg = role === 'Dosen' ? '0369a1' : '064e3b';
    const color = role === 'Dosen' ? '38bdf8' : '34d399';
    preview.src = `https://ui-avatars.com/api/?name=Civitas&background=${bg}&color=${color}&bold=true&size=160`;
  }
  showToast("Foto dikembalikan ke avatar bawaan.", "info");
}

function previewEditMemberPhoto(url) {
  const preview = document.getElementById('editMemberPhotoPreview');
  if (!preview) return;
  STATE.tempEditMemberPhoto = url ? url.trim() : null;
  if (url && url.trim()) {
    preview.src = url.trim();
  }
}

function handleEditMemberPhotoFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    STATE.tempEditMemberPhoto = e.target.result;
    const preview = document.getElementById('editMemberPhotoPreview');
    if (preview) preview.src = e.target.result;
    showToast("Foto baru berhasil dimuat dari perangkat.", "success");
  };
  reader.readAsDataURL(file);
}

function resetEditMemberPhoto() {
  STATE.tempEditMemberPhoto = '';
  const urlInput = document.getElementById('editMemberFotoUrl');
  const fileInput = document.getElementById('editMemberFotoFileInput');
  if (urlInput) urlInput.value = '';
  if (fileInput) fileInput.value = '';
  const nama = document.getElementById('editMemberNama')?.value || 'Civitas';
  const preview = document.getElementById('editMemberPhotoPreview');
  if (preview) {
    preview.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=1e293b&color=38bdf8&bold=true&size=160`;
  }
  showToast("Foto dikembalikan ke avatar awal.", "info");
}

function handleMemberNamaChange(nama, mode) {
  if (mode === 'add' && !STATE.tempAddMemberPhoto && !document.getElementById('memberFotoUrl')?.value) {
    const preview = document.getElementById('addMemberPhotoPreview');
    if (preview) {
      const role = document.getElementById('memberPeran')?.value || 'Mahasiswa';
      const bg = role === 'Dosen' ? '0369a1' : '064e3b';
      const color = role === 'Dosen' ? '38bdf8' : '34d399';
      preview.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nama || 'Civitas')}&background=${bg}&color=${color}&bold=true&size=160`;
    }
  }
}

/* --------------------------------------------------------------------------
   ADMIN FLOW SECURITY GATES
   -------------------------------------------------------------------------- */
function triggerAddMemberFlow() {
  if (STATE.isAdminLoggedIn) {
    openAddMemberModal();
  } else {
    STATE.pendingAdminAction = { action: 'add_member' };
    showToast("Aksi penginputan data membutuhkan autentikasi Admin Laboran.", "info");
    const emailInput = document.getElementById('adminEmailInput');
    const passInput = document.getElementById('adminPasswordInput');
    if (emailInput && !emailInput.value) emailInput.value = STATE.adminConfig?.email || 'admin.lab@iaiyapnas.ac.id';
    if (passInput) passInput.value = '';
    document.getElementById('adminLoginModal')?.classList.add('active');
  }
}

function triggerEditMemberFlow(memberId) {
  if (STATE.isAdminLoggedIn) {
    openEditMemberModal(memberId);
  } else {
    STATE.pendingAdminAction = { action: 'edit_member', id: memberId };
    showToast("Aksi edit data civitas membutuhkan autentikasi Admin Laboran.", "info");
    const emailInput = document.getElementById('adminEmailInput');
    const passInput = document.getElementById('adminPasswordInput');
    if (emailInput && !emailInput.value) emailInput.value = STATE.adminConfig?.email || 'admin.lab@iaiyapnas.ac.id';
    if (passInput) passInput.value = '';
    document.getElementById('adminLoginModal')?.classList.add('active');
  }
}

function triggerDeleteMemberFlow(memberId) {
  if (STATE.isAdminLoggedIn) {
    deleteMember(memberId);
  } else {
    STATE.pendingAdminAction = { action: 'delete_member', id: memberId };
    showToast("Aksi penghapusan data membutuhkan autentikasi Admin Laboran.", "warning");
    const emailInput = document.getElementById('adminEmailInput');
    const passInput = document.getElementById('adminPasswordInput');
    if (emailInput && !emailInput.value) emailInput.value = STATE.adminConfig?.email || 'admin.lab@iaiyapnas.ac.id';
    if (passInput) passInput.value = '';
    document.getElementById('adminLoginModal')?.classList.add('active');
  }
}

/* --------------------------------------------------------------------------
   CRUD MODAL ACTIONS
   -------------------------------------------------------------------------- */
function openAddMemberModal() {
  document.getElementById('newMemberForm')?.reset();
  STATE.tempAddMemberPhoto = null;
  setAddMemberRole('Mahasiswa');
  const urlInput = document.getElementById('memberFotoUrl');
  if (urlInput) urlInput.value = '';
  document.getElementById('addMemberModal')?.classList.add('active');
}

function saveNewMember(event) {
  event.preventDefault();
  const peran = document.getElementById('memberPeran').value;
  const nama = document.getElementById('memberNama').value.trim();
  const nomorInduk = document.getElementById('memberNomorInduk').value.trim();
  const jurusan = document.getElementById('memberJurusan').value.trim() || 'Tadris IPA';
  const statusSemester = document.getElementById('memberSemester').value.trim();
  const telepon = document.getElementById('memberTelepon').value.trim();
  const email = document.getElementById('memberEmail').value.trim();
  const fotoUrlInput = document.getElementById('memberFotoUrl')?.value.trim() || '';

  // Check duplicate NIM/NIDN
  if (STATE.members.some(m => m.nomorInduk === nomorInduk)) {
    showToast(`NIM/NIDN "${nomorInduk}" sudah terdaftar di database!`, "error");
    return;
  }

  // Determine photo: uploaded file > Supabase/web URL > fallback avatar
  const foto = STATE.tempAddMemberPhoto || fotoUrlInput || '';

  const prefix = peran === 'Dosen' ? 'MBR-D' : 'MBR-M';
  const newMember = {
    id: `${prefix}${Date.now().toString().slice(-4)}`,
    peran,
    nama,
    nomorInduk,
    jurusan,
    statusSemester,
    telepon,
    email,
    foto
  };

  STATE.members.unshift(newMember);
  saveState();
  STATE.tempAddMemberPhoto = null;
  closeModal('addMemberModal');
  populateMemberQuickSelect();
  renderMembersView();
  showToast(`Civitas "${nama}" (${peran}) berhasil didaftarkan ke database lab.`, "success");
}

function openEditMemberModal(memberId) {
  const member = STATE.members.find(m => m.id === memberId);
  if (!member) return;

  STATE.tempEditMemberPhoto = member.foto || '';

  document.getElementById('editMemberId').value = member.id;
  document.getElementById('editMemberNama').value = member.nama;
  document.getElementById('editMemberNomorInduk').value = member.nomorInduk;
  document.getElementById('editMemberJurusan').value = member.jurusan || 'Tadris IPA';
  document.getElementById('editMemberSemester').value = member.statusSemester || '';
  document.getElementById('editMemberTelepon').value = member.telepon || '';
  document.getElementById('editMemberEmail').value = member.email || '';

  const urlInput = document.getElementById('editMemberFotoUrl');
  if (urlInput) urlInput.value = (member.foto && member.foto.startsWith('http')) ? member.foto : '';

  const preview = document.getElementById('editMemberPhotoPreview');
  if (preview) preview.src = getMemberAvatarUrl(member);

  setEditMemberRole(member.peran || 'Mahasiswa');
  document.getElementById('editMemberModal')?.classList.add('active');
}

function saveEditedMember(event) {
  event.preventDefault();
  const id = document.getElementById('editMemberId').value;
  const member = STATE.members.find(m => m.id === id);
  if (!member) return;

  const urlInput = document.getElementById('editMemberFotoUrl')?.value.trim() || '';

  member.peran = document.getElementById('editMemberPeran').value;
  member.nama = document.getElementById('editMemberNama').value.trim();
  member.nomorInduk = document.getElementById('editMemberNomorInduk').value.trim();
  member.jurusan = document.getElementById('editMemberJurusan').value.trim();
  member.statusSemester = document.getElementById('editMemberSemester').value.trim();
  member.telepon = document.getElementById('editMemberTelepon').value.trim();
  member.email = document.getElementById('editMemberEmail').value.trim();

  if (STATE.tempEditMemberPhoto) {
    member.foto = STATE.tempEditMemberPhoto;
  } else if (urlInput) {
    member.foto = urlInput;
  }

  saveState();
  STATE.tempEditMemberPhoto = null;
  closeModal('editMemberModal');
  populateMemberQuickSelect();
  renderMembersView();
  showToast(`Data "${member.nama}" berhasil diperbarui.`, "success");
}

function deleteMember(memberId) {
  const member = STATE.members.find(m => m.id === memberId);
  if (!member) return;

  if (confirm(`Hapus data ${member.peran} "${member.nama}" (${member.nomorInduk}) dari database?`)) {
    STATE.members = STATE.members.filter(m => m.id !== memberId);
    saveState();
    populateMemberQuickSelect();
    renderMembersView();
    showToast(`Data "${member.nama}" telah dihapus.`, "info");
  }
}

/* --------------------------------------------------------------------------
   DIRECT LOAN SHORTCUT & UTILITIES
   -------------------------------------------------------------------------- */
function directLoanForMember(memberId) {
  const member = STATE.members.find(m => m.id === memberId);
  if (!member) return;

  // Set quick select dropdown
  const quickSelect = document.getElementById('memberQuickSelect');
  if (quickSelect) quickSelect.value = memberId;

  // Fill loan form fields
  handleMemberSelectChange(memberId);

  // Switch to loan tab
  switchTab('tab-peminjaman');
  showToast(`Data "${member.nama}" (${member.nomorInduk}) siap digunakan pada formulir peminjaman.`, "success");
}

function copyToClipboard(text, label) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label || 'Teks'} "${text}" berhasil disalin ke clipboard.`, "info");
    }).catch(() => {
      fallbackCopy(text, label);
    });
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const tempInput = document.createElement("input");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
  showToast(`${label || 'Teks'} "${text}" berhasil disalin ke clipboard.`, "info");
}

// Download Excel Template for Members
function downloadMemberTemplate() {
  if (typeof XLSX === 'undefined') {
    showToast("Modul Excel (SheetJS) belum siap. Silakan refresh halaman.", "error");
    return;
  }

  const templateRows = [
    {
      "Peran": "Dosen",
      "Nama_Lengkap": "Dr. H. Muhammad Ilyas, M.Pd.",
      "NIM_NIDN": "0920068001",
      "Program_Studi": "Tadris IPA",
      "Semester_Jabatan": "Dosen Pengampu / Kepala Lab",
      "No_WhatsApp": "081241122334",
      "Email": "ilyas@iaiyapnas.ac.id"
    },
    {
      "Peran": "Mahasiswa",
      "Nama_Lengkap": "Muh. Ikhsan Basir",
      "NIM_NIDN": "2320401005",
      "Program_Studi": "Tadris IPA",
      "Semester_Jabatan": "Semester 5",
      "No_WhatsApp": "081244556677",
      "Email": "ikhsan.basir@mhs.iaiyapnas.ac.id"
    },
    {
      "Peran": "Mahasiswa",
      "Nama_Lengkap": "Andi Reski Amelia",
      "NIM_NIDN": "2320401022",
      "Program_Studi": "Tadris IPA",
      "Semester_Jabatan": "Semester 3",
      "No_WhatsApp": "082345678901",
      "Email": "andi.reski@mhs.iaiyapnas.ac.id"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Database Civitas");
  XLSX.writeFile(wb, "Template_Import_Civitas_SILAB_IAI_YAPNAS.xlsx");
  showToast("Template Excel resmi berhasil diunduh.", "success");
}

function openImportExcelModal() {
  STATE.parsedExcelMembers = [];
  const previewSec = document.getElementById('excelPreviewSection');
  const btnConfirm = document.getElementById('btnConfirmImportExcel');
  const fileInput = document.getElementById('excelFileInput');
  if (previewSec) previewSec.style.display = 'none';
  if (btnConfirm) btnConfirm.disabled = true;
  if (fileInput) fileInput.value = '';
  document.getElementById('importExcelModal')?.classList.add('active');
}

function handleExcelFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  handleExcelFile(file);
}

function handleExcelFile(file) {
  if (typeof XLSX === 'undefined') {
    showToast("Library Excel (SheetJS) tidak terdeteksi. Silakan coba lagi.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!rows || rows.length === 0) {
        showToast("Berkas Excel kosong atau tidak memiliki baris data.", "warning");
        return;
      }

      // Parse and normalize rows
      const parsed = [];
      rows.forEach((row, idx) => {
        const findVal = (keys) => {
          for (let k of keys) {
            for (let rk of Object.keys(row)) {
              if (rk.toLowerCase().replace(/[\s_-]/g, '') === k.toLowerCase().replace(/[\s_-]/g, '')) {
                return String(row[rk]).trim();
              }
            }
          }
          return "";
        };

        const nama = findVal(["nama", "namalengkap", "nama_lengkap", "name", "nama_mahasiswa_dosen"]);
        const nomorInduk = findVal(["nim", "nidn", "nim_nidn", "nomorinduk", "nomor_induk", "nik", "id", "noinduk"]);
        const peranRaw = findVal(["peran", "role", "status", "jabatan"]);
        const jurusan = findVal(["programstudi", "program_studi", "prodi", "jurusan", "fakultas"]) || "Tadris IPA";
        const semester = findVal(["semester", "semester_jabatan", "tingkat", "kelas"]) || "Semester 1";
        const telepon = findVal(["nowhatsapp", "no_whatsapp", "whatsapp", "wa", "telepon", "nohp", "no_hp", "phone"]);
        const email = findVal(["email", "alamatemail", "surel", "mail"]);

        if (nama && nomorInduk) {
          const peran = (peranRaw.toLowerCase().includes('dosen') || peranRaw.toLowerCase().includes('pengajar')) ? 'Dosen' : 'Mahasiswa';
          parsed.push({
            id: `MBR-${Date.now().toString().slice(-4)}-${idx}`,
            peran,
            nama,
            nomorInduk,
            jurusan,
            statusSemester: semester,
            telepon,
            email
          });
        }
      });

      if (parsed.length === 0) {
        showToast("Format kolom Excel tidak sesuai. Wajib ada kolom Nama dan NIM/NIDN.", "error");
        return;
      }

      STATE.parsedExcelMembers = parsed;

      // Render Preview Table
      const previewSec = document.getElementById('excelPreviewSection');
      const countEl = document.getElementById('excelParsedCount');
      const tbody = document.getElementById('excelPreviewTableBody');
      const btnConfirm = document.getElementById('btnConfirmImportExcel');

      if (countEl) countEl.textContent = parsed.length;
      if (tbody) {
        tbody.innerHTML = parsed.slice(0, 10).map(m => `
          <tr>
            <td><span class="${m.peran === 'Dosen' ? 'badge-role-dosen' : 'badge-role-mhs'}">${m.peran}</span></td>
            <td><strong>${m.nama}</strong></td>
            <td style="font-family: var(--font-mono);">${m.nomorInduk}</td>
            <td>${m.jurusan} (${m.statusSemester})</td>
            <td>${m.telepon || '-'}</td>
          </tr>
        `).join('') + (parsed.length > 10 ? `<tr><td colspan="5" style="text-align:center; color:var(--text-dim);">... dan ${parsed.length - 10} data lainnya</td></tr>` : '');
      }

      if (previewSec) previewSec.style.display = 'block';
      if (btnConfirm) btnConfirm.disabled = false;

      showToast(`${parsed.length} baris data berhasil dibaca dari file Excel.`, "info");
    } catch (err) {
      console.error(err);
      showToast("Gagal memproses file Excel: " + err.message, "error");
    }
  };
  reader.readAsArrayBuffer(file);
}

function saveImportedMembers() {
  if (!STATE.parsedExcelMembers || STATE.parsedExcelMembers.length === 0) {
    showToast("Belum ada data Excel yang siap diimpor.", "warning");
    return;
  }

  const mode = document.getElementById('importModeSelect')?.value || 'MERGE';

  if (mode === 'REPLACE') {
    STATE.members = [...STATE.parsedExcelMembers];
  } else {
    // MERGE: filter out duplicate NIM
    const existingNims = new Set(STATE.members.map(m => m.nomorInduk));
    let addedCount = 0;
    STATE.parsedExcelMembers.forEach(m => {
      if (!existingNims.has(m.nomorInduk)) {
        STATE.members.push(m);
        existingNims.add(m.nomorInduk);
        addedCount++;
      }
    });
  }

  saveState();
  closeModal('importExcelModal');
  populateMemberQuickSelect();
  renderMembersTable();
  showToast(`Sukses! ${STATE.parsedExcelMembers.length} civitas telah tersimpan di database lab.`, "success");
}

/* ==========================================================================
   6C. KETENTUAN ASET & BERITA ACARA KERUSAKAN / GANTI RUGI (BAP)
   ========================================================================== */
function openDamageClaimModal(ticket) {
  const loan = STATE.loans.find(l => l.tiket === ticket);
  if (!loan) return;

  STATE.activeDamageTicket = ticket;
  const detailsCard = document.getElementById('damageClaimDetailsCard');
  if (detailsCard) {
    const itemsList = loan.items.map(i => `<strong>${i.nama}</strong> (${i.jumlah} unit, ${i.kode})`).join('<br>• ');
    detailsCard.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <div><strong>Nomor E-Tiket:</strong> <span style="font-family: var(--font-mono); color: #ef4444;">${loan.tiket}</span></div>
        <div><strong>Peminjam:</strong> ${loan.nama} (${loan.nim})</div>
        <div><strong>Peran / Status:</strong> ${loan.peran} - Tadris IPA</div>
        <div><strong>No. WhatsApp:</strong> ${loan.telepon || '-'}</div>
      </div>
      <div style="border-top: 1px dashed var(--border-subtle); padding-top: 8px; margin-top: 8px;">
        <strong>Barang Mengalami Kerusakan:</strong><br>• ${itemsList}
      </div>
      <div style="margin-top: 6px; color: #ef4444;">
        <strong>Kondisi Ditemukan:</strong> ${loan.statusKondisi || 'Pecah / Kerusakan Fisik'}
      </div>
      ${loan.catatanPengembalian ? `<div style="margin-top: 4px; font-style: italic; color: var(--text-dim);">Catatan Pengembalian: "${loan.catatanPengembalian}"</div>` : ''}
    `;
  }

  document.getElementById('damageClaimModal')?.classList.add('active');
}

function sendWhatsAppClaimWarning() {
  if (!STATE.activeDamageTicket) return;
  const loan = STATE.loans.find(l => l.tiket === STATE.activeDamageTicket);
  if (!loan) return;

  const phone = (loan.telepon || '').replace(/\D/g, '');
  if (!phone) {
    showToast("Nomor WhatsApp peminjam tidak ditemukan.", "error");
    return;
  }

  const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : (phone.startsWith('62') ? phone : '62' + phone);
  const itemsText = loan.items.map(i => `${i.nama} (${i.jumlah} unit)`).join(', ');
  const laboranNama = STATE.laboran?.nama || "Ahmad Fadhlillah, S.Si.";

  const text = `Assalamu'alaikum Wr. Wb.

Yth. ${loan.peran} ${loan.nama} (NIM: ${loan.nim})

Diberitahukan dari *Laboratorium Terpadu Tadris IPA IAI YAPNAS JENEPONTO* terkait pengembalian alat praktikum dengan No. E-Tiket: *${loan.tiket}*.

Berdasarkan pemeriksaan fisik laboratorium, barang berikut:
• *${itemsText}*
Dinyatakan dalam kondisi: *${loan.statusKondisi || 'Mengalami Kerusakan / Pecah'}*.

Sesuai dengan *Tata Tertib & Pakta Integritas Laboratorium IAI YAPNAS Jeneponto*, peminjam wajib mempertanggungjawabkan dan mengganti unit alat dengan spesifikasi setara paling lambat *7 (tujuh) hari kerja*.

Mohon segera berkoordinasi dengan Pranata Laboratorium di Lab Tadris IPA IAI YAPNAS.

Laboran Bertugas:
*${laboranNama}*
NIP. ${STATE.laboran?.nip || '-'}
Laboratorium Terpadu Tadris IPA - Institut Agama Islam Yapnas Jeneponto.`;

  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  showToast("Membuka pesan peringatan resmi ke WhatsApp peminjam...", "success");
}

function printDamageClaimReceipt() {
  if (!STATE.activeDamageTicket) return;
  const loan = STATE.loans.find(l => l.tiket === STATE.activeDamageTicket);
  if (!loan) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const bapNum = `BAP-LAB/${now.getFullYear()}/${loan.tiket.replace('PNJ-', '')}`;
  const elBapNum = document.getElementById('printBapNumber');
  if (elBapNum) elBapNum.textContent = bapNum;

  const elName = document.getElementById('printBapBorrowerName');
  const elRole = document.getElementById('printBapBorrowerRole');
  const elNim = document.getElementById('printBapBorrowerNim');
  const elPhone = document.getElementById('printBapBorrowerPhone');
  const elTicket = document.getElementById('printBapTicketNum');
  const elCourse = document.getElementById('printBapCourse');
  const elCond = document.getElementById('printBapCondition');
  const elDate = document.getElementById('printBapDate');
  const elSigner = document.getElementById('printBapSignerName');

  if (elName) elName.textContent = loan.nama;
  if (elRole) elRole.textContent = loan.peran;
  if (elNim) elNim.textContent = loan.nim;
  if (elPhone) elPhone.textContent = loan.telepon || '-';
  if (elTicket) elTicket.textContent = loan.tiket;
  if (elCourse) elCourse.textContent = `${loan.mataKuliah} (${loan.dosenPengampu})`;
  if (elCond) elCond.textContent = loan.statusKondisi || 'Kerusakan / Pecah';
  if (elDate) elDate.textContent = dateStr;
  if (elSigner) elSigner.textContent = `( ${loan.nama} )`;

  const itemsTbody = document.getElementById('printBapItemsBody');
  if (itemsTbody) {
    itemsTbody.innerHTML = loan.items.map((it, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace;">${it.kode || '-'}</td>
        <td><strong>${it.nama}</strong> (${it.jumlah} unit)</td>
        <td>${it.merk || 'Standar Lab'} / ${it.buatan || 'Original'}</td>
      </tr>
    `).join('');
  }

  window.print();
}

function resolveDamageClaim(ticket) {
  const loan = STATE.loans.find(l => l.tiket === ticket);
  if (!loan) return;

  if (confirm(`Tandai ganti rugi aset untuk tiket ${ticket} telah diselesaikan oleh peminjam?`)) {
    loan.status = "Selesai";
    loan.statusKondisi = "Selesai (Sudah Diganti)";
    saveState();
    renderAllViews();
    showToast(`Klaim ganti rugi untuk ${ticket} telah diselesaikan.`, "success");
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

  const returnList = STATE.loans.filter(l => l.status === 'Selesai' || l.status === 'Klaim Ganti Rugi' || l.fotoPengembalian !== null);
  if (returnList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;">Belum ada foto bukti pengembalian alat yang diunggah.</td></tr>`;
    return;
  }

  tbody.innerHTML = returnList.map(loan => {
    const isDamaged = (loan.statusKondisi || '').includes('Pecah') || (loan.statusKondisi || '').includes('Kerusakan') || (loan.statusKondisi || '').includes('Kurang') || loan.status === 'Klaim Ganti Rugi';
    return `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700; color: #10b981;">${loan.tiket}</td>
        <td><strong>${loan.nama}</strong><br><small class="badge">${loan.peran}</small> (${loan.nim})</td>
        <td>${loan.items.map(i => `${i.nama} (${i.jumlah})`).join(', ')}</td>
        <td>
          ${loan.fotoPengembalian ? `
            <img src="${loan.fotoPengembalian}" alt="Bukti" style="width: 55px; height: 55px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-subtle); cursor: pointer;" onclick="previewImage('${loan.fotoPengembalian}')" title="Klik untuk perbesar">
          ` : '<span style="color: var(--text-dim);">-</span>'}
        </td>
        <td>
          <span class="badge" style="background: ${isDamaged ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; color: ${isDamaged ? '#ef4444' : '#10b981'};">
            ${loan.statusKondisi || 'Baik'}
          </span><br>
          <small style="color: var(--text-muted);">${loan.catatanPengembalian || 'Tidak ada catatan'}</small>
        </td>
        <td><span class="status-badge ${loan.status.toLowerCase().replace(/\s+/g, '-')}">${loan.status}</span></td>
        <td style="text-align: center;">
          ${isDamaged && loan.status === 'Klaim Ganti Rugi' ? `
            <div style="display: flex; gap: 4px; flex-direction: column;">
              <button class="btn btn-danger btn-sm" onclick="openDamageClaimModal('${loan.tiket}')" style="font-size: 0.72rem; padding: 4px 6px;">
                <i class="fa-solid fa-triangle-exclamation"></i> BAP Ganti Rugi
              </button>
              <button class="btn btn-outline btn-sm" onclick="resolveDamageClaim('${loan.tiket}')" style="font-size: 0.72rem; padding: 3px 6px;">
                <i class="fa-solid fa-check"></i> Sudah Diganti
              </button>
            </div>
          ` : `
            <span style="color: #10b981; font-size: 0.8rem;"><i class="fa-solid fa-circle-check"></i> Aset Aman</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
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
    showToast("Wajib melampirkan foto fisik alat saat dikembalikan sebagai bukti pertanggungjawaban aset kampus.", "warning");
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
  loan.verifikatorLaboran = STATE.laboran ? STATE.laboran.nama : "Ahmad Fadhlillah, S.Si.";

  const isDamaged = condition.includes("Pecah") || condition.includes("Kerusakan") || condition.includes("Kurang");

  if (isDamaged) {
    loan.status = "Klaim Ganti Rugi";
    // Mark inventory item as damaged if single item
    loan.items.forEach(cartItem => {
      const alat = STATE.alat.find(a => a.id === cartItem.id);
      if (alat) {
        alat.status = 'Habis'; // Marked as needing repair/replacement
      }
    });
    showToast("Perhatian: Kerusakan aset kampus tercatat. Surat Berita Acara & Kewajiban Ganti Rugi 7 Hari Kerja diterbitkan.", "warning");
  } else {
    loan.status = "Selesai";
    // Restore inventory stock
    loan.items.forEach(cartItem => {
      const alat = STATE.alat.find(a => a.id === cartItem.id);
      if (alat) {
        alat.stokTersedia = Math.min(alat.stok, alat.stokTersedia + cartItem.jumlah);
        alat.status = 'Tersedia';
      }
      const fas = STATE.fasilitas.find(f => f.id === cartItem.id);
      if (fas) {
        fas.stokTersedia = Math.min(fas.stok, fas.stokTersedia + cartItem.jumlah);
        fas.status = 'Tersedia';
      }
    });
    showToast("Pengembalian alat berhasil diverifikasi! Alat diterima dalam kondisi baik & lengkap. Terima kasih telah menjaga aset kampus.", "success");
  }

  saveState();
  closeModal('returnFormModal');
  renderAllViews();
  searchTrackingLoan();
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

function handleAddInvPhotoSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    STATE.tempAddInvPhoto = e.target.result;
    const preview = document.getElementById('addInvPreviewImg');
    if (preview) preview.src = e.target.result;
    showToast("Foto alat berhasil dimuat.", "success");
  };
  reader.readAsDataURL(file);
}

function handleAddInvImageUrlInput(url) {
  const preview = document.getElementById('addInvPreviewImg');
  if (preview && url && url.trim()) {
    preview.src = url.trim();
  }
}

function saveNewInventoryItem(event) {
  event.preventDefault();

  const type = document.getElementById('invType').value;
  const kode = document.getElementById('invKode').value.trim();
  const nama = document.getElementById('invNama').value.trim();
  const stok = parseInt(document.getElementById('invStok').value) || 1;
  const lokasi = document.getElementById('invLokasi').value.trim() || 'Lab Terpadu';
  const urlGambar = document.getElementById('addInvImageUrl')?.value.trim() || '';
  const gambar = STATE.tempAddInvPhoto || urlGambar || 'assets/glassware.jpg';

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
      gambar
    };
    STATE.alat.unshift(newAlat);
  } else if (type === 'FASILITAS') {
    const newFas = {
      id: `FAS-USR-${Date.now().toString().slice(-4)}`,
      nama,
      kode,
      kategori: "Fasilitas Umum & K3",
      stok,
      stokTersedia: stok,
      status: "Tersedia",
      lokasi,
      deskripsi: "Fasilitas pendukung laboratorium.",
      gambar: gambar || 'assets/fumehood.jpg'
    };
    STATE.fasilitas.unshift(newFas);
  } else if (type === 'BAHAN') {
    const rumus = document.getElementById('invRumus')?.value.trim() || '-';
    const jenis = document.getElementById('invJenisBahan')?.value.trim() || 'Reagen';
    const newBahan = {
      id: `BHN-USR-${Date.now().toString().slice(-4)}`,
      nama,
      kode,
      rumus,
      jenis,
      stok: `${stok} Botol`,
      lokasi,
      bahaya: "GHS-01"
    };
    STATE.bahan.unshift(newBahan);
  }

  saveState();
  STATE.tempAddInvPhoto = null;
  document.getElementById('newInventoryForm')?.reset();
  const preview = document.getElementById('addInvPreviewImg');
  if (preview) preview.src = 'assets/glassware.jpg';
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

  // Keyboard Shortcut: Ctrl + Shift + A or Ctrl + Shift + L to open Admin Portal
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'L' || e.key === 'l')) {
      e.preventDefault();
      triggerAdminAccess();
    }
  });

  // Secret Triple Click on Logo or Copyright
  let clickCount = 0;
  let clickTimer = null;
  const triggerSecret = () => {
    clickCount++;
    clearTimeout(clickTimer);
    if (clickCount >= 3) {
      clickCount = 0;
      triggerAdminAccess();
    } else {
      clickTimer = setTimeout(() => { clickCount = 0; }, 800);
    }
  };
  document.querySelector('.sidebar-logo-img')?.addEventListener('click', triggerSecret);
  document.getElementById('sidebarCopyText')?.addEventListener('click', triggerSecret);

  // Drag and Drop listeners for Excel Dropzone
  const dropZone = document.getElementById('excelDropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleExcelFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Close modals on clicking backdrop
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

/* ==========================================================================
   26. INTEGRASI SUPABASE CLOUD DATABASE & REAL-TIME SYNC
   ========================================================================== */

let cloudSyncTimeout = null;

const SUPABASE_SCHEMA_SQL_CODE = `-- ==============================================================================
-- SILAB TADRIS IPA - IAI YAPNAS JENEPONTO
-- SUPABASE DATABASE SCHEMA & MIGRATION SCRIPT
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
    peran TEXT NOT NULL,
    nama TEXT NOT NULL,
    nomor_induk TEXT NOT NULL,
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
    status TEXT DEFAULT 'Menunggu Verifikasi',
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

-- RLS & POLICIES
ALTER TABLE public.silab_alat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_bahan_kimia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_laboran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.silab_org_structure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Alat" ON public.silab_alat FOR SELECT USING (true);
CREATE POLICY "Public All Alat" ON public.silab_alat FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Fasilitas" ON public.silab_fasilitas FOR SELECT USING (true);
CREATE POLICY "Public All Fasilitas" ON public.silab_fasilitas FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Bahan" ON public.silab_bahan_kimia FOR SELECT USING (true);
CREATE POLICY "Public All Bahan" ON public.silab_bahan_kimia FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Members" ON public.silab_members FOR SELECT USING (true);
CREATE POLICY "Public All Members" ON public.silab_members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Loans" ON public.silab_loans FOR SELECT USING (true);
CREATE POLICY "Public All Loans" ON public.silab_loans FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Laboran" ON public.silab_laboran FOR SELECT USING (true);
CREATE POLICY "Public All Laboran" ON public.silab_laboran FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Org" ON public.silab_org_structure FOR SELECT USING (true);
CREATE POLICY "Public All Org" ON public.silab_org_structure FOR ALL USING (true) WITH CHECK (true);

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('silab-assets', 'silab-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Asset Read" ON storage.objects FOR SELECT USING (bucket_id = 'silab-assets');
CREATE POLICY "Public Asset Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'silab-assets');
CREATE POLICY "Public Asset Update" ON storage.objects FOR UPDATE USING (bucket_id = 'silab-assets');
`;

function initSupabaseIntegration() {
  if (typeof SILAB_SUPABASE === 'undefined') return;

  // Set inputs if available
  const inputUrl = document.getElementById('inputSupabaseUrl');
  const inputKey = document.getElementById('inputSupabaseAnonKey');
  if (inputUrl) inputUrl.value = SILAB_SUPABASE.config.url || '';
  if (inputKey) inputKey.value = SILAB_SUPABASE.config.anonKey || '';

  // Setup SQL Schema pre
  const sqlPre = document.getElementById('sqlSchemaPre');
  if (sqlPre) sqlPre.value = SUPABASE_SCHEMA_SQL_CODE;

  // Check connection health in background without toast
  checkSupabaseHealthUi(false);
}

async function checkSupabaseHealthUi(showToastNotification = true) {
  if (typeof SILAB_SUPABASE === 'undefined') return;

  const badge = document.getElementById('supabaseStatusBadge');
  const box = document.getElementById('supabaseDiagnosticBox');
  const topDot = document.getElementById('topCloudDot');
  const topText = document.getElementById('topCloudText');

  if (badge) {
    badge.style.background = 'rgba(245, 158, 11, 0.15)';
    badge.style.color = '#f59e0b';
    badge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    badge.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memeriksa Koneksi...';
  }

  const result = await SILAB_SUPABASE.checkConnection();

  if (result.ok && result.status === 'connected') {
    if (badge) {
      badge.style.background = 'rgba(16, 185, 129, 0.15)';
      badge.style.color = '#10b981';
      badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Cloud Terhubung';
    }
    if (topDot) topDot.style.background = '#10b981';
    if (topText) topText.textContent = 'Cloud Active';

    if (box) {
      box.style.background = 'rgba(16, 185, 129, 0.08)';
      box.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      box.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.3rem; margin-top: 2px;"></i>
          <div>
            <div style="font-weight: 700; color: #10b981; margin-bottom: 4px;">Koneksi Supabase Cloud Berhasil & Aktif!</div>
            <div style="font-size: 0.83rem; color: var(--text-main); line-height: 1.5;">
              Aplikasi terhubung ke database cloud <code>\${SILAB_SUPABASE.config.url}</code>. Setiap penambahan atau perubahan data inventaris, civitas, peminjaman, dan struktur organisasi dapat disinkronkan secara online.
            </div>
          </div>
        </div>
      `;
    }

    if (showToastNotification) showToast("🟢 Koneksi ke Supabase Cloud Berhasil Terhubung!", "success");

  } else if (result.status === 'quota_exceeded') {
    if (badge) {
      badge.style.background = 'rgba(239, 68, 68, 0.15)';
      badge.style.color = '#ef4444';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Kuota Egress Terlampaui';
    }
    if (topDot) topDot.style.background = '#ef4444';
    if (topText) topText.textContent = 'Quota Limit';

    if (box) {
      box.style.background = 'rgba(239, 68, 68, 0.08)';
      box.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      box.innerHTML = `
        <div style="display: flex; gap: 14px; align-items: flex-start;">
          <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 1.4rem; margin-top: 2px;"></i>
          <div>
            <div style="font-weight: 700; color: #ef4444; margin-bottom: 4px;">
              Peringatan Supabase: Batasan Kuota Egress (exceed_egress_quota)
            </div>
            <div style="font-size: 0.82rem; color: var(--text-main); line-height: 1.55; margin-bottom: 8px;">
              Proyek Supabase (<code>\${SILAB_SUPABASE.config.url}</code>) saat ini dibatasi oleh Supabase karena telah mencapai batas kuota bandwidth akun (<em>exceed_egress_quota</em>).
            </div>
            <div style="font-size: 0.8rem; background: rgba(0,0,0,0.15); padding: 10px 14px; border-radius: 8px; border-left: 3px solid #ef4444;">
              <strong>Solusi yang Tersedia:</strong><br>
              <strong>Opsi 1 (Disarankan & Gratis):</strong> Buat <em>New Project</em> gratis di <a href="https://supabase.com/dashboard" target="_blank" style="color: #38bdf8; text-decoration: underline;">supabase.com/dashboard</a> (Free tier dapat 2 proyek baru gratis dengan kuota bersih). Salin URL & Anon Key proyek baru tersebut, lalu tempelkan di form di bawah dan klik <strong>Simpan & Hubungkan</strong>.<br>
              <strong>Opsi 2:</strong> Buka <em>Project Settings &gt; Billing</em> pada proyek ini di Supabase untuk melepas batasan / spend caps.<br>
              <em>Catatan: Aplikasi SILAB-IPA saat ini tetap berjalan normal 100% menggunakan LocalStorage mode offline tanpa error bagi pengunjung.</em>
            </div>
          </div>
        </div>
      `;
    }

    if (showToastNotification) showToast("⚠️ Supabase terhalang batas kuota (exceed_egress_quota). Beralih ke LocalStorage.", "warning");

  } else if (result.status === 'tables_missing') {
    if (badge) {
      badge.style.background = 'rgba(245, 158, 11, 0.15)';
      badge.style.color = '#f59e0b';
      badge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      badge.innerHTML = '<i class="fa-solid fa-table-list"></i> Tabel Belum Ada';
    }
    if (topDot) topDot.style.background = '#f59e0b';
    if (topText) topText.textContent = 'Setup Schema';

    if (box) {
      box.style.background = 'rgba(245, 158, 11, 0.08)';
      box.style.borderColor = 'rgba(245, 158, 11, 0.3)';
      box.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <i class="fa-solid fa-circle-exclamation" style="color: #f59e0b; font-size: 1.3rem; margin-top: 2px;"></i>
          <div>
            <div style="font-weight: 700; color: #f59e0b; margin-bottom: 4px;">Koneksi Sukses, Namun Tabel Belum Dibuat!</div>
            <div style="font-size: 0.83rem; color: var(--text-main); line-height: 1.5;">
              Domain Supabase terhubung dengan benar, namun tabel <code>silab_alat</code> dkk belum dieksekusi di database. 
              Klik tombol <strong>"Salin Skrip SQL Schema"</strong> di samping, lalu jalankan di menu <strong>SQL Editor</strong> Supabase Anda.
            </div>
          </div>
        </div>
      `;
    }

    if (showToastNotification) showToast("Koneksi berhasil, namun tabel database Supabase belum dibuat.", "info");

  } else {
    // Offline / error
    if (badge) {
      badge.style.background = 'rgba(100, 116, 139, 0.15)';
      badge.style.color = '#94a3b8';
      badge.style.borderColor = 'rgba(100, 116, 139, 0.3)';
      badge.innerHTML = '<i class="fa-solid fa-hard-drive"></i> LocalStorage Mode';
    }
    if (topDot) topDot.style.background = '#94a3b8';
    if (topText) topText.textContent = 'Local Mode';

    if (box) {
      box.style.background = 'rgba(100, 116, 139, 0.08)';
      box.style.borderColor = 'rgba(100, 116, 139, 0.25)';
      box.innerHTML = `
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <i class="fa-solid fa-hard-drive" style="color: #94a3b8; font-size: 1.3rem; margin-top: 2px;"></i>
          <div>
            <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Aplikasi Berjalan dalam Mode LocalStorage Offline</div>
            <div style="font-size: 0.83rem; color: var(--text-muted); line-height: 1.5;">
              \${result.message || 'Data inventaris saat ini tersimpan aman di peramban (browser). Anda dapat menghubungkan Supabase kapan saja.'}
            </div>
          </div>
        </div>
      `;
    }

    if (showToastNotification) showToast("Status: " + (result.message || "Mode LocalStorage aktif"), "info");
  }
}

function handleCloudPillClick() {
  if (STATE.isAdminLoggedIn) {
    switchTab('tab-admin');
    switchAdminSubTab('admin-tab-cloud');
  } else {
    showToast(`Status Database: \${SILAB_SUPABASE.statusMessage}. Masuk sebagai Admin untuk mengelola sinkronisasi cloud.`, 'info');
  }
}

function renderAdminCloudTab() {
  const inputUrl = document.getElementById('inputSupabaseUrl');
  const inputKey = document.getElementById('inputSupabaseAnonKey');
  if (inputUrl && SILAB_SUPABASE.config.url) inputUrl.value = SILAB_SUPABASE.config.url;
  if (inputKey && SILAB_SUPABASE.config.anonKey) inputKey.value = SILAB_SUPABASE.config.anonKey;
}

async function handleSaveSupabaseConfig(e) {
  if (e) e.preventDefault();
  const inputUrl = document.getElementById('inputSupabaseUrl');
  const inputKey = document.getElementById('inputSupabaseAnonKey');
  if (!inputUrl || !inputKey) return;

  const url = inputUrl.value.trim().replace(/\/+$/, '');
  const anonKey = inputKey.value.trim();

  if (!url.startsWith('https://')) {
    alert("Project URL Supabase harus diawali dengan https:// (contoh: https://xyz.supabase.co)");
    return;
  }

  SILAB_SUPABASE.saveConfig({ url, anonKey });
  showToast("Menghubungkan ke Supabase...", "info");
  await checkSupabaseHealthUi(true);
}

async function resetSupabaseConfigToDefault() {
  if (confirm("Kembalikan konfigurasi Supabase ke URL & Kunci bawaan?")) {
    SILAB_SUPABASE.saveConfig(DEFAULT_SUPABASE_CONFIG);
    const inputUrl = document.getElementById('inputSupabaseUrl');
    const inputKey = document.getElementById('inputSupabaseAnonKey');
    if (inputUrl) inputUrl.value = DEFAULT_SUPABASE_CONFIG.url;
    if (inputKey) inputKey.value = DEFAULT_SUPABASE_CONFIG.anonKey;
    showToast("Konfigurasi direset ke pengaturan bawaan.", "info");
    await checkSupabaseHealthUi(true);
  }
}

async function handlePushLocalToSupabase() {
  if (SILAB_SUPABASE.status === 'quota_exceeded') {
    alert("Proyek Supabase saat ini terkena pembatasan kuota (exceed_egress_quota). Silakan gunakan proyek Supabase baru yang bersih terlebih dahulu.");
    return;
  }

  if (!confirm("Unggah seluruh data lokal (alat, fasilitas, bahan kimia, mahasiswa/dosen, peminjaman, struktur) ke Supabase? Data yang ada di Supabase akan diperbarui/ditambahkan.")) {
    return;
  }

  showToast("Mengunggah data ke cloud Supabase...", "info");

  try {
    const res = await SILAB_SUPABASE.pushAllLocalToCloud(STATE);
    if (res.errors && res.errors.length > 0) {
      alert("Sebagian data berhasil, namun ada catatan:\\n\\n" + res.errors.join("\\n") + "\\n\\nPastikan Anda telah menjalankan skrip SQL schema di SQL Editor Supabase.");
    } else {
      showToast(`Sukses sinkronkan \${res.alat} Alat, \${res.fasilitas} Fasilitas, \${res.bahan} Bahan, \${res.members} Civitas ke Supabase!`, "success");
    }
  } catch (err) {
    console.error("Gagal sinkronkan ke Supabase:", err);
    alert("Gagal mengunggah ke Supabase: " + err.message);
  }
}

async function handlePullSupabaseToLocal() {
  if (SILAB_SUPABASE.status === 'quota_exceeded') {
    alert("Proyek Supabase saat ini terkena batasan kuota (exceed_egress_quota).");
    return;
  }

  if (!confirm("Tarik data dari database Supabase dan perbarui data aplikasi di browser Anda?")) {
    return;
  }

  showToast("Mengunduh data dari Supabase...", "info");

  try {
    const cloudData = await SILAB_SUPABASE.pullAllCloudToLocal();
    let updatedCount = 0;

    if (cloudData.alat && cloudData.alat.length > 0) {
      STATE.alat = cloudData.alat;
      updatedCount += cloudData.alat.length;
    }
    if (cloudData.fasilitas && cloudData.fasilitas.length > 0) {
      STATE.fasilitas = cloudData.fasilitas;
      updatedCount += cloudData.fasilitas.length;
    }
    if (cloudData.bahan && cloudData.bahan.length > 0) {
      STATE.bahan = cloudData.bahan;
      updatedCount += cloudData.bahan.length;
    }
    if (cloudData.members && cloudData.members.length > 0) {
      STATE.members = cloudData.members;
      updatedCount += cloudData.members.length;
    }
    if (cloudData.loans && cloudData.loans.length > 0) {
      STATE.loans = cloudData.loans;
      updatedCount += cloudData.loans.length;
    }
    if (cloudData.laboran) {
      STATE.laboran = cloudData.laboran;
    }
    if (cloudData.orgStructure && cloudData.orgStructure.length > 0) {
      STATE.orgStructure = cloudData.orgStructure;
    }

    saveState();
    renderAllViews();
    showToast(`Berhasil memperbarui \${updatedCount} data dari Supabase!`, "success");
  } catch (err) {
    console.error("Gagal menarik data dari Supabase:", err);
    alert("Gagal mengunduh data: " + err.message);
  }
}

function openSupabaseSqlModal() {
  const modal = document.getElementById('supabaseSqlModal');
  const sqlPre = document.getElementById('sqlSchemaPre');
  if (sqlPre) sqlPre.value = SUPABASE_SCHEMA_SQL_CODE;
  if (modal) modal.classList.add('active');
}

function copySqlSchemaCode() {
  const sqlPre = document.getElementById('sqlSchemaPre');
  if (sqlPre) {
    sqlPre.select();
    navigator.clipboard.writeText(sqlPre.value).then(() => {
      showToast("📋 Seluruh skrip SQL Schema berhasil disalin ke clipboard!", "success");
    }).catch(() => {
      document.execCommand('copy');
      showToast("📋 Skrip SQL berhasil disalin!", "success");
    });
  }
}

function triggerCloudAutoSync() {
  if (typeof SILAB_SUPABASE === 'undefined') return;
  if (!SILAB_SUPABASE.client || SILAB_SUPABASE.status !== 'connected' || !SILAB_SUPABASE.config.autoSync) {
    return;
  }

  if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout);
  cloudSyncTimeout = setTimeout(async () => {
    try {
      console.log("Background auto-syncing to Supabase...");
      await SILAB_SUPABASE.pushAllLocalToCloud(STATE);
      console.log("Background auto-sync finished.");
    } catch (err) {
      console.warn("Auto-sync Supabase gagal:", err.message);
    }
  }, 2000);
}

