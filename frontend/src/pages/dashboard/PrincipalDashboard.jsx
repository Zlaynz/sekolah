import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Award, Users, School, BookOpen, CheckCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrincipalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/principal');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat dashboard eksekutif...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Eksekutif Kepala Sekolah & Wakasek</h1>
        <p className="text-sm text-gray-500">Pengawasan capaian standar akademik & evaluasi kelulusan sekolah</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Siswa Aktif</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{data?.totalStudents || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Tenaga Pendidik</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{data?.totalTeachers || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Kandidat Kelulusan Kls 9</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{data?.grade9Candidates || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Standar KKM Tunggal</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">75.00</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Akses Laporan & Evaluasi Mutu Belajar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/academic-years"
            className="p-4 rounded-xl border border-gray-200 hover:border-indigo-400 bg-gray-50/50 block transition-all"
          >
            <h3 className="font-bold text-gray-900">Kuncian Nilai (Locking Period)</h3>
            <p className="text-xs text-gray-500 mt-1">
              Atur status buka / tutup penginputan nilai rapor oleh para guru sebelum rapat pleno kenaikan kelas.
            </p>
          </Link>

          <Link
            to="/vice-principal/graduation"
            className="p-4 rounded-xl border border-gray-200 hover:border-indigo-400 bg-gray-50/50 block transition-all"
          >
            <h3 className="font-bold text-gray-900">Kalkulasi Kelulusan Kelas 9</h3>
            <p className="text-xs text-gray-500 mt-1">
              Formulasi otomatis: 60% Rata-rata Rapor S1-S5 + 40% Ujian Kelulusan sesuai regulasi PRD.
            </p>
          </Link>

          <Link
            to="/queue/jobs"
            className="p-4 rounded-xl border border-gray-200 hover:border-indigo-400 bg-gray-50/50 block transition-all"
          >
            <h3 className="font-bold text-gray-900">Antrean Generasi Rapor PDF</h3>
            <p className="text-xs text-gray-500 mt-1">
              Pantau antrean background worker kompilasi dokumen rapor sekolah skala besar.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

