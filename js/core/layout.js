/* =====================================================
   ECOSORT - LAYOUT COMPONENTS
   Sidebar, Header, StatCard
===================================================== */

// Berkas ini membangun kerangka tampilan aplikasi: sidebar (menu samping),
// header (pencarian, notifikasi, profil), kartu statistik, dan konfirmasi
// logout. Fungsi "render..." menghasilkan string HTML, sedangkan fungsi
// "bind..." memasang event pada HTML tersebut.

// Pembuat ikon
import { icon } from "./icons.js";
// Pembuat logo (string HTML)
import { logo } from "./components.js";
// Daftar menu untuk tiap peran
import { MENU_BY_ROLE } from "./router.js";
// Sesi pengguna yang sedang login
import { getActiveSession } from "./auth.js";
// Pembaca penyimpanan lokal
import { readLocal } from "./database.js";
// Dialog konfirmasi logout bersama
import { confirmLogout } from "../components/feedback.js";

/* =====================================================
   HTML ESCAPE
===================================================== */

// Mengganti karakter khusus HTML (& < > " ') dengan entitasnya agar teks
// dinamis aman disisipkan ke HTML (mencegah injeksi/XSS)
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}


/* =====================================================
   SIDEBAR
===================================================== */

// Membuat HTML sidebar.
// - role : peran pengguna, menentukan daftar menu dan label area
// - page : halaman aktif (menu yang sesuai diberi kelas "active")
// - open : apakah sidebar sedang terbuka (untuk tampilan mobile)
// Tombol profil, pengaturan, dan keluar ditempatkan di bagian bawah.
export function renderSidebar({
  role,
  page,
  open = false
}) {
  // Menu sesuai peran; array kosong jika peran tidak dikenal
  const menu = MENU_BY_ROLE[role] || [];

  return `
    <aside class="sidebar ${open ? "sidebar-open" : ""}">
      <div class="side-logo">
        ${logo(true)}

        <button class="mobile-close" data-action="close-sidebar">
          ${icon("close")}
        </button>
      </div>

      <div class="side-role">
        <span>
          ${role === "User"
      ? "AREA PENGGUNA"
      : "AREA ADMINISTRASI"}
        </span>
      </div>

      <nav>
        ${menu.map(item => `
          <button
            data-page="${escapeHTML(item.id)}"
            class="${page === item.id ? "active" : ""}"
          >
            ${icon(item.icon)}
            <span>${escapeHTML(item.label)}</span>
            ${page === item.id ? "<i></i>" : ""}
          </button>
        `).join("")}
      </nav>

      <div class="side-bottom">
        <button
          data-page="profile"
          class="${page === "profile" ? "active" : ""}"
        >
          ${icon("profile")}
          <span>Profil Saya</span>
        </button>

        <button
          data-page="settings"
          class="${page === "settings" ? "active" : ""}"
        >
          ${icon("settings")}
          <span>Pengaturan</span>
        </button>

        <button data-action="logout">
          ${icon("arrow")}
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  `;
}


/* =====================================================
   SIDEBAR EVENTS
===================================================== */

// Memasang event klik pada sidebar dengan satu listener (event delegation).
// Callback yang diterima (semua opsional, dipanggil dengan ?.):
// - setPage  : pindah ke halaman tertentu
// - setOpen  : buka/tutup sidebar
// - onLogout : proses logout
export function bindSidebar(element, {
  setPage,
  setOpen,
  onLogout
}) {
  if (!element) return;

  element.addEventListener("click", event => {
    // Klik pada tombol menu halaman: pindah halaman lalu tutup sidebar
    const pageButton = event.target.closest("[data-page]");

    if (pageButton && element.contains(pageButton)) {
      const page = pageButton.dataset.page;

      setPage?.(page);
      setOpen?.(false);

      return;
    }

    // Selain itu, cek tombol aksi (tutup sidebar atau logout)
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) return;

    switch (actionButton.dataset.action) {
      case "close-sidebar":
        setOpen?.(false);
        break;

      case "logout":
        onLogout?.();
        break;
    }
  });
}


