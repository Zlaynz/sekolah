import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MyAttendancePage() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.studentId) {
      loadAttendance();
    }
  }, [user]);

  const loadAttendance = async () => {
    try {
      const res = await api.get(`/reports/student-report-card/${user.studentId}`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat data presensi...</div>;
  }

  const att = report?.attendance || { hadir: 0, izin: 0, sakit: 0, alpa: 0, total: 0, percentage: 100 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rekapitulasi Kehadiran Saya</h1>
        <p className="text-sm text-gray-500">Persentase kehadiran tatap muka pada tahun ajaran ini</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase">Hadir</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{att.hadir}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase">Izin</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">{att.izin}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase">Sakit</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{att.sakit}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase">Alpa</span>
          <p className="text-3xl font-extrabold text-red-600 mt-1">{att.alpa}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-base text-gray-900 mb-2">Tingkat Kehadiran Kumulatif</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-emerald-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, att.percentage || 100)}%` }}
          />
        </div>
        <p className="text-right text-xs font-bold text-gray-600 mt-1">
          {att.percentage ? att.percentage.toFixed(1) : 100}% Kehadiran
        </p>
      </div>
    </div>
  );
}

