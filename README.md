
# ♻️ EcoSort
### Sistem Klasifikasi dan Pengelolaan Sampah Berbasis Web

EcoSort merupakan aplikasi berbasis web yang dirancang untuk membantu pengguna mengenali, mengklasifikasikan, dan memahami cara penanganan sampah berdasarkan karakteristiknya.

Selain menyediakan fitur klasifikasi sampah, EcoSort juga dilengkapi dengan sistem pengelolaan data, panduan penanganan sampah, manajemen dataset, evaluasi model, serta pengelolaan pengguna berdasarkan hak akses masing-masing role.

---

## 📌 DAFTAR ISI

1. [Tentang EcoSort](#-tentang-ecosort)
2. [Latar Belakang](#-latar-belakang)
3. [Tujuan Proyek](#-tujuan-proyek)
4. [Fitur Utama](#-fitur-utama)
5. [Pembagian Hak Akses](#-pembagian-hak-akses)
6. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
7. [Struktur Folder](#-struktur-folder)
8. [Persyaratan Sistem](#-persyaratan-sistem)
9. [Instalasi dan Menjalankan Aplikasi](#-instalasi-dan-menjalankan-aplikasi)
10. [Panduan Penggunaan](#-panduan-penggunaan)
11. [Sistem Klasifikasi Sampah](#-sistem-klasifikasi-sampah)
12. [Sistem Pengelolaan Dataset](#-sistem-pengelolaan-dataset)
13. [Evaluasi Model](#-evaluasi-model)
14. [Sistem Penyimpanan Data](#-sistem-penyimpanan-data)
15. [Keamanan dan Hak Akses](#-keamanan-dan-hak-akses)
16. [Batasan Sistem](#-batasan-sistem)
17. [Pemecahan Masalah](#-pemecahan-masalah)
18. [Pengembangan Selanjutnya](#-pengembangan-selanjutnya)
19. [Penutup](#-penutup)

---

## 🌱 Tentang EcoSort

EcoSort adalah platform digital yang berfokus pada pengelolaan dan klasifikasi sampah untuk membantu meningkatkan kesadaran masyarakat terhadap pentingnya pemilahan sampah.

Aplikasi ini menyediakan informasi mengenai jenis sampah, karakteristik, kategori, serta rekomendasi penanganan yang sesuai.

EcoSort memiliki tiga tingkatan pengguna:

- **User:** Pengguna yang melakukan klasifikasi dan melihat riwayat hasil klasifikasi.
- **Sub Admin:** Pengelola data sampah dan panduan penanganan.
- **Super Admin:** Pengelola utama yang memiliki akses terhadap manajemen pengguna, dataset, dan evaluasi model.

Setiap role memiliki tampilan dashboard, menu navigasi, dan hak akses yang disesuaikan dengan tanggung jawabnya.

## 🎯 Latar Belakang

Permasalahan sampah merupakan salah satu tantangan lingkungan yang memerlukan perhatian bersama.

Kurangnya pengetahuan mengenai jenis dan karakteristik sampah dapat menyebabkan kesalahan dalam proses pemilahan dan penanganannya.

Oleh karena itu, EcoSort dikembangkan sebagai media digital yang membantu masyarakat mengenali kategori sampah dan memperoleh informasi mengenai cara penanganan yang tepat.

Melalui sistem ini, diharapkan proses edukasi dan pengelolaan informasi sampah dapat dilakukan dengan lebih mudah, terstruktur, dan efisien.

## 🎯 Tujuan Proyek

Pengembangan EcoSort memiliki beberapa tujuan utama:

1. Membantu pengguna mengenali karakteristik dan kategori sampah.
2. Memberikan rekomendasi penanganan berdasarkan hasil klasifikasi.
3. Menyediakan informasi edukatif mengenai pemilahan dan pengelolaan sampah.
4. Mempermudah pengelolaan data sampah dan panduan penanganan.
5. Menyediakan pengelolaan dataset untuk kebutuhan pelatihan dan pengujian model.
6. Menyediakan fasilitas evaluasi performa model klasifikasi.
7. Mengatur hak akses pengguna berdasarkan role.
8. Meningkatkan kesadaran masyarakat terhadap pengelolaan sampah yang bertanggung jawab.

---

## ✨ Fitur Utama

### 1. Landing Page

Halaman utama yang menjadi pintu masuk aplikasi EcoSort.

Fitur yang tersedia:

- Pengenalan EcoSort.
- Informasi dan tujuan aplikasi.
- Penjelasan cara kerja sistem.
- Informasi kategori sampah.
- Edukasi mengenai pengelolaan sampah.
- Navigasi menuju halaman login.
- Tombol untuk memulai penggunaan aplikasi.

### 2. Authentication System

Sistem autentikasi menyediakan beberapa halaman:

- Login.
- Registrasi akun.
- Lupa kata sandi.
- Login khusus Super Admin.
- Validasi input email dan kata sandi.
- Pilihan role User dan Sub Admin.
- Opsi mengingat sesi login.
- Pengelolaan sesi pengguna.
- Logout dengan konfirmasi.

### 3. Dashboard

Dashboard menyediakan ringkasan informasi dan aktivitas sesuai role pengguna.

Informasi yang ditampilkan meliputi:

- Statistik aktivitas.
- Ringkasan klasifikasi.
- Distribusi kategori sampah.
- Aktivitas terbaru.
- Informasi pengelolaan data.
- Navigasi menuju fitur utama.

### 4. Klasifikasi Sampah

Fitur klasifikasi memungkinkan pengguna memasukkan nama dan deskripsi sampah untuk memperoleh hasil identifikasi berbasis aturan dan kata kunci.

Informasi yang dapat ditampilkan:

- Hasil kategori sampah.
- Alasan klasifikasi.
- Karakteristik sampah.
- Rekomendasi penanganan.
- Panduan penanganan.
- Peringatan untuk sampah yang memerlukan penanganan khusus.
- Opsi menyimpan hasil klasifikasi.
- Opsi mencetak hasil klasifikasi.

### 5. Riwayat Klasifikasi

Fitur ini menyimpan hasil klasifikasi yang telah dilakukan pengguna.

Fitur yang tersedia:

- Melihat daftar riwayat.
- Melihat detail hasil klasifikasi.
- Melihat kategori hasil.
- Melihat rekomendasi penanganan.
- Filter riwayat berdasarkan tanggal.
- Menghapus riwayat dengan konfirmasi.
- Melihat ringkasan jumlah klasifikasi.

### 6. Manajemen Data Sampah

Fitur pengelolaan data sampah tersedia untuk Sub Admin dan Super Admin.

Fitur yang tersedia:

- Menambahkan data sampah.
- Mengubah data sampah.
- Menghapus data sampah.
- Melihat detail data.
- Pencarian data.
- Filter kategori.
- Filter status.
- Pengurutan data.
- Pengaturan status aktif dan draft.
- Ekspor data ke CSV.
- Ringkasan jumlah data.

### 7. Panduan Penanganan Sampah

Fitur edukasi yang menyediakan informasi mengenai cara penanganan sampah.

Fitur pengelolaan meliputi:

- Menambahkan panduan.
- Mengubah panduan.
- Menghapus panduan.
- Melihat detail panduan.
- Mengelola kategori.
- Mengelola status publikasi.
- Pencarian dan filter.
- Ekspor data panduan.

### 8. Manajemen Pengguna

Fitur khusus Super Admin untuk mengelola akun pengguna.

Fitur yang tersedia melalui modul manajemen data:

- Melihat daftar pengguna.
- Menambahkan pengguna.
- Mengubah informasi pengguna.
- Menghapus pengguna.
- Mengatur role pengguna.
- Mengatur status akun.
- Pencarian pengguna.
- Filter berdasarkan role dan status.
- Pengurutan data.
- Ekspor data pengguna.

### 9. Manajemen Dataset

Fitur khusus Super Admin untuk mengelola kumpulan gambar sampah yang digunakan sebagai dataset.

Fitur yang tersedia:

- Menambahkan dataset.
- Mengunggah gambar sampah.
- Mengubah informasi dataset.
- Menghapus dataset.
- Mengelompokkan data berdasarkan kategori.
- Memisahkan Training dan Testing.
- Mengatur status dataset.
- Mencari dataset.
- Memfilter dataset.
- Mengurutkan dataset.
- Melihat statistik dataset.
- Mengekspor informasi dataset ke CSV.

Format gambar yang didukung:

- JPG / JPEG
- PNG
- WEBP

Ukuran maksimum gambar: 5 MB per file.

### 10. Evaluasi Model

Fitur khusus Super Admin untuk menghitung dan mengevaluasi performa model klasifikasi berdasarkan confusion matrix.

Metrik yang tersedia:

- Accuracy.
- Precision.
- Recall.
- F1-score.
- Confusion Matrix.
- Evaluasi setiap kelas.
- Riwayat evaluasi.
- Penghapusan hasil evaluasi.
- Ekspor hasil evaluasi ke CSV.

### 11. Laporan

Halaman laporan menyediakan ringkasan informasi aktivitas dan hasil klasifikasi.

Fitur yang tersedia:

- Ringkasan statistik.
- Grafik aktivitas klasifikasi.
- Distribusi kategori sampah.
- Pemilihan periode tampilan.
- Unduhan laporan dalam format CSV.

### 12. Profil Pengguna

Halaman profil menyediakan fasilitas pengelolaan informasi akun.

Fitur yang tersedia:

- Mengubah nama.
- Mengubah email.
- Mengubah nomor telepon.
- Mengubah kota.
- Mengganti foto profil.
- Menyimpan perubahan profil.
- Tampilan informasi aktivitas akun.

### 13. Pengaturan

Halaman pengaturan menyediakan pengelolaan preferensi dan privasi.

Fitur yang tersedia:

- Preferensi notifikasi hasil klasifikasi.
- Preferensi tips pengelolaan sampah.
- Preferensi pembaruan sistem.
- Pengelolaan privasi.
- Penghapusan data prototipe lokal.

---

## 👥 Pembagian Hak Akses

EcoSort menggunakan tiga role utama dengan hak akses yang berbeda.

| Fitur | User | Sub Admin | Super Admin |
|---|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ |
| Klasifikasi Sampah | ✓ | - | - |
| Riwayat Klasifikasi | ✓ | - | - |
| Manajemen Pengguna | - | - | ✓ |
| Data Sampah | - | ✓ | ✓ |
| Panduan Penanganan | - | ✓ | ✓ |
| Manajemen Dataset | - | - | ✓ |
| Evaluasi Model | - | - | ✓ |
| Laporan | - | ✓ | ✓ |
| Profil | ✓ | ✓ | ✓ |
| Pengaturan | ✓ | ✓ | ✓ |

### User

User merupakan pengguna umum yang menggunakan EcoSort untuk mengenali dan memilah sampah.

Tanggung jawab dan akses:

- Melakukan klasifikasi sampah.
- Melihat hasil klasifikasi.
- Menyimpan hasil klasifikasi.
- Melihat riwayat klasifikasi.
- Mengelola profil pribadi.
- Mengatur preferensi aplikasi.

### Sub Admin

Sub Admin bertanggung jawab terhadap pengelolaan informasi dan konten EcoSort.

Tanggung jawab dan akses:

- Memantau dashboard.
- Mengelola data sampah.
- Mengelola panduan penanganan.
- Memantau laporan konten.
- Mengelola profil.
- Mengatur preferensi aplikasi.

### Super Admin

Super Admin merupakan pengelola utama yang memiliki akses administratif lebih luas.

Tanggung jawab dan akses:

- Memantau dashboard utama.
- Mengelola pengguna.
- Mengelola data sampah.
- Mengelola panduan penanganan.
- Mengelola dataset.
- Melakukan evaluasi model.
- Melihat laporan.
- Mengelola profil.
- Mengatur preferensi aplikasi.

---

## 💻 Teknologi yang Digunakan

EcoSort dikembangkan menggunakan teknologi web standar tanpa framework front-end tambahan pada implementasi saat ini.

### HTML5

Digunakan untuk membangun struktur halaman aplikasi.

### CSS3

Digunakan untuk mengatur:

- Tata letak halaman.
- Warna dan tipografi.
- Komponen antarmuka.
- Responsivitas.
- Animasi.
- Tampilan dashboard.
- Modal dan notifikasi.

### JavaScript ES6+

Digunakan untuk:

- Logika aplikasi.
- Validasi formulir.
- Autentikasi prototipe.
- Pengelolaan sesi.
- Navigasi.
- Klasifikasi berbasis aturan.
- Pengelolaan data.
- Perhitungan evaluasi model.
- Interaksi antarmuka.

### Local Storage

Digunakan untuk menyimpan data prototipe secara lokal pada browser.

### Session Storage

Digunakan untuk menyimpan sesi login sementara.

### IndexedDB

Digunakan untuk menyimpan file gambar dataset.

### Google Fonts

Menggunakan font Inter untuk menjaga konsistensi tampilan antarmuka. Jika koneksi internet tidak tersedia, browser menggunakan font cadangan.

---

## 📂 Struktur Folder

Berikut struktur direktori proyek EcoSort:

```text
PROJEK ECOSORT/
│
├── README.md
├── index.html
│
├── assets/
│   ├── icon/
│   │   └── favicon.svg
│   │
│   └── images/
│       ├── ecosort-hero-recycling.jpg
│       └── ecosort-waste-collection.jpg
│
├── css/
│   ├── style.css
│   ├── components.css
│   ├── landing.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── pages.css
│   ├── feedback.css
│   └── responsive.css
│
├── js/
│   │
│   ├── components/
│   │   ├── auth-view.js
│   │   ├── landing-view.js
│   │   ├── feedback.js
│   │   └── ui.js
│   │
│   ├── core/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── components.js
│   │   ├── dashboard.js
│   │   ├── data-management-page.js
│   │   ├── database.js
│   │   ├── icon.js
│   │   ├── icons.js
│   │   ├── layout.js
│   │   ├── router.js
│   │
│   └── modules/
│       ├── classification.js
│       ├── data-page.js
│       └── model.js
│
└── pages/
    │
    ├── landing.html
    ├── login.html
    ├── register.html
    ├── forgot-password.html
    ├── reports.html
    ├── settings.html
    │
    ├── user/
    │   ├── user-dashboard.html
    │   ├── user-classification.html
    │   ├── user-history.html
    │   └── user-profile.html
    │
    ├── subadmin/
    │   ├── subadmin-dashboard.html
    │   ├── subadmin-guides.html
    │   ├── subadmin-users.html
    │   └── subadmin-waste.html
    │
    └── superadmin/
        ├── superadmin-dashboard.html
        ├── superadmin-users.html
        ├── superadmin-waste-page.html
        ├── superadmin-waste.html
        ├── superadmin-guides-page.html
        ├── superadmin-guides.html
        ├── superadmin-dataset-page.html
        ├── superadmin-dataset.html
        ├── superadmin-model-page.html
        └── superadmin-model.html
```

### Penjelasan direktori

**assets/**

Menyimpan gambar, ikon, dan aset visual yang digunakan dalam aplikasi.

**css/**

Menyimpan seluruh stylesheet untuk tampilan landing page, autentikasi, dashboard, halaman internal, dan responsivitas.

**js/components/**

Menyimpan komponen antarmuka yang digunakan untuk halaman landing, autentikasi, dan elemen UI.

**js/core/**

Berisi fungsi inti aplikasi, seperti autentikasi, database lokal, navigasi, dashboard, layout, dan pengelolaan halaman.

**js/modules/**

Berisi modul fitur khusus, seperti klasifikasi, riwayat, dataset, pengguna, panduan, data sampah, dan evaluasi model.

**pages/**

Menyimpan seluruh halaman HTML aplikasi yang dikelompokkan berdasarkan fungsi dan role.

Catatan: Beberapa file di dalam struktur merupakan placeholder atau fragmen HTML yang digunakan oleh halaman lain, bukan halaman mandiri yang harus dibuka secara langsung.

---

## ⚙️ Persyaratan Sistem

Untuk menjalankan EcoSort, diperlukan:

| Persyaratan | Keterangan |
|---|---|
| Sistem operasi | Windows, Linux, atau macOS |
| Browser | Chrome, Edge, Firefox, atau browser modern |
| JavaScript | Harus aktif |
| Python | Python 3 untuk server lokal, atau VS Code Live Server |
| Penyimpanan | Local Storage dan IndexedDB aktif |
| Koneksi internet | Diperlukan untuk memuat Google Fonts |

Tidak diperlukan instalasi framework seperti React, Vue, atau Angular.

Tidak diperlukan instalasi dependency menggunakan npm untuk menjalankan versi proyek ini.

---

## 🚀 Instalasi dan Menjalankan Aplikasi

### 1. Ekstrak proyek

Ekstrak file ZIP proyek EcoSort.

Pastikan folder utama memiliki struktur:

```text
PROJEK ECOSORT/
├── index.html
├── README.md
├── assets/
├── css/
├── js/
└── pages/
```

### 2. Buka proyek menggunakan Visual Studio Code

Buka Visual Studio Code.

Pilih:

```text
File → Open Folder
```

Kemudian pilih folder:

```text
PROJEK ECOSORT
```

Pastikan folder yang dibuka adalah folder utama proyek, bukan folder `pages` atau `js`.

### 3. Jalankan menggunakan Live Server

Jika menggunakan ekstensi Live Server:

1. Buka file `index.html`.
2. Klik kanan pada file tersebut.
3. Pilih Open with Live Server.
4. Browser akan membuka aplikasi EcoSort.

### Alternatif: Menggunakan Python

Buka terminal pada folder utama proyek.

Jalankan perintah:

```bash
python -m http.server 8000
```

Jika menggunakan Windows dan perintah tersebut tidak tersedia:

```bash
py -m http.server 8000
```

Jika menggunakan Linux atau macOS:

```bash
python3 -m http.server 8000
```

Setelah server berjalan, buka browser dan akses:

```text
http://localhost:8000/
```

Sistem akan mengarahkan pengguna ke halaman landing EcoSort.

Untuk menghentikan server, tekan:

```text
CTRL + C
```

**Penting:** Jangan menjalankan aplikasi dengan membuka file HTML melalui `file://` secara langsung. EcoSort menggunakan JavaScript ES Modules dan beberapa komponen yang membutuhkan HTTP server lokal.

---

## 📖 Panduan Penggunaan

### A. Memulai aplikasi

1. Buka halaman utama EcoSort.
2. Pelajari informasi dan kategori sampah.
3. Pilih tombol untuk memulai.
4. Sistem akan mengarahkan pengguna ke halaman login.

### B. Login sebagai User

1. Buka halaman login.
2. Pilih role User.
3. Masukkan email dan kata sandi.
4. Pilih opsi ingat sesi jika diperlukan.
5. Tekan tombol Login.
6. Sistem akan membuka Dashboard User.

### C. Login sebagai Sub Admin

1. Buka halaman login.
2. Pilih role Sub Admin.
3. Masukkan email dan kata sandi.
4. Tekan tombol Login.
5. Sistem akan membuka Dashboard Sub Admin.

### D. Login sebagai Super Admin

1. Buka halaman login.
2. Pilih akses Login Super Admin.
3. Masukkan email dan kata sandi pada halaman khusus Super Admin.
4. Tekan tombol login.
5. Sistem akan membuka Dashboard Super Admin.

### E. Melakukan klasifikasi

1. Login sebagai User.
2. Buka menu Klasifikasi Sampah.
3. Masukkan nama sampah.
4. Masukkan deskripsi atau karakteristik sampah.
5. Tekan tombol klasifikasi.
6. Periksa hasil kategori.
7. Baca alasan dan rekomendasi penanganan.
8. Simpan hasil jika ingin memasukkannya ke riwayat.

### F. Melihat riwayat

1. Buka menu Riwayat Klasifikasi.
2. Lihat daftar klasifikasi yang tersimpan.
3. Gunakan filter tanggal jika diperlukan.
4. Pilih Lihat Detail untuk informasi lebih lanjut.
5. Gunakan tombol hapus jika ingin menghapus riwayat tertentu.

### G. Mengelola data sebagai Sub Admin

1. Login sebagai Sub Admin.
2. Buka menu Data Sampah atau Panduan Penanganan.
3. Gunakan tombol tambah untuk memasukkan data.
4. Lengkapi informasi yang diperlukan.
5. Simpan perubahan.
6. Gunakan fitur pencarian dan filter untuk menemukan data.
7. Lakukan perubahan atau penghapusan sesuai kebutuhan.

### H. Mengelola sistem sebagai Super Admin

1. Login sebagai Super Admin.
2. Buka Dashboard Super Admin.
3. Pilih menu sesuai kebutuhan.
4. Kelola pengguna, data sampah, dan panduan.
5. Buka Dataset untuk mengelola data gambar.
6. Buka Evaluasi Model untuk memasukkan confusion matrix dan menghitung metrik.
7. Gunakan fitur laporan untuk melihat ringkasan dan mengunduh data.

---

## ♻️ Sistem Klasifikasi Sampah

EcoSort mengelompokkan sampah berdasarkan karakteristik dan kata kunci yang ditemukan dalam nama serta deskripsi sampah.

### Kategori utama

**1. Organik**

Sampah yang berasal dari bahan alami dan umumnya dapat terurai secara biologis.

Contoh:

- Kulit buah.
- Sisa makanan.
- Daun kering.
- Ranting.
- Ampas kopi.
- Sisa sayuran.

**2. Anorganik**

Sampah berupa material yang dapat digunakan kembali atau didaur ulang sesuai kondisi dan fasilitas yang tersedia.

Contoh:

- Botol plastik.
- Kaleng.
- Kaca.
- Aluminium.
- Kardus.
- Kertas bersih.

**3. Residu**

Sampah yang sulit didaur ulang melalui alur pemilahan umum atau telah terkontaminasi.

Contoh:

- Tisu bekas.
- Popok.
- Pembalut.
- Styrofoam.
- Kemasan sachet.
- Kertas berminyak.

**4. B3 dan sampah khusus**

Sampah yang berpotensi berbahaya dan membutuhkan penanganan khusus.

Contoh:

- Baterai.
- Aki.
- Limbah elektronik.
- Lampu tertentu.
- Obat-obatan.
- Jarum.
- Bahan kimia.
- Pestisida.

Sampah kategori khusus tidak diarahkan ke alur organik, anorganik umum, atau residu biasa.

### Proses klasifikasi

Alur klasifikasi:

```text
Pengguna memasukkan informasi sampah
                 |
                 v
       Normalisasi informasi
                 |
                 v
       Pemeriksaan kata kunci
                 |
                 v
       Analisis karakteristik
                 |
                 v
       Penentuan kategori
                 |
                 v
       Penyusunan rekomendasi
                 |
                 v
       Hasil klasifikasi
                 |
                 v
       Simpan ke riwayat
```

Sistem juga menyediakan kondisi ketika informasi belum cukup untuk menentukan kategori sehingga pengguna dapat melengkapi deskripsi atau melakukan klasifikasi ulang.

---

## 🗂️ Sistem Pengelolaan Dataset

Dataset merupakan kumpulan data gambar sampah yang dikelola oleh Super Admin.

Setiap data dapat memiliki informasi:

- Nama dataset.
- Jenis sampah.
- Kategori.
- Pembagian Training atau Testing.
- Status data.
- Deskripsi.
- Gambar.

### Pembagian dataset

**Training**

Digunakan sebagai kelompok data pelatihan.

**Testing**

Digunakan sebagai kelompok data pengujian.

### Penyimpanan dataset

- Informasi dan metadata dataset disimpan melalui Local Storage.
- File gambar disimpan menggunakan IndexedDB.
- Database gambar menggunakan nama `ecosort-dataset-db`.
- Object store yang digunakan adalah `images`.

---

## 📊 Evaluasi Model

Evaluasi model EcoSort menggunakan confusion matrix dengan empat kelas:

1. Organik.
2. Anorganik.
3. Residu.
4. B3.

### Accuracy

Mengukur proporsi prediksi yang benar terhadap seluruh data.

```text
Accuracy = Jumlah prediksi benar / Total data
```

### Precision

Mengukur ketepatan prediksi positif pada suatu kelas.

```text
Precision = TP / (TP + FP)
```

### Recall

Mengukur kemampuan sistem menemukan seluruh data aktual dari suatu kelas.

```text
Recall = TP / (TP + FN)
```

### F1-score

Merupakan rata-rata harmonis antara precision dan recall.

```text
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

### Confusion Matrix

Confusion matrix digunakan untuk membandingkan kelas aktual dengan kelas prediksi.

Baris menunjukkan kelas aktual, sedangkan kolom menunjukkan kelas prediksi.

Hasil evaluasi dapat disimpan dan ditampilkan kembali melalui riwayat evaluasi model.

---

## 💾 Sistem Penyimpanan Data

EcoSort menggunakan penyimpanan lokal browser untuk kebutuhan prototipe.

### 1. Local Storage

Digunakan untuk menyimpan:

- Informasi profil.
- Data pengguna.
- Data sampah.
- Panduan penanganan.
- Riwayat klasifikasi.
- Preferensi pengaturan.
- Metadata dataset.
- Hasil evaluasi model.
- Sesi login yang dipilih untuk diingat.

Sebagian besar data aplikasi menggunakan prefix:

```text
ecosort:
```

### 2. Session Storage

Digunakan untuk menyimpan sesi sementara.

Sesi sementara menggunakan key:

```text
ecosort:session
```

Sesi ini akan berakhir ketika sesi browser terkait berakhir.

### 3. IndexedDB

Digunakan untuk menyimpan file gambar dataset agar tidak seluruh file gambar harus disimpan sebagai teks di Local Storage.

### 4. Logout

Saat pengguna melakukan logout, sistem menghapus sesi yang tersimpan pada Local Storage dan Session Storage.

Data riwayat serta data aplikasi lainnya tidak otomatis dihapus ketika pengguna logout.

### 5. Penghapusan data

Fitur penghapusan data lokal tersedia pada halaman Pengaturan.

Penghapusan tersebut ditujukan untuk data prototipe yang menggunakan prefix Local Storage EcoSort.

File gambar yang disimpan terpisah pada IndexedDB perlu dikelola secara terpisah.

---

## 🔐 Keamanan dan Hak Akses

EcoSort memiliki pemeriksaan role pada halaman aplikasi untuk membatasi navigasi berdasarkan jenis pengguna.

Sistem menggunakan:

- Validasi role.
- Pemeriksaan sesi aktif.
- Pembatasan akses halaman.
- Pengelolaan sesi.
- Konfirmasi logout.
- Validasi formulir.
- Penyimpanan profil lokal.

**Catatan keamanan:**

Implementasi saat ini merupakan prototipe front-end. Pemeriksaan role dilakukan pada sisi browser dan belum menggantikan autentikasi serta otorisasi server.

Untuk penggunaan produksi diperlukan backend, autentikasi yang aman, penyimpanan terpusat, dan validasi hak akses pada server.

---

## ⚠️ Batasan Sistem

Beberapa bagian EcoSort masih berada dalam tahap prototipe.

### 1. Autentikasi

Autentikasi berjalan sepenuhnya di browser (tanpa server).

- Registrasi menyimpan akun ke localStorage. Kata sandi disimpan sebagai hash SHA-256 dengan salt, bukan teks asli.
- Login normal memeriksa email terdaftar, kata sandi, dan kesesuaian role.
- Login Super Admin memakai akun bawaan prototipe `superadmin@ecosort.id` dengan kata sandi `EcoSort@2026` (konstanta `SUPER_ADMIN_ACCOUNT` di `js/core/auth.js`).
- Karena tersimpan di browser, keamanan ini belum setara autentikasi server.

### 2. Pemulihan kata sandi

Permintaan pemulihan kata sandi belum mengirim email karena belum terhubung ke layanan backend.

### 3. Login Google

Integrasi Google OAuth belum dikonfigurasi.

### 4. Klasifikasi

Klasifikasi yang digunakan saat ini berbasis pencocokan kata kunci pada nama dan deskripsi sampah.

Klasifikasi tersebut belum menggunakan model machine learning terlatih untuk mengenali gambar secara otomatis.

### 5. Dataset dan Model

Dataset telah memiliki fasilitas pengelolaan gambar dan pembagian Training serta Testing.

Evaluasi model menghitung metrik berdasarkan confusion matrix yang dimasukkan pengguna. Fitur ini belum menjalankan proses pelatihan model secara otomatis.

### 6. Dashboard dan laporan

Sebagian angka statistik, grafik, dan aktivitas pada dashboard administratif serta laporan masih menggunakan data contoh untuk tampilan prototipe.

### 7. Penyimpanan

Data disimpan pada browser dan perangkat yang digunakan. Belum terdapat sinkronisasi data antarpengguna atau antarperangkat melalui server.

Oleh karena itu, data prototipe tidak disarankan digunakan untuk menyimpan informasi sensitif atau data produksi.

---

## 🛠️ Pemecahan Masalah

### 1. Halaman tidak dapat dibuka

Pastikan:

- Folder utama proyek sudah benar.
- Server lokal sudah berjalan.
- Alamat browser menggunakan `http://localhost`.
- File `index.html` berada pada folder utama.

### 2. Halaman kosong

Periksa:

- JavaScript sudah aktif.
- Semua file JavaScript tersedia.
- Tidak ada kesalahan pada Console browser.
- Jalur import file sudah sesuai.

### 3. Login tidak berhasil

Pastikan:

- Email memiliki format yang benar.
- Kata sandi memenuhi panjang minimal delapan karakter dan akun sudah terdaftar.
- Role yang dipilih sesuai.
- Sesi browser tidak mengalami masalah penyimpanan.

### 4. Data tidak muncul

Periksa:

- Browser yang digunakan sama.
- Domain dan port server lokal sama.
- Local Storage belum terhapus.
- Data tidak sedang berada pada browser atau perangkat lain.

### 5. Gambar dataset tidak muncul

Pastikan:

- Browser mendukung IndexedDB.
- Gambar menggunakan format yang didukung.
- Ukuran gambar tidak lebih dari 5 MB.
- Data gambar belum dihapus dari penyimpanan browser.

### 6. Perubahan kode tidak terlihat

Lakukan pemuatan ulang halaman secara penuh:

```text
CTRL + SHIFT + R
```

Jika masih bermasalah, buka Developer Tools dan periksa tab Console.

---

## 🚀 Pengembangan Selanjutnya

Beberapa pengembangan yang dapat dilakukan pada EcoSort:

1. Integrasi backend untuk autentikasi dan manajemen pengguna.
2. Integrasi database terpusat.
3. Pengembangan model machine learning untuk klasifikasi gambar sampah.
4. Integrasi dataset dengan proses pelatihan model.
5. Pengembangan sistem notifikasi.
6. Integrasi layanan pemulihan kata sandi.
7. Integrasi autentikasi Google.
8. Pengembangan laporan dan analisis statistik berbasis data aktual.
9. Pengujian keamanan dan performa aplikasi.
10. Deployment aplikasi ke server produksi.

Pengembangan dilakukan secara bertahap dengan tetap mempertahankan struktur dan desain utama EcoSort.

---

## 🌍 Penutup

EcoSort diharapkan menjadi salah satu solusi digital yang dapat membantu meningkatkan pemahaman masyarakat mengenai klasifikasi dan pengelolaan sampah.

Dengan adanya fitur klasifikasi, rekomendasi penanganan, pengelolaan data, dataset, dan evaluasi model, EcoSort dirancang sebagai platform yang mendukung proses edukasi serta pengelolaan informasi sampah secara lebih terstruktur.

Melalui pengembangan berkelanjutan, EcoSort diharapkan dapat memberikan kontribusi positif terhadap peningkatan kesadaran lingkungan dan penerapan pengelolaan sampah yang lebih bertanggung jawab.

---

**EcoSort — Sort Smart, Live Green.** ♻️