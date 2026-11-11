/* =====================================================
   ECOSORT - COMPONENT BRIDGE
   Connects core modules to components/ui.js
===================================================== */

// Berkas jembatan: membungkus komponen UI dari components/ui.js agar
// modul inti bisa memakainya sebagai fungsi yang mengembalikan string HTML
// (bukan elemen DOM), misalnya untuk disisipkan lewat innerHTML.

// Komponen UI asli yang akan dibungkus
import {
  Icon,
  Logo,
  Button,
  Badge,
  Field
} from "../components/ui.js";

/* =====================================================
   ICON
===================================================== */

// Mengembalikan HTML ikon berdasarkan nama dan ukuran (default 20)
export function icon(name, size = 20) {
  return Icon({ name, size }).outerHTML;
}

/* =====================================================
   LOGO
===================================================== */

// Mengembalikan HTML logo; light = true untuk versi terang (latar gelap)
export function logo(light = false) {
  return Logo({ light }).outerHTML;
}

/* =====================================================
   BUTTON
===================================================== */

// Mengembalikan HTML tombol.
// Opsi yang didukung:
// - iconName  : nama ikon di dalam tombol
// - variant   : gaya tombol (default "primary")
// - type      : tipe tombol HTML (default "button")
// - full      : tombol selebar penuh
// - loading   : tampilkan status memuat
// - disabled  : nonaktifkan tombol
// - attributes: string atribut HTML tambahan, misalnya 'id="x" data-action="y"'
// - onClick   : handler klik (hanya berlaku pada elemen DOM; hilang setelah
//               diubah menjadi string HTML lewat outerHTML)
export function button(text, options = {}) {
  const {
    iconName,
    variant = "primary",
    type = "button",
    full = false,
    loading = false,
    disabled = false,
    attributes = "",
    onClick
  } = options;

  // Buat elemen tombol dari komponen UI
  const element = Button({
    children: text,
    variant,
    icon: iconName,
    type,
    full,
    loading,
    disabled,
    onClick
  });

  // Apply additional HTML attributes when provided.
  if (attributes) {
    // Trik: string atribut di-parse oleh browser lewat <template> agar
    // dikenali sebagai atribut yang valid, tanpa perlu parsing manual
    const template = document.createElement("template");
    template.innerHTML = `<button ${attributes}></button>`;

    const temporary = template.content.firstElementChild;

    if (temporary) {
      // Salin setiap atribut hasil parsing ke tombol yang sebenarnya
      Array.from(temporary.attributes).forEach(attribute => {
        element.setAttribute(
          attribute.name,
          attribute.value
        );
      });
    }
  }

  return element.outerHTML;
}

/* =====================================================
   BADGE
===================================================== */

// Mengembalikan HTML lencana (badge); tone menentukan warna (default "green")
export function badge(text, tone = "green") {
  return Badge({
    children: text,
    tone
  }).outerHTML;
}

/* =====================================================
   FIELD
===================================================== */

// Membuat field form. Berbeda dari fungsi lain, hasilnya dikembalikan apa adanya
// dari komponen Field (tidak diubah menjadi string outerHTML).
export function field(options = {}) {
  return Field(options);
}

/* =====================================================
   DEFAULT EXPORT
===================================================== */

// Ekspor default berisi semua fungsi, agar bisa diimpor sebagai satu objek
export default {
  icon,
  logo,
  button,
  badge,
  field
};