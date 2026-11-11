/* =====================================================
   ECOSORT - ROUTER MODULE
   Migration: Pure JavaScript ES Modules
===================================================== */

// Berkas ini mengatur "routing" sederhana berbasis hash URL (#app/<halaman>):
// daftar menu per peran, membaca halaman dari URL, memeriksa halaman yang
// boleh diakses suatu peran, dan berpindah halaman.

// Daftar peran/halaman dan validatornya berasal dari database.js
import { ROLES, PAGES, isRole, isPage } from "./database.js";

// Diekspor ulang agar modul lain cukup mengimpor dari router.js
export { ROLES, PAGES, isRole, isPage };

/* =====================================================
   MENU BY ROLE
===================================================== */

// Daftar menu sidebar untuk tiap peran. Setiap item punya:
// - id    : nama halaman (harus ada di PAGES)
// - label : teks yang tampil di menu
// - icon  : nama ikon
// Urutan array = urutan tampil di sidebar; item pertama juga menjadi
// halaman bawaan peran (lihat getDefaultPage).
// Halaman "profile" dan "settings" tidak ada di sini karena dibuat
// terpisah di bagian bawah sidebar.
export const MENU_BY_ROLE = {

  "Super Admin": [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "users", label: "Manajemen Pengguna", icon: "users" },
    { id: "waste", label: "Data Sampah", icon: "waste" },
    { id: "guides", label: "Panduan Penanganan", icon: "guides" },
    { id: "dataset", label: "Dataset", icon: "dataset" },
    { id: "model", label: "Evaluasi Model", icon: "model" },
    { id: "reports", label: "Laporan", icon: "reports" }
  ],

  "Sub Admin": [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "waste", label: "Data Sampah", icon: "waste" },
    { id: "guides", label: "Panduan Penanganan", icon: "guides" },
    { id: "reports", label: "Laporan Konten", icon: "reports" }
  ],

  User: [
    { id: "dashboard", label: "Beranda", icon: "dashboard" },
    { id: "classify", label: "Klasifikasi Sampah", icon: "classify" },
    { id: "history", label: "Riwayat Klasifikasi", icon: "history" }
  ]

};


/* =====================================================
   GET PAGE FROM URL HASH
===================================================== */

// Membaca nama halaman dari hash URL berformat "#app/<halaman>".
// Mengembalikan nama halaman jika polanya cocok DAN halaman itu valid
// (ada di PAGES); selain itu mengembalikan null.
// Contoh: "#app/waste" -> "waste", "#app/xyz" -> null, "#waste" -> null.
export function pageFromHash(
  hash = window.location.hash
) {

  // Pola: harus diawali "#app/" lalu satu segmen tanpa "/", "?", atau "#"
  const match = /^#app\/([^/?#]+)$/.exec(hash);

  const candidate = match?.[1];

  return candidate && isPage(candidate)
    ? candidate
    : null;

}

/* =====================================================
   ALLOWED PAGES BY ROLE
===================================================== */

// Mengembalikan Set berisi halaman yang boleh diakses sebuah peran:
// semua halaman di menunya ditambah "profile" dan "settings".
// Peran yang tidak valid menghasilkan Set kosong (tidak ada akses).
export function allowedPagesForRole(role) {

  if (!isRole(role)) {
    return new Set();
  }

  return new Set([
    ...MENU_BY_ROLE[role].map(item => item.id),
    "profile",
    "settings"
  ]);

}

/* =====================================================
   NAVIGATION
===================================================== */

// Berpindah halaman di dalam SPA dengan mengubah hash URL (tanpa memuat
// ulang halaman) dan menggulir ke atas.
// Mengembalikan false jika halaman tidak valid atau tidak diizinkan untuk
// peran tersebut, dan true jika berhasil.
// Catatan: pushState tidak memicu event "hashchange", jadi tampilan harus
// diperbarui sendiri oleh pemanggil.
export function navigateTo(page, role) {

  // Tolak halaman yang tidak dikenal atau di luar hak akses peran
  if (
    !isPage(page) ||
    !allowedPagesForRole(role).has(page)
  ) {
    return false;
  }

  // Tambah entri riwayat browser dengan hash baru
  window.history.pushState(
    null,
    "",
    `#app/${page}`
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  return true;

}

/* =====================================================
   GET DEFAULT PAGE
===================================================== */

// Mengembalikan halaman awal sebuah peran: item pertama di menunya
// (cadangan: "dashboard"). Peran yang tidak valid menghasilkan null.
export function getDefaultPage(role) {

  if (!isRole(role)) {
    return null;
  }

  return MENU_BY_ROLE[role][0]?.id || "dashboard";

}