# Product Requirement Document (PRD)

## Web Application Penilaian & Presensi Siswa Sekolah Menengah Pertama (SMP)

---

## 1. Dokumen Dokumen & Gambaran Umum (Overview & Context)

### 1.1 Tujuan Aplikasi
Aplikasi Penilaian Siswa SMP adalah *web application* yang dirancang untuk mengelola seluruh ekosistem penilaian akademik, kehadiran, serta kelulusan/kenaikan kelas. Sistem ini mengusung batas Kriteria Ketuntasan Minimal (KKM) tunggal sebesar **75** untuk semua mata pelajaran, serta menyediakan fungsionalitas khusus Ujian Kelulusan yang terisolasi untuk siswa Kelas 9.

### 1.2 Lingkup Pengguna (User Roles)
* **Admin:** Pengelolaan *master data*, konfigurasi tahun ajaran, dan manajemen akun.
* **Siswa:** Akses *read-only* profil, kehadiran, nilai harian/ujian, dan unduh Rapor PDF.
* **Guru Mata Pelajaran:** Penginputan presensi mapel serta nilai (Tugas, UTS, UAS, UKK, dan Ujian Kelulusan untuk Kelas 9).
* **Wali Kelas:** Rekapitulasi presensi, penginputan nilai sikap/catatan wali kelas, dan pemicu cetak rapor kelas.
* **Wakil Kepala Sekolah (Wakasek Kurikulum):** Pengawasan rekapitulasi nilai sekolah, penetapan status kuncian nilai (*locking period*), dan rekomendasi kenaikan/kelulusan.
* **Kepala Sekolah:** Monitoring *executive dashboard*, persetujuan (*approval*) laporan hasil belajar, dan cetak dokumen resmi.

---

## 2. Aturan Bisnis Spesiﬁk (Core Business Rules & Constraints)

1. **KKM Standar:** Batas kelulusan minimum seluruh mata pelajaran adalah **75**. Nilai $< 75$ secara visual ditandai merah (*Belum Tuntas / Perlu Remedi*).
2. **Restriksi Modul Ujian Kelulusan:** Modul Ujian Kelulusan hanya aktif untuk siswa dengan tingkatan kelas **9**. Sistem harus menolak *payload* atau input nilai Ujian Kelulusan untuk tingkat kelas 7 dan 8 baik di *frontend* maupun *backend validation*.
3. **Mekanisme Soft Delete:** 
   * Semua tabel utama menggunakan *soft delete* (`deleted_at TIMESTAMP NULL`).
   * Data yang di-*soft delete* tidak boleh muncul pada query tampilan standar aplikasi (*Active Scope*).
4. **Proteksi Relasi (Referential Integrity Constraint on Soft Delete):**
   * **Aturan Utama:** Sebelum mengeksekusi *soft delete* pada data utama (*primary/parent record* like `students`, `teachers`, `subjects`, `classes`), sistem **WAJIB** mengecek keberadaan relasi data anak (*child records*) yang masih aktif (`deleted_at IS NULL`).
   * Jika relasi anak yang aktif ditemukan, sistem **HARUS MENOLAK** operasi hapus (*soft delete*) dan mengembalikan pesan galat (*error message*), contoh: `"Data tidak dapat dihapus karena masih digunakan pada data [Nama Tabel Relasi]"`.
   * Data *parent* hanya boleh di-*soft delete* jika tidak memiliki data anak aktif, atau jika seluruh data anak terkait telah ter-*soft delete* terlebih dahulu.

---

## 3. Arsitektur Database & Spesifikasi Tabel Rinci (Database Schema)

Database menggunakan pendekatan Relational DBMS (PostgreSQL / MySQL) dengan spesifikasi tipe data, kunci primer, kunci asing, serta bidang pelacakan audit dan soft delete.

### 3.1 Skema Diagram Relasi & Keterhubungan (Entity Relationship Overview)

