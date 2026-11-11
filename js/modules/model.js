
/* =====================================================
   ECOSORT - MODEL EVALUATION ENGINE

   Mengevaluasi classifier yang dipakai pengguna
   (classifyWaste di classification.js) terhadap dataset
   berlabel yang dikelola Super Admin.

   Cara kerja:
   1. Ambil sampel dataset berstatus "Aktif" dan berlabel
      (kunci penyimpanan yang sama dengan halaman Dataset).
   2. Jalankan classifyWaste(nama, deskripsi) pada tiap sampel.
   3. Bandingkan prediksi dengan label -> confusion matrix.
   4. Hitung accuracy, precision, recall, F1 (macro).
   5. Simpan hasil sebagai riwayat evaluasi (Local Storage).

   Catatan jujur tentang model:
   Classifier ini adalah decision tree berbasis aturan yang
   ditulis manual, bukan model hasil pelatihan. Karena itu
   tidak ada kurva training/validation; yang diukur adalah
   seberapa sesuai keputusan aturan dengan label dataset.

   Baris matriks  = kategori aktual (label dataset)
   Kolom matriks  = kategori prediksi + "Tidak terklasifikasi"
                    (classifier menolak menjawab / butuh info)
===================================================== */

import {
  readLocal,
  writeLocal,
  seedForKind,
  datasetSampleSeed,
  downloadFile
} from "../core/database.js";

import {
  classifyWaste,
  classificationTerms,
  CLASSIFIER_VERSION
} from "./classification.js";


/* =====================================================
   CONSTANTS
===================================================== */

export const CLASSES = [
  "Organik",
  "Anorganik",
  "B3",
  "Residu"
];

export const UNCLASSIFIED = "Tidak terklasifikasi";

export const MODEL_INFO = {
  name: "EcoSort Classification Model",
  kind: "Decision Tree berbasis aturan"
};

export const MAX_HISTORY = 20;
export const MAX_STORED_ERRORS = 100;
export const SMALL_SAMPLE_THRESHOLD = 20;

const STORAGE_KEY = "model-evaluations-v2";
const DATASET_KEY = "data-dataset";


/* =====================================================
   FORMAT HELPERS
===================================================== */

export function formatPercent(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${(value * 100)
    .toFixed(digits)
    .replace(".", ",")}%`;
}

export function formatDate(value, withTime = true) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    withTime
      ? { dateStyle: "long", timeStyle: "short" }
      : { dateStyle: "long" }
  ).format(date);
}


/* =====================================================
   SIGNATURES
   Dipakai untuk mendeteksi apakah hasil evaluasi
   terakhir sudah kedaluwarsa (dataset / aturan berubah).
   FNV-1a 32-bit: cukup untuk deteksi perubahan.
===================================================== */

function hash(text) {
  let value = 0x811c9dc5;

  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }

  return (value >>> 0).toString(16).padStart(8, "0");
}

export function modelSignature() {
  return hash(
    `${CLASSIFIER_VERSION}|${JSON.stringify(classificationTerms)}`
  );
}

export function modelVersionLabel() {
  return `${CLASSIFIER_VERSION} · #${modelSignature().slice(0, 6)}`;
}

function datasetSignature(eligible) {
  return hash(
    JSON.stringify(
      [...eligible]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(item => [
          item.id,
          item.name,
          item.description,
          item.category
        ])
    )
  );
}


/* =====================================================
   DATASET ACCESS
===================================================== */

function isDatasetArray(value) {
  return Array.isArray(value) && value.every(item =>
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    typeof item.status === "string" &&
    typeof item.description === "string"
  );
}

/* Kunci dan fallback sama dengan halaman Dataset
   (data-page.js -> getInitialItems). */
export function loadDatasetItems() {
  return readLocal(
    DATASET_KEY,
    seedForKind("dataset"),
    isDatasetArray
  );
}

function splitEligible(items) {
  const eligible = [];
  const skipped = { notActive: 0, invalidLabel: 0 };

  items.forEach(item => {
    if (item.status !== "Aktif") {
      skipped.notActive++;
    } else if (!CLASSES.includes(item.category)) {
      skipped.invalidLabel++;
    } else {
      eligible.push(item);
    }
  });

  return { eligible, skipped };
}


/* =====================================================
   PREDICTION
===================================================== */

