// Berkas ini adalah titik masuk untuk halaman data (jenis "waste" dan "guides")
// milik Sub Admin dan Super Admin. Tugasnya: memeriksa akses, menyiapkan
// kerangka halaman (sidebar, header, modal, toast), memasang event, lalu
// memuat modul halaman data ke dalamnya.

// Notifikasi toast dan dialog konfirmasi logout bersama (diberi alias agar
// tidak bentrok dengan fungsi lokal bernama sama di bawah)
import { showToast as showSharedToast, confirmLogout as confirmLogoutDialog } from "../components/feedback.js";
// Sesi aktif dan fungsi logout
import { getActiveSession, logout } from "./auth.js";
// Penyimpanan lokal dan pemeriksa bentuk data (array item data)
import { isDataItemArray, readLocal, writeLocal } from "./database.js";
// Halaman yang diizinkan per peran, dan pembaca halaman dari hash URL
import { allowedPagesForRole, pageFromHash } from "./router.js";
// Komponen kerangka halaman: sidebar dan header beserta pengikat event-nya
import {
  renderSidebar,
  bindSidebar,
  renderHeader,
  bindHeader
} from "./layout.js";
// Pembuat ikon
import { icon } from "./icons.js";
// Pembuat halaman data (daftar, form, dsb.)
import { createDataPage } from "../modules/data-page.js";

// Elemen kontainer utama aplikasi
const root = document.getElementById("app-root");
// Peran dan jenis halaman dibaca dari atribut data-* pada <body>
const ROLE = document.body.dataset.role;
const KIND = document.body.dataset.kind;
// Nama halaman sama dengan jenis datanya ("waste" atau "guides")
const PAGE = KIND;

// Dashboard utama tiap peran (tujuan pengalihan jika peran tidak cocok)
const ROLE_HOME = {
  User: "../user/user-dashboard.html",
  "Sub Admin": "../subadmin/subadmin-dashboard.html",
  "Super Admin": "../superadmin/superadmin-dashboard.html"
};

// Peta halaman -> file HTML untuk setiap peran.
// Dipakai oleh fungsi navigate() untuk berpindah halaman.
const PAGE_ROUTES = {
  "Sub Admin": {
    dashboard: "./subadmin-dashboard.html",
    waste: "./subadmin-waste.html",
    guides: "./subadmin-guides.html",
    reports: "../reports.html",
    profile: "../user/user-profile.html",
    settings: "../settings.html"
  },

  "Super Admin": {
    dashboard: "./superadmin-dashboard.html",
    users: "./superadmin-users.html",
    waste: "./superadmin-waste-page.html",
    guides: "./superadmin-guides-page.html",
    dataset: "./superadmin-dataset-page.html",
    model: "./superadmin-model-page.html",
    reports: "../reports.html",
    profile: "../user/user-profile.html",
    settings: "../settings.html"
  }
};

// ---- Rangkaian pemeriksaan awal (guard). Jika gagal, proses dihentikan
// dengan melempar error agar sisa kode tidak dijalankan. ----

// Kontainer utama harus ada
if (!root) {
  throw new Error("ECOSORT: App root tidak ditemukan.");
}

// Peran pada halaman harus salah satu yang punya rute (Sub Admin / Super Admin)
if (!Object.prototype.hasOwnProperty.call(PAGE_ROUTES, ROLE)) {
  window.location.replace("../login.html");
  throw new Error("ECOSORT: Role halaman tidak valid.");
}

// Jenis halaman data hanya boleh "waste" atau "guides"
if (!["waste", "guides"].includes(KIND)) {
  throw new Error("ECOSORT: Jenis halaman data tidak valid.");
}

// Pengguna harus sudah login
const session = getActiveSession();

if (!session) {
  window.location.replace("../login.html");
  throw new Error("ECOSORT: Sesi tidak ditemukan.");
}

