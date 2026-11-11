
/* =====================================================
   ECOSORT - CLASSIFICATION ENGINE
   Source: src/App.tsx
   Original function: classifyWaste()
   Migration: Pure JavaScript
===================================================== */

/* =====================================================
   CLASSIFICATION TERMS
   Menggunakan kata kunci dari sumber asli.
===================================================== */
import {
  Icon,
  Button,
  Badge
} from "../components/ui.js";

/* Naikkan versi ini setiap kali logika skoring/alur keputusan berubah.
   Perubahan kata kunci terdeteksi otomatis oleh halaman Evaluasi Model. */
export const CLASSIFIER_VERSION = "1.0.0";

export const classificationTerms = {
  organic: [
    "sisa makanan",
    "kulit buah",
    "kulit pisang",
    "sisa sayur",
    "sayuran",
    "buah",
    "daun",
    "ranting",
    "ampas kopi",
    "ampas teh",
    "bahan hayati",
    "mudah terurai",
    "kompos"
  ],

  inorganic: [
    "plastik",
    "botol",
    "kaca",
    "kaleng",
    "logam",
    "aluminium",
    "kardus",
    "karton",
    "kertas bersih",
    "koran",
    "pet",
    "hdpe",
    "dapat digunakan kembali",
    "bisa digunakan kembali"
  ],

  residue: [
    "tisu",
    "popok",
    "pembalut",
    "puntung",
    "styrofoam",
    "sachet",
    "multilapis",
    "multi lapis",
    "kertas minyak",
    "masker sekali pakai"
  ],

  dirty: [
    "kotor",
    "terkontaminasi",
    "berminyak",
    "berlumur",
    "tercampur makanan",
    "sulit dibersihkan",
    "tidak bisa dibersihkan"
  ],

  clean: [
    "bersih",
    "kosong",
    "kering",
    "sudah dibilas",
    "tidak terkontaminasi"
  ],

  hazard: [
    "baterai",
    "aki",
    "limbah elektronik",
    "elektronik",
    "lampu",
    "obat",
    "jarum",
    "benda tajam",
    "pecahan tajam",
    "pecahan kaca",
    "kaca pecah",
    "tajam",
    "bahan kimia",
    "pestisida",
    "cat",
    "oli",
    "merkuri"
  ]
};

/* =====================================================
   MATCHING TERMS
===================================================== */

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* Cocokkan sebagai kata utuh agar "aki" tidak cocok dengan "kaki",
   dan "cat" tidak cocok dengan "tercatat". */
