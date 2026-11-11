/* =====================================================
   ECOSORT - UI COMPONENTS
   Converted from src/App.tsx
   Pure JavaScript / Vanilla DOM
===================================================== */

/* =====================================================
   ICON PATHS - ORIGINAL SVG DATA

   Kumpulan data path SVG untuk setiap ikon. Key adalah
   nama ikon, value adalah isi elemen <svg> (path, circle,
   rect, dll). Atribut gambar umum (stroke, ukuran, dsb)
   diatur oleh komponen Icon di bawah.
===================================================== */

const iconPaths = {
  // Logo EcoSort: daun
  logo: `
    <path d="M12 3c-1 4.8-4.8 5.6-7.3 6.7C2.3 10.8 2.1 14.4 4 16c2.4 2.1 6.6 1.3 8.2-2.4C13.4 11 12.7 7.2 12 3Z"/>
    <path d="M5 19c2.8-5.6 6.2-8.3 12-10"/>
    <path d="M14 14c1.7-1.4 3.8-1.3 5.1-.6 2.1 1.2 2.5 4.3.8 6.1-1.5 1.5-4.2 1.7-5.8.2-1.2-1.2-1.3-3-.1-5.7Z"/>
  `,

  // Dashboard: empat kotak
  dashboard: `
    <rect x="3" y="3" width="7" height="7" rx="2"/>
    <rect x="14" y="3" width="7" height="7" rx="2"/>
    <rect x="3" y="14" width="7" height="7" rx="2"/>
    <rect x="14" y="14" width="7" height="7" rx="2"/>
  `,

  // Pengguna: dua orang
  users: `
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  `,

  // Sampah: tempat sampah
  waste: `
    <path d="M3 6h18"/>
    <path d="M8 6V4h8v2M19 6l-1 15H6L5 6"/>
    <path d="M10 11v5M14 11v5"/>
  `,

  // Panduan: buku
  guides: `
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>
  `,

  // Dataset: tumpukan database
  dataset: `
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5"/>
    <path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/>
  `,

  // Model: diagram cabang (decision tree)
  model: `
    <path d="M12 2v6M12 8l-5 4M12 8l5 4"/>
    <rect x="3" y="12" width="8" height="5" rx="1"/>
    <rect x="13" y="12" width="8" height="5" rx="1"/>
    <path d="M7 17v5M17 17v5"/>
  `,

  // Klasifikasi: kotak dengan centang
  classify: `
    <path d="m9 11 3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  `,

  // Riwayat: jam
  history: `
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2M3 12H1"/>
  `,

  // Laporan: grafik garis
  reports: `
    <path d="M3 3v18h18"/>
    <path d="m7 16 4-5 3 3 5-7"/>
  `,

  // Profil: kepala dan bahu
  profile: `
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21a8 8 0 0 1 16 0"/>
  `,

  // Pengaturan: roda gigi
  settings: `
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.35.6.75 1 .9.35.15.72.2 1.1.2h.1v4h-.1a1.7 1.7 0 0 0-1.1.4 1.7 1.7 0 0 0-1 1Z"/>
  `,

  // Panah kecil ke kanan
  chevron: `<path d="m9 18 6-6-6-6"/>`,

  // Notifikasi: lonceng
  bell: `
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
    <path d="M10 21h4"/>
  `,

  // Pencarian: kaca pembesar
  search: `
    <circle cx="11" cy="11" r="7"/>
    <path d="m20 20-4-4"/>
  `,

  // Tambah: tanda plus
  plus: `<path d="M12 5v14M5 12h14"/>`,

  // Ubah: pensil
  edit: `
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>
  `,

  // Lihat: mata
  eye: `
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/>
    <circle cx="12" cy="12" r="2.5"/>
  `,

  // Tutup: tanda silang
  close: `<path d="M18 6 6 18M6 6l12 12"/>`,

  // Panah ke kanan
  arrow: `
    <path d="M5 12h14M13 6l6 6-6 6"/>
  `,

  // Menu: tiga garis (hamburger)
  menu: `
    <path d="M4 6h16M4 12h16M4 18h16"/>
  `,

  // Centang
  check: `<path d="m5 12 4 4L19 6"/>`,

  // Logo Google: empat warna resmi (stroke diatur per path)
  google: `
    <path stroke="#4285F4" d="M21.3 12.2c0-.7-.1-1.4-.2-2H12v3.7h5.2a4.5 4.5 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.9-4.1 2.9-7Z"/>
    <path stroke="#34A853" d="M12 21.6c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4H3.4v2.5a9.7 9.7 0 0 0 8.6 5.4Z"/>
    <path stroke="#FBBC05" d="M6.6 13.7a5.8 5.8 0 0 1 0-3.7V7.5H3.4a9.6 9.6 0 0 0 0 8.7l3.2-2.5Z"/>
    <path stroke="#EA4335" d="M12 6c1.4 0 2.7.5 3.7 1.5l2.8-2.7A9.4 9.4 0 0 0 3.4 7.5L6.6 10c.8-2.3 2.9-4 5.4-4Z"/>
  `
};