/* =====================================================
   PROFILE IDENTITY
===================================================== */

// Menentukan nama dan inisial yang tampil di header.
// Urutan prioritas nama:
// 1) profil yang disimpan pengguna ("profile") jika cocok dengan sesi,
// 2) profil saat registrasi ("prototype-profile") jika emailnya cocok,
// 3) nama bawaan sesuai peran (fallback).
function getHeaderIdentity(role) {
  // Nama dan inisial bawaan (data contoh) untuk tiap peran
  const defaults = {
    "User": {
      name: "Andi Nugraha",
      initials: "AN"
    },

    "Sub Admin": {
      name: "Sinta Aulia",
      initials: "SA"
    },

    "Super Admin": {
      name: "Abiydal",
      initials: "Abi"
    }
  };

  const fallback = defaults[role] || defaults.User;
  const session = getActiveSession();

  // Tanpa sesi, atau peran sesi berbeda dengan peran yang diminta: pakai bawaan
  if (!session || session.role !== role) {
    return fallback;
  }

  // Email sesi dinormalkan untuk perbandingan
  const email = String(session.email || "")
    .trim()
    .toLowerCase();

  if (!email) return fallback;

  // Profil yang disimpan pengguna beserta email pemiliknya
  const saved = readLocal("profile", null);

  const owner = String(
    readLocal("profile-owner", "") || ""
  ).trim().toLowerCase();

  // Profil yang dibuat saat registrasi
  const registered = readLocal(
    "prototype-profile",
    null
  );

  // Profil tersimpan dianggap milik pengguna ini jika:
  // pemiliknya sama dengan email sesi, ATAU (tidak ada pemilik tercatat
  // dan email di dalam profil sama dengan email sesi)
  const savedMatches =
    saved &&
    typeof saved === "object" &&
    !Array.isArray(saved) &&
    (
      owner === email ||
      (
        !owner &&
        String(saved.email || "")
          .trim()
          .toLowerCase() === email
      )
    );

  // Profil registrasi cocok jika emailnya sama dengan email sesi
  const registeredMatches =
    registered &&
    typeof registered === "object" &&
    !Array.isArray(registered) &&
    String(registered.email || "")
      .trim()
      .toLowerCase() === email;

  let name = fallback.name;

  // Pilih nama dari profil tersimpan dulu, lalu profil registrasi
  if (
    savedMatches &&
    typeof saved.name === "string" &&
    saved.name.trim()
  ) {
    name = saved.name.trim();

  } else if (
    registeredMatches &&
    typeof registered.name === "string" &&
    registered.name.trim()
  ) {
    name = registered.name.trim();
  }

  // Inisial: huruf pertama tiap kata, maksimal 2 huruf, kapital
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    name,
  initials: initials || fallback.initials,

  // Mengambil foto profil dari Local Storage
  photo: savedMatches &&
    typeof saved.photo === "string" &&
    saved.photo.startsWith("data:image/")
      ? saved.photo
      : ""
  };
}


/* =====================================================
   HEADER
===================================================== */

