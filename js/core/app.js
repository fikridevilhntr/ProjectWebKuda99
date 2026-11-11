/* =====================================================
   ECOSORT - APPLICATION CORE
   Pure JavaScript ES Modules
===================================================== */

// Berkas inti aplikasi: mengatur navigasi berdasarkan peran (role),
// tampilan autentikasi (login/register/lupa password/super admin),
// penjagaan akses halaman, logout, dan inisialisasi halaman landing.

// Fungsi-fungsi logika autentikasi (sesi, login, logout, dsb.)
import {
  getActiveSession,
  logout,
  submitAuthentication,
  submitSuperAdminAuthentication,
  requestGoogleLogin
} from "./auth.js";

// Fungsi-fungsi untuk merender dan mengikat event pada tampilan autentikasi
import {
  renderAuthView,
  bindAuthView,
  renderSuperAdminLoginView,
  bindSuperAdminView
} from "../components/auth-view.js";

/* =====================================================
   ROLE ROUTES
===================================================== */

// Peta peran -> URL dashboard masing-masing.
// import.meta.url dipakai agar path relatif dihitung dari lokasi file ini,
// bukan dari halaman yang sedang dibuka.
export const ROUTES = {
  "User": new URL(
    "../../pages/user/user-dashboard.html",
    import.meta.url
  ).href,

  "Sub Admin": new URL(
    "../../pages/subadmin/subadmin-dashboard.html",
    import.meta.url
  ).href,

  "Super Admin": new URL(
    "../../pages/superadmin/superadmin-dashboard.html",
    import.meta.url
  ).href
};

/* =====================================================
   APPLICATION STATE
===================================================== */

// State tunggal untuk halaman autentikasi.
// Setiap perubahan state diikuti render ulang tampilan.
const authState = {
  mode: "login",        // mode form: login / register / forgot
  role: "User",         // peran yang dipilih saat masuk
  name: "",             // nama (dipakai saat registrasi)
  email: "",
  password: "",
  remember: false,      // opsi "ingat saya"
  showPassword: false,  // tampilkan/sembunyikan password
  loading: false,       // true saat permintaan sedang diproses
  superAdmin: false,    // true jika menampilkan form login Super Admin
  errors: {},           // pesan error per field
  message: ""           // pesan umum (sukses/gagal)
};

// Menyimpan fungsi pembersih event listener dari render sebelumnya
// agar listener tidak menumpuk setiap kali tampilan dirender ulang.
let removeAuthListeners = null;

/* =====================================================
   URL HELPER
===================================================== */

// Mengubah path relatif menjadi URL absolut berdasarkan halaman saat ini.
function pageUrl(path) {
  return new URL(
    path,
    window.location.href
  ).href;
}

/* =====================================================
   SESSION NAVIGATION
===================================================== */

// Mengarahkan pengguna ke dashboard sesuai perannya.
// Jika sesi tidak ada atau peran tidak dikenal, diarahkan ke halaman login.
// Mengembalikan true jika berhasil diarahkan ke dashboard, false jika tidak.
export function navigateToRoleHome(
  session = getActiveSession()
) {

  // Sesi tidak valid atau peran tidak terdaftar di ROUTES
  if (
    !session ||
    !ROUTES[session.role]
  ) {

    window.location.assign(
      pageUrl("./login.html")
    );

    return false;
  }

  // Sesi valid: menuju dashboard sesuai peran
  window.location.assign(
    ROUTES[session.role]
  );

  return true;
}

/* =====================================================
   LOGIN NAVIGATION
===================================================== */

// Menuju halaman login. Jika pengguna sudah punya sesi aktif,
// langsung diarahkan ke dashboard-nya agar tidak perlu login lagi.
export function goToLogin() {

  const session = getActiveSession();

  if (session) {

    navigateToRoleHome(session);

    return;
  }

  window.location.assign(
    pageUrl("./login.html")
  );
}

/* =====================================================
   LANDING PAGE NAVIGATION
===================================================== */

// Menyiapkan interaksi pada halaman landing:
// tombol login/mulai, tombol pelajari, tombol panduan, dan tautan navigasi.
function initializeLanding() {

  // Kumpulkan semua tombol yang berfungsi sebagai pintu masuk ke login
  const loginButtons =
    document.querySelectorAll(
      [
        "#loginBtn",
        "#startBtn",
        "#ctaBtn",
        '[data-action="login"]',
        '[data-action="start-classification"]'
      ].join(",")
    );

  loginButtons.forEach(button => {

    button.addEventListener(
      "click",
      event => {

        // Biarkan tautan anchor (#...) berperilaku normal (scroll di halaman)
        if (
          button.tagName === "A" &&
          button.getAttribute("href")?.startsWith("#")
        ) {
          return;
        }

        // Selain itu, batalkan aksi bawaan lalu arahkan ke login
        event.preventDefault();

        goToLogin();

      }
    );

  });

  /* LEARN BUTTON */

  // Tombol "pelajari": gulir halus ke bagian #cara-kerja
  document
    .getElementById("learnBtn")
    ?.addEventListener("click", () => {

      document
        .getElementById("cara-kerja")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    });

  /* GUIDE BUTTONS */

  // Tombol panduan juga mengarah ke alur login
  document
    .querySelectorAll('[data-action="guide"]')
    .forEach(button => {

      button.addEventListener(
        "click",
        goToLogin
      );

    });

  /* NAVIGATION LINKS */

  // Tautan menu navigasi berformat "#id": gulir halus ke elemen tujuan
  document
    .querySelectorAll(
      '.nav-links a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          // Ambil id tujuan dengan membuang karakter "#"
          const id = link
            .getAttribute("href")
            .slice(1);

          const target =
            document.getElementById(id);

          // Jika elemen tujuan tidak ada, biarkan perilaku default
          if (!target) return;

          event.preventDefault();

          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        }
      );

    });

}

