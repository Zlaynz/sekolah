import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { School, ClipboardList, CheckCircle } from 'lucide-react';

export default function AttendanceRecapPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadRecap();
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes?pageSize=50');
      const cls = res.data.items || [];
      setClasses(cls);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRecap = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/class-recap/${selectedClassId}`);
      setRecap(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekapitulasi Kelas & Kehadiran</h1>
          <p className="text-sm text-gray-500">Rekap akumulasi presensi dan status tuntas nilai siswa per rombel</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <School className="w-5 h-5 text-indigo-600" />
        <label className="text-sm font-semibold text-gray-700">Pilih Rombel:</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-xs"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              Kelas {c.className} (Tingkat {c.gradeLevel}) - Wali: {c.homeroomTeacherName}
            </option>
          ))}
        </select>
        {recap && (
          <span className="text-xs text-gray-500 ml-auto">
            Wali Kelas: <strong>{recap.homeroomTeacher}</strong> | TA: <strong>{recap.academicYear}</strong>
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-12">No</th>
              <th className="px-4 py-3 text-left">NIS</th>
              <th className="px-4 py-3 text-left">Nama Siswa</th>
              <th className="px-4 py-3 text-center">Hadir</th>
              <th className="px-4 py-3 text-center">Izin</th>
              <th className="px-4 py-3 text-center">Sakit</th>
              <th className="px-4 py-3 text-center">Alpa</th>
              <th className="px-4 py-3 text-center">Rata-rata Nilai</th>
              <th className="px-4 py-3 text-center">Status Evaluasi KKM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">
                  Memuat rekapitulasi kelas...
                </td>
              </tr>
            ) : !recap || recap.students.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-gray-400">
                  Tidak ada data siswa dalam rombel ini.
                </td>
              </tr>
            ) : (
              recap.students.map((st, idx) => {
                const hasRemedi = st.belowKkmCount > 0;
                return (
                  <tr key={st.studentId} className={`hover:bg-gray-50 ${hasRemedi ? 'bg-rose-50/50' : ''}`}>
                    <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{st.studentNis}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{st.studentName}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-emerald-700">{st.hadir}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-blue-700">{st.izin}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-amber-700">{st.sakit}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-red-700">{st.alpa}</td>
                    <td className="px-4 py-3 text-center text-sm font-bold">{st.averageFinalGrade.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      {hasRemedi ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full">
                          {st.belowKkmCount} Mapel Belum Tuntas
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                          Tuntas Semua Mapel
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