// Peran sesi harus sama dengan peran halaman; jika beda, alihkan ke
// dashboard miliknya sendiri
if (session.role !== ROLE) {
  window.location.replace(
    ROLE_HOME[session.role] || "../login.html"
  );
  throw new Error("ECOSORT: Akses tidak diizinkan.");
}

// Halaman ini harus termasuk halaman yang diizinkan untuk peran tersebut
const allowedPages = allowedPagesForRole(ROLE);

if (!allowedPages.has(PAGE)) {
  window.location.replace(ROLE_HOME[ROLE]);
  throw new Error("ECOSORT: Halaman tidak tersedia.");
}

/* MIGRASI DATA LAMA */

// Memindahkan data dari kunci lama (mis. "waste") ke kunci baru
// ("data-waste"). Dilewati jika data baru sudah ada; data lama dibiarkan.
function migrateLegacyData() {
  const current = readLocal(
    `data-${KIND}`,
    null,
    isDataItemArray
  );

  // Data baru sudah ada: tidak perlu migrasi
  if (Array.isArray(current)) return;

  const legacy = readLocal(
    KIND,
    null,
    isDataItemArray
  );

  // Salin data lama ke kunci baru
  if (Array.isArray(legacy)) {
    writeLocal(`data-${KIND}`, legacy);
  }
}

migrateLegacyData();

/* STATE */

// Apakah sidebar sedang terbuka (dipakai pada layar kecil)
let sidebarOpen = false;
// Id timer toast (untuk dibatalkan saat toast ditutup)
let toastTimer = null;
// Fungsi pembersih; diisi nanti saat render, awalnya tidak melakukan apa-apa
let unbindHeader = () => { };
let unmountDataPage = () => { };
// Apakah modal konfirmasi logout buatan lokal sedang tampil
let confirmLogout = false;

/* HELPERS */

// Mengganti karakter khusus HTML menjadi entitas agar aman disisipkan ke HTML
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

/* TOAST */

// Menampilkan notifikasi lewat komponen toast bersama.
// tone: "success" (default) atau "error".
function showToast(message, tone = "success") {
  showSharedToast(message, tone);
}

/* NAVIGATION */

// Berpindah ke halaman lain sesuai peran. Mengembalikan true jika
// perpindahan dimulai, false jika ditolak (dengan toast error).
function navigate(page) {
  // Tolak halaman yang tidak diizinkan untuk peran ini
  if (!allowedPages.has(page)) {
    showToast(
      "Halaman tersebut tidak tersedia untuk peran ini.",
      "error"
    );
    return false;
  }

  // Cari file tujuan dari peta rute
  const destination = PAGE_ROUTES[ROLE]?.[page];

  if (!destination) {
    showToast("Rute halaman belum tersedia.", "error");
    return false;
  }

  // Bangun URL tujuan dan tambahkan hash "#app/<halaman>"
  const target = new URL(destination, window.location.href);
  target.hash = `app/${page}`;

  window.location.assign(target.href);
  return true;
}

/* SIDEBAR */

// Membuka/menutup sidebar. Lapisan overlay gelap hanya ditampilkan saat
// sidebar terbuka DAN layar berukuran kecil (lebar maksimal 1050px).
function setSidebarOpen(open) {
  sidebarOpen = Boolean(open);

  root.querySelector(".sidebar")?.classList.toggle(
    "sidebar-open",
    sidebarOpen
  );

  const overlay = root.querySelector(".side-overlay");
  const isMobile = window.matchMedia(
    "(max-width: 1050px)"
  ).matches;

  if (overlay) {
    overlay.style.display =
      sidebarOpen && isMobile ? "block" : "none";
  }
}

/* LOGOUT MODAL */