/* =====================================================
   AUTHENTICATION ROOT
===================================================== */

// Mencari elemen kontainer tempat tampilan autentikasi dirender.
// Mengembalikan null jika halaman ini bukan halaman autentikasi.
function getAuthRoot() {

  return document.querySelector(
    "[data-auth-root], #auth-root"
  );

}

/* =====================================================
   AUTHENTICATION VIEW RENDERER
===================================================== */

// Merender tampilan autentikasi sesuai authState, lalu mengikat event-nya.
// Dipanggil ulang setiap kali state berubah.
function renderAuthentication(root) {

  // Lepas listener dari render sebelumnya sebelum mengganti isi DOM
  if (removeAuthListeners) {

    removeAuthListeners();

    removeAuthListeners = null;

  }

  /* SUPER ADMIN VIEW */

  // Jika mode Super Admin aktif, tampilkan form khusus Super Admin
  if (authState.superAdmin) {

    root.innerHTML =
      renderSuperAdminLoginView({

        email: authState.email,

        password: authState.password,

        showPassword:
          authState.showPassword,

        loading: authState.loading,

        errors: authState.errors

      });

    removeAuthListeners =
      bindSuperAdminView(root, {

        // Saat form dikirim
        onSubmit:
          handleSuperAdminSubmit,

        // Kembali ke form login biasa
        onBack: () => {

          authState.superAdmin = false;

          authState.password = "";

          authState.errors = {};

          authState.message = "";

          renderAuthentication(root);

        },

        // Menuju halaman landing
        onHome: () => {

          window.location.assign(
            pageUrl("./landing.html")
          );

        }

      });

    // Selesai: tampilan normal tidak perlu dirender
    return;
  }

  /* NORMAL AUTHENTICATION VIEW */

  // Tampilan login/register/lupa password untuk User dan Sub Admin
  root.innerHTML = renderAuthView({

    mode: authState.mode,

    role: authState.role,

    name: authState.name,

    email: authState.email,

    password: authState.password,

    remember: authState.remember,

    showPassword:
      authState.showPassword,

    loading: authState.loading,

    errors: authState.errors,

    message: authState.message

  });

  removeAuthListeners =
    bindAuthView(root, {

      // Saat form dikirim
      onSubmit:
        handleAuthSubmit,

      // Ganti mode (login/register/forgot); reset password, error, dan pesan
      onModeChange: mode => {

        authState.mode = mode;

        authState.password = "";

        authState.errors = {};

        authState.message = "";

        renderAuthentication(root);

      },

      // Ganti peran yang dipilih
      onRoleChange: role => {

        authState.role = role;

        renderAuthentication(root);

      },

      // Beralih ke form login Super Admin
      onSuperAdmin: () => {

        authState.superAdmin = true;

        authState.password = "";

        authState.errors = {};

        authState.message = "";

        renderAuthentication(root);

      },

      // Klik tombol login dengan Google
      onGoogleLogin:
        handleGoogleLogin

    });

}

/* =====================================================
   NORMAL AUTHENTICATION SUBMISSION
===================================================== */

// Menangani pengiriman form login/register/lupa password.
async function handleAuthSubmit(values) {

  const root = getAuthRoot();

  // Hentikan jika kontainer tidak ada atau permintaan sebelumnya masih berjalan
  if (!root || authState.loading) return;

  // Simpan nilai input ke state agar tidak hilang saat render ulang
  authState.name = values.name || "";

  authState.email = values.email || "";

  authState.password = values.password || "";

  authState.remember =
    Boolean(values.remember);

  // Bersihkan error/pesan lama, lalu tampilkan kondisi loading
  authState.errors = {};

  authState.message = "";

  authState.loading = true;

  renderAuthentication(root);

  try {

    // Kirim data ke logika autentikasi
    const result =
      await submitAuthentication({

        mode: authState.mode,

        role: authState.role,

        name: authState.name,

        email: authState.email,

        password: authState.password,

        remember: authState.remember

      });

    authState.loading = false;

    if (result.success) {

      /* LOGIN SUCCESS */

      // Login berhasil: langsung menuju dashboard sesuai peran
      if (result.action === "login") {

        navigateToRoleHome(
          result.session
        );

        return;
      }

      /* REGISTRATION SUCCESS */

      // Registrasi berhasil: kembali ke form login dengan pesan sukses
      if (result.action === "register") {

        authState.mode = "login";

        authState.password = "";

        authState.message =
          result.message || "";

      }

      /* FORGOT PASSWORD SUCCESS */

      // Permintaan reset password berhasil: tampilkan pesan
      else if (result.action === "forgot") {

        authState.message =
          result.message || "";

        authState.password = "";

      }

    } else {

      // Gagal: tampilkan error per field dan pesan umum
      authState.errors =
        result.errors || {};

      authState.message =
        result.message ||
        "Periksa kembali data yang dimasukkan.";

    }

  } catch (error) {

    // Kesalahan tak terduga (misalnya masalah jaringan atau bug)
    authState.loading = false;

    authState.message =
      "Terjadi kesalahan saat memproses autentikasi.";

    console.error(
      "ECOSORT AUTH ERROR:",
      error
    );

  }

  // Render ulang untuk menampilkan hasil terbaru
  renderAuthentication(root);

}

