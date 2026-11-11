/* =====================================================
   ECOSORT - DATABASE MODULE
   Original source: src/App.tsx
   Migration: Pure JavaScript ES Modules
===================================================== */

// Berkas ini adalah "database" prototipe berbasis penyimpanan browser
// (localStorage dan sessionStorage). Isinya: konfigurasi kunci penyimpanan,
// validator, pembaca/penulis data, utilitas CSV, data awal (seed),
// riwayat klasifikasi, dan pengelolaan sesi.

/* =====================================================
   STORAGE CONFIGURATION
===================================================== */

// Awalan untuk semua kunci localStorage milik aplikasi ini, agar tidak
// bentrok dengan data aplikasi lain pada domain yang sama
export const STORAGE_PREFIX = "ecosort:";

// Daftar peran yang valid di aplikasi
export const ROLES = [
  "Super Admin",
  "Sub Admin",
  "User"
];

// Daftar nama halaman yang valid di aplikasi
export const PAGES = [
  "dashboard",
  "users",
  "waste",
  "guides",
  "dataset",
  "model",
  "classify",
  "history",
  "reports",
  "profile",
  "settings"
];

/* =====================================================
   ROLE VALIDATION
===================================================== */

// True jika nilai berupa teks dan termasuk dalam daftar peran
export function isRole(value) {
  return (
    typeof value === "string" &&
    ROLES.includes(value)
  );
}

/* =====================================================
   PAGE VALIDATION
===================================================== */

// True jika nilai berupa teks dan termasuk dalam daftar halaman
export function isPage(value) {
  return (
    typeof value === "string" &&
    PAGES.includes(value)
  );
}

/* =====================================================
   DATA ITEM VALIDATION
===================================================== */

// Memeriksa bahwa nilai adalah array item data yang bentuknya benar:
// setiap item harus objek dan memiliki field id, name, type, category,
// status, dan description yang semuanya berupa teks.
// Dipakai sebagai validator saat membaca data dari penyimpanan.
export function isDataItemArray(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      // Tolak null, undefined, atau nilai non-objek
      if (!item || typeof item !== "object") {
        return false;
      }

      const record = item;

      return [
        "id",
        "name",
        "type",
        "category",
        "status",
        "description"
      ].every(
        (field) =>
          typeof record[field] === "string"
      );
    })
  );
}

/* =====================================================
   ORIGINAL LOCAL STORAGE READER
===================================================== */

// Membaca data JSON dari localStorage dengan aman.
// - key      : nama kunci (awalan STORAGE_PREFIX ditambahkan otomatis)
// - fallback : nilai yang dikembalikan jika data tidak ada, rusak, atau
//              gagal validasi
// - validate : fungsi pemeriksa bentuk data (opsional)
// Jika data gagal validasi, salinan cadangannya disimpan sekali ke kunci
// "...:invalid-backup" agar data asli tidak hilang begitu saja.
export function readLocal(
  key,
  fallback,
  validate
) {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  try {
    const value = window.localStorage.getItem(
      storageKey
    );

    // Tidak ada data tersimpan
    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    // Lolos validasi (atau tidak ada validator): kembalikan data
    if (!validate || validate(parsed)) {
      return parsed;
    }

    // Data tidak valid: simpan cadangan satu kali (tidak menimpa cadangan lama)
    const backupKey =
      `${storageKey}:invalid-backup`;

    if (
      !window.localStorage.getItem(backupKey)
    ) {
      window.localStorage.setItem(
        backupKey,
        value
      );
    }

    return fallback;

  } catch {
    // JSON rusak atau localStorage tidak dapat diakses
    return fallback;
  }
}

/* =====================================================
   ORIGINAL LOCAL STORAGE WRITER
===================================================== */

// Menyimpan nilai (diubah ke JSON) ke localStorage dengan awalan kunci.
// Tidak ada try/catch di sini: error (mis. penyimpanan penuh) akan dilempar
// ke pemanggil.
export function writeLocal(key, value) {
  window.localStorage.setItem(
    `${STORAGE_PREFIX}${key}`,
    JSON.stringify(value)
  );
}

/* =====================================================
   ORIGINAL CSV DOWNLOAD
===================================================== */