* **`users`** $1 \rightarrow 1$ **`teachers`** / **`students`**
* **`academic_years`** $1 \rightarrow N$ **`classes`**
* **`classes`** $1 \rightarrow N$ **`class_students`** $\leftarrow 1$ **`students`**
* **`teachers`** $1 \rightarrow N$ **`classes`** (Sebagai Wali Kelas)
* **`classes`** $1 \rightarrow N$ **`subject_teachers`** $\leftarrow 1$ **`subjects`**, $1 \leftarrow$ **`teachers`**
* **`subject_teachers`** $1 \rightarrow N$ **`attendances`** $\leftarrow 1$ **`students`**
* **`subject_teachers`** $1 \rightarrow N$ **`daily_grades`** $\leftarrow 1$ **`students`**
* **`subject_teachers`** $1 \rightarrow N$ **`exam_grades`** $\leftarrow 1$ **`students`**
* **`students`** $1 \rightarrow N$ **`graduation_exams`** $\leftarrow 1$ **`subjects`**

---

### 3.2 Kamus Data & Struktur Tabel Rinci

#### 1. Tabel `users`
Mengolah otentikasi dan identitas pengguna sistem.

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT / UUID | Primary Key, Auto Increment | Identitas unik user |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Username login |
| `password` | VARCHAR(255) | NOT NULL | Hash password (BCrypt/Argon2) |
| `role` | ENUM | NOT NULL | `'ADMIN','GURU','WALIKELAS','WAKASEK','KEPSEK','SISWA'` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 2. Tabel `academic_years` (Tahun Ajaran)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Tahun Ajaran |
| `year_name` | VARCHAR(20) | NOT NULL | Contoh: "2025/2026" |
| `semester` | ENUM | NOT NULL | `'GANJIL', 'GENAP'` |
| `is_active` | BOOLEAN | DEFAULT FALSE | Tahun ajaran aktif |
| `is_locked` | BOOLEAN | DEFAULT FALSE | Mengunci penginputan nilai |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 3. Tabel `teachers` (Data Guru & Pejabat Sekolah)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Guru |
| `user_id` | BIGINT | FK -> `users.id`, UNIQUE, NULLABLE | Relasi ke akun user |
| `nip` | VARCHAR(30) | UNIQUE, NULLABLE | NIP/NIK Guru |
| `full_name` | VARCHAR(100) | NOT NULL | Nama lengkap beserta gelar |
| `gender` | ENUM | NOT NULL | `'L', 'P'` |
| `position` | ENUM | DEFAULT 'GURU' | `'GURU', 'WAKASEK', 'KEPSEK'` |
| `signature_path` | VARCHAR(255) | NULLABLE | Path file tanda tangan elektronik |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 4. Tabel `students` (Data Siswa)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Siswa |
| `user_id` | BIGINT | FK -> `users.id`, UNIQUE, NULLABLE | Relasi ke akun user |
| `nisn` | VARCHAR(10) | UNIQUE, NOT NULL | NISN Siswa |
| `nis` | VARCHAR(20) | UNIQUE, NOT NULL | NIS Lokal |
| `full_name` | VARCHAR(100) | NOT NULL | Nama lengkap siswa |
| `gender` | ENUM | NOT NULL | `'L', 'P'` |
| `birth_place` | VARCHAR(50) | NOT NULL | Tempat lahir |
| `birth_date` | DATE | NOT NULL | Tanggal lahir |
| `status` | ENUM | DEFAULT 'AKTIF' | `'AKTIF', 'LULUS', 'MUTASI'` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 5. Tabel `subjects` (Mata Pelajaran)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Mata Pelajaran |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | Kode Mapel (misal: MAT-7) |
| `name` | VARCHAR(100) | NOT NULL | Nama Mata Pelajaran |
| `kkm` | DECIMAL(5,2) | DEFAULT 75.00, NOT NULL | Standar kelulusan (Fixed 75) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 6. Tabel `classes` (Rombongan Belajar / Kelas)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Kelas |
| `academic_year_id`| BIGINT | FK -> `academic_years.id`, NOT NULL | Relasi Tahun Ajaran |
| `homeroom_teacher_id`| BIGINT | FK -> `teachers.id`, NOT NULL | Wali Kelas |
| `grade_level` | INT | CHECK (grade_level IN (7, 8, 9)) | Tingkat Kelas |
| `class_name` | VARCHAR(20) | NOT NULL | Nama Kelas (Contoh: "7-A") |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 7. Tabel `class_students` (Plotting Siswa ke Kelas)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Plotting |
| `class_id` | BIGINT | FK -> `classes.id`, NOT NULL | ID Kelas |
| `student_id` | BIGINT | FK -> `students.id`, NOT NULL | ID Siswa |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