export function matchingTerms(text, terms) {
  return terms.filter(term =>
    new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`,
      "u"
    ).test(text)
  );
}

/* =====================================================
   CLASSIFICATION ENGINE
   Original function: classifyWaste()
===================================================== */

export function classifyWaste(name, description) {

  const normalizedName = name.toLowerCase();
  const normalizedDescription = description.toLowerCase();

  const combined =
    `${normalizedName} ${normalizedDescription}`;

  const riskText = combined
    .replace(
      /tidak (?:tercampur|mengandung) bahan kimia/g,
      ""
    )
    .replace(
      /tidak terkontaminasi(?: bahan berbahaya)?/g,
      ""
    )
    .replace(
      /tanpa (?:campuran )?bahan kimia/g,
      ""
    );

  const hazards = matchingTerms(
    riskText,
    classificationTerms.hazard
  );

  /* -----------------------------------------------
     1. SPECIAL / HAZARDOUS WASTE
  ------------------------------------------------ */

  if (hazards.length) {
    return {
      status: "special",
      tone: "yellow",
      icon: "bell",
      title: "Perlu penanganan khusus",

      description:
        "Sampah ini tidak boleh dimasukkan ke alur organik, anorganik umum, atau residu biasa.",

      reason:
        `Input menyebutkan indikator berpotensi berbahaya: ${hazards.join(", ")}.`,

      handling: [
        "Pisahkan dari sampah rumah tangga lain dan jangan dibongkar, dibakar, atau dikosongkan sembarangan.",
        "Simpan sementara dalam wadah yang kuat, tertutup, dan diberi penanda.",
        "Hubungi fasilitas pengumpulan B3, limbah elektronik, layanan kesehatan, atau pengelola resmi sesuai jenisnya."
      ],

      tip:
        "Periksa layanan pengumpulan khusus di wilayah Anda sebelum membawa sampah.",

      warning:
        "Gunakan pelindung yang sesuai dan hindari kontak langsung apabila kemasan bocor atau benda tajam terbuka."
    };
  }

  /* -----------------------------------------------
     2. MATCH MATERIAL
  ------------------------------------------------ */

  const organicMatches = matchingTerms(
    combined,
    classificationTerms.organic
  );

  const inorganicMatches = matchingTerms(
    combined,
    classificationTerms.inorganic
  );

  const residueMatches = matchingTerms(
    combined,
    classificationTerms.residue
  );

  const dirtyMatches = matchingTerms(
    riskText,
    classificationTerms.dirty
  );

  const cleanMatches = matchingTerms(
    normalizedDescription,
    classificationTerms.clean
  );

  const wordCount = description
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const mixed =
    /\b(campuran|berbagai material|kombinasi material|tercampur plastik|tercampur logam|tercampur kaca)\b/
      .test(normalizedDescription);

  const materialGroups = [
    organicMatches.length > 0,
    inorganicMatches.length > 0,
    residueMatches.length > 0
  ].filter(Boolean).length;

  /* -----------------------------------------------
     3. INSUFFICIENT INFORMATION
  ------------------------------------------------ */

  if (
    wordCount < 5 ||
    (
      !organicMatches.length &&
      !inorganicMatches.length &&
      !residueMatches.length
    )
  ) {
    return {
      status: "needs-info",
      tone: "yellow",
      icon: "search",
      title: "Perlu informasi tambahan",

      description:
        "Informasi yang tersedia belum cukup untuk menentukan kategori dengan yakin.",

      reason:
        "Bahan utama atau kondisi sampah belum dijelaskan secara spesifik.",

      handling: [
        "Sebutkan bahan utama, misalnya sisa makanan, plastik, kaca, logam, kertas, atau bahan campuran.",
        "Jelaskan apakah sampah bersih, basah, berminyak, atau terkontaminasi.",
        "Jelaskan apakah komponennya dapat dipisahkan dan fasilitas pengolahan apa yang tersedia."
      ],

      tip:
        "Lengkapi deskripsi lalu jalankan klasifikasi ulang."
    };
  }

  /* -----------------------------------------------
     4. MIXED MATERIAL
  ------------------------------------------------ */

  if (
    mixed &&
    materialGroups > 1 &&
    !dirtyMatches.length
  ) {
    return {
      status: "needs-info",
      tone: "yellow",
      icon: "search",
      title: "Material campuran perlu diperjelas",

      description:
        "Komponen sampah tampak terdiri dari lebih dari satu material sehingga tidak aman dipaksa ke satu kategori.",

      reason:
        `Deskripsi memuat beberapa jenis bahan: ${
          [
            ...organicMatches,
            ...inorganicMatches,
            ...residueMatches
          ].slice(0, 4).join(", ")
        }. `,

      handling: [
        "Pisahkan setiap komponen berdasarkan material apabila memungkinkan.",
        "Jelaskan komponen yang tidak dapat dipisahkan dan kondisi kontaminasinya.",
        "Periksa apakah fasilitas setempat menerima kemasan atau material campuran tersebut."
      ],

      tip:
        "Klasifikasikan kembali setiap komponen yang sudah dipisahkan."
    };
  }

  /* -----------------------------------------------
     5. DECISION TREE SCORING
  ------------------------------------------------ */

  const scores = {
    Organik: organicMatches.length * 3,

    Anorganik:
      inorganicMatches.length * 3 +
      cleanMatches.length,

    Residu:
      residueMatches.length * 3 +
      dirtyMatches.length * 4 +
      (
        dirtyMatches.length &&
        inorganicMatches.length
          ? 2
          : 0
      )
  };

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  /* -----------------------------------------------
     6. AMBIGUOUS RESULT
  ------------------------------------------------ */

  if (
    ranked[0][1] < 3 ||
    (
      ranked[0][1] === ranked[1][1] &&
      ranked[0][1] > 0
    )
  ) {
    return {
      status: "needs-info",
      tone: "yellow",
      icon: "search",
      title: "Perlu informasi tambahan",

      description:
        "Karakteristik yang disebutkan mendukung lebih dari satu kemungkinan kategori.",

      reason:
        "Material, kebersihan, atau tingkat kontaminasinya belum cukup membedakan cara pengolahan.",

      handling: [
        "Jelaskan material yang paling dominan.",
        "Sebutkan apakah sampah dapat dibersihkan atau dipisahkan.",
        "Tambahkan informasi tentang sisa makanan, minyak, bahan kimia, atau kontaminan lain."
      ],

      tip:
        "Semakin spesifik deskripsinya, semakin relevan hasil aturan lokal."
    };
  }

  /* -----------------------------------------------
     7. ORGANIC
  ------------------------------------------------ */

  const category = ranked[0][0];

  if (category === "Organik") {
    return {
      status: "classified",
      category,
      tone: "green",
      icon: "logo",

      title:
        "Bahan hayati yang dapat diolah secara organik",

      description:
        "Sampah ini paling sesuai dengan kategori organik berdasarkan bahan dan kondisi yang dijelaskan.",

      reason:
        `Input menunjukkan bahan hayati atau mudah terurai, terutama ${
          organicMatches.slice(0, 3).join(", ")
        }. `,

      handling: [
        "Pisahkan dari plastik, logam, kaca, residu, dan bahan berbahaya.",
        "Tiriskan sisa cairan apabila terlalu basah.",
        "Olah melalui kompos atau pengolahan organik yang menerima bahan tersebut.",
        "Simpan sementara dalam wadah tertutup agar tidak menimbulkan bau atau mengundang hama."
      ],

      tip:
        "Potong bahan berukuran besar agar lebih mudah diolah, tetapi periksa kesesuaiannya dengan metode kompos yang digunakan."
    };
  }

  /* -----------------------------------------------
     8. INORGANIC
  ------------------------------------------------ */

  if (category === "Anorganik") {
    return {
      status: "classified",
      category,
      tone: "blue",
      icon: "waste",

      title:
        "Material non-hayati yang berpotensi dimanfaatkan kembali",

      description:
        "Sampah ini paling sesuai dengan kategori anorganik dan berpotensi digunakan kembali atau didaur ulang.",

      reason:
        `Input menyebutkan material ${
          inorganicMatches.slice(0, 3).join(", ")
        }${
          cleanMatches.length
            ? ` dengan kondisi ${cleanMatches.slice(0, 2).join(", ")}`
            : ""
        }.`,

      handling: [
        "Pisahkan berdasarkan jenis material dan kosongkan seluruh isinya.",
        "Bersihkan dan keringkan apabila aman serta diperlukan oleh fasilitas penerima.",
        "Pisahkan tutup, label, atau komponen lain jika diminta oleh fasilitas pengolahan.",
        "Gunakan kembali jika masih layak atau salurkan ke bank sampah dan fasilitas yang menerima material tersebut."
      ],

      tip:
        "Tidak semua fasilitas menerima setiap jenis material; periksa ketentuan penerima setempat sebelum menyalurkannya."
    };
  }

  /* -----------------------------------------------
     9. RESIDUE
  ------------------------------------------------ */

  return {
    status: "classified",
    category,
    tone: "gray",
    icon: "close",

    title:
      "Sampah yang sulit diolah melalui jalur umum",

    description:
      "Sampah ini paling sesuai dengan kategori residu karena kondisi atau materialnya membatasi pengomposan dan daur ulang umum.",

    reason: dirtyMatches.length
      ? `Kondisi ${dirtyMatches.slice(0, 3).join(", ")} membuat material umumnya tidak sesuai untuk jalur daur ulang biasa.`
      : `Jenis material seperti ${residueMatches.slice(0, 3).join(", ")} umumnya tidak diterima melalui jalur pengolahan biasa.`,

    handling: [
      "Pisahkan dari sampah organik dan material daur ulang yang masih bersih.",
      "Bungkus atau simpan dengan aman sesuai karakteristik sampah.",
      "Pastikan tidak ada baterai, bahan kimia, limbah elektronik, atau benda tajam di dalamnya.",
      "Buang melalui sistem pengangkutan sampah resmi setempat."
    ],

    tip:
      "Kurangi penggunaan produk sekali pakai dan pilih alternatif yang dapat digunakan kembali bila tersedia."
  };
}


/* =====================================================
   ORIGINAL WASTE GUIDES
   Source: src/App.tsx
===================================================== */

const wasteGuides = [
  {
    id: "organik",
    name: "Sampah Organik",
    icon: "logo",
    tone: "green",
    steps: [
      "Pisahkan dari sampah anorganik.",
      "Tiriskan sisa makanan agar tidak terlalu basah.",
      "Olah sisa makanan dan daun menjadi kompos jika memungkinkan.",
      "Hindari mencampur sampah organik dengan bahan kimia atau limbah berbahaya."
    ],
    dos: [
      "Gunakan wadah tertutup",
      "Cacah bahan besar untuk kompos"
    ],
    donts: [
      "Mencampur plastik",
      "Mencampur bahan kimia"
    ],
    storage:
      "Simpan singkat dalam wadah tertutup dan berventilasi sebelum diolah agar tidak mengundang hama."
  },
  {
    id: "anorganik",
    name: "Anorganik yang Dapat Didaur Ulang",
    icon: "waste",
    tone: "blue",
    steps: [
      "Pisahkan berdasarkan material.",
      "Kosongkan wadah dari sisa isinya.",
      "Bilas jika diperlukan dan memungkinkan.",
      "Keringkan sebelum disimpan.",
      "Setorkan ke bank sampah atau fasilitas daur ulang yang menerima material tersebut."
    ],
    dos: [
      "Pastikan material bersih dan kering",
      "Periksa aturan fasilitas penerima"
    ],
    donts: [
      "Menyatukan semua material",
      "Menganggap semua kemasan dapat didaur ulang"
    ],
    storage:
      "Kelompokkan per material dalam wadah kering. Pipihkan kardus dan botol bila aman untuk menghemat ruang.",
    warning:
      "Tidak semua plastik, kertas, atau kemasan otomatis dapat didaur ulang. Penerimaan bergantung pada kondisi material dan fasilitas setempat."
  },
  {
    id: "residu",
    name: "Sampah Residu",
    icon: "close",
    tone: "gray",
    steps: [
      "Pisahkan dari material yang masih dapat didaur ulang.",
      "Bungkus dan simpan dengan baik untuk mencegah bau atau kebocoran.",
      "Buang melalui sistem pengangkutan sampah setempat.",
      "Jangan membakar sampah secara terbuka."
    ],
    dos: [
      "Bungkus rapat",
      "Gunakan layanan angkut setempat"
    ],
    donts: [
      "Membakar terbuka",
      "Mencampur dengan material daur ulang"
    ],
    storage:
      "Gunakan kantong atau wadah tertutup yang tidak mudah bocor, lalu keluarkan sesuai jadwal pengangkutan."
  },
  {
    id: "b3",
    name: "B3 Rumah Tangga dan Limbah Berbahaya",
    icon: "bell",
    tone: "red",
    steps: [
      "Jangan mencampur dengan sampah organik atau sampah biasa.",
      "Jangan membuang bahan kimia ke saluran air.",
      "Jangan membongkar, membakar, atau merusak baterai.",
      "Simpan aman, terpisah, dan jauh dari jangkauan anak-anak.",
      "Serahkan melalui fasilitas pengumpulan limbah berbahaya yang sesuai."
    ],
    dos: [
      "Pertahankan label asli",
      "Gunakan wadah sekunder yang kuat"
    ],
    donts: [
      "Membuang ke saluran air",
      "Membakar atau membongkar"
    ],
    storage:
      "Simpan tegak di tempat sejuk dan kering, gunakan kemasan asli bila tersedia, serta jauhkan dari anak-anak.",
    warning:
      "Berbahaya: hindari kontak langsung. Jika wadah bocor, jangan menyentuh tanpa perlindungan dan hubungi layanan setempat."
  },
  {
    id: "elektronik",
    name: "Sampah Elektronik (E-Waste)",
    icon: "settings",
    tone: "purple",
    steps: [
      "Pisahkan dari sampah rumah tangga biasa.",
      "Jangan membongkar komponen yang berpotensi berbahaya.",
      "Hapus data pribadi sebelum diserahkan jika perangkat masih dapat diakses.",
      "Serahkan ke pengumpul atau fasilitas sampah elektronik yang sesuai."
    ],
    dos: [
      "Cadangkan dan hapus data pribadi",
      "Serahkan dalam kondisi utuh"
    ],
    donts: [
      "Membongkar perangkat",
      "Membuang bersama sampah biasa"
    ],
    storage:
      "Simpan perangkat utuh di tempat kering. Lindungi layar atau bagian pecah sebelum dibawa."
  },
  {
    id: "tajam",
    name: "Sampah Khusus dan Benda Tajam",
    icon: "plus",
    tone: "yellow",
    steps: [
      "Hindari menyentuh bagian tajam secara langsung.",
      "Gunakan wadah yang kuat, tertutup, dan sesuai jenis limbah.",
      "Beri label peringatan bila diperlukan.",
      "Ikuti prosedur pengumpulan setempat, khususnya untuk benda tajam dan limbah medis."
    ],
    dos: [
      "Gunakan wadah tahan tusuk",
      "Beri label peringatan"
    ],
    donts: [
      "Memasukkan ke kantong tipis",
      "Menekan benda tajam dengan tangan"
    ],
    storage:
      "Masukkan langsung ke wadah tahan tusuk yang dapat ditutup. Jangan isi wadah terlalu penuh.",
    warning:
      "Jangan menangani jarum atau pecahan dengan tangan kosong. Limbah medis memerlukan prosedur pengumpulan khusus."
  }
];

/* =====================================================
   GUIDE SELECTION
   Original: guideForClassification()
===================================================== */

export function guideForClassification(result, input) {
  if (result.category === "Organik") {
    return wasteGuides.find(guide => guide.id === "organik") || null;
  }

  if (result.category === "Anorganik") {
    return wasteGuides.find(guide => guide.id === "anorganik") || null;
  }

  if (result.category === "Residu") {
    return wasteGuides.find(guide => guide.id === "residu") || null;
  }

  if (result.status !== "special") return null;

  const text = input.toLowerCase();

  const specialId =
    /\b(jarum|benda tajam|pecahan kaca|limbah medis)\b/.test(text)
      ? "tajam"
      : /\b(ponsel|kabel|charger|elektronik|komputer|e-waste)\b/.test(text)
        ? "elektronik"
        : /\b(baterai|pestisida|bahan kimia|sisa cat|lampu)\b/.test(text)
          ? "b3"
          : null;

  return specialId
    ? wasteGuides.find(guide => guide.id === specialId) || null
    : null;
}

/* =====================================================
   HTML HELPERS
===================================================== */

function escapeClassificationHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function classificationIcon(name, size = 20) {
  return Icon({ name, size }).outerHTML;
}

function classificationBadge(text, tone) {
  return Badge({
    children: text,
    tone
  }).outerHTML;
}

function classificationButton(text, options = {}) {
  const element = Button({
    children: text,
    variant: options.variant || "primary",
    icon: options.icon,
    type: options.type || "button",
    disabled: options.disabled || false,
    loading: options.loading || false
  });

  if (options.action) {
    element.dataset.action = options.action;
  }

  return element.outerHTML;
}

/* =====================================================
   CLASSIFICATION RESULT VIEW
===================================================== */

function renderClassificationResult({
  name,
  description,
  result,
  saved,
  showGuide
}) {
  if (!result) return "";

  const matchedGuide = guideForClassification(
    result,
    `${name} ${description}`
  );

  return `
    <section
      id="classification-result"
      class="classification-result result-${result.status}"
    >

      <div class="classification-result-heading">

        <div class="result-burst tone-${result.tone}">
          <div class="result-icon">
            ${classificationIcon(result.icon, 38)}
          </div>
        </div>

        <div>
          <span class="kicker">HASIL KLASIFIKASI</span>
          <h2>${escapeClassificationHTML(
            result.category || result.title
          )}</h2>
          <p>${escapeClassificationHTML(result.description)}</p>
        </div>

        <span class="confidence">
          Aturan lokal EcoSort
        </span>

      </div>

      <div class="result-card">

        <div class="result-card-head">
          <div>

            ${classificationBadge(
              (result.category || result.title).toUpperCase(),
              result.tone === "yellow" ? "yellow" : result.tone
            )}

            <h3>${escapeClassificationHTML(result.title)}</h3>

          </div>
        </div>

        <div class="waste-summary">

          <div>
            <span>NAMA SAMPAH</span>
            <b>${escapeClassificationHTML(name.trim())}</b>
          </div>

          <div>
            <span>RINGKASAN DESKRIPSI</span>
            <p>${escapeClassificationHTML(description.trim())}</p>
          </div>

        </div>

        <div class="classification-reason">

          <span>
            ${classificationIcon("search")}
          </span>

          <div>
            <b>Alasan klasifikasi</b>
            <p>${escapeClassificationHTML(result.reason)}</p>
          </div>

        </div>

        <div class="handling-card">

          <div class="handling-title">

            <span>
              ${classificationIcon(result.icon)}
            </span>

            <div>
              <b>Cara penanganan</b>
              <p>Ikuti langkah yang sesuai dengan kondisi sampah.</p>
            </div>

          </div>

          <ol>
            ${result.handling.map(step => `
              <li>${escapeClassificationHTML(step)}</li>
            `).join("")}
          </ol>

        </div>

        ${result.warning ? `
          <div class="result-warning">
            ${classificationIcon("bell")}
            <p>${escapeClassificationHTML(result.warning)}</p>
          </div>
        ` : ""}

        <div class="result-tip">
          <span>TIP</span>
          <p>${escapeClassificationHTML(result.tip)}</p>
        </div>

        <!-- MATCHED GUIDE -->

        <div class="classification-guide">

          <div class="classification-guide-head">

            <span class="${
              matchedGuide
                ? `guide-${matchedGuide.tone}`
                : ""
            }">
              ${classificationIcon(
                matchedGuide?.icon || "guides"
              )}
            </span>

            <div>
              <small>PANDUAN PENANGANAN</small>

              <h3>
                ${escapeClassificationHTML(
                  matchedGuide
                    ? matchedGuide.name
                    : "Panduan yang sesuai belum tersedia"
                )}
              </h3>

              <p>
                ${matchedGuide
                  ? "Panduan dipilih berdasarkan kategori hasil klasifikasi di atas."
                  : "Lengkapi informasi sampah atau lakukan klasifikasi ulang tanpa menebak kategorinya."
                }
              </p>
            </div>

            ${matchedGuide
              ? classificationButton(
                  showGuide ? "Tutup Panduan" : "Lihat Panduan Penanganan",
                  {
                    variant: "outline",
                    action: "toggle-guide"
                  }
                )
              : ""
            }

          </div>

          ${matchedGuide && showGuide ? `
            <div class="classification-guide-detail">

              ${matchedGuide.warning ? `
                <div class="guide-warning">
                  ${classificationIcon("bell")}

                  <div>
                    <b>Perhatian</b>
                    <p>${escapeClassificationHTML(matchedGuide.warning)}</p>
                  </div>
                </div>
              ` : ""}

              <h4>Langkah penanganan</h4>

              <ol class="guide-steps">
                ${matchedGuide.steps.map((step, index) => `
                  <li>
                    <span>${index + 1}</span>
                    <p>${escapeClassificationHTML(step)}</p>
                  </li>
                `).join("")}
              </ol>

              <div class="guide-do-grid">

                <section class="guide-do">
                  <h3>
                    ${classificationIcon("check", 17)}
                    Yang boleh dilakukan
                  </h3>

                  ${matchedGuide.dos.map(item => `
                    <p>${escapeClassificationHTML(item)}</p>
                  `).join("")}
                </section>

                <section class="guide-dont">
                  <h3>
                    ${classificationIcon("close", 17)}
                    Hindari
                  </h3>

                  ${matchedGuide.donts.map(item => `
                    <p>${escapeClassificationHTML(item)}</p>
                  `).join("")}
                </section>

              </div>

              <section class="guide-storage">

                ${classificationIcon("dataset")}

                <div>
                  <h3>Penyimpanan dan penyaluran</h3>
                  <p>${escapeClassificationHTML(matchedGuide.storage)}</p>
                </div>

              </section>

            </div>
          ` : ""}

        </div>

      </div>

      <!-- RESULT ACTIONS -->

      <div class="result-actions">

        ${classificationButton("Klasifikasi Ulang", {
          variant: "outline",
          action: "reclassify"
        })}

        ${result.category
          ? classificationButton(
              saved ? "Hasil Tersimpan" : "Simpan Hasil",
              {
                icon: "history",
                action: "save-result",
                disabled: saved
              }
            )
          : ""
        }

        ${classificationButton("Cetak Hasil", {
          variant: "outline",
          action: "print-result"
        })}

        ${saved
          ? classificationButton("Lihat Riwayat", {
              variant: "ghost",
              action: "open-history"
            })
          : ""
        }

      </div>

    </section>
  `;
}

/* =====================================================
   CLASSIFICATION PAGE
   Original component: Classification()
===================================================== */

export class ClassificationPage {

  constructor({
    onHistory = () => {},
    onSave = () => {},
    onToast = () => {}
  } = {}) {

    this.onHistory = onHistory;
    this.onSave = onSave;
    this.onToast = onToast;

    this.name = "";
    this.description = "";

    this.errors = {};

    this.result = null;

    this.processing = false;
    this.saved = false;
    this.showGuide = false;

    this.saveLock = false;

    this.root = null;
    this.timer = null;

    this.handleInput = this.handleInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  /* ===================================================
     RENDER
  =================================================== */

  render() {
    return `
      <div class="classification-wrap">

        <div class="classification-hero">

          <div>
            <span class="kicker">
              KLASIFIKASI BERBASIS ATURAN
            </span>

            <h1>Klasifikasi Sampah</h1>

            <p>
              Kenali jenis sampahmu dan temukan cara penanganan yang tepat
              untuk menjaga lingkungan.
            </p>
          </div>

          <div class="classification-hero-icon">
            ${classificationIcon("logo", 42)}
            <span></span>
          </div>

        </div>

        <form
          class="classification-form-card"
          data-form="classification"
          novalidate
        >

          <div class="classification-form-head">

            <span class="classification-form-icon">
              ${classificationIcon("edit")}
            </span>

            <div>
              <h2>Informasi sampah</h2>
              <p>
                Jelaskan sampah secara spesifik agar hasil lebih relevan.
              </p>
            </div>

          </div>

          <label class="classification-field">

            <span>
              Nama Sampah <i>*</i>
            </span>

            <div class="input-wrap ${
              this.errors.name ? "input-error" : ""
            }">

              ${classificationIcon("waste", 18)}

              <input
                name="name"
                data-field="name"
                value="${escapeClassificationHTML(this.name)}"
                placeholder="Contoh: Kulit Pisang"
                aria-invalid="${Boolean(this.errors.name)}"
                ${this.processing ? "disabled" : ""}
              />

            </div>

            ${this.errors.name
              ? `<small class="field-error">${escapeClassificationHTML(this.errors.name)}</small>`
              : ""
            }

          </label>

          <label class="classification-field">

            <span>
              Deskripsi Sampah <i>*</i>
            </span>

            <textarea
              name="description"
              data-field="description"
              placeholder="Jelaskan bahan, kondisi, dan karakteristik sampah. Contoh: Kulit pisang sisa makanan, masih basah, dan tidak tercampur bahan kimia."
              aria-invalid="${Boolean(this.errors.description)}"
              ${this.processing ? "disabled" : ""}
            >${escapeClassificationHTML(this.description)}</textarea>

            <small class="classification-help">
              Sertakan bahan utama, kondisi, tingkat kebersihan, kontaminasi,
              dan apakah tercampur bahan lain.
            </small>

            ${this.errors.description
              ? `<small class="field-error">${escapeClassificationHTML(this.errors.description)}</small>`
              : ""
            }

          </label>

          <div class="classification-form-actions">

            ${classificationButton("Klasifikasikan Sampah", {
              type: "submit",
              icon: "classify",
              loading: this.processing
            })}

            ${classificationButton("Reset Formulir", {
              variant: "outline",
              action: "reset-form",
              disabled: this.processing
            })}

          </div>

        </form>

        <div class="b3-inline">

          <span>!</span>

          <p>
            <b>Catatan keamanan</b>
            Baterai, lampu, obat, bahan kimia, limbah elektronik, dan benda
            tajam memerlukan jalur pengelolaan khusus.
          </p>

        </div>

        ${renderClassificationResult({
          name: this.name,
          description: this.description,
          result: this.result,
          saved: this.saved,
          showGuide: this.showGuide
        })}

      </div>
    `;
  }

  /* ===================================================
     MOUNT
  =================================================== */

  mount(root) {
    if (!root) {
      throw new Error(
        "ECOSORT: Root Classification tidak ditemukan."
      );
    }

    this.destroy();

    this.root = root;

    this.root.addEventListener("input", this.handleInput);
    this.root.addEventListener("submit", this.handleSubmit);
    this.root.addEventListener("click", this.handleClick);

    this.update();

    return () => this.destroy();
  }

  /* ===================================================
     UPDATE VIEW
  =================================================== */

  update() {
    if (!this.root) return;

    this.root.innerHTML = this.render();
  }

  /* ===================================================
     INPUT CHANGE
  =================================================== */

  handleInput(event) {
    const field = event.target.dataset.field;

    if (field !== "name" && field !== "description") {
      return;
    }

    this[field] = event.target.value;

    this.errors[field] = "";

    if (this.result) {
      this.result = null;
      this.saved = false;
      this.showGuide = false;
      this.saveLock = false;
    }

    const currentPosition = event.target.selectionStart;

    this.update();

    const newInput = this.root.querySelector(
      `[data-field="${field}"]`
    );

    if (newInput) {
      newInput.focus();

      if (currentPosition !== null) {
        newInput.setSelectionRange(
          currentPosition,
          currentPosition
        );
      }
    }
  }

  /* ===================================================
     SUBMIT CLASSIFICATION
     Original delay: 450ms
  =================================================== */

  handleSubmit(event) {
    if (!event.target.matches('[data-form="classification"]')) {
      return;
    }

    event.preventDefault();

    if (this.processing) return;

    const nextErrors = {};

    if (!this.name.trim()) {
      nextErrors.name = "Nama sampah wajib diisi.";
    }

    if (!this.description.trim()) {
      nextErrors.description = "Deskripsi sampah wajib diisi.";
    }

    this.errors = nextErrors;

    if (Object.keys(nextErrors).length) {
      this.update();

      this.onToast(
        "Lengkapi nama dan deskripsi sampah",
        "error"
      );

      return;
    }

    this.processing = true;
    this.saved = false;
    this.showGuide = false;
    this.saveLock = false;

    this.update();

    this.timer = window.setTimeout(() => {

      this.result = classifyWaste(
        this.name.trim(),
        this.description.trim()
      );

      this.processing = false;

      this.update();

      window.requestAnimationFrame(() => {
        this.root?.querySelector("#classification-result")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
      });

    }, 450);
  }

  /* ===================================================
     SAVE RESULT
     Original key: history-v2
  =================================================== */

  saveResult() {
    if (
      !this.result?.category ||
      this.saved ||
      this.saveLock
    ) {
      return;
    }

    this.saveLock = true;

    const timestamp = Date.now();

    const record = {
      id: timestamp,

      name: this.name.trim(),

      description: this.description.trim(),

      date: new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(timestamp),

      timestamp,

      category: this.result.category,

      tone: this.result.tone,

      icon: this.result.icon,

      reason: this.result.reason,

      recommendation: this.result.handling.join(" "),

      handling: this.result.handling,

      tip: this.result.tip
    };

    try {
      this.onSave(record);

      this.saved = true;

      this.onToast(
        "Hasil tersimpan secara lokal di perangkat ini"
      );

      this.update();

    } catch (error) {
      this.saveLock = false;

      this.onToast(
        "Hasil gagal disimpan",
        "error"
      );

      console.error("ECOSORT save history:", error);
    }
  }

  /* ===================================================
     RESET FORM
  =================================================== */

  resetForm() {
    if (this.processing) return;

    this.name = "";
    this.description = "";

    this.errors = {};

    this.result = null;

    this.saved = false;
    this.showGuide = false;
    this.saveLock = false;

    this.update();
  }

  /* ===================================================
     CLICK ACTIONS
  =================================================== */

  handleClick(event) {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton || !this.root.contains(actionButton)) {
      return;
    }

    switch (actionButton.dataset.action) {

      case "reset-form":
        this.resetForm();
        break;

      case "toggle-guide":
        this.showGuide = !this.showGuide;
        this.update();
        break;

      case "reclassify":
        this.result = null;
        this.saved = false;
        this.showGuide = false;
        this.saveLock = false;

        this.update();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
        break;

      case "save-result":
        this.saveResult();
        break;

      case "print-result":
        window.print();
        break;

      case "open-history":
        this.onHistory();
        break;
    }
  }

  /* ===================================================
     DESTROY
  =================================================== */

  destroy() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }

    if (!this.root) return;

    this.root.removeEventListener("input", this.handleInput);
    this.root.removeEventListener("submit", this.handleSubmit);
    this.root.removeEventListener("click", this.handleClick);

    this.root = null;
  }
}

/* =====================================================
   FACTORY
===================================================== */

export function createClassificationPage(options = {}) {
  return new ClassificationPage(options);
}