/* =====================================================
   ECOSORT - FEEDBACK COMPONENTS
   Satu sumber untuk toast/snackbar dan dialog konfirmasi
   agar tampilan, teks, dan animasi konsisten di semua halaman.
===================================================== */

// Fungsi helper untuk membuat markup ikon SVG
import { icon } from "../core/icons.js";

// Lama toast tampil sebelum otomatis hilang (milidetik)
const TOAST_DURATION = 3200;
// Lama animasi keluar toast sebelum elemen dihapus dari DOM (milidetik)
const TOAST_EXIT_MS = 160;

// Konfigurasi tiap jenis toast: judul yang ditampilkan dan nama ikonnya
const TOAST_TONES = {
  success: { title: "Berhasil", icon: "check" },
  error: { title: "Perlu diperiksa", icon: "close" },
  info: { title: "Informasi", icon: "bell" }
};

// Menyimpan id timer auto-hide agar bisa dibatalkan saat toast diganti/ditutup
let toastTimer = null;

/**
 * Mengambil elemen wadah (host) toast.
 * Jika belum ada, dibuat sekali lalu dipakai ulang.
 */
function getToastHost() {
  let host = document.getElementById("ecosort-toast-host");

  if (!host) {
    host = document.createElement("div");
    host.id = "ecosort-toast-host";
    // aria-live agar pembaca layar mengumumkan toast baru secara sopan
    host.setAttribute("aria-live", "polite");
    document.body.appendChild(host);
  }

  return host;
}

/**
 * Menjalankan animasi keluar lalu menghapus toast dari DOM.
 * Aman dipanggil berulang atau pada toast yang sudah terlepas.
 */
function removeToast(toast) {
  // Abaikan bila toast tidak ada atau sudah tidak berada di DOM
  if (!toast || !toast.isConnected) return;

  // Kelas ini memicu animasi keluar lewat CSS
  toast.classList.add("is-leaving");

  /* animationend tidak muncul bila animasi dimatikan
     (prefers-reduced-motion), jadi pakai timer cadangan. */
  window.setTimeout(() => toast.remove(), TOAST_EXIT_MS);
}

/**
 * Tampilkan toast. Hanya satu toast tampil pada satu waktu.
 * @param {string} message
 * @param {"success"|"error"|"info"} tone
 */
export function showToast(message, tone = "success") {
  // Ambil konfigurasi sesuai tone; bila tone tidak dikenal, pakai "success"
  const config = TOAST_TONES[tone] || TOAST_TONES.success;
  const safeTone = TOAST_TONES[tone] ? tone : "success";
  const host = getToastHost();

  // Batalkan timer toast sebelumnya agar tidak menutup toast yang baru
  if (toastTimer) {
    window.clearTimeout(toastTimer);
    toastTimer = null;
  }

  // Kosongkan wadah sehingga hanya ada satu toast
  host.replaceChildren();

  const toast = document.createElement("div");
  toast.className = `toast toast-${safeTone}`;
  // Error memakai "alert" (langsung diumumkan), lainnya "status"
  toast.setAttribute("role", safeTone === "error" ? "alert" : "status");

  // Ikon di sisi kiri toast
  const mark = document.createElement("span");
  mark.innerHTML = icon(config.icon);

  // Bagian isi: judul dan pesan
  const content = document.createElement("div");
  const heading = document.createElement("b");
  heading.textContent = config.title;
  const text = document.createElement("p");
  // textContent (bukan innerHTML) mencegah injeksi HTML dari pesan
  text.textContent = String(message ?? "");
  content.append(heading, text);

  // Tombol tutup manual
  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", "Tutup notifikasi");
  close.innerHTML = icon("close", 16);
  close.addEventListener("click", () => {
    // Hentikan timer auto-hide karena toast ditutup manual
    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }
    removeToast(toast);
  });

  toast.append(mark, content, close);
  host.appendChild(toast);

  // Sembunyikan toast otomatis setelah durasi tertentu
  toastTimer = window.setTimeout(() => {
    toastTimer = null;
    removeToast(toast);
  }, TOAST_DURATION);
}

/**
 * Dialog konfirmasi bergaya sama dengan dialog logout.
 * Mengembalikan Promise<boolean>.
 */