*Constraint Unik:* Combined Unique (`class_id`, `student_id`, `deleted_at`)

---

#### 8. Tabel `subject_teachers` (Pengampu Mata Pelajaran Kelas)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Penugasan Mapel |
| `class_id` | BIGINT | FK -> `classes.id`, NOT NULL | ID Kelas |
| `subject_id` | BIGINT | FK -> `subjects.id`, NOT NULL | ID Mapel |
| `teacher_id` | BIGINT | FK -> `teachers.id`, NOT NULL | ID Guru Pengampu |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 9. Tabel `attendances` (Presensi Siswa)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Presensi |
| `subject_teacher_id`| BIGINT | FK -> `subject_teachers.id`, NOT NULL| Pengampu Mapel |
| `student_id` | BIGINT | FK -> `students.id`, NOT NULL | ID Siswa |
| `date` | DATE | NOT NULL | Tanggal Presensi |
| `status` | ENUM | NOT NULL | `'HADIR','IZIN','SAKIT','ALPA'`|
| `notes` | TEXT | NULLABLE | Keterangan |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 10. Tabel `daily_grades` (Penilaian Tugas Harian)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Nilai Harian |
| `subject_teacher_id`| BIGINT | FK -> `subject_teachers.id`, NOT NULL| Pengampu Mapel |
| `student_id` | BIGINT | FK -> `students.id`, NOT NULL | ID Siswa |
| `task_title` | VARCHAR(100) | NOT NULL | Nama Tugas/Kuis |
| `score` | DECIMAL(5,2) | CHECK (score BETWEEN 0 AND 100) | Nilai (0-100) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

#### 11. Tabel `exam_grades` (Penilaian UTS, UAS, & UKK)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Nilai Ujian |
| `subject_teacher_id`| BIGINT | FK -> `subject_teachers.id`, NOT NULL| Pengampu Mapel |
| `student_id` | BIGINT | FK -> `students.id`, NOT NULL | ID Siswa |
| `exam_type` | ENUM | NOT NULL | `'UTS', 'UAS', 'UKK'` |
| `score` | DECIMAL(5,2) | CHECK (score BETWEEN 0 AND 100) | Nilai Ujian (0-100) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

*Aturan Aplikasi:* `UKK` hanya diinput pada semester GENAP untuk kelas 7 dan 8.

---

#### 12. Tabel `graduation_exams` (Khusus Ujian Kelulusan - Kelas 9)

| Nama Kolom | Tipe Data | Constraint / Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | Primary Key, Auto Increment | ID Ujian Kelulusan |
| `academic_year_id`| BIGINT | FK -> `academic_years.id`, NOT NULL | Tahun Ajaran |
| `student_id` | BIGINT | FK -> `students.id`, NOT NULL | ID Siswa (Wajib Kelas 9) |
| `subject_id` | BIGINT | FK -> `subjects.id`, NOT NULL | ID Mapel |
| `written_score` | DECIMAL(5,2) | DEFAULT 0.00 | Nilai Ujian Tulis |
| `practical_score`| DECIMAL(5,2) | DEFAULT 0.00 | Nilai Ujian Praktik |
| `final_score` | DECIMAL(5,2) | GENERATED / COMPUTED | Average / Weight Score |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu buat |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu ubah |
| `deleted_at` | TIMESTAMP | NULLABLE | Soft delete timestamp |

---

