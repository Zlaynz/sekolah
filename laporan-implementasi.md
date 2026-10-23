# Dokumentasi Implementasi Aplikasi Penilaian & Presensi Siswa SMP

Sistem Penilaian Akademik dan Presensi Siswa SMP telah selesai dibangun secara menyeluruh sesuai dengan dokumen spesifikasi **Product Requirement Document (PRD)**.

---

## 1. Ringkasan Arsitektur & Teknologi

| Komponen | Spesifikasi | Detail Konfigurasi |
| :--- | :--- | :--- |
| **Database** | MySQL Server (Laragon) | Port `3306`, Database: `sekolah_db`, User: `root` (tanpa password) |
| **Backend REST API** | C# .NET 8 (ASP.NET Core Web API) | EF Core Pomelo MySQL, JWT Authentication, Clean Architecture |
| **Frontend** | React 18 + Vite | Tailwind CSS v4, React Router v6, Axios, Lucide Icons, Hot Toast |
| **Status Layanan** | Aktif | Backend: `http://localhost:5000` \| Frontend: `http://127.0.0.1:5173` |

---

## 2. Pemenuhan 3 Ketentuan Khusus Backend

### A. Restful API Queue (Background Worker)
* **Arsitektur Antrean:** Menggunakan `System.Threading.Channels.Channel<JobDto>` dengan kapasitas terkontrol (bounded channel) dan dieksekusi asinkron oleh background worker `JobQueueWorker` (`BackgroundService`).
* **Kegunaan:** Pemrosesan kompilasi rapor skala besar, agregasi nilai semester, dan ekspor data tanpa memblokir request thread HTTP.
* **RESTful Endpoints:**
  * `POST /api/queue/jobs`: Menambahkan tugas ke dalam antrean (mengembalikan HTTP `202 Accepted` beserta ID tugas & URI status).
  * `GET /api/queue/jobs/{id}`: Melakukan polling progres status (`Queued` -> `Processing` (10%..90%) -> `Completed` (100%)).
  * `GET /api/queue/jobs`: Memantau seluruh antrean tugas aktif dan riwayatnya.
* **UI Antrean:** Disediakan halaman visualisasi antrean interaktif di `/queue/jobs` dengan *real-time progress bar*.

### B. Query Optimizing (Optimalisasi Kueri Database)
* **AsNoTracking:** Semua endpoint pembacaan data memanfaatkan `.AsNoTracking()` untuk menonaktifkan overhead change-tracking EF Core.
* **Proyeksi DTO (`.Select()`):** Mencegah *over-fetching* dengan hanya memilih kolom data yang dibutuhkan di tingkat database SQL.
* **Pagination Terpadu (`ToPagedListAsync`):** Seluruh daftar data menggunakan paging standar (`page`, `pageSize`, total items, total pages) sehingga beban memori tetap ringan.
* **Composite Indexes:** Diterapkan indeks komposit pada tabel dengan volume kueri tinggi:
  * `daily_grades(subject_teacher_id, student_id)`
  * `exam_grades(subject_teacher_id, student_id, exam_type)`
  * `attendances(subject_teacher_id, date)`
  * `graduation_exams(academic_year_id, student_id, subject_id)`
  * `students(full_name)`, `teachers(full_name)`

### C. Fitur Search Seperti Search Engine
* **Endpoint Pencarian:** `GET /api/search?q={query}&type={type}`
* **Multi-Entity Search:** Melakukan pencarian lintas 4 entitas utama: Siswa, Guru & Pejabat, Rombel Kelas, dan Mata Pelajaran.
* **Weighted Relevance Scoring:**
  * **Exact Match (100 poin):** Kata kunci identik persis dengan nama/NISN/kode.
  * **Prefix Match (75 poin):** Kata kunci berada di awal kata/kalimat.
  * **Contains Match (50 poin):** Kata kunci terkandung di dalam teks.
  * **Tokenized Word Matching:** Mendukung pencarian multi-kata (contoh: *"Matematika 7"*).
* **Metadata & Quick Navigation:** Menampilkan jumlah hasil per kategori, waktu eksekusi dalam milidetik (*execution time in ms*), skor relevansi, serta tombol navigasi langsung ke entitas terkait.

---

## 3. Pemenuhan Aturan Bisnis PRD

1. **KKM Standar Tunggal (75.00):**
   * Seluruh mata pelajaran memiliki nilai KKM tetap **75.00**.
   * Di tabel penilaian guru dan rapor siswa, setiap sel dengan nilai $< 75$ otomatis diberi penanda *background* **merah muda** dengan badge *"Belum Tuntas / Perlu Remedi"*.
2. **Restriksi Modul Ujian Kelulusan (Khusus Kelas 9):**
   * Modul Ujian Kelulusan hanya aktif untuk siswa tingkat **Kelas 9**.
   * Validasi backend maupun frontend menolak masukan nilai ujian kelulusan untuk siswa kelas 7 dan 8.
3. **Mekanisme Soft Delete & Proteksi Relasi (Referential Integrity - HTTP 422):**
   * Setiap tabel utama memiliki kolom `deleted_at` dengan global query filter aktif.
   * Sebelum operasi *soft delete* dijalankan, sistem mengecek keberadaan data anak aktif.
   * Jika relasi anak masih aktif ditemukan, sistem menolak operasi dan mengembalikan respon **HTTP 422 Unprocessable Entity** dengan rincian tabel yang terikat (sesuai PRD Bab 4.1).
4. **Formulasi Algoritma Nilai Rapor & Kelulusan:**
   * **Kelas 7 & 8 (Semester):**
     $$NA = (0.30 \times R_{TH}) + (0.30 \times UTS) + (0.40 \times UAS/UKK)$$
   * **Kelas 9 (Kelulusan):**
     $$NA_{Lulus} = (0.60 \times \overline{\text{Rapor S1–S5}}) + (0.40 \times \text{GraduationExam.final\_score})$$
5. **Kuncian Nilai (Locking Period):**
   * Bila status tahun ajaran diatur `is_locked = true`, penginputan nilai dan presensi oleh guru otomatis diblokir sistem.

---

## 4. Kredensial Akun Pengujian Sistem

| Peran (Role) | Username | Password | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin123` | Akses penuh manajemen master data, rombel, guru mapel, user, & kuncian nilai |
| **GURU** | `guru1` | `password123` | Guru Budi: Input presensi, nilai tugas harian, nilai ujian UTS/UAS mapel MAT-7 & MAT-9 |
| **WALIKELAS** | `guru2` | `password123` | Guru Siti: Wali Kelas 9-A & Guru BIN-7, rekap absensi rombel, cetak rapor |
| **WAKASEK** | `wakasek` | `password123` | Pak Hendra: Kontrol kuncian nilai tahun ajaran & evaluasi rekomendasi kelulusan Kls 9 |
| **KEPSEK** | `kepsek` | `password123` | Ibu Nurhayati: Monitoring executive dashboard dan laporan mutu belajar |
| **SISWA** | `siswa1` | `password123` | Siswa Ahmad Dani (Kls 7-A): Akses profil diri, rekap absensi, dan unduh rapor PDF |
