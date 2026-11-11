/* =====================================================
   ECOSORT - DASHBOARD MODULE
   Source: src/App.tsx

   Original components:
   - AdminDashboard
   - UserDashboard
   - StatCard
   - BarChart
   - Donut
   - ActivityList
   - HistoryList

   Migration: Pure JavaScript
===================================================== */

// Berkas ini membangun HTML (string) untuk dashboard Admin/Sub Admin dan
// dashboard User. Semua fungsi render mengembalikan string HTML yang nantinya
// disisipkan ke halaman (misalnya lewat innerHTML).


// Fungsi pembuat ikon
import { icon } from "../core/icons.js";
// Fungsi pembuat tombol dan lencana (badge) dalam bentuk string HTML
import { button, badge } from "../core/components.js";
// Pembaca penyimpanan lokal dan pemeriksa kepemilikan riwayat
import { readLocal, isHistoryOwnedBy } from "../core/database.js";
// Pengambil sesi pengguna yang sedang login
import { getActiveSession } from "./auth.js";

/* =====================================================
   HTML ESCAPE
===================================================== */

// Mengamankan teks sebelum disisipkan ke HTML dengan mengganti karakter
// khusus (& < > " ') menjadi entitas HTML. Ini mencegah injeksi HTML/XSS
// dari data yang berasal dari pengguna.
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
   PAGE TITLE
   Original component: PageTitle
===================================================== */

// Membuat judul halaman: eyebrow (teks kecil di atas, opsional), judul,
// deskripsi, dan area tombol aksi (opsional).
// Catatan: "action" tidak di-escape karena berisi HTML dari fungsi tombol.
function pageTitle({
  eyebrow,
  title,
  description,
  action = ""
}) {
  return `
    <div class="page-title">
      <div>
        ${eyebrow ? `<span>${escapeHTML(eyebrow)}</span>` : ""}
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(description)}</p>
      </div>
      ${action ? `<div class="page-title-actions">${action}</div>` : ""}
    </div>
  `;
}

/* =====================================================
   PANEL HEAD
   Original component: PanelHead
===================================================== */

// Membuat kepala panel: judul, subjudul (opsional), dan aksi di sisi kanan.
function panelHead({
  title,
  subtitle,
  action = ""
}) {
  return `
    <div class="panel-head">
      <div>
        <h3>${escapeHTML(title)}</h3>
        ${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ""}
      </div>
      ${action}
    </div>
  `;
}

/* =====================================================
   STAT CARD
   Original component: StatCard
===================================================== */