// Membuat HTML header: tombol menu (mobile), kolom pencarian dengan daftar
// hasil, tombol notifikasi beserta popover-nya, dan chip profil.
// - query             : isi awal kolom pencarian
// - notificationsOpen : apakah popover notifikasi terbuka
export function renderHeader({
  role,
  query = "",
  notificationsOpen = false
}) {
  const user = getHeaderIdentity(role);

  return `
    <header class="app-header">

      <button
        class="menu-button"
        data-action="open-sidebar"
      >
        ${icon("menu")}
      </button>

      <form
        class="header-search"
        data-form="header-search"
      >

        ${icon("search")}

        <input
          data-input="header-search"
          value="${escapeHTML(query)}"
          placeholder="Cari data, halaman, atau bantuan..."
          aria-label="Cari halaman"
          aria-controls="header-search-results"
          aria-autocomplete="list"
          autocomplete="off"
        />

        <kbd>⌘ K</kbd>

        <div
          class="header-search-results"
          id="header-search-results"
          role="listbox"
          data-container="search-results"
          hidden
        ></div>

      </form>

      <div class="header-actions">

        <button
          class="bell"
          data-action="toggle-notifications"
          aria-label="Buka notifikasi"
          aria-expanded="${notificationsOpen}"
        >
          ${icon("bell")}
          <span></span>
        </button>

        <div
          class="notification-popover"
          data-container="notifications"
          ${notificationsOpen ? "" : "hidden"}
        >
          <b>Notifikasi</b>

          <p>
            Data EcoSort tersimpan secara lokal di perangkat ini.
          </p>

          <button data-action="read-notifications">
            Tandai sudah dibaca
          </button>
        </div>

        <button
          class="profile-chip"
          data-action="open-profile"
        >${user.photo
  ? `
    <img
      class="avatar"
      src="${escapeHTML(user.photo)}"
      alt="Foto profil"
    >
  `
  : `
    <span class="avatar">
      ${escapeHTML(user.initials)}
    </span>
  `
}

          <div>
            <b>${escapeHTML(user.name)}</b>
            <small>${escapeHTML(role)}</small>
          </div>

          ${icon("chevron", 16)}
        </button>

      </div>
    </header>
  `;
}


/* =====================================================
   HEADER SEARCH RESULTS
===================================================== */

// Kata kunci tambahan per halaman, agar pencarian juga cocok dengan sinonim
// (mis. mengetik "beranda" menemukan halaman dashboard)
const SEARCH_KEYWORDS = {
  dashboard: "beranda home ringkasan utama",
  users: "pengguna user akun admin",
  waste: "sampah data jenis kategori",
  guides: "panduan penanganan petunjuk cara",
  dataset: "dataset data latih gambar",
  model: "model evaluasi akurasi performa",
  reports: "laporan report statistik",
  classify: "klasifikasi sampah unggah upload foto gambar",
  history: "riwayat klasifikasi hasil sebelumnya",
  profile: "profil akun saya",
  settings: "pengaturan setelan preferensi"
};

// Membuat label dengan bagian yang cocok dibungkus <mark> (disorot).
// Setiap potongan teks tetap di-escape; hanya tag <mark> yang ditambahkan.
// "query" harus sudah huruf kecil. Jika tidak cocok, label dikembalikan polos.
function highlightMatch(label, query) {
  const index = label.toLowerCase().indexOf(query);

  if (index === -1) return escapeHTML(label);

  const end = index + query.length;

  return (
    escapeHTML(label.slice(0, index)) +
    "<mark>" + escapeHTML(label.slice(index, end)) + "</mark>" +
    escapeHTML(label.slice(end))
  );
}

// Membuat HTML daftar hasil pencarian halaman untuk sebuah peran.
// Yang dicari: menu peran + Profil Saya + Pengaturan.
// Hasil dari kecocokan label ditampilkan lebih dulu, lalu dari kata kunci.
// Query kosong menghasilkan string kosong.
export function renderSearchResults(role, query) {
  // Semua tujuan yang bisa dicari
  const destinations = [
    ...(MENU_BY_ROLE[role] || []),

    {
      id: "profile",
      label: "Profil Saya",
      icon: "profile"
    },

    {
      id: "settings",
      label: "Pengaturan",
      icon: "settings"
    }
  ];

  const normalizedQuery = String(query || "")
    .trim()
    .toLowerCase();

  if (!normalizedQuery) return "";

  // Cocok pada label
  const byLabel = destinations.filter(item =>
    item.label.toLowerCase().includes(normalizedQuery)
  );

  // Cocok pada kata kunci (yang belum masuk hasil label)
  const byKeyword = destinations.filter(item =>
    !byLabel.includes(item) &&
    (SEARCH_KEYWORDS[item.id] || "").includes(normalizedQuery)
  );

  const results = [...byLabel, ...byKeyword];

  // Tidak ada yang cocok: tampilkan pesan kosong
  if (!results.length) {
    return `
      <div class="search-empty" role="status">
        Tidak ada halaman yang cocok.
      </div>
    `;
  }

  return results.map(item => `
    <button
      type="button"
      role="option"
      class="search-result"
      data-search-page="${escapeHTML(item.id)}"
    >
      ${icon(item.icon, 20)}
      <span>${highlightMatch(item.label, normalizedQuery)}</span>
    </button>
  `).join("");
}


