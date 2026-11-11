/* =====================================================
   ECOSORT - LANDING PAGE
   Original source: src/App.tsx
   Original component: Landing()
   Source lines: 595-810

   Migration: Vanilla JavaScript
===================================================== */

// Komponen UI dasar yang dipakai halaman ini
import {
  Icon,
  Logo,
  Button,
  Badge
} from "./ui.js";

/* =====================================================
   COMPONENT HELPERS

   Komponen di ui.js mengembalikan elemen DOM, sedangkan
   halaman ini dibangun dari template string. Helper di
   bawah mengubah elemen tersebut menjadi string HTML
   (outerHTML) agar bisa disisipkan ke dalam template.
===================================================== */

// Menghasilkan HTML ikon berdasarkan nama dan ukuran (default 20)
function iconHTML(name, size = 20) {
  return Icon({ name, size }).outerHTML;
}

// Menghasilkan HTML logo; light = true untuk versi terang (latar gelap)
function logoHTML(light = false) {
  return Logo({ light }).outerHTML;
}

// Menghasilkan HTML tombol; varian default "primary"
// Catatan: onClick tidak ikut terbawa ke outerHTML (hanya markup yang dihasilkan)
function buttonHTML({
  text,
  variant,
  icon,
  action
}) {
  const element = Button({
    children: text,
    variant: variant || "primary",
    icon,
    onClick: action
  });

  return element.outerHTML;
}

// Menghasilkan HTML badge; warna (tone) default "green"
function badgeHTML(text, tone) {
  return Badge({
    children: text,
    tone: tone || "green"
  }).outerHTML;
}

/* =====================================================
   LANDING PAGE RENDERER

   Original:
   function Landing({ onLogin })
===================================================== */

