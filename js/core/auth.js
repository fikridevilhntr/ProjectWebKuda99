/* =====================================================
   ECOSORT - AUTHENTICATION CORE
   Source: src/App.tsx
   Original login delay: 350ms
   Super Admin login delay: 450ms
===================================================== */

// Berkas logika autentikasi: validasi form, penyimpanan akun lokal
// (prototipe tanpa server), pembuatan dan pemulihan sesi, login, registrasi,
// lupa password, login Super Admin, dan logout.

// Fungsi bantu penyimpanan dari database.js (localStorage/sessionStorage)
import {
  readLocal,
  writeLocal,
  getTemporarySession,
  getPersistentSession,
  saveTemporarySession,
  savePersistentSession,
  removeTemporarySession,
  removePersistentSession,
  isRole
} from "./database.js";

/* =====================================================
   AUTHENTICATION CONSTANTS
===================================================== */

// Mode form autentikasi yang diizinkan
export const AUTH_MODES = [
  "login",
  "register",
  "forgot"
];

// Kumpulan pesan yang ditampilkan ke pengguna (error validasi dan info)
export const AUTH_MESSAGES = {
  name: "Nama minimal 3 karakter.",
  email: "Masukkan alamat email yang valid.",
  password: "Kata sandi minimal 8 karakter.",

  requiredEmail: "Email wajib diisi.",
  requiredPassword: "Password wajib diisi.",

  forgot:
    "Permintaan pemulihan tercatat pada prototipe ini. Pengiriman email memerlukan backend.",

  register:
    "Akun berhasil dibuat. Silakan masuk dengan email dan kata sandi kamu.",

  emailTaken:
    "Email sudah terdaftar. Silakan masuk.",

  emailNotFound:
    "Akun dengan email ini belum terdaftar.",

  wrongPassword:
    "Kata sandi salah.",

  wrongSuperAdmin:
    "Email atau kata sandi Super Admin salah.",

  google:
    "Login dengan Google akan tersedia setelah integrasi autentikasi selesai dikonfigurasi."
};

// Jeda buatan (ms) untuk mensimulasikan proses ke server
export const NORMAL_LOGIN_DELAY = 350;
export const SUPERADMIN_LOGIN_DELAY = 450;

/* =====================================================
   ROLE CONFIGURATION
===================================================== */

// Peran yang boleh dipilih lewat form biasa (Super Admin punya jalur sendiri)
export const AUTH_ROLES = [
  "User",
  "Sub Admin"
];

/* =====================================================
   VALIDATION
===================================================== */