/* =====================================================
   HEADER EVENTS
===================================================== */

// Memasang semua event pada header: pencarian (ketik, panah, Enter, Escape,
// pintasan Ctrl/Cmd+K), notifikasi, tombol menu, dan sinkronisasi nama profil.
// Mengembalikan fungsi pembersih (unbindHeader) yang melepas semua listener.
// Callback: onMenu (buka sidebar) dan onNavigate (pindah halaman).
export function bindHeader(element, {
  role,
  onMenu,
  onNavigate
}) {
  // Tidak ada elemen: kembalikan pembersih kosong
  if (!element) return () => { };

  // Ambil elemen-elemen penting di dalam header
  const input = element.querySelector(
    '[data-input="header-search"]'
  );

  const form = element.querySelector(
    '[data-form="header-search"]'
  );

  const resultsContainer = element.querySelector(
    '[data-container="search-results"]'
  );

  const notifications = element.querySelector(
    '[data-container="notifications"]'
  );

  const notificationButton = element.querySelector(
    '[data-action="toggle-notifications"]'
  );

  // Jika ada elemen yang hilang, hentikan dan laporkan di console
  if (
    !input ||
    !form ||
    !resultsContainer ||
    !notifications ||
    !notificationButton
  ) {
    console.error(
      "ECOSORT: Struktur Header tidak lengkap."
    );

    return () => { };
  }


  /* SEARCH */

  // Indeks hasil pencarian yang sedang disorot (-1 = tidak ada)
  let activeIndex = -1;

  // Daftar tombol hasil pencarian saat ini
  function getResultItems() {
    return [
      ...resultsContainer.querySelectorAll("[data-search-page]")
    ];
  }

  // Menyorot hasil pada indeks tertentu. Indeks berputar (dari akhir ke awal
  // dan sebaliknya) dan item digulir agar terlihat.
  function setActive(index) {
    const items = getResultItems();

    items.forEach(item =>
      item.classList.remove("is-active")
    );

    if (!items.length) {
      activeIndex = -1;
      return;
    }

    activeIndex = (index + items.length) % items.length;

    items[activeIndex].classList.add("is-active");
    items[activeIndex].scrollIntoView({ block: "nearest" });
  }

  // Menutup daftar hasil; clear = true juga mengosongkan input dan hasilnya
  function closeSearch({ clear = false } = {}) {
    if (clear) input.value = "";

    activeIndex = -1;
    resultsContainer.hidden = true;

    if (clear) resultsContainer.innerHTML = "";
  }

  // Memperbarui hasil setiap kali isi input berubah.
  // Daftar disembunyikan jika input kosong.
  function updateSearch() {
    const query = input.value;

    resultsContainer.innerHTML =
      renderSearchResults(role, query);

    resultsContainer.hidden = !query.trim();
    activeIndex = -1;
  }

  // Berpindah ke halaman dari hasil yang dipilih, lalu menutup pencarian
  function goToResult(item) {
    if (!item) return;

    onNavigate?.(item.dataset.searchPage);
    closeSearch({ clear: true });
    input.blur();
  }

  // Klik pada hasil pencarian
  function handleSearchResult(event) {
    goToResult(
      event.target.closest("[data-search-page]")
    );
  }

  // Menyorot hasil saat kursor mouse melewatinya
  function handleSearchHover(event) {
    const target = event.target.closest(
      "[data-search-page]"
    );

    if (!target) return;

    setActive(getResultItems().indexOf(target));
  }

  // Tekan Enter: buka hasil yang disorot, atau hasil pertama bila belum ada
  function handleSubmit(event) {
    event.preventDefault();

    const items = getResultItems();

    goToResult(items[activeIndex] || items[0]);
  }

  // Navigasi keyboard pada hasil: panah bawah/atas memindahkan sorotan,
  // Escape menutup daftar. Diabaikan jika daftar sedang tersembunyi.
  function handleSearchKeys(event) {
    if (resultsContainer.hidden) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive(activeIndex + 1);
        break;

      case "ArrowUp":
        event.preventDefault();
        setActive(activeIndex < 0 ? -1 : activeIndex - 1);
        break;

      case "Escape":
        event.preventDefault();
        closeSearch();
        break;
    }
  }

  // Saat input difokuskan dan sudah berisi teks, tampilkan hasil lagi
  function handleSearchFocus() {
    if (input.value.trim()) updateSearch();
  }

  // Klik di luar form pencarian menutup daftar hasil
  function handleOutsideClick(event) {
    if (!form.contains(event.target)) closeSearch();
  }

  // Pintasan Ctrl/Cmd + K: fokus ke kolom pencarian dan pilih isinya
  function handleShortcut(event) {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.key.toLowerCase() === "k"
    ) {
      event.preventDefault();
      input.focus();
      input.select();
    }
  }


  /* NOTIFICATIONS */

  // Membuka/menutup popover notifikasi dan memperbarui atribut aria-expanded
  function handleNotifications() {
    const isOpen = !notifications.hidden;

    notifications.hidden = isOpen;

    notificationButton.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );
  }


  /* PROFILE HEADER SYNC */

  // Memperbarui nama dan inisial pada chip profil tanpa render ulang header,
  // misalnya setelah pengguna mengubah nama di halaman profil
  function syncProfileHeader() {
    const account = getHeaderIdentity(role);

    const label = element.querySelector(
      ".profile-chip b"
    );

    const avatar = element.querySelector(
      ".profile-chip .avatar"
    );

    if (label) {
      label.textContent = account.name;
    }

    if (avatar) {
      avatar.outerHTML = account.photo
    ? `
      <img
        class="avatar"
        src="${escapeHTML(account.photo)}"
        alt="Foto profil"
      >
    `
    : `
      <span class="avatar">
        ${escapeHTML(account.initials)}
      </span>
    `;
    }
  }


  // Memicu sinkronisasi hanya bila yang berubah adalah kolom nama profil
  function handleProfileFieldChange(event) {
    if (
      event.target?.matches?.(
        '[data-profile-field="name"]'
      )
    ) {
      syncProfileHeader();
    }
  }


  /* HEADER ACTIONS */

  // Menangani klik tombol aksi di header lewat atribut data-action
  function handleClick(event) {
    const action = event.target.closest(
      "[data-action]"
    );

    // Abaikan jika tidak ada aksi atau elemennya di luar header
    if (!action || !element.contains(action)) {
      return;
    }

    switch (action.dataset.action) {
      // Buka sidebar (tombol menu di mobile)
      case "open-sidebar":
        onMenu?.();
        break;

      // Buka halaman profil
      case "open-profile":
        onNavigate?.("profile");
        break;

      // Tandai notifikasi dibaca: tutup popover
      case "read-notifications":
        notifications.hidden = true;

        notificationButton.setAttribute(
          "aria-expanded",
          "false"
        );
        break;
    }
  }


  /* EVENT REGISTRATION */

  // Daftarkan semua listener. Beberapa dipasang di document/window, sehingga
  // WAJIB dilepas lewat fungsi pembersih di bawah.
  input.addEventListener("input", updateSearch);
  input.addEventListener("keydown", handleSearchKeys);
  input.addEventListener("focus", handleSearchFocus);

  resultsContainer.addEventListener(
    "mouseover",
    handleSearchHover
  );

  document.addEventListener(
    "click",
    handleOutsideClick
    
  );

  // Memperbarui header ketika foto profil berubah
  document.addEventListener(
    "profile:updated",
    syncProfileHeader
  );

  resultsContainer.addEventListener(
    "click",
    handleSearchResult
  );

  form.addEventListener("submit", handleSubmit);

  window.addEventListener(
    "keydown",
    handleShortcut
  );

  notificationButton.addEventListener(
    "click",
    handleNotifications
  );

  element.addEventListener(
    "click",
    handleClick
  );

  document.addEventListener(
    "input",
    handleProfileFieldChange
  );

  document.addEventListener(
    "change",
    handleProfileFieldChange
  );

  window.addEventListener(
    "storage",
    syncProfileHeader
  );

  document.addEventListener(
  "profile:updated",
  syncProfileHeader
  );


  /* CLEANUP */

  // Melepas semua listener yang didaftarkan di atas (urutannya sama)
  return function unbindHeader() {
    input.removeEventListener(
      "input",
      updateSearch
    );

    input.removeEventListener(
      "keydown",
      handleSearchKeys
    );

    input.removeEventListener(
      "focus",
      handleSearchFocus
    );

    resultsContainer.removeEventListener(
      "mouseover",
      handleSearchHover
    );

    document.removeEventListener(
      "click",
      handleOutsideClick
    );

    resultsContainer.removeEventListener(
      "click",
      handleSearchResult
    );

    form.removeEventListener(
      "submit",
      handleSubmit
    );

    window.removeEventListener(
      "keydown",
      handleShortcut
    );

    notificationButton.removeEventListener(
      "click",
      handleNotifications
    );

    element.removeEventListener(
      "click",
      handleClick
    );

    document.removeEventListener(
      "input",
      handleProfileFieldChange
    );

    document.removeEventListener(
      "change",
      handleProfileFieldChange
      
    );

    document.removeEventListener(
      "profile:updated",
      syncProfileHeader
    );

    window.removeEventListener(
      "storage",
      syncProfileHeader
    );
  };
}