// Menampilkan atau menyembunyikan modal konfirmasi logout sesuai nilai
// confirmLogout. Bila disembunyikan, isi kontainer modal dikosongkan.
function renderLogoutModal() {
  const modalRoot = root.querySelector("#modal-root");
  if (!modalRoot) return;

  // Tidak perlu tampil: kosongkan kontainer lalu selesai
  if (!confirmLogout) {
    modalRoot.replaceChildren();
    return;
  }

  // Modal berupa <form> sehingga tombol "Ya, keluar" memicu event submit
  // (ditangani handleRootSubmit). Backdrop dan tombol batal ditangani
  // lewat atribut data-action pada handleRootClick.
  modalRoot.innerHTML = `
    <div
      class="modal-backdrop"
      data-action="close-logout-backdrop"
      role="presentation"
    >
      <form
        class="modal"
        data-form="logout"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        novalidate
      >
        <div class="modal-head">
          <div class="delete-icon">
            ${icon("waste")}
            <h3 id="logout-modal-title">Keluar dari EcoSort?</h3>
            <p>
              Tindakan ini tidak dapat dibatalkan.
              Data akan dihapus dari penyimpanan lokal.
            </p>
          </div>

          <button
            type="button"
            data-action="cancel-logout"
            aria-label="Tutup modal"
          >
            ${icon("close")}
          </button>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-outline"
            data-action="cancel-logout"
          >
            <span>Batal</span>
          </button>

          <button type="submit" class="btn btn-danger">
            <span>Ya, keluar</span>
          </button>
        </div>
      </form>
    </div>
  `;

  // Fokus awal ke tombol batal (pilihan paling aman) demi aksesibilitas
  modalRoot
    .querySelector('[data-action="cancel-logout"]')
    ?.focus();
}

// Menangani logout dari sidebar: tampilkan dialog konfirmasi bersama,
// dan jika disetujui, hapus sesi lalu kembali ke landing.
async function handleLogout() {
  const confirmed = await confirmLogoutDialog();
  if (!confirmed) return;

  if (logout()) {
    window.location.assign(new URL("../landing.html", window.location.href).href);
  } else {
    showToast("Gagal keluar dari akun.", "error");
  }
}

/* EVENTS */

// Satu listener klik di root (event delegation): aksi ditentukan dari
// atribut data-action pada elemen yang diklik atau induknya.
function handleRootClick(event) {
  const action = event.target.closest("[data-action]");

  // Abaikan jika tidak ada data-action, atau elemennya di luar root
  if (!action || !root.contains(action)) return;

  switch (action.dataset.action) {
    // Tutup toast secara manual dan batalkan timer-nya
    case "dismiss-toast": {
      root.querySelector("#toast-root")?.replaceChildren();

      if (toastTimer) {
        window.clearTimeout(toastTimer);
        toastTimer = null;
      }
      break;
    }

    // Klik overlay gelap: tutup sidebar
    case "close-overlay":
      setSidebarOpen(false);
      break;

    // Tombol batal pada modal logout
    case "cancel-logout":
      confirmLogout = false;
      renderLogoutModal();
      break;

    // Klik pada latar modal: tutup hanya jika yang diklik benar-benar latarnya,
    // bukan isi modal
    case "close-logout-backdrop":
      if (event.target === action) {
        confirmLogout = false;
        renderLogoutModal();
      }
      break;
  }
}

// Menangani submit form modal logout ("Ya, keluar"): tutup modal,
// hapus sesi, lalu kembali ke halaman landing.
function handleRootSubmit(event) {
  const form = event.target.closest('[data-form="logout"]');

  // Abaikan form lain
  if (!form || !root.contains(form)) return;

  // Cegah pengiriman form bawaan browser
  event.preventDefault();

  confirmLogout = false;
  renderLogoutModal();

  if (logout()) {
    window.location.assign(new URL("../landing.html", window.location.href).href);
  } else {
    showToast("Gagal mengakhiri sesi.", "error");
  }
}

// Tombol Escape menutup modal logout bila sedang tampil
function handleKeydown(event) {
  if (event.key === "Escape" && confirmLogout) {
    confirmLogout = false;
    renderLogoutModal();
  }
}

