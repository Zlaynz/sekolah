import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, GraduationCap, School, BookOpen, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Siswa', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500', link: '/admin/students' },
    { label: 'Total Guru', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'bg-emerald-500', link: '/admin/teachers' },
    { label: 'Rombongan Belajar', value: stats?.totalClasses || 0, icon: School, color: 'bg-purple-500', link: '/admin/classes' },
    { label: 'Mata Pelajaran', value: stats?.totalSubjects || 0, icon: BookOpen, color: 'bg-amber-500', link: '/admin/subjects' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrator</h1>
          <p className="text-sm text-gray-500">Ringkasan master data dan status sistem akademik</p>
        </div>

        {/* Active Academic Year Pill */}
        {stats?.activeAcademicYear && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-medium text-indigo-700">
            <Clock className="w-4 h-4" />
            <span>Tahun Ajaran: {stats.activeAcademicYear.yearName} ({stats.activeAcademicYear.semester})</span>
            {stats.activeAcademicYear.isLocked ? (
              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">Terkunci</span>
            ) : (
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-bold">Aktif Terbuka</span>
            )}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center text-white shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* PRD Compliance Status Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" /> Standar Kriteria Ketuntasan Minimal (KKM) & Proteksi Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-100 mt-4">
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <span className="font-semibold text-white block">KKM Tunggal SMP: 75.00</span>
            Nilai di bawah 75 secara visual ditandai merah & perlu perbaikan/remedi.
          </div>
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <span className="font-semibold text-white block">Restriksi Modul Kelas 9</span>
            Ujian kelulusan terisolasi khusus siswa kelas 9; ditolak untuk kelas 7 dan 8.
          </div>
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
            <span className="font-semibold text-white block">Soft Delete Protektif (HTTP 422)</span>
            Pencegahan penghapusan data induk yang masih memiliki relasi data anak aktif.
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3">Siswa Terbaru Terdaftar</h2>
          <div className="divide-y divide-gray-100">
            {stats?.recentStudents?.length > 0 ? (
              stats.recentStudents.map((st) => (
                <div key={st.id} className="py-2.5 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-gray-800">{st.fullName}</span>
                    <span className="text-gray-400 text-xs ml-2">NISN: {st.nisn}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                    {st.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 py-4">Belum ada siswa terdaftar.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-right">
            <Link to="/admin/students" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              Lihat Semua Siswa &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3">Aksi Cepat Manajemen</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/academic-years" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 block transition-colors">
              📅 Konfigurasi Tahun Ajaran
            </Link>
            <Link to="/admin/classes" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 block transition-colors">
              🏫 Buat Rombongan Belajar
            </Link>
            <Link to="/admin/subject-teachers" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 block transition-colors">
              📖 Plotting Guru Pengampu
            </Link>
            <Link to="/queue/jobs" className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 block transition-colors">
              ⚡ Antrean Tugas Background
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