/* =====================================================
   DOM HELPER
===================================================== */

// Membuat elemen HTML dengan class dan teks opsional
function createElement(tag, className, text) {
  const element = document.createElement(tag);

  // Pasang class hanya bila diberikan
  if (className) {
    element.className = className;
  }

  // Isi teks bila ada; string kosong tetap dianggap teks yang valid
  if (text !== undefined && text !== null) {
    element.textContent = text;
  }

  return element;
}

// Menambahkan konten ke elemen induk.
// Node DOM ditambahkan langsung, nilai lain diubah menjadi teks biasa
// (aman dari injeksi HTML).
function appendContent(parent, content) {
  // Abaikan konten kosong
  if (content === undefined || content === null) {
    return;
  }

  // Jika sudah berupa Node (elemen/teks), tambahkan apa adanya
  if (content instanceof Node) {
    parent.appendChild(content);
    return;
  }

  // Selain itu, jadikan string lalu sisipkan sebagai text node
  parent.appendChild(
    document.createTextNode(String(content))
  );
}

/* =====================================================
   ICON
   Original React component:
   Icon({ name, size = 20 })
===================================================== */

// Membuat elemen <svg> untuk ikon sesuai nama dan ukuran
export function Icon({
  name,
  size = 20
} = {}) {
  // SVG harus dibuat dengan namespace SVG, bukan createElement biasa
  const svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  // Atribut umum gaya ikon (garis, tanpa isi, warna mengikuti teks)
  svg.setAttribute("class", "icon");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  // Ikon bersifat dekoratif, sembunyikan dari pembaca layar
  svg.setAttribute("aria-hidden", "true");

  // Ambil data path berdasarkan nama ikon
  const paths = iconPaths[name];

  // Bila nama tidak dikenal, SVG dikembalikan kosong
  if (paths) {
    svg.innerHTML = paths;
  }

  return svg;
}

/* =====================================================
   LOGO
   Original React component:
   Logo({ light = false })
===================================================== */

// Membuat logo EcoSort (ikon daun + teks); light untuk latar gelap
export function Logo({
  light = false
} = {}) {
  const logo = createElement(
    "div",
    `logo${light ? " logo-light" : ""}`
  );

  // Kotak penampung ikon logo
  const mark = createElement(
    "span",
    "logo-mark"
  );

  mark.appendChild(
    Icon({
      name: "logo",
      size: 24
    })
  );

  // Teks nama aplikasi
  const name = createElement(
    "span",
    "",
    "EcoSort"
  );

  logo.append(mark, name);

  return logo;
}

/* =====================================================
   BUTTON
   Original React component:
   Button({
     children,
     variant = "primary",
     icon,
     onClick,
     type = "button",
     full = false,
     disabled = false,
     loading = false
   })
===================================================== */