## 4. Mekanisme Soft Delete & Restriksi Penghapusan (Soft Delete Protection Logic)

Sistem wajib menerapkan proteksi dependensi relasi sebelum mengeksekusi operasi *soft delete*.

```
[User Request: Soft Delete Data Utama (e.g. Students)]
                      │
                      ▼
    [Check Child Tables for Active Records?]
   (Where foreign_key = Target.id AND deleted_at IS NULL)
                      │
            ┌─────────┴─────────┐
            │                   │
         [YES]                [NO]
            │                   │
            ▼                   ▼
 [Reject Delete Operation]    [Execute Soft Delete]
 [Return HTTP 422 Error]      [Set deleted_at = NOW()]
```

### 4.1 Daftar Tabel & Aturan Dependensi Hapus

| Tabel Utama (Parent) | Tabel Anak yang Wajib Kosong / Ter-soft delete | Respon Sistem Jika Ada Relasi Aktif |
| :--- | :--- | :--- |
| `students` | `class_students`, `attendances`, `daily_grades`, `exam_grades`, `graduation_exams` | **422 Unprocessable Entity:** "Data siswa tidak dapat dihapus karena memiliki riwayat kelas, presensi, atau nilai aktif." |
| `teachers` | `classes` (sebagai Wali Kelas), `subject_teachers` | **422 Unprocessable Entity:** "Data guru tidak dapat dihapus karena masih terdaftar sebagai wali kelas atau pengampu mata pelajaran aktif." |
| `subjects` | `subject_teachers`, `graduation_exams` | **422 Unprocessable Entity:** "Mata pelajaran tidak dapat dihapus karena masih digunakan pada penugasan pengampu/ujian." |
| `classes` | `class_students`, `subject_teachers` | **422 Unprocessable Entity:** "Kelas tidak dapat dihapus karena masih memiliki daftar siswa atau penugasan mapel aktif." |
| `academic_years` | `classes`, `graduation_exams` | **422 Unprocessable Entity:** "Tahun ajaran tidak dapat dihapus karena memiliki data kelas atau ujian kelulusan aktif." |

---

## 5. Algoritma Penilaian & Kalkulasi Sistem

### 5.1 Perhitungan Nilai Akhir Mapel Semester (Kelas 7 & 8)
Formulasi standar hitung Rapor per mapel:
* **Rata-Rata Tugas Harian ($R_{TH}$):** Total Nilai Tugas / Jumlah Tugas.
* **Nilai Akhir Rapor ($NA$):**

$$NA = (0.30 \times R_{TH}) + (0.30 \times UTS) + (0.40 \times UAS/UKK)$$

* **Evaluasi KKM:**
  $$\text{Status} = \begin{cases} \text{Tuntas}, & \text{jika } NA \ge 75.00 \\ \text{Belum Tuntas}, & \text{jika } NA < 75.00 \end{cases}$$

### 5.2 Perhitungan Nilai Kelulusan (Kelas 9)
Siswa Kelas 9 dievaluasi berdasarkan gabungan Nilai Rapor Semester 1–5 dan Ujian Kelulusan:

$$NA_{Lulus} = (0.60 \times \overline{\text{Rapor S1–S5}}) + (0.40 \times \text{GraduationExam.final\_score})$$

---

## 6. Kebutuhan Antarmuka Web (UI/UX Requirements)

1. **Indicator Minimum KKM:** Tampilan tabel nilai guru/wali kelas secara otomatis memberikan *background highlight* merah muda pada sel nilai $< 75$.
2. **Dynamic Menu Ujian Kelulusan:** Visualisasi menu "Ujian Kelulusan" pada bilah navigasi guru/admin hanya dirender jika *filter* kelas yang dipilih adalah **Kelas 9**.
3. **Modal Konfirmasi Hapus & Error Alert:**
   * Saat tombol hapus diklik, tampilkan dialog konfirmasi soft delete.
   * Jika sistem mendeteksi relasi aktif, munculkan *modal error* yang menginformasikan rincian tabel mana yang masih memegang relasi aktif tersebut.