// Mengembalikan string HTML seluruh halaman landing.
// Urutan bagian: navigasi, hero, cara kerja, kategori, CTA, footer.
// Tombol memakai atribut data-action yang ditangani oleh bindLanding().
export function renderLanding() {

  return `

    <div class="public">

      <!-- NAVIGATION -->

      <nav class="public-nav">

        ${logoHTML()}

        <div class="nav-links">

          <a href="#cara-kerja">Cara Kerja</a>

          <a href="#kategori">Kategori</a>

          <a href="#tentang">Tentang</a>

        </div>

        <button
          class="btn btn-primary"
          data-action="login"
        >
          Masuk
        </button>

      </nav>

      <main>

        <!-- HERO SECTION -->

        <section class="hero">

          <div class="hero-copy">

            <div class="eyebrow">
              <span></span>
              Klasifikasi cerdas untuk lingkungan
            </div>

            <h1>
              Kenali sampahmu,
              <br>
              <em>pilah dengan tepat.</em>
            </h1>

            <p>
              EcoSort membantu Anda mengenali kategori sampah berdasarkan
              karakteristiknya dan memberi rekomendasi penanganan yang mudah
              dipahami.
            </p>

            <div class="hero-actions">

              <button
                class="btn btn-primary"
                data-action="login"
              >
                Mulai klasifikasi
                ${iconHTML("arrow", 18)}
              </button>

              <button
                class="btn btn-outline"
                data-action="learn"
              >
                Pelajari cara kerja
              </button>

            </div>

            <div class="trust-row">

              <span>
                ${iconHTML("check", 16)}
                Tanpa unggah gambar
              </span>

              <span>
                ${iconHTML("check", 16)}
                Mudah digunakan
              </span>

              <span>
                ${iconHTML("check", 16)}
                Gratis
              </span>

            </div>

          </div>

          <!-- HERO ILLUSTRATION -->

          <div class="hero-visual">

            <div class="orbit orbit-one"></div>
            <div class="orbit orbit-two"></div>

            <div class="eco-illustration">

              <div class="leaf leaf-a"></div>
              <div class="leaf leaf-b"></div>

              <div class="bin">

                <div class="bin-lid"></div>

                ${iconHTML("logo", 58)}

              </div>

              <div class="float-card float-top">

                <span class="float-icon green">
                  ${iconHTML("check", 18)}
                </span>

                <span>
                  <b>Organik</b>
                  <small>Mudah terurai</small>
                </span>

              </div>

              <div class="float-card float-bottom">

                <span class="float-icon blue">
                  ${iconHTML("waste", 18)}
                </span>

                <span>
                  <b>Anorganik</b>
                  <small>Dapat didaur ulang</small>
                </span>

              </div>

            </div>

          </div>

        </section>

        <!-- HOW IT WORKS -->

        <section
          class="process-section"
          id="cara-kerja"
        >

          <div class="section-heading">

            <span class="kicker">
              PROSES SEDERHANA
            </span>

            <h2>
              Empat langkah menuju pemilahan yang tepat
            </h2>

            <p>
              Jawab beberapa pertanyaan singkat. Decision Tree kami membantu
              menentukan kategori dan penanganannya.
            </p>

          </div>

          <div class="process-grid">

            ${[
      /* Data langkah: [nomor, judul, deskripsi, nama ikon] */
      [
        "01",
        "Bahan penyusun",
        "Pilih bahan utama penyusun sampah.",
        "logo"
      ],
      [
        "02",
        "Jenis atau bentuk",
        "Kenali bentuk dan penggunaan benda.",
        "waste"
      ],
      [
        "03",
        "Kondisi sampah",
        "Tentukan kebersihan atau kontaminasinya.",
        "classify"
      ],
      [
        "04",
        "Kemampuan terurai",
        "Ketahui apakah dapat terurai alami.",
        "history"
      ]
      /* Setiap data dirender menjadi satu kartu; index dipakai untuk kelas warna p0-p3 */
    ].map((item, index) => `

              <div class="process-card">

                <span class="step-number">
                  ${item[0]}
                </span>

                <div class="process-icon p${index}">
                  ${iconHTML(item[3], 25)}
                </div>

                <h3>${item[1]}</h3>

                <p>${item[2]}</p>

              </div>

            `).join("")}

          </div>

        </section>

        <!-- CATEGORY SECTION -->

        <section
          class="category-section"
          id="kategori"
        >

          <div class="section-heading">

            <span class="kicker">
              KENALI KATEGORINYA
            </span>

            <h2>
              Tiga kategori utama EcoSort
            </h2>

          </div>

          <div class="category-grid">

            <!-- ORGANIC -->

            <div class="category-card organic">

              <div class="category-symbol">
                ${iconHTML("logo", 36)}
              </div>

              ${badgeHTML("ORGANIK", "green")}

              <h3>Kembali ke alam</h3>

              <p>
                Sisa buah, sayur, daun, dan bahan alami yang dapat terurai.
              </p>

              <button
                class="category-link"
                data-action="login"
              >
                Lihat panduan
                ${iconHTML("arrow", 16)}
              </button>

            </div>

            <!-- INORGANIC -->

            <div class="category-card inorganic">

              <div class="category-symbol">
                ${iconHTML("waste", 36)}
              </div>

              ${badgeHTML("ANORGANIK", "blue")}

              <h3>Beri kesempatan kedua</h3>

              <p>
                Plastik, kaca, dan bahan non-alami yang berpotensi didaur ulang.
              </p>

              <button
                class="category-link"
                data-action="login"
              >
                Lihat panduan
                ${iconHTML("arrow", 16)}
              </button>

            </div>

            <!-- RESIDUE -->

            <div class="category-card residue">

              <div class="category-symbol">
                ${iconHTML("close", 36)}
              </div>

              ${badgeHTML("RESIDU", "gray")}

              <h3>Tangani dengan benar</h3>

              <p>
                Tisu bekas, popok, dan sampah terkontaminasi yang sulit diolah.
              </p>

              <button
                class="category-link"
                data-action="login"
              >
                Lihat panduan
                ${iconHTML("arrow", 16)}
              </button>

            </div>

          </div>

          <!-- B3 NOTICE -->

          <div class="b3-note">

            <span class="b3-icon">!</span>

            <div>

              <b>
                Perhatian: Sampah B3 di luar cakupan model
              </b>

              <p>
                Baterai, lampu, obat, dan limbah berbahaya memerlukan penanganan
                khusus. Serahkan ke fasilitas pengelolaan B3 resmi.
              </p>

            </div>

          </div>

        </section>

        <!-- CTA SECTION -->

        <section
          class="cta-section"
          id="tentang"
        >

          <div>

            <span class="kicker light">
              MULAI HARI INI
            </span>

            <h2>
              Satu pilihan kecil,
              <br>
              dampak besar untuk bumi.
            </h2>

            <p>
              Mulai klasifikasi dan temukan cara penanganan sampah yang tepat.
            </p>

          </div>

          <button
            class="btn btn-secondary"
            data-action="login"
          >
            Coba EcoSort sekarang
            ${iconHTML("arrow", 18)}
          </button>

        </section>

      </main>

      <!-- FOOTER -->

      <footer>

        ${logoHTML(true)}

        <p>
          Teknologi sederhana untuk kebiasaan yang lebih baik.
        </p>

        <span>
          © 2026 EcoSort
        </span>

      </footer>

    </div>

  `;
}

/* =====================================================
   LANDING PAGE EVENT BINDING

   Original:
   onLogin()
   scrollIntoView({ behavior: "smooth" })
===================================================== */

// Memasang event klik pada elemen root hasil render.
// Memakai event delegation: satu listener menangani semua tombol data-action.
// Mengembalikan fungsi unsubscribe untuk melepas listener (cleanup).
export function bindLanding(root, {
  onLogin
} = {}) {

  // Bila root tidak ada, kembalikan fungsi kosong agar pemanggil tetap aman
  if (!root) {
    return () => { };
  }

  const handleClick = event => {

    // Cari elemen terdekat yang punya atribut data-action (termasuk induk dari klik pada ikon)
    const action = event.target.closest("[data-action]");

    if (!action) return;

    switch (action.dataset.action) {

      // Tombol masuk/mulai: panggil callback dari pemanggil bila tersedia
      case "login":
        onLogin?.();
        break;

      // Tombol "Pelajari cara kerja": gulir halus ke bagian #cara-kerja
      case "learn":
        root.querySelector("#cara-kerja")
          ?.scrollIntoView({
            behavior: "smooth"
          });
        break;

    }

  };

  root.addEventListener("click", handleClick);

  // Lepas listener saat halaman dibongkar agar tidak terjadi kebocoran memori
  return function unsubscribe() {
    root.removeEventListener("click", handleClick);
  };
}