// Membuat tombol dengan varian, ikon opsional, dan status loading
export function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  full = false,
  disabled = false,
  loading = false
} = {}) {
  // Class: btn + varian; btn-full membuat tombol selebar penuh
  const button = createElement(
    "button",
    `btn btn-${variant}${full ? " btn-full" : ""}`
  );

  button.type = type;
  // Tombol dinonaktifkan saat disabled atau sedang loading
  button.disabled = disabled || loading;
  // Memberi tahu teknologi bantu bahwa tombol sedang memproses
  button.setAttribute(
    "aria-busy",
    String(loading)
  );

  // Ikon opsional di sisi kiri label
  if (icon) {
    button.appendChild(
      Icon({
        name: icon,
        size: 18
      })
    );
  }

  // Label: saat loading tampil "Memproses...", selain itu isi dari children
  const label = createElement(
    "span",
    "",
    loading ? "Memproses..." : ""
  );

  if (!loading) {
    appendContent(label, children);
  }

  button.appendChild(label);

  // Pasang handler klik hanya bila berupa fungsi
  if (typeof onClick === "function") {
    button.addEventListener("click", onClick);
  }

  return button;
}

/* =====================================================
   BADGE
   Original React component:
   Badge({ children, tone = "green" })
===================================================== */

// Membuat badge berwarna (titik + teks); tone menentukan warna
export function Badge({
  children,
  tone = "green"
} = {}) {
  const badge = createElement(
    "span",
    `badge badge-${tone}`
  );

  // Titik penanda di awal badge
  badge.appendChild(
    createElement("span", "badge-dot")
  );

  appendContent(badge, children);

  return badge;
}

/* =====================================================
   FIELD
   Original React component:
   Field({
     label,
     placeholder,
     type = "text",
     icon,
     value,
     onChange,
     error,
     action,
     autoComplete
   })
===================================================== */

// Membuat kolom input berlabel, dengan ikon, tombol aksi, dan pesan error opsional
export function Field({
  label,
  placeholder,
  type = "text",
  icon,
  value,
  onChange,
  error,
  action,
  autoComplete
} = {}) {
  // Elemen <label> membungkus teks label dan input
  const field = createElement(
    "label",
    "field"
  );

  field.appendChild(
    createElement("span", "", label)
  );

  // Pembungkus input; kelas input-error menandai kondisi error
  const inputWrap = createElement(
    "div",
    `input-wrap${error ? " input-error" : ""}`
  );

  // Ikon opsional di dalam kolom input
  if (icon) {
    inputWrap.appendChild(
      Icon({
        name: icon,
        size: 18
      })
    );
  }

  const input = document.createElement("input");

  input.type = type;
  input.placeholder = placeholder ?? "";
  // Menandai input tidak valid untuk teknologi bantu
  input.setAttribute(
    "aria-invalid",
    String(Boolean(error))
  );

  // Nilai awal hanya diisi bila diberikan
  if (value !== undefined) {
    input.value = value;
  }

  if (autoComplete) {
    input.autocomplete = autoComplete;
  }

  // Kirim nilai terbaru ke callback setiap kali pengguna mengetik
  if (typeof onChange === "function") {
    input.addEventListener("input", event => {
      onChange(event.target.value);
    });
  }

  inputWrap.appendChild(input);

  // Elemen aksi opsional di sisi kanan (misalnya tombol tampilkan password)
  if (action instanceof Node) {
    inputWrap.appendChild(action);
  }

  field.appendChild(inputWrap);

  // Pesan error ditampilkan di bawah input
  if (error) {
    field.appendChild(
      createElement(
        "small",
        "field-error",
        error
      )
    );
  }

  return field;
}

/* =====================================================
   EXPORT ICON MAP
===================================================== */

// Ekspor data ikon agar bisa dipakai modul lain
export { iconPaths };