// Membuat kartu statistik: ikon berwarna (tone), judul, nilai utama,
// dan perubahan dibanding bulan lalu.
function statCard({
  title,
  value,
  change,
  iconName,
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
        <span>↗ ${escapeHTML(change)}</span> dari bulan lalu
      </div>
    </div>
  `;
}

/* =====================================================
   BAR CHART
   Original component: BarChart
===================================================== */

// Membuat diagram batang tren 7 hari. Datanya statis (contoh/prototipe),
// bukan dari data nyata. Nilai dipakai sebagai tinggi batang dalam persen.
function barChart() {
  // Nilai tiap hari (Senin sampai Minggu)
  const vals = [42, 58, 48, 74, 63, 82, 72];

  // Label hari, urutannya sesuai array nilai di atas
  const days = [
    "Sen", "Sel", "Rab", "Kam",
    "Jum", "Sab", "Min"
  ];

  return `
    <div class="bar-chart">

      <div class="y-labels">
        <span>100</span>
        <span>75</span>
        <span>50</span>
        <span>25</span>
        <span>0</span>
      </div>

      <div class="bars">
        ${vals.map((value, index) => `
          <div class="bar-col">
            <div
              class="bar"
              style="height: ${value}%"
            >
              <span>${value}</span>
            </div>

            <small>${days[index]}</small>
          </div>
        `).join("")}
      </div>

    </div>
  `;
}

/* =====================================================
   DONUT CHART
   Original component: Donut
===================================================== */

// Membuat diagram donat distribusi kategori. Angka total ("3.856") ditulis
// langsung (statis); tampilan lingkarannya diatur lewat CSS.
function donut() {
  return `
    <div class="donut">
      <div>
        <b>3.856</b>
        <span>Total</span>
      </div>
    </div>
  `;
}

/* =====================================================
   CATEGORY LEGEND
   Original JSX preserved
===================================================== */

// Membuat legenda warna untuk diagram donat: Organik, Anorganik, Residu
// beserta persentasenya (statis, contoh data).
function categoryLegend() {
  return `
    <div class="legend">

      <span>
        <i class="org"></i>
        Organik
        <b>48%</b>
      </span>

      <span>
        <i class="anorg"></i>
        Anorganik
        <b>34%</b>
      </span>

      <span>
        <i class="res"></i>
        Residu
        <b>18%</b>
      </span>

    </div>
  `;
}

/* =====================================================
   ACTIVITY LIST
   Original component: ActivityList
===================================================== */

// Membuat daftar aktivitas terbaru. Parameter sub = true untuk Sub Admin,
// false untuk Super Admin. Tiap item berupa [judul, keterangan, waktu];
// datanya statis (contoh).
function activityList(sub = false) {

  const items = sub
    ? [
      [
        "Kulit mangga",
        "Data sampah ditambahkan",
        "2 menit lalu"
      ],
      [
        "Panduan kompos rumah",
        "Panduan diperbarui",
        "1 jam lalu"
      ],
      [
        "Botol kaca",
        "Status diubah menjadi aktif",
        "3 jam lalu"
      ]
    ]
    : [
      [
        "Akun baru terdaftar",
        "Dewi Lestari bergabung sebagai User",
        "2 menit lalu"
      ],
      [
        "Dataset diperbarui",
        "20 data baru berhasil ditambahkan",
        "1 jam lalu"
      ],
      [
        "Model dilatih ulang",
        "Versi 1.0 berhasil diaktifkan",
        "3 jam lalu"
      ]
    ];

  return `
    <div class="activity-list">

      ${items.map((item, index) => {

    // Pilih ikon sesuai urutan item. Item pertama berbeda untuk Sub Admin
    // ("waste") dan Super Admin ("users").
    const iconName =
      index === 0
        ? sub ? "waste" : "users"
        : index === 1
          ? "dataset"
          : "model";

    return `
          <div>

            <span class="activity-icon a${index}">
              ${icon(iconName, 18)}
            </span>

            <p>
              <b>${escapeHTML(item[0])}</b>
              <small>${escapeHTML(item[1])}</small>
            </p>

            <time>${escapeHTML(item[2])}</time>

            ${icon("chevron", 15)}

          </div>
        `;
  }).join("")}

    </div>
  `;
}


/* =====================================================
   USER DASHBOARD - DYNAMIC HISTORY
===================================================== */

// Mengambil riwayat klasifikasi milik pengguna yang sedang login.
// Data yang rusak atau bukan milik pengguna ini disaring keluar.
function getHistoryRecords() {
  const records = readLocal("history-v2", []);

  // Jika data bukan array, anggap kosong
  if (!Array.isArray(records)) {
    return [];
  }

  const email = getActiveSession()?.email;

  // Simpan hanya catatan yang: berupa objek, milik pengguna ini,
  // dan memiliki kategori berupa teks yang tidak kosong
  return records.filter(record =>
    record &&
    typeof record === "object" &&
    !Array.isArray(record) &&
    isHistoryOwnedBy(record, email) &&
    typeof record.category === "string" &&
    record.category.trim() !== ""
  );
}

// Menentukan waktu (timestamp, ms) sebuah catatan dengan urutan prioritas:
// 1) field timestamp, 2) field id (jika berupa angka waktu),
// 3) hasil parsing field date. Mengembalikan 0 jika semuanya tidak valid.
function getRecordTimestamp(record) {
  const timestamp = Number(record.timestamp);

  if (Number.isFinite(timestamp) && timestamp > 0) {
    return timestamp;
  }

  const idTimestamp = Number(record.id);

  if (Number.isFinite(idTimestamp) && idTimestamp > 0) {
    return idTimestamp;
  }

  const parsed = Date.parse(record.date || "");

  return Number.isFinite(parsed) ? parsed : 0;
}

// Menghitung statistik dashboard User: total klasifikasi, kategori
// terfavorit, dan jumlah klasifikasi pada bulan berjalan.
function getUserDashboardStats(records) {
  // Penghitung per kategori yang dikenal
  const categories = {
    Organik: 0,
    Anorganik: 0,
    Residu: 0
  };

  records.forEach(record => {
    const category = record.category.trim();

    // Hanya hitung kategori yang ada di daftar di atas
    if (Object.prototype.hasOwnProperty.call(
      categories,
      category
    )) {
      categories[category]++;
    }
  });

  // Cari kategori dengan hitungan tertinggi.
  // Jika seri, kategori yang lebih dulu dalam daftar yang dipilih.
  let favoriteCategory = "Belum ada";
  let highestCount = 0;

  Object.entries(categories).forEach(([name, count]) => {
    if (count > highestCount) {
      highestCount = count;
      favoriteCategory = name;
    }
  });

  const now = new Date();

  // Hitung catatan yang bulan dan tahunnya sama dengan sekarang
  const thisMonth = records.filter(record => {
    const timestamp = getRecordTimestamp(record);

    if (!timestamp) return false;

    const date = new Date(timestamp);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  return {
    total: records.length,
    favoriteCategory,
    thisMonth
  };
}

/* =====================================================
   HISTORY LIST
   Original component: HistoryList

   Original storage key:
   history-v2
===================================================== */


// Membuat daftar riwayat klasifikasi.
// - compact = true menampilkan 3 item, false menampilkan 5 item
// - sourceRecords opsional; jika kosong, data dibaca dari penyimpanan lokal
function historyList(compact = false, sourceRecords = null) {

  const records = Array.isArray(sourceRecords)
    ? sourceRecords
    : getHistoryRecords();

  // Urutkan dari yang terbaru (salinan array, sehingga data asli tidak berubah)
  const sortedRecords = [...records].sort(
    (a, b) =>
      getRecordTimestamp(b) - getRecordTimestamp(a)
  );

  // Ambil sebagian saja sesuai mode tampilan
  const visibleRecords = sortedRecords.slice(
    0,
    compact ? 3 : 5
  );

  return `
    <div class="history-list">

      ${visibleRecords.map(record => {

    // Kelas warna ikon berdasarkan tone catatan
    const toneClass =
      record.tone === "blue"
        ? "c1"
        : record.tone === "gray"
          ? "c2"
          : "";

    // Nama cadangan jika catatan tidak punya nama
    const name = record.name || "Sampah tanpa nama";

    // Gunakan tanggal tersimpan; jika tidak ada, format dari timestamp
    // (locale Indonesia), dan jika itu pun tidak ada, tampilkan teks cadangan
    const date = record.date ||
      (
        getRecordTimestamp(record)
          ? new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
            timeStyle: "short"
          }).format(getRecordTimestamp(record))
          : "Tanggal tidak tersedia"
      );

    return `
          <div>

            <span class="history-symbol ${toneClass}">
              ${icon(record.icon || "classify", 18)}
            </span>

            <p>
              <b>${escapeHTML(name)}</b>
              <small>${escapeHTML(date)}</small>
            </p>

            ${badge(
      escapeHTML(record.category),
      record.tone || "green"
    )}

            ${icon("chevron", 15)}

          </div>
        `;
  }).join("")}

      ${visibleRecords.length === 0
      ? `
          <div class="dashboard-history-empty">
            Belum ada hasil klasifikasi.
            Mulai klasifikasi sampah pertamamu!
          </div>
        `
      : ""
    }

    </div>
  `;
}

/* =====================================================
   ADMIN DASHBOARD
   Original component: AdminDashboard
===================================================== */

// Merender dashboard untuk peran admin.
// role === "Sub Admin" menampilkan versi Sub Admin; selain itu versi Super Admin.
// Seluruh angka dan nama sapaan di sini statis (data contoh prototipe).
export function renderAdminDashboard(role) {

  const sub = role === "Sub Admin";

  // Tombol aksi di judul halaman; atribut data-page dipakai untuk navigasi
  const action = button(
    sub ? "Tambah data sampah" : "Impor dataset",
    {
      iconName: "plus",
      attributes: `data-page="${sub ? "waste" : "dataset"}"`
    }
  );

  // Daftar kartu statistik, isinya berbeda untuk Sub Admin dan Super Admin
  const stats = [
    {
      title: sub ? "Total Data Sampah" : "Total Pengguna",
      value: sub ? "156" : "1.248",
      change: "12,5%",
      iconName: sub ? "waste" : "users",
      tone: "green"
    },
    {
      title: sub ? "Panduan Aktif" : "Total Klasifikasi",
      value: sub ? "42" : "3.856",
      change: "8,2%",
      iconName: sub ? "guides" : "classify",
      tone: "blue"
    },
    {
      title: sub ? "Perlu Ditinjau" : "Data Berlabel",
      value: sub ? "8" : "300",
      change: "4,1%",
      iconName: "dataset",
      tone: "yellow"
    },
    {
      title: sub ? "Konten Diperbarui" : "Model Aktif",
      value: sub ? "24" : "v1.0",
      change: sub ? "6,8%" : "Decision Tree",
      iconName: sub ? "edit" : "model",
      tone: "purple"
    }
  ];

  return `

    ${pageTitle({
    eyebrow: "RINGKASAN HARI INI",

    title: `Selamat datang, ${sub ? "Aditya" : "Abiydal"}`,

    description: sub
      ? "Kelola informasi sampah dan panduan agar selalu relevan."
      : "Pantau aktivitas dan performa sistem EcoSort hari ini.",

    action
  })}

    <div class="stats-grid">

      ${stats.map(stat => statCard({
    ...stat
  })).join("")}

    </div>

    <div class="dashboard-grid">

      <div class="panel chart-panel">

        ${panelHead({
    title: sub
      ? "Aktivitas konten"
      : "Tren klasifikasi",

    subtitle: sub
      ? "Pembaruan dalam 7 hari terakhir"
      : "Jumlah klasifikasi dalam 7 hari terakhir"
  })}

        ${barChart()}

      </div>

      <div class="panel distribution">

        ${panelHead({
    title: "Distribusi kategori",
    subtitle: "Berdasarkan hasil klasifikasi"
  })}

        ${donut()}

        ${categoryLegend()}

      </div>

    </div>

    <div class="panel recent">

      ${panelHead({
    title: sub
      ? "Pembaruan terbaru"
      : "Aktivitas terbaru",

    subtitle: "Data dan aktivitas terkini",

    action: `
          <button
            class="text-button"
            data-page="${sub ? "waste" : "reports"}"
          >
            Lihat semua ${icon("arrow", 15)}
          </button>
        `
  })}

      ${activityList(sub)}

    </div>

  `;
}

/* =====================================================
   USER DASHBOARD
   Original component: UserDashboard
===================================================== */


// Merender dashboard untuk User biasa. Berbeda dari dashboard admin,
// bagian riwayat dan statistik di sini memakai data nyata dari penyimpanan
// lokal milik pengguna yang sedang login.
export function renderUserDashboard() {

  // Ambil riwayat milik pengguna, lalu urutkan dari yang terbaru
  const records = getHistoryRecords().sort(
    (a, b) =>
      getRecordTimestamp(b) - getRecordTimestamp(a)
  );

  // Hitung statistik ringkas dari riwayat tersebut
  const stats = getUserDashboardStats(records);

  const session = getActiveSession();

  const profile = readLocal("prototype-profile", null);

  // Nama sapaan hanya dipakai jika profil valid DAN emailnya sama dengan email
  // sesi aktif. Jika tidak, dipakai nama umum "pengguna EcoSort".
  const displayName =
    profile &&
      typeof profile.name === "string" &&
      profile.name.trim() &&
      typeof profile.email === "string" &&
      profile.email.toLowerCase() ===
      session?.email?.toLowerCase()
      ? profile.name.trim()
      : "pengguna EcoSort";

  return `

    <div class="user-welcome">

      <div>

        <span class="kicker">
          SELAMAT DATANG KEMBALI
        </span>

        <h1>
          Halo, ${escapeHTML(displayName)}!
          Sudah siap memilah hari ini?
        </h1>

        <p>
          Kenali karakteristik sampahmu dan dapatkan rekomendasi penanganan
          yang tepat.
        </p>

        ${button("Mulai klasifikasi", {
    iconName: "arrow",
    attributes: 'data-page="classify"'
  })}

      </div>

      <div class="welcome-art">

        ${icon("logo", 80)}

        <span class="spark s1"></span>
        <span class="spark s2"></span>
        <span class="spark s3"></span>

      </div>

    </div>

    <div class="mini-stats">

      <div>

        <span class="mini-icon">
          ${icon("classify")}
        </span>

        <p>
          Total klasifikasi
          <b>${stats.total} kali</b>
        </p>

      </div>

      <div>

        <span class="mini-icon blue">
          ${icon("logo")}
        </span>

        <p>
          Paling sering
          <b>${escapeHTML(stats.favoriteCategory)}</b>
        </p>

      </div>

      <div>

        <span class="mini-icon yellow">
          ${icon("history")}
        </span>

        <p>
          Bulan ini
          <b>${stats.thisMonth} klasifikasi</b>
        </p>

      </div>

    </div>

    <div class="user-grid">

      <div class="panel recent-user">

        ${panelHead({
    title: "Riwayat terbaru",
    subtitle: "Klasifikasi yang baru Anda lakukan"
  })}

        ${historyList(true, records)}

        ${button("Lihat semua riwayat", {
    variant: "ghost",
    full: true,
    attributes: 'data-page="history"'
  })}

      </div>

      <div class="panel tip-card">

        <span class="tip-label">
          TIPS HARI INI
        </span>

        <div class="tip-icon">
          ${icon("logo", 30)}
        </div>

        <h3>
          Bersihkan sebelum didaur ulang
        </h3>

        <p>
          Bilas kemasan plastik dan kaca sebelum memasukkannya ke tempat
          sampah anorganik.
        </p>

        <span class="tip-count">
          01 / 05
        </span>

      </div>

    </div>

  `;
}