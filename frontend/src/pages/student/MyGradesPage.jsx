import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { BookOpenCheck, Download, Award, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyGradesPage() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queueing, setQueueing] = useState(false);

  useEffect(() => {
    if (user?.studentId) {
      loadGrades();
    }
  }, [user]);

  const loadGrades = async () => {
    try {
      const res = await api.get(`/reports/student-report-card/${user.studentId}`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueueDownload = async () => {
    setQueueing(true);
    try {
      const res = await api.post('/queue/jobs', {
        reportType: 'STUDENT_REPORT_CARD',
        targetId: user.studentId
      });
      toast.success('Permintaan unduh rapor telah dimasukkan ke dalam antrean background!');
    } catch (err) {
      toast.error('Gagal memproses antrean.');
    } finally {
      setQueueing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat nilai rapor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nilai & Rapor Hasil Belajar</h1>
          <p className="text-sm text-gray-500">
            Formulasi NA = (0.30 × Tugas) + (0.30 × UTS) + (0.40 × UAS/UKK) | KKM Tunggal: 75.00
          </p>
        </div>

        <button
          onClick={handleQueueDownload}
          disabled={queueing || !report}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> {queueing ? 'Memproses...' : 'Unduh Rapor PDF'}
        </button>
      </div>

      {/* KKM Notification */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between text-sm">
        <div>
          <span className="font-bold text-indigo-900 block">Kriteria Ketuntasan Minimal (KKM): 75.00</span>
          <span className="text-xs text-indigo-700">Nilai di bawah 75 ditandai merah muda dan membutuhkan ujian remedi.</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 block">Rata-rata Nilai:</span>
          <span className="text-2xl font-black text-indigo-700">{report?.overallAverage?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-12">No</th>
              <th className="px-4 py-3 text-left">Mata Pelajaran</th>
              <th className="px-4 py-3 text-center">Batas KKM</th>
              <th className="px-4 py-3 text-center">Rata Tugas (30%)</th>
              <th className="px-4 py-3 text-center">UTS (30%)</th>
              <th className="px-4 py-3 text-center">UAS/UKK (40%)</th>
              <th className="px-4 py-3 text-center font-bold">Nilai Akhir (NA)</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!report || report.grades.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Belum ada nilai yang diinputkan untuk semester ini.
                </td>
              </tr>
            ) : (
              report.grades.map((g, idx) => {
                const isBelow = g.isBelowKkm;
                return (
                  <tr key={g.subjectId} className={`hover:bg-gray-50 ${isBelow ? 'bg-rose-50/70' : ''}`}>
                    <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {g.subjectName} ({g.subjectCode})
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-bold text-indigo-700">{g.kkm}</td>
                    <td className="px-4 py-3 text-center text-sm">{g.dailyAvg.toFixed(1)}</td>
                    <td className="px-4 py-3 text-center text-sm">{g.utsScore !== null ? g.utsScore.toFixed(1) : '-'}</td>
                    <td className="px-4 py-3 text-center text-sm">{g.uasScore !== null ? g.uasScore.toFixed(1) : '-'}</td>
                    <td className="px-4 py-3 text-center text-base font-extrabold">
                      <span className={isBelow ? 'text-red-700' : 'text-gray-900'}>{g.finalScore.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isBelow ? (
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-700 font-bold text-xs rounded-full">
                          Belum Tuntas (&lt; 75)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                          Tuntas (≥ 75)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