export function confirmDialog({
  title = "Apakah kamu yakin?",
  message = "",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  symbol = "!"
} = {}) {
  return new Promise(resolve => {
    // Pastikan browser mendukung elemen <dialog> dan showModal()
    if (
      typeof HTMLDialogElement === "undefined" ||
      typeof HTMLDialogElement.prototype.showModal !== "function"
    ) {
      console.error("ECOSORT: Dialog tidak didukung browser.");
      resolve(false);
      return;
    }

    // Cegah dialog ganda: bila sudah ada yang terbuka, anggap batal
    if (document.getElementById("ecosort-confirm-dialog")) {
      resolve(false);
      return;
    }

    // Buat elemen dialog beserta atribut aksesibilitasnya
    const dialog = document.createElement("dialog");
    dialog.id = "ecosort-confirm-dialog";
    dialog.className = "ecosort-logout-dialog";
    dialog.setAttribute("aria-labelledby", "ecosort-confirm-title");
    dialog.setAttribute("aria-describedby", "ecosort-confirm-description");

    // Bagian kepala: simbol, judul + pesan, dan tombol tutup
    const heading = document.createElement("div");
    heading.className = "ecosort-logout-heading";

    // Simbol/ikon teks di sisi kiri
    const mark = document.createElement("span");
    mark.className = "ecosort-logout-icon";
    mark.textContent = symbol;

    // Judul dan deskripsi dialog
    const copy = document.createElement("div");
    copy.className = "ecosort-logout-copy";
    const h2 = document.createElement("h2");
    h2.id = "ecosort-confirm-title";
    h2.textContent = title;
    const p = document.createElement("p");
    p.id = "ecosort-confirm-description";
    p.textContent = message;
    copy.append(h2, p);

    // Tombol "×" di pojok; berfungsi sebagai pembatalan
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "ecosort-logout-close";
    closeButton.dataset.confirmAction = "cancel";
    closeButton.setAttribute("aria-label", "Tutup");
    closeButton.textContent = "×";

    heading.append(mark, copy, closeButton);

    // Bagian bawah: tombol batal dan konfirmasi
    const actions = document.createElement("div");
    actions.className = "ecosort-logout-actions";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "ecosort-logout-cancel";
    cancel.dataset.confirmAction = "cancel";
    cancel.textContent = cancelText;

    const confirm = document.createElement("button");
    confirm.type = "button";
    confirm.className = "ecosort-logout-confirm";
    confirm.dataset.confirmAction = "confirm";
    confirm.textContent = confirmText;

    actions.append(cancel, confirm);
    dialog.append(heading, actions);

    // Satu listener klik untuk seluruh dialog (event delegation)
    dialog.addEventListener("click", event => {
      // Klik pada backdrop (area di luar kotak dialog) = batal
      if (event.target === dialog) {
        dialog.close("cancel");
        return;
      }

      // Cari tombol berpenanda data-confirm-action yang diklik
      const action = event.target.closest("[data-confirm-action]");
      if (!action) return;

      // Nilai aksi ("cancel"/"confirm") menjadi returnValue dialog
      dialog.close(action.dataset.confirmAction);
    });

    // Dipanggil saat dialog ditutup (tombol, backdrop, maupun tombol Esc)
    dialog.addEventListener(
      "close",
      () => {
        // Hanya "confirm" yang dianggap setuju; Esc/lainnya = false
        const confirmed = dialog.returnValue === "confirm";
        dialog.remove();
        resolve(confirmed);
      },
      { once: true }
    );

    document.body.appendChild(dialog);
    // Tampilkan sebagai modal (ada backdrop dan fokus terkunci di dialog)
    dialog.showModal();
    // Fokus awal ke tombol batal agar aksi tidak terkonfirmasi tanpa sengaja
    cancel.focus();
  });
}

/** Konfirmasi logout yang sama untuk semua role. */
export function confirmLogout() {
  return confirmDialog({
    title: "Keluar dari EcoSort?",
    message: "Apakah kamu yakin ingin mengakhiri sesi akun ini?",
    confirmText: "Ya, Keluar",
    symbol: "↪"
  });
}