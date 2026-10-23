import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Award, CheckCircle2, XCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GraduationPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAyId, setSelectedAyId] = useState('');
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedAyId) {
      loadGraduationRecap();
    }
  }, [selectedAyId]);

  const fetchYears = async () => {
    try {
      const res = await api.get('/academic-years?pageSize=20');
      const items = res.data.items || [];
      setAcademicYears(items);
      const active = items.find((a) => a.isActive);
      if (active) setSelectedAyId(active.id);
      else if (items.length > 0) setSelectedAyId(items[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGraduationRecap = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/graduation/${selectedAyId}`);
      setRecap(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueueGraduationJob = async () => {
    try {
      const res = await api.post('/queue/jobs', {
        reportType: 'GRADUATION',
        academicYearId: parseInt(selectedAyId)
      });
      toast.success(`Tugas kompilasi kelulusan masuk antrean (Job ID: ${res.data.id.substring(0, 8)}...)`);
    } catch (err) {
      toast.error('Gagal memasukkan antrean.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" /> Rekomendasi & Evaluasi Kelulusan Kelas 9
          </h1>
          <p className="text-sm text-gray-500">
            Formulasi PRD Bab 5.2: NA_Lulus = (0.60 × Rapor S1–S5) + (0.40 × Nilai Ujian Kelulusan)
          </p>
        </div>

        <button
          onClick={handleQueueGraduationJob}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Antrean Ekspor SKL / Kelulusan
        </button>
      </div>

      {/* Year Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <label className="text-sm font-semibold text-gray-700">Tahun Ajaran:</label>
        <select
          value={selectedAyId}
          onChange={(e) => setSelectedAyId(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-xs"
        >
          {academicYears.map((ay) => (
            <option key={ay.id} value={ay.id}>
              {ay.yearName} ({ay.semester}) {ay.isActive ? ' - [Aktif]' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Siswa Kelas 9</span>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{recap?.totalCandidates || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Rekomendasi LULUS</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{recap?.passedCount || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Belum Memenuhi KKM</span>
          <p className="text-3xl font-extrabold text-red-600 mt-1">{recap?.failedCount || 0}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-12">No</th>
              <th className="px-4 py-3 text-left">NISN</th>
              <th className="px-4 py-3 text-left">Nama Siswa</th>
              <th className="px-4 py-3 text-left">Rombel</th>
              <th className="px-4 py-3 text-center">Rata Rapor S1-S5 (60%)</th>
              <th className="px-4 py-3 text-center">Ujian Kelulusan (40%)</th>
              <th className="px-4 py-3 text-center font-bold">Nilai Akhir Kelulusan</th>
              <th className="px-4 py-3 text-center">Status Kelulusan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Memuat data kelulusan...
                </td>
              </tr>
            ) : !recap || recap.students.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Tidak ada calon kelulusan di tahun ajaran ini.
                </td>
              </tr>
            ) : (
              recap.students.map((st, idx) => {
                const passed = st.isPassed;
                return (
                  <tr key={st.studentId} className={`hover:bg-gray-50 ${!passed ? 'bg-rose-50/50' : ''}`}>
                    <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{st.nisn}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{st.studentName}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-700">Kelas {st.className}</td>
                    <td className="px-4 py-3 text-center text-sm">{st.avgReportS1toS5.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center text-sm">{st.graduationExamScore.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center font-extrabold text-base text-indigo-700">
                      {st.finalGraduationScore.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {passed ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> LULUS
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> TIDAK LULUS
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