/* =====================================================
   SUPER ADMIN AUTHENTICATION
===================================================== */

// Menangani pengiriman form login Super Admin.
async function handleSuperAdminSubmit(values) {

  const root = getAuthRoot();

  // Hentikan jika kontainer tidak ada atau masih loading
  if (!root || authState.loading) return;

  authState.email = values.email || "";

  authState.password = values.password || "";

  authState.errors = {};

  authState.loading = true;

  renderAuthentication(root);

  try {

    const result =
      await submitSuperAdminAuthentication({

        email: authState.email,

        password: authState.password

      });

    authState.loading = false;

    // Berhasil: menuju dashboard Super Admin
    if (result.success) {

      navigateToRoleHome(
        result.session
      );

      return;

    }

    // Gagal: simpan error untuk ditampilkan
    authState.errors =
      result.errors || {};

  } catch (error) {

    authState.loading = false;

    console.error(
      "ECOSORT SUPER ADMIN ERROR:",
      error
    );

  }

  renderAuthentication(root);

}

/* =====================================================
   GOOGLE LOGIN
===================================================== */

// Menangani klik login Google: meminta proses login lalu menampilkan
// pesan hasilnya pada tampilan autentikasi.
function handleGoogleLogin() {

  const result = requestGoogleLogin();

  authState.message = result.message;

  const root = getAuthRoot();

  if (root) {

    renderAuthentication(root);

  }

}

/* =====================================================
   ROLE PAGE ACCESS GUARD
===================================================== */

// Penjaga akses: memastikan pengguna hanya membuka halaman sesuai perannya.
// Mengembalikan true jika akses diizinkan, false jika dialihkan.
export function protectRolePage() {

  const session = getActiveSession();

  const pathname =
    window.location.pathname;

  // Tentukan peran yang dibutuhkan dari folder halaman saat ini
  const expectedRole =
    pathname.includes("/pages/user/")
      ? "User"
      : pathname.includes("/pages/subadmin/")
        ? "Sub Admin"
        : pathname.includes("/pages/superadmin/")
          ? "Super Admin"
          : null;

  // Bukan halaman khusus peran (mis. landing/login): tidak perlu dijaga
  if (!expectedRole) return true;

  /* SESSION NOT FOUND */

  // Belum login: arahkan ke halaman login
  if (!session) {

    window.location.assign(
      pageUrl("../login.html")
    );

    return false;

  }

  /* ROLE NOT AUTHORIZED */

  // Sudah login tetapi peran tidak sesuai: arahkan ke dashboard miliknya
  if (session.role !== expectedRole) {

    navigateToRoleHome(session);

    return false;

  }

  return true;

}

/* =====================================================
   LOGOUT HANDLER
===================================================== */

// Keluar dari sesi; jika berhasil, kembali ke halaman landing.
// Mengembalikan status keberhasilan logout.
export function handleLogout() {

  const success = logout();

  if (success) {
    window.location.assign(pageUrl("../landing.html"));
  }

  return success;

}

/* =====================================================
   APPLICATION INITIALIZATION
===================================================== */

// Titik masuk aplikasi: menentukan apa yang dijalankan sesuai halaman.
export function initializeApplication() {

  const authRoot = getAuthRoot();

  /* AUTHENTICATION PAGE */

  // Jika ada kontainer autentikasi, ini halaman login: render lalu selesai
  if (authRoot) {

    renderAuthentication(authRoot);

    return;

  }

  /* ROLE ACCESS VALIDATION */

  // Validasi akses untuk halaman khusus peran
  const allowed = protectRolePage();

  // Jika dialihkan, hentikan proses inisialisasi
  if (!allowed) return;

  /* LANDING PAGE */

  // Aktifkan interaksi halaman landing
  initializeLanding();

}

/* =====================================================
   DOM READY
===================================================== */

// Jalankan inisialisasi setelah DOM siap:
// jika dokumen masih dimuat, tunggu DOMContentLoaded; jika tidak, langsung jalan.
if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApplication,
    { once: true }
  );

} else {

  initializeApplication();

}