// Saat ukuran jendela berubah, terapkan ulang status sidebar agar tampilan
// overlay menyesuaikan (mobile / desktop)
function handleResize() {
  setSidebarOpen(sidebarOpen);
}

/* RENDER APPLICATION */

// Membangun kerangka halaman, memasang semua event, dan memuat halaman data.
function renderApplication() {
  // Kerangka: sidebar, area utama (header + konten), overlay, serta
  // kontainer kosong untuk modal dan toast
  root.innerHTML = `
    <div class="app-shell">

      ${renderSidebar({
    role: ROLE,
    page: PAGE,
    open: sidebarOpen
  })}

      <div class="app-main">

        ${renderHeader({
    role: ROLE
  })}

        <main>
          <div id="data-page-content"></div>
        </main>

      </div>

      <div
        class="side-overlay"
        data-action="close-overlay"
        style="display:none"
      ></div>

    </div>

    <div id="modal-root"></div>
    <div id="toast-root"></div>
  `;

  // Pasang event sidebar: pindah halaman, buka/tutup, dan logout
  bindSidebar(root.querySelector(".sidebar"), {
    setPage: navigate,
    setOpen: setSidebarOpen,
    onLogout: handleLogout
  });

  // Pasang event header; hasilnya (fungsi pembersih) disimpan untuk cleanup
  unbindHeader = bindHeader(
    root.querySelector(".app-header"),
    {
      role: ROLE,
      onMenu: () => setSidebarOpen(true),
      onNavigate: navigate
    }
  );

  // Pasang listener global untuk klik, submit, keyboard, dan resize
  root.addEventListener("click", handleRootClick);
  root.addEventListener("submit", handleRootSubmit);

  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", handleResize);

  // Muat halaman data ke dalam area konten.
  // mount() mengembalikan fungsi pembersih, disimpan untuk cleanup.
  const pageRoot = root.querySelector("#data-page-content");

  const dataPage = createDataPage({
    kind: KIND,
    onToast: showToast
  });

  unmountDataPage = dataPage.mount(pageRoot);
}

/* INITIALIZATION */

// Inisialisasi halaman: menyelaraskan hash URL dengan halaman ini,
// lalu merender aplikasi.
async function initializePage() {
  const requestedPage = pageFromHash();

  // Hash menunjuk halaman lain: coba berpindah ke sana.
  // Jika gagal, kembalikan hash ke halaman ini.
  if (requestedPage && requestedPage !== PAGE) {
    if (navigate(requestedPage)) return;

    window.history.replaceState(
      null,
      "",
      `#app/${PAGE}`
    );
  }

  // Tidak ada hash: isi dengan halaman ini (tanpa menambah riwayat browser)
  if (!requestedPage) {
    window.history.replaceState(
      null,
      "",
      `#app/${PAGE}`
    );
  }

  renderApplication();
}

// Jalankan inisialisasi; bila gagal, tampilkan pesan error di halaman.
initializePage().catch(error => {
  console.error(
    `ECOSORT ${PAGE.toUpperCase()} ERROR:`,
    error
  );

  root.innerHTML = `
    <main class="page-content">
      <section class="panel">
        <h2>Halaman gagal dimuat</h2>
        <p data-error-message></p>
      </section>
    </main>
  `;

  // Pesan error diisi lewat textContent (bukan HTML) agar aman dari injeksi
  root.querySelector(
    "[data-error-message]"
  ).textContent = error.message;
});

/* CLEANUP */

// Saat halaman ditinggalkan: bersihkan semua listener dan timer agar tidak
// terjadi kebocoran memori. { once: true } membuat handler hanya jalan sekali.
window.addEventListener("pagehide", () => {
  unmountDataPage();
  unbindHeader();

  root.removeEventListener("click", handleRootClick);
  root.removeEventListener("submit", handleRootSubmit);

  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", handleResize);

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }
}, { once: true });