// Mengunduh teks sebagai file di browser.
// Caranya: bungkus isi menjadi Blob, buat tautan sementara, klik otomatis,
// lalu hapus tautan dan lepaskan URL agar memori tidak bocor.
export function downloadFile(
  filename,
  content,
  type = "text/csv"
) {
  const blob = new Blob(
    [content],
    {
      type: `${type};charset=utf-8`
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

/* =====================================================
   ORIGINAL CSV CONVERTER
===================================================== */

// Mengubah array objek menjadi teks CSV.
// Header diambil dari kunci objek pertama; setiap nilai dibungkus tanda
// kutip dan tanda kutip di dalamnya digandakan (aturan CSV standar).
// Array kosong menghasilkan string kosong.
export function toCsv(rows) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  // Pembungkus nilai CSV: "nilai" dengan " di dalamnya menjadi ""
  const escape = (value) =>
    `"${String(value).replace(/"/g, '""')}"`;

  return [
    headers.map(escape).join(","),
    ...rows.map((row) =>
      headers
        .map((header) => escape(row[header]))
        .join(",")
    )
  ].join("\n");
}

/* =====================================================
   ORIGINAL WASTE DATA
===================================================== */

// Data awal jenis sampah. Dipakai sebagai dasar seed untuk halaman
// "waste" dan "guides" (lihat seedForKind).
export const wasteRows = [
  {
    name: "Kulit pisang",
    type: "Sisa makanan",
    category: "Organik",
    material: "Bahan alami",
    status: "Aktif"
  },
  {
    name: "Botol air mineral",
    type: "Botol plastik",
    category: "Anorganik",
    material: "Plastik PET",
    status: "Aktif"
  },
  {
    name: "Daun kering",
    type: "Sampah kebun",
    category: "Organik",
    material: "Bahan alami",
    status: "Aktif"
  },
  {
    name: "Tisu bekas",
    type: "Produk kertas",
    category: "Residu",
    material: "Kertas terkontaminasi",
    status: "Aktif"
  },
  {
    name: "Toples kaca",
    type: "Wadah kaca",
    category: "Anorganik",
    material: "Kaca",
    status: "Draft"
  }
];

/* =====================================================
   ORIGINAL USER SEED
===================================================== */

// Data awal pengguna. Tiap baris berupa [nama, email, peran, status],
// lalu diubah menjadi objek item data lengkap lewat .map di bawah.
// Peran dipakai juga sebagai "type" dan "category" agar cocok dengan bentuk
// item data umum (lihat isDataItemArray).
export const userSeed = [
  [
    "Dewi Lestari",
    "dewi@email.com",
    "User",
    "Aktif"
  ],
  [
    "Bima Saputra",
    "bima@email.com",
    "Sub Admin",
    "Aktif"
  ],
  [
    "Nadia Azzahra",
    "nadia@email.com",
    "User",
    "Aktif"
  ],
  [
    "Rian Fadli",
    "rian@email.com",
    "User",
    "Nonaktif"
  ],
  [
    "Maya Sari",
    "maya@email.com",
    "User",
    "Aktif"
  ]
].map(
  ([name, email, category, status], index) => ({
    id: `USR-${index + 1}`,
    name,
    email,
    type: category,
    category,
    status,
    description: `Akun ${category} EcoSort`,
    joined: "12 Mei 2025"
  })
);

/* =====================================================
   DATASET SEED (data berlabel untuk evaluasi model)

   Deskripsi ditulis seperti input pengguna pada halaman
   klasifikasi (bahan, kondisi, karakteristik), karena
   itulah bentuk masukan yang diproses classifier.
   Label diberikan berdasarkan aturan pemilahan umum,
   bukan disesuaikan dengan keluaran classifier.
===================================================== */

// Tiap baris berupa [nama, jenis, kategori, status, deskripsi].
// Kelompok data (dipisah baris kosong): Organik, Anorganik, B3, Residu,
// lalu dua contoh berstatus "Draft" (label belum final).
// Perhatikan: kategori "B3" ada di dataset ini, sedangkan dashboard hanya
// menghitung Organik, Anorganik, dan Residu.
export const datasetSampleSeed = [
  ["Kulit pisang", "Sisa makanan", "Organik", "Aktif", "Kulit pisang sisa makanan, masih basah, dan tidak tercampur bahan kimia."],
  ["Ampas kopi", "Sisa minuman", "Organik", "Aktif", "Ampas kopi sisa seduhan yang sudah dingin dan mudah terurai menjadi kompos."],
  ["Daun kering", "Sampah kebun", "Organik", "Aktif", "Daun kering dan ranting kecil hasil menyapu halaman rumah."],
  ["Sisa sayuran", "Sisa makanan", "Organik", "Aktif", "Potongan sisa sayur dan kulit wortel dari dapur yang belum busuk."],
  ["Kulit jeruk", "Sisa buah", "Organik", "Aktif", "Kulit buah jeruk sisa makan siang, basah, dan bisa dijadikan kompos."],
  ["Ampas teh", "Sisa minuman", "Organik", "Aktif", "Ampas teh sisa seduhan pagi hari yang masih basah dan mudah terurai."],
  ["Sisa nasi", "Sisa makanan", "Organik", "Aktif", "Sisa makanan berupa nasi dan lauk yang tidak habis dan sudah basi."],
  ["Potongan rumput", "Sampah kebun", "Organik", "Aktif", "Rumput dan daun hasil pangkas taman yang masih segar dan mudah terurai."],

  ["Botol air mineral", "Botol plastik", "Anorganik", "Aktif", "Botol plastik PET bekas air mineral, sudah kosong, bersih, dan sudah dibilas."],
  ["Kaleng minuman", "Kaleng", "Anorganik", "Aktif", "Kaleng aluminium bekas minuman yang sudah kosong dan bersih."],
  ["Kardus bekas", "Kemasan kertas", "Anorganik", "Aktif", "Kardus bekas kemasan paket, masih kering dan tidak terkontaminasi."],
  ["Toples kaca", "Wadah kaca", "Anorganik", "Aktif", "Toples kaca bekas selai, kosong, dan sudah dibilas bersih."],
  ["Koran bekas", "Kertas", "Anorganik", "Aktif", "Koran bekas yang masih kering dan bersih, bisa digunakan kembali."],
  ["Botol sirup", "Botol kaca", "Anorganik", "Aktif", "Botol kaca bekas sirup yang sudah kosong dan dicuci."],
  ["Kaleng sarden", "Kaleng", "Anorganik", "Aktif", "Kaleng logam bekas sarden yang sudah kosong dan dibilas."],
  ["Galon air", "Wadah plastik", "Anorganik", "Aktif", "Galon plastik HDPE bekas air minum, bersih dan masih bisa digunakan kembali."],

  ["Baterai bekas", "Limbah elektronik", "B3", "Aktif", "Baterai bekas remote televisi yang sudah habis dayanya."],
  ["Lampu LED rusak", "Limbah elektronik", "B3", "Aktif", "Lampu LED rumah tangga yang sudah mati dan tidak dipakai lagi."],
  ["Sisa cat tembok", "Bahan kimia", "B3", "Aktif", "Sisa cat tembok dalam kaleng yang sudah mengering sebagian."],
  ["Obat kedaluwarsa", "Limbah medis", "B3", "Aktif", "Obat tablet dan sirup kedaluwarsa dari kotak obat keluarga."],
  ["Jarum suntik", "Benda tajam", "B3", "Aktif", "Jarum suntik bekas pemakaian di rumah, ujungnya masih terbuka."],
  ["Botol pestisida", "Bahan kimia", "B3", "Aktif", "Botol pestisida semprot tanaman yang masih berisi sisa cairan."],
  ["Ponsel rusak", "Limbah elektronik", "B3", "Aktif", "Ponsel lama yang rusak dan tidak bisa menyala lagi."],
  ["Aki motor", "Limbah kendaraan", "B3", "Aktif", "Aki motor bekas yang sudah tidak berfungsi dan cairannya mulai bocor."],

  ["Tisu bekas", "Produk kertas", "Residu", "Aktif", "Tisu bekas pakai yang kotor terkena makanan dan tidak bisa didaur ulang."],
  ["Popok bayi", "Produk higienis", "Residu", "Aktif", "Popok bayi sekali pakai yang sudah terpakai."],
  ["Puntung rokok", "Sisa rokok", "Residu", "Aktif", "Puntung rokok sisa merokok yang sudah padam."],
  ["Styrofoam", "Kemasan", "Residu", "Aktif", "Styrofoam bekas kotak makanan dengan sisa minyak menempel."],
  ["Sachet kopi", "Kemasan", "Residu", "Aktif", "Sachet kopi instan bekas, kemasan multilapis yang sulit didaur ulang."],
  ["Pembalut bekas", "Produk higienis", "Residu", "Aktif", "Pembalut bekas pakai yang sudah dibungkus plastik kantong."],
  ["Masker sekali pakai", "Produk higienis", "Residu", "Aktif", "Masker sekali pakai bekas yang sudah kotor dan tidak bisa dibersihkan."],
  ["Kertas minyak", "Kemasan", "Residu", "Aktif", "Kertas minyak bekas bungkus gorengan, berminyak dan tidak bisa dibersihkan."],

  ["Kain perca", "Tekstil", "Residu", "Draft", "Potongan kain perca bekas jahitan, kategori belum dipastikan."],
  ["Kantong belanja", "Kemasan", "Anorganik", "Draft", "Kantong belanja bekas, menunggu peninjauan label."]
].map(
  // Ubah tiap baris menjadi objek dengan id berurutan: DT-001, DT-002, dst.
  ([name, type, category, status, description], index) => ({
    id: `DT-${String(index + 1).padStart(3, "0")}`,
    name,
    type,
    category,
    status,
    description
  })
);

/* =====================================================
   ORIGINAL DATA SEED GENERATOR
===================================================== */

// Mengembalikan data awal sesuai jenis halaman:
// - "users"   -> userSeed
// - "dataset" -> datasetSampleSeed
// - lainnya ("waste" atau "guides") -> dibangun dari wasteRows
export function seedForKind(kind) {
  if (kind === "users") {
    return userSeed;
  }

  if (kind === "dataset") {
    return datasetSampleSeed;
  }

  // Nama panduan, urutannya sejajar dengan baris pada wasteRows
  const guideNames = [
    "Cara membuat kompos",
    "Daur ulang botol PET",
    "Mengelola daun kering",
    "Penanganan tisu bekas",
    "Memilah wadah kaca"
  ];

  // Id berurutan: ES-001, ES-002, dst. Untuk "guides", nama dan deskripsi
  // berupa panduan; untuk "waste", nama sampah dan material utama.
  return wasteRows.map((row, index) => ({
    id: `ES-${String(index + 1).padStart(3, "0")}`,
    name:
      kind === "guides"
        ? guideNames[index]
        : row.name,
    type: row.type,
    category: row.category,
    status: row.status,
    description:
      kind === "guides"
        ? `Panduan praktis untuk ${row.name.toLowerCase()}.`
        : `Material utama: ${row.material}.`
  }));
}

/* =====================================================
   ORIGINAL HISTORY STORAGE
===================================================== */

/* Riwayat milik user: record lama tanpa ownerEmail tetap terlihat (kompatibilitas). */
// Memeriksa apakah sebuah catatan riwayat milik email tertentu.
// Catatan tanpa ownerEmail dianggap milik semua orang (data lama).
// Perbandingan email tidak membedakan huruf besar/kecil dan spasi tepi.
export function isHistoryOwnedBy(record, email) {
  const owner = String(record?.ownerEmail || "").trim().toLowerCase();
  return !owner || owner === String(email || "").trim().toLowerCase();
}

// Mengambil seluruh riwayat klasifikasi (semua pengguna; penyaringan
// per pemilik dilakukan di pemanggil dengan isHistoryOwnedBy)
export function getHistory() {
  return readLocal("history-v2", []);
}

// Menyimpan seluruh daftar riwayat klasifikasi
export function saveHistory(records) {
  writeLocal("history-v2", records);
}

/* =====================================================
   ORIGINAL DATA COLLECTION ACCESS
===================================================== */

// Mengambil koleksi data berdasarkan jenis. Jika belum ada atau bentuknya
// tidak valid, dipakai data awal dari seedForKind (belum otomatis disimpan).
export function getData(kind) {
  return readLocal(
    kind,
    seedForKind(kind),
    isDataItemArray
  );
}

// Menyimpan koleksi data berdasarkan jenis
export function saveData(kind, data) {
  writeLocal(kind, data);
}

/* =====================================================
   SESSION STORAGE
   Original session key:
   ecosort:session
===================================================== */

// Sesi sementara: disimpan di sessionStorage, hilang saat tab/browser ditutup.
// Mengembalikan null jika tidak ada atau datanya tidak bisa dibaca.
export function getTemporarySession() {
  try {
    const value =
      window.sessionStorage.getItem(
        "ecosort:session"
      );

    return value ? JSON.parse(value) : null;

  } catch {
    return null;
  }
}

// Menyimpan sesi sementara
export function saveTemporarySession(session) {
  window.sessionStorage.setItem(
    "ecosort:session",
    JSON.stringify(session)
  );
}

// Menghapus sesi sementara
export function removeTemporarySession() {
  window.sessionStorage.removeItem(
    "ecosort:session"
  );
}

/* =====================================================
   PERMANENT SESSION
===================================================== */

// Sesi persisten ("ingat saya"): disimpan di localStorage dengan kunci
// "ecosort:session", sehingga bertahan setelah browser ditutup
export function getPersistentSession() {
  return readLocal("session", null);
}

// Menyimpan sesi persisten
export function savePersistentSession(session) {
  writeLocal("session", session);
}

// Menghapus sesi persisten
export function removePersistentSession() {
  window.localStorage.removeItem(
    `${STORAGE_PREFIX}session`
  );
}

/* =====================================================
   CLEAR ORIGINAL ECOSORT STORAGE
===================================================== */

// Menghapus semua data localStorage milik aplikasi (kunci berawalan
// "ecosort:"), termasuk akun, riwayat, dan sesi persisten.
// Tidak menyentuh sessionStorage.
export function clearPrototypeData() {
  Object.keys(window.localStorage)
    .filter((key) =>
      key.startsWith(STORAGE_PREFIX)
    )
    .forEach((key) =>
      window.localStorage.removeItem(key)
    );
}