export function predictCategory(item) {
  let result;

  try {
    result = classifyWaste(
      item.name || "",
      item.description || ""
    );
  } catch (error) {
    console.error("ECOSORT: Classifier gagal.", error);

    return {
      predicted: UNCLASSIFIED,
      reason: "Classifier gagal memproses sampel ini."
    };
  }

  if (result.status === "special") {
    return { predicted: "B3", reason: result.reason || "" };
  }

  if (
    result.status === "classified" &&
    CLASSES.includes(result.category)
  ) {
    return {
      predicted: result.category,
      reason: result.reason || ""
    };
  }

  return {
    predicted: UNCLASSIFIED,
    reason: [result.title, result.reason]
      .filter(Boolean)
      .join(". ")
  };
}


/* =====================================================
   METRICS

   matrix: CLASSES.length baris x (CLASSES.length + 1) kolom.
   Kolom terakhir = "Tidak terklasifikasi".

   - accuracy  : benar / seluruh sampel (tidak terklasifikasi
                 dihitung salah)
   - precision : TP / total prediksi kategori tsb
   - recall    : TP / total sampel aktual kategori tsb
   - macro     : rata-rata kategori yang punya data uji.
                 Kategori tanpa data uji tidak ikut dirata-rata.
   - precision untuk kategori yang tidak pernah diprediksi
     dihitung 0 (konvensi umum, zero_division = 0).
===================================================== */

export function computeMetrics(matrix) {
  const size = CLASSES.length;

  const valid =
    Array.isArray(matrix) &&
    matrix.length === size &&
    matrix.every(row =>
      Array.isArray(row) &&
      row.length === size + 1 &&
      row.every(value =>
        Number.isInteger(value) && value >= 0
      )
    );

  if (!valid) {
    throw new Error("Format confusion matrix tidak valid.");
  }

  let total = 0;
  let correct = 0;
  let unclassified = 0;

  const perClass = CLASSES.map((name, index) => {
    const support = matrix[index].reduce(
      (sum, value) => sum + value,
      0
    );

    const predicted = matrix.reduce(
      (sum, row) => sum + row[index],
      0
    );

    const tp = matrix[index][index];

    const precision = predicted > 0 ? tp / predicted : 0;
    const recall = support > 0 ? tp / support : 0;

    const f1 =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

    total += support;
    correct += tp;
    unclassified += matrix[index][size];

    return {
      name,
      support,
      predicted,
      tp,
      fp: predicted - tp,
      fn: support - tp,
      precision,
      recall,
      f1,
      evaluable: support > 0
    };
  });

  const evaluable = perClass.filter(item => item.evaluable);

  const macro = key =>
    evaluable.length
      ? evaluable.reduce((sum, item) => sum + item[key], 0) /
        evaluable.length
      : 0;

  return {
    total,
    correct,
    unclassified,
    accuracy: total > 0 ? correct / total : 0,
    precision: macro("precision"),
    recall: macro("recall"),
    f1: macro("f1"),
    perClass
  };
}


/* =====================================================
   EVALUATE (fungsi murni, tanpa penyimpanan)
===================================================== */

export function evaluateItems(items) {
  const { eligible, skipped } = splitEligible(items);

  const size = CLASSES.length;

  const matrix = CLASSES.map(() =>
    new Array(size + 1).fill(0)
  );

  const errors = [];

  eligible.forEach(item => {
    const { predicted, reason } = predictCategory(item);

    const row = CLASSES.indexOf(item.category);

    const col =
      predicted === UNCLASSIFIED
        ? size
        : CLASSES.indexOf(predicted);

    matrix[row][col]++;

    if (row !== col) {
      errors.push({
        id: item.id,
        name: item.name,
        actual: item.category,
        predicted,
        reason: String(reason).slice(0, 200)
      });
    }
  });

  return {
    eligible,
    skipped,
    matrix,
    errors,
    metrics: computeMetrics(matrix)
  };
}


/* =====================================================
   HISTORY STORAGE
===================================================== */

function isEvaluationArray(value) {
  const size = CLASSES.length;

  return Array.isArray(value) && value.every(record =>
    record &&
    typeof record === "object" &&
    typeof record.id === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.modelSignature === "string" &&
    typeof record.datasetSignature === "string" &&
    Array.isArray(record.matrix) &&
    record.matrix.length === size &&
    record.matrix.every(row =>
      Array.isArray(row) &&
      row.length === size + 1 &&
      row.every(cell => Number.isInteger(cell) && cell >= 0)
    ) &&
    record.metrics &&
    Number.isFinite(record.metrics.accuracy) &&
    Array.isArray(record.metrics.perClass) &&
    Array.isArray(record.errors)
  );
}

