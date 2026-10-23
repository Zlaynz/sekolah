// Role constants (supports uppercase from backend)
export const ROLES = {
  ADMIN: 'ADMIN',
  GURU: 'GURU',
  WALIKELAS: 'WALIKELAS',
  WAKASEK: 'WAKASEK',
  KEPSEK: 'KEPSEK',
  SISWA: 'SISWA',
};

// KKM (Kriteria Ketuntasan Minimal)
export const KKM = 75;

// Grade calculation weights for grades 7 & 8
export const GRADE_WEIGHTS = {
  DAILY: 0.30,
  UTS: 0.30,
  UAS_UKK: 0.40,
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// Attendance status options
export const ATTENDANCE_STATUS = {
  HADIR: 'HADIR',
  IZIN: 'IZIN',
  SAKIT: 'SAKIT',
  ALPA: 'ALPA',
};

// Exam types
export const EXAM_TYPES = {
  UTS: 'UTS',
  UAS: 'UAS',
  UKK: 'UKK',
};

// Grade levels for SMP
export const GRADE_LEVELS = [7, 8, 9];

// Role labels in Indonesian
export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  GURU: 'Guru Mata Pelajaran',
  WALIKELAS: 'Wali Kelas',
  WAKASEK: 'Wakasek Kurikulum',
  KEPSEK: 'Kepala Sekolah',
  SISWA: 'Siswa',
};
