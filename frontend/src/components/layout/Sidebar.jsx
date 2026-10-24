import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import UserAvatar from '../common/UserAvatar';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  Calendar,
  UserCheck,
  ClipboardList,
  FileText,
  Search,
  X,
  BookOpenCheck,
  BarChart3,
  CheckCircle,
  UserCircle,
  Award,
  FileBarChart,
  UsersRound,
  LibraryBig,
  Layers,
} from 'lucide-react';

const getNavItems = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return [
        { type: 'section', label: 'Utama' },
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { type: 'section', label: 'Master Data' },
        { path: '/admin/users', label: 'Pengguna & Akun', icon: Users },
        { path: '/admin/academic-years', label: 'Tahun Ajaran', icon: Calendar },
        { path: '/admin/teachers', label: 'Data Guru', icon: GraduationCap },
        { path: '/admin/students', label: 'Data Siswa', icon: UsersRound },
        { path: '/admin/subjects', label: 'Mata Pelajaran', icon: BookOpen },
        { path: '/admin/classes', label: 'Rombel Kelas', icon: School },
        { type: 'section', label: 'Manajemen Kelas' },
        { path: '/admin/class-students', label: 'Plotting Siswa', icon: UserCheck },
        { path: '/admin/subject-teachers', label: 'Guru Pengampu', icon: LibraryBig },
        { type: 'section', label: 'Layanan Sistem' },
        { path: '/search', label: 'Mesin Pencari', icon: Search },
        { path: '/queue/jobs', label: 'Antrean Background', icon: Layers },
      ];

    case ROLES.GURU:
      return [
        { type: 'section', label: 'Utama' },
        { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { type: 'section', label: 'Penilaian Akademik' },
        { path: '/teacher/attendance', label: 'Input Presensi', icon: ClipboardList },
        { path: '/teacher/daily-grades', label: 'Nilai Harian', icon: BookOpenCheck },
        { path: '/teacher/exam-grades', label: 'Nilai UTS/UAS/UKK', icon: FileText },
        { path: '/teacher/graduation-exams', label: 'Ujian Kelulusan', icon: Award, gradeLevel: 9 },
        { type: 'section', label: 'Lainnya' },
        { path: '/search', label: 'Pencarian Global', icon: Search },
        { path: '/queue/jobs', label: 'Antrean Tugas', icon: Layers },
      ];

    case ROLES.WALIKELAS:
      return [
        { type: 'section', label: 'Utama' },
        { path: '/homeroom/dashboard', label: 'Dashboard Guru', icon: LayoutDashboard },
        { type: 'section', label: 'Wali Kelas' },
        { path: '/homeroom/attendance-recap', label: 'Rekap Presensi & Nilai', icon: ClipboardList },
        { path: '/homeroom/report-cards', label: 'Cetak Rapor Rombel', icon: FileBarChart },
        { type: 'section', label: 'Lainnya' },
        { path: '/search', label: 'Pencarian Global', icon: Search },
        { path: '/queue/jobs', label: 'Antrean Unduh Rapor', icon: Layers },
      ];

    case ROLES.WAKASEK:
      return [
        { type: 'section', label: 'Utama' },
        { path: '/principal/dashboard', label: 'Dashboard Kurikulum', icon: LayoutDashboard },
        { type: 'section', label: 'Pengawasan Akademik' },
        { path: '/admin/academic-years', label: 'Kuncian Periode Nilai', icon: Calendar },
        { path: '/homeroom/attendance-recap', label: 'Rekapitulasi Rombel', icon: BarChart3 },
        { path: '/vice-principal/graduation', label: 'Evaluasi Kelulusan Kls 9', icon: CheckCircle },
        { type: 'section', label: 'Layanan' },
        { path: '/search', label: 'Pencarian Global', icon: Search },
        { path: '/queue/jobs', label: 'Antrean Kompilasi', icon: Layers },
      ];

    case ROLES.KEPSEK:
      return [
        { type: 'section', label: 'Utama' },
        { path: '/principal/dashboard', label: 'Dashboard Eksekutif', icon: LayoutDashboard },
        { type: 'section', label: 'Laporan & Mutu' },
        { path: '/homeroom/attendance-recap', label: 'Rekap Capaian Sekolah', icon: FileBarChart },
        { path: '/vice-principal/graduation', label: 'Laporan Kelulusan Kls 9', icon: Award },
        { type: 'section', label: 'Layanan' },
        { path: '/search', label: 'Pencarian Global', icon: Search },
        { path: '/queue/jobs', label: 'Antrean Dokumen', icon: Layers },
      ];

    case ROLES.SISWA:
      return [
        { type: 'section', label: 'Utama' },
        { path: '/student/profile', label: 'Profil Saya', icon: UserCircle },
        { path: '/student/attendance', label: 'Presensi Saya', icon: ClipboardList },
        { path: '/student/grades', label: 'Nilai & Rapor Saya', icon: BookOpenCheck },
        { type: 'section', label: 'Layanan' },
        { path: '/queue/jobs', label: 'Antrean Unduh Saya', icon: Layers },
      ];

    default:
      return [];
  }
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = getNavItems(user?.role);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-indigo-600 shrink-0">
        <div className="flex items-center gap-2">
          <School className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-base font-bold text-white leading-tight">SIAKAD SMP</h1>
            <p className="text-xs text-indigo-200">Sistem Penilaian Terpadu</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-white hover:text-indigo-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item, idx) => {
            if (item.type === 'section') {
              return (
                <li key={`section-${idx}`} className="pt-4 first:pt-0">
                  <span className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                </li>
              );
            }

            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-gray-700 hover:bg-gray-100 font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.label}
                  {item.gradeLevel === 9 && (
                    <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                      Kls 9
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile footer pill */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/60 flex items-center gap-3">
        <UserAvatar
          photoPath={user?.photoPath}
          name={user?.name || user?.username}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-800 truncate leading-tight">
            {user?.name || user?.username}
          </p>
          <p className="text-[10px] text-gray-500 font-medium">
            {ROLE_LABELS[user?.role] || user?.role || 'Guest'}
          </p>
        </div>

      </div>
    </aside>
  );
}