// Pemeriksaan format email sederhana: ada teks, "@", teks, ".", lalu teks,
// dan tanpa spasi
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Memvalidasi form login/register/forgot.
// - nama hanya diperiksa saat registrasi (minimal 3 karakter)
// - email selalu diperiksa formatnya
// - password diperiksa (minimal 8 karakter) kecuali mode lupa password
// Mengembalikan { valid, errors } dengan errors berisi pesan per field.
export function validateAuthForm({
  mode,
  name = "",
  email = "",
  password = ""
}) {
  const errors = {};

  if (
    mode === "register" &&
    name.trim().length < 3
  ) {
    errors.name = AUTH_MESSAGES.name;
  }

  if (!isValidEmail(email)) {
    errors.email = AUTH_MESSAGES.email;
  }

  if (
    mode !== "forgot" &&
    password.length < 8
  ) {
    errors.password = AUTH_MESSAGES.password;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// Validasi form Super Admin: hanya memastikan email dan password tidak kosong
export function validateSuperAdminForm({
  email = "",
  password = ""
}) {
  const errors = {};

  if (!email.trim()) {
    errors.email = AUTH_MESSAGES.requiredEmail;
  }

  if (!password) {
    errors.password = AUTH_MESSAGES.requiredPassword;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/* =====================================================
   DELAY HELPER
===================================================== */

// Menunda eksekusi selama sejumlah milidetik (dipakai dengan await)
function wait(milliseconds) {
  return new Promise(resolve => {
    window.setTimeout(resolve, milliseconds);
  });
}

/* =====================================================
   ACCOUNT STORAGE (prototipe, tanpa server)
   Kata sandi disimpan sebagai hash SHA-256 + salt,
   bukan teks asli. Ini hanya untuk prototipe lokal.
===================================================== */

// Kunci penyimpanan lokal untuk daftar akun
const ACCOUNTS_KEY = "accounts";

/* Akun Super Admin bawaan prototipe (ubah sesuai kebutuhan). */
export const SUPER_ADMIN_ACCOUNT = {
  email: "superadmin@ecosort.id",
  password: "EcoSort@2026"
};

// Menyeragamkan email: ubah ke teks, buang spasi tepi, huruf kecil
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Membaca daftar akun; jika data rusak atau bukan array, dipakai array kosong
function readAccounts() {
  return readLocal(ACCOUNTS_KEY, [], Array.isArray);
}

// Mencari akun berdasarkan email (tanpa membedakan huruf besar/kecil).
// Mengembalikan akun, atau null jika tidak ditemukan.
function findAccount(email) {
  const target = normalizeEmail(email);
  return readAccounts().find(
    account => normalizeEmail(account.email) === target
  ) || null;
}

// Membuat salt acak 16 byte dalam format heksadesimal.
// Memakai crypto yang aman bila tersedia, jika tidak, Math.random sebagai cadangan.
function randomSalt() {
  const bytes = new Uint8Array(16);

  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Ubah tiap byte menjadi 2 digit heksadesimal lalu gabungkan
  return Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

// Meng-hash password dengan salt memakai SHA-256 (Web Crypto API).
// Mengembalikan hash dalam bentuk string heksadesimal.
async function hashPassword(password, salt) {
  // Gabungkan salt dan password lalu ubah menjadi byte
  const data = new TextEncoder().encode(`${salt}:${password}`);

  if (window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(digest), byte =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  /* Cadangan sederhana bila Web Crypto tidak tersedia. */
  // Hash djb2: jauh lebih lemah dari SHA-256, hanya untuk kompatibilitas
  let hash = 5381;

  for (const byte of data) {
    hash = ((hash << 5) + hash + byte) >>> 0;
  }

  return `fallback-${hash.toString(16)}`;
}


/* =====================================================
   REGISTER
   Original:
   writeLocal("prototype-profile", {name, email})
===================================================== */

// Membuat akun baru dan menyimpannya di penyimpanan lokal.
// Alur: validasi nama dan email -> cek email belum dipakai -> hash password
// -> simpan akun -> simpan profil prototipe.
export async function registerProfile({
  name,
  email,
  password,
  role = "User"
}) {
  // Nama harus ada dan minimal 3 karakter
  if (!name || name.trim().length < 3) {
    return {
      success: false,
      errors: { name: AUTH_MESSAGES.name },
      message: ""
    };
  }

  // Email harus ada dan formatnya valid
  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      errors: { email: AUTH_MESSAGES.email },
      message: ""
    };
  }

  // Tolak jika email sudah terdaftar
  if (findAccount(email)) {
    return {
      success: false,
      errors: { email: AUTH_MESSAGES.emailTaken },
      message: ""
    };
  }

  // Peran di luar daftar yang diizinkan dikembalikan ke "User"
  const safeRole = AUTH_ROLES.includes(role) ? role : "User";

  try {
    // Hash password dengan salt unik; password asli tidak disimpan
    const salt = randomSalt();
    const hash = await hashPassword(password, salt);

    // Tambahkan akun baru ke daftar akun yang sudah ada
    writeLocal(ACCOUNTS_KEY, [
      ...readAccounts(),
      {
        name: name.trim(),
        email: email.trim(),
        role: safeRole,
        salt,
        hash,
        createdAt: new Date().toISOString()
      }
    ]);

    // Simpan profil ringkas (perilaku dari prototipe asli)
    writeLocal("prototype-profile", {
      name: name.trim(),
      email: email.trim()
    });

    return {
      success: true,
      message: AUTH_MESSAGES.register
    };
  } catch (error) {
    console.error("ECOSORT: Registrasi gagal.", error);

    return {
      success: false,
      errors: {},
      message: "Akun gagal disimpan."
    };
  }
}

/* =====================================================
   FORGOT PASSWORD
   Original prototype does not send email.
===================================================== */

// Memproses permintaan pemulihan password.
// Pada prototipe ini hanya memvalidasi email dan memberi pesan;
// tidak ada email yang benar-benar dikirim.
export function requestPasswordRecovery(email) {
  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      message: AUTH_MESSAGES.email
    };
  }

  return {
    success: true,
    message: AUTH_MESSAGES.forgot
  };
}

/* =====================================================
   CREATE NORMAL USER SESSION
===================================================== */

// Membuat sesi untuk User/Sub Admin.
// remember = true -> sesi persisten (bertahan setelah browser ditutup);
// remember = false -> sesi sementara (hilang saat tab/browser ditutup).
export function createUserSession({
  role,
  email,
  remember = false
}) {
  // Peran harus termasuk peran yang diizinkan
  if (!AUTH_ROLES.includes(role)) {
    return {
      success: false,
      message: "Role tidak valid."
    };
  }

  // Email harus valid
  if (!email || !isValidEmail(email)) {
    return {
      success: false,
      message: AUTH_MESSAGES.email
    };
  }

  const session = {
    role,
    email
  };

  try {
    if (remember) {
      savePersistentSession(session);
    } else {
      saveTemporarySession(session);
    }

    return {
      success: true,
      session
    };

  } catch (error) {
    console.error(
      "ECOSORT: Gagal menyimpan session.",
      error
    );

    return {
      success: false,
      message: "Session gagal disimpan."
    };
  }
}

/* =====================================================
   CREATE SUPER ADMIN SESSION
===================================================== */

// Membuat sesi Super Admin. Selalu sementara (tidak ada opsi "ingat saya").
export function createSuperAdminSession(email) {
  if (!email || !email.trim()) {
    return {
      success: false,
      message: AUTH_MESSAGES.requiredEmail
    };
  }

  const session = {
    role: "Super Admin",
    email: email.trim()
  };

  try {
    saveTemporarySession(session);

    return {
      success: true,
      session
    };

  } catch (error) {
    console.error(
      "ECOSORT: Super Admin session gagal.",
      error
    );

    return {
      success: false,
      message: "Session gagal disimpan."
    };
  }
}

/* =====================================================
   RESTORE SESSION
===================================================== */

// Mengambil sesi aktif. Sesi persisten diprioritaskan di atas sesi sementara.
// Sesi hanya dianggap valid jika perannya dikenal dan email berupa teks;
// selain itu mengembalikan null.
export function getActiveSession() {
  const persistent = getPersistentSession();
  const temporary = getTemporarySession();

  const candidate = persistent || temporary;

  if (
    candidate &&
    isRole(candidate.role) &&
    typeof candidate.email === "string"
  ) {
    return candidate;
  }

  return null;
}

/* =====================================================
   AUTHENTICATION CHECK
===================================================== */

// True jika ada sesi aktif yang valid
export function isAuthenticated() {
  return getActiveSession() !== null;
}

// True jika pengguna yang sedang login memiliki peran yang ditanyakan
export function hasRole(role) {
  const session = getActiveSession();

  return Boolean(
    session &&
    session.role === role
  );
}

/* =====================================================
   NORMAL LOGIN SUBMISSION
   Original delay: 350ms
===================================================== */

// Memproses login User/Sub Admin.
// Alur: validasi form -> cek peran -> jeda simulasi -> cari akun
// -> bandingkan hash password -> cocokkan peran akun -> buat sesi.
export async function submitNormalLogin({
  role = "User",
  email = "",
  password = "",
  remember = false
}) {
  const validation = validateAuthForm({
    mode: "login",
    email,
    password
  });

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  if (!AUTH_ROLES.includes(role)) {
    return {
      success: false,
      errors: {
        role: "Role tidak valid."
      }
    };
  }

  await wait(NORMAL_LOGIN_DELAY);

  // Akun harus sudah terdaftar
  const account = findAccount(email);

  if (!account) {
    return {
      success: false,
      errors: { email: AUTH_MESSAGES.emailNotFound }
    };
  }

  // Hash password yang diketik dengan salt milik akun, lalu bandingkan
  const hash = await hashPassword(password, account.salt);

  if (hash !== account.hash) {
    return {
      success: false,
      errors: { password: AUTH_MESSAGES.wrongPassword }
    };
  }

  // Peran yang dipilih di form harus sama dengan peran akun
  if (account.role !== role) {
    return {
      success: false,
      errors: {
        email:
          `Akun ini terdaftar sebagai ${account.role}. ` +
          "Pilih peran yang sesuai."
      }
    };
  }

  // Semua pemeriksaan lolos: buat sesi
  const result = createUserSession({
    role,
    email: account.email,
    remember
  });

  return {
    ...result,
    errors: {},
    action: "login"
  };
}

/* =====================================================
   REGISTER SUBMISSION
   Original delay: 350ms
===================================================== */

// Memproses pengiriman form registrasi: validasi, jeda simulasi,
// lalu membuat akun. Hasilnya menandai action "register" dan mode berikutnya "login".
export async function submitRegistration({
  name = "",
  email = "",
  password = "",
  role = "User"
}) {
  const validation = validateAuthForm({
    mode: "register",
    name,
    email,
    password
  });

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  await wait(NORMAL_LOGIN_DELAY);

  const result = await registerProfile({
    name,
    email,
    password,
    role
  });

  return {
    errors: {},
    ...result,
    action: "register",
    nextMode: "login"
  };
}

/* =====================================================
   FORGOT PASSWORD SUBMISSION
   Original delay: 350ms
===================================================== */

// Memproses pengiriman form lupa password: validasi email, jeda simulasi,
// lalu memanggil requestPasswordRecovery.
export async function submitForgotPassword({
  email = ""
}) {
  const validation = validateAuthForm({
    mode: "forgot",
    email
  });

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  await wait(NORMAL_LOGIN_DELAY);

  return {
    ...requestPasswordRecovery(email),
    errors: {},
    action: "forgot"
  };
}

/* =====================================================
   AUTHENTICATION FORM HANDLER
===================================================== */

// Pintu masuk tunggal untuk form autentikasi:
// meneruskan ke fungsi yang sesuai dengan mode (forgot / register / login).
export async function submitAuthentication({
  mode = "login",
  role = "User",
  name = "",
  email = "",
  password = "",
  remember = false
}) {
  // Tolak mode yang tidak dikenal
  if (!AUTH_MODES.includes(mode)) {
    return {
      success: false,
      message: "Mode autentikasi tidak valid.",
      errors: {}
    };
  }

  if (mode === "forgot") {
    return submitForgotPassword({
      email
    });
  }

  if (mode === "register") {
    return submitRegistration({
      name,
      email,
      password,
      role
    });
  }

  // Mode default: login
  return submitNormalLogin({
    role,
    email,
    password,
    remember
  });
}

/* =====================================================
   SUPER ADMIN LOGIN
   Original delay: 450ms
   Original validation only checks non-empty fields.
===================================================== */

// Memproses login Super Admin dengan membandingkan input terhadap
// SUPER_ADMIN_ACCOUNT. Email dibandingkan tanpa memperhatikan huruf besar/kecil,
// password dibandingkan apa adanya.
export async function submitSuperAdminAuthentication({
  email = "",
  password = ""
}) {
  const validation = validateSuperAdminForm({
    email,
    password
  });

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  await wait(SUPERADMIN_LOGIN_DELAY);

  // Kredensial valid hanya jika email DAN password sama persis
  const validCredentials =
    normalizeEmail(email) ===
    normalizeEmail(SUPER_ADMIN_ACCOUNT.email) &&
    password === SUPER_ADMIN_ACCOUNT.password;

  if (!validCredentials) {
    return {
      success: false,
      errors: { password: AUTH_MESSAGES.wrongSuperAdmin }
    };
  }

  const result = createSuperAdminSession(email);

  return {
    ...result,
    errors: {},
    action: "superadmin-login"
  };
}

/* =====================================================
   LOGOUT
   Original:
   remove localStorage session
   remove sessionStorage session
===================================================== */

// Menghapus sesi persisten dan sementara.
// Mengembalikan true jika berhasil, false jika terjadi error.
export function logout() {
  try {
    removePersistentSession();
    removeTemporarySession();

    return true;

  } catch (error) {
    console.error(
      "ECOSORT: Logout gagal.",
      error
    );

    return false;
  }
}

/* =====================================================
   GOOGLE LOGIN
   Original prototype message only.
===================================================== */

// Placeholder login Google: belum ada integrasi, selalu mengembalikan pesan info
export function requestGoogleLogin() {
  return {
    success: false,
    message: AUTH_MESSAGES.google
  };
}

/* =====================================================
   AVAILABLE ROLES
===================================================== */

// Mengembalikan salinan daftar peran, sehingga array aslinya tidak bisa
// diubah dari luar
export function getAvailableRoles() {
  return [...AUTH_ROLES];
}