export function loadEvaluations() {
  return readLocal(STORAGE_KEY, [], isEvaluationArray);
}

function saveEvaluations(records) {
  try {
    writeLocal(STORAGE_KEY, records);
    return true;
  } catch (error) {
    console.error(
      "ECOSORT: Gagal menyimpan riwayat evaluasi.",
      error
    );
    return false;
  }
}

export function clearEvaluations() {
  return saveEvaluations([]);
}


/* =====================================================
   RUN EVALUATION
===================================================== */

export function runEvaluation() {
  const items = loadDatasetItems();
  const result = evaluateItems(items);

  if (result.metrics.total === 0) {
    return {
      ok: false,
      error:
        "Belum ada data uji. Tambahkan data berstatus Aktif dengan kategori Organik, Anorganik, B3, atau Residu di halaman Dataset."
    };
  }

  const record = {
    id: `EVAL-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    modelName: MODEL_INFO.name,
    classifierVersion: CLASSIFIER_VERSION,
    versionLabel: modelVersionLabel(),
    modelSignature: modelSignature(),
    datasetSignature: datasetSignature(result.eligible),
    skipped: result.skipped,
    classes: [...CLASSES],
    matrix: result.matrix,
    metrics: result.metrics,
    errorCount: result.errors.length,
    errors: result.errors.slice(0, MAX_STORED_ERRORS)
  };

  const records = [record, ...loadEvaluations()]
    .slice(0, MAX_HISTORY);

  if (!saveEvaluations(records)) {
    return {
      ok: false,
      error:
        "Hasil evaluasi gagal disimpan. Penyimpanan browser mungkin penuh atau diblokir."
    };
  }

  return { ok: true, record, records };
}


/* =====================================================
   READINESS
   Ringkasan kondisi data uji saat ini + apakah hasil
   evaluasi terakhir masih sesuai.
===================================================== */

export function getReadiness(latest) {
  const items = loadDatasetItems();
  const { eligible, skipped } = splitEligible(items);

  const perClass = CLASSES.map(name => ({
    name,
    count: eligible.filter(item => item.category === name).length
  }));

  const existingIds = new Set(items.map(item => item.id));

  const missingClasses = perClass
    .filter(item => item.count === 0)
    .map(item => item.name);

  const stale = Boolean(
    latest &&
    (
      latest.modelSignature !== modelSignature() ||
      latest.datasetSignature !== datasetSignature(eligible)
    )
  );

  return {
    eligible: eligible.length,
    skipped,
    perClass,
    missingClasses,
    small: eligible.length < SMALL_SAMPLE_THRESHOLD,
    stale,
    modelChanged: Boolean(
      latest && latest.modelSignature !== modelSignature()
    ),
    sampleAvailable: datasetSampleSeed.some(
      sample => !existingIds.has(sample.id)
    )
  };
}


/* =====================================================
   LOAD SAMPLE DATASET
   Menambahkan contoh data berlabel (tidak menimpa data
   yang ada; sampel dengan ID yang sudah ada dilewati).
===================================================== */

export function appendSampleDataset() {
  const items = loadDatasetItems();
  const existingIds = new Set(items.map(item => item.id));

  const additions = datasetSampleSeed.filter(
    sample => !existingIds.has(sample.id)
  );

  if (!additions.length) {
    return { ok: true, added: 0 };
  }

  try {
    writeLocal(DATASET_KEY, [...items, ...additions]);

    return { ok: true, added: additions.length };
  } catch (error) {
    console.error(
      "ECOSORT: Gagal menambahkan contoh dataset.",
      error
    );

    return {
      ok: false,
      added: 0,
      error: "Contoh data gagal disimpan ke penyimpanan browser."
    };
  }
}


/* =====================================================
   RULE SUMMARY
   Ringkasan aturan untuk modal "Lihat aturan pohon".
   Daftar kata kunci diambil langsung dari classifier;
   teks langkah harus diperbarui jika logika berubah
   (naikkan CLASSIFIER_VERSION di classification.js).
===================================================== */

export function getRuleSummary() {
  return {
    version: modelVersionLabel(),

    steps: [
      {
        title: "1. Deteksi B3",
        text: "Jika input memuat kata kunci bahaya, hasilnya B3. Frasa seperti “tidak mengandung bahan kimia” atau “tidak terkontaminasi” diabaikan."
      },
      {
        title: "2. Informasi kurang",
        text: "Jika deskripsi kurang dari 5 kata, atau tidak ada kata kunci organik, anorganik, maupun residu, hasilnya Tidak terklasifikasi."
      },
      {
        title: "3. Material campuran",
        text: "Jika deskripsi menyebut campuran, memuat lebih dari satu kelompok material, dan tidak ada kondisi kotor, hasilnya Tidak terklasifikasi."
      },
      {
        title: "4. Skoring",
        text: "Organik = 3 × kata kunci organik. Anorganik = 3 × kata kunci anorganik + 1 × kata kunci bersih. Residu = 3 × kata kunci residu + 4 × kata kunci kotor (+2 bila kotor dan anorganik bersamaan)."
      },
      {
        title: "5. Keputusan",
        text: "Kategori dengan skor tertinggi dipilih. Jika skor tertinggi kurang dari 3 atau seri, hasilnya Tidak terklasifikasi."
      }
    ],

    groups: [
      ["B3 / bahaya", classificationTerms.hazard],
      ["Organik", classificationTerms.organic],
      ["Anorganik", classificationTerms.inorganic],
      ["Residu", classificationTerms.residue],
      ["Kondisi kotor (menambah skor Residu)", classificationTerms.dirty],
      ["Kondisi bersih (menambah skor Anorganik)", classificationTerms.clean]
    ].map(([label, terms]) => ({ label, terms: [...terms] }))
  };
}


/* =====================================================
   CSV REPORT
===================================================== */

function csvCell(value) {
  let text = String(value ?? "");

  /* Cegah formula injection saat dibuka di Excel/Sheets. */
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function buildReportCsv(record) {
  const { metrics } = record;
  const columns = [...CLASSES, UNCLASSIFIED];

  const rows = [
    ["Laporan Evaluasi Model EcoSort"],
    ["Tanggal evaluasi", formatDate(record.createdAt)],
    ["Nama model", record.modelName],
    ["Jenis model", MODEL_INFO.kind],
    ["Versi aturan", record.versionLabel],
    ["Jumlah sampel uji", metrics.total],
    ["Sampel dilewati (bukan Aktif)", record.skipped.notActive],
    ["Sampel dilewati (label tidak dikenal)", record.skipped.invalidLabel],
    [],
    ["Metrik keseluruhan"],
    ["Accuracy", formatPercent(metrics.accuracy, 2)],
    ["Precision (macro)", formatPercent(metrics.precision, 2)],
    ["Recall (macro)", formatPercent(metrics.recall, 2)],
    ["F1-Score (macro)", formatPercent(metrics.f1, 2)],
    ["Sampel benar", metrics.correct],
    ["Sampel tidak terklasifikasi", metrics.unclassified],
    [],
    ["Metrik per kategori"],
    ["Kategori", "Precision", "Recall", "F1-Score", "Jumlah Data"],
    ...metrics.perClass.map(item => [
      item.name,
      item.evaluable ? formatPercent(item.precision, 2) : "—",
      item.evaluable ? formatPercent(item.recall, 2) : "—",
      item.evaluable ? formatPercent(item.f1, 2) : "—",
      item.support
    ]),
    [],
    ["Confusion matrix (baris = aktual, kolom = prediksi)"],
    ["Aktual / Prediksi", ...columns],
    ...record.matrix.map((row, index) => [CLASSES[index], ...row]),
    [],
    [
      `Sampel salah klasifikasi (${record.errorCount})` +
        (record.errorCount > record.errors.length
          ? ` - ${record.errors.length} pertama ditampilkan`
          : "")
    ],
    ["ID", "Nama", "Label aktual", "Prediksi", "Alasan classifier"],
    ...record.errors.map(item => [
      item.id,
      item.name,
      item.actual,
      item.predicted,
      item.reason
    ])
  ];

  return rows
    .map(row => row.map(csvCell).join(","))
    .join("\r\n");
}

export function downloadReport(record) {
  const date = new Date(record.createdAt)
    .toISOString()
    .slice(0, 10);

  downloadFile(
    `ecosort-laporan-evaluasi-model-${date}.csv`,
    "\uFEFF" + buildReportCsv(record),
    "text/csv"
  );
}