/* =====================================================
   STAT CARD
===================================================== */

// Membuat HTML kartu statistik (versi untuk modul layout). Parameter
// "icon" diberi alias iconName agar tidak bentrok dengan fungsi icon().
export function renderStatCard({
  title,
  value,
  change,
  icon: iconName,
  tone = "green"
}) {
  return `
    <div class="stat-card">

      <div class="stat-icon ${escapeHTML(tone)}">
        ${icon(iconName)}
      </div>

      <div class="stat-title">
        ${escapeHTML(title)}
      </div>

      <div class="stat-value">
        ${escapeHTML(value)}
      </div>

      <div class="stat-change">
        <span>↗ ${escapeHTML(change)}</span>
        dari bulan lalu
      </div>

    </div>
  `;
}


/* =====================================================
   ECOSORT - GLOBAL LOGOUT CONFIRMATION
   Untuk User, Sub Admin, dan Super Admin.
   Memakai dialog konfirmasi bersama (components/feedback.js).
===================================================== */

// Menampilkan dialog konfirmasi logout, dan memanggil onConfirm hanya jika
// pengguna menyetujui. Jika onConfirm bukan fungsi, hanya mencatat error.
export function showLogoutConfirm({ onConfirm } = {}) {

  if (typeof onConfirm !== "function") {
    console.error("ECOSORT: Fungsi logout tidak tersedia.");
    return;
  }

  confirmLogout().then(confirmed => {
    if (confirmed) onConfirm();
  });

}