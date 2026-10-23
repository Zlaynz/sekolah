import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FileBarChart, Download, Printer, User, Award, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function ReportCardPage() {
  const [searchParams] = useSearchParams();
  const initialStudentId = searchParams.get('studentId') || '';

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queueing, setQueueing] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadReport();
    }
  }, [selectedStudentId]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students?pageSize=100');
      const items = res.data.items || [];
      setStudents(items);
      if (!selectedStudentId && items.length > 0) {
        setSelectedStudentId(items[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/student-report-card/${selectedStudentId}`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Restful API Queue integration for asynchronous report generation
  const handleQueueReport = async () => {
    setQueueing(true);
    try {
      const res = await api.post('/queue/jobs', {
        reportType: 'STUDENT_REPORT_CARD',
        targetId: parseInt(selectedStudentId)
      });
      toast.success(`Tugas kompilasi rapor telah dimasukkan ke dalam antrean (Job ID: ${res.data.id.substring(0, 8)}...)`);
    } catch (err) {
      toast.error('Gagal memasukkan tugas antrean.');
    } finally {
      setQueueing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Hasil Belajar (Rapor Siswa)</h1>
          <p className="text-sm text-gray-500">
            Formulasi NA = (0.30 × R_TH) + (0.30 × UTS) + (0.40 × UAS/UKK) | Batas KKM 75.00
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> Cetak Rapor
          </button>
          <button
            onClick={handleQueueReport}
            disabled={queueing || !report}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {queueing ? 'Memproses Antrean...' : 'Antrean Unduh PDF'}
          </button>
        </div>
      </div>

      {/* Student Selector */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <User className="w-5 h-5 text-indigo-600" />
        <label className="text-sm font-semibold text-gray-700">Pilih Siswa:</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-sm"
        >
          {students.map((st) => (
            <option key={st.id} value={st.id}>
              {st.fullName} (NISN: {st.nisn} | Kelas: {st.currentClassName || '-'})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Memuat kalkulasi rapor...</div>
      ) : !report ? (
        <div className="p-12 text-center text-gray-400">Pilih siswa untuk melihat rapor.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6 print:shadow-none print:border-none">
          {/* Header Rapor Resmi */}
          <div className="border-b-2 border-gray-900 pb-4 text-center space-y-1">
            <h2 className="text-xl font-black uppercase tracking-wider text-gray-900">
              RAPOR HASIL BELAJAR SISWA SEKOLAH MENENGAH PERTAMA
            </h2>
            <p className="text-sm font-medium text-gray-600">SMP NEGERI NUSANTARA</p>
            <p className="text-xs text-gray-400">Tahun Ajaran: {report.academicYear} - Semester: {report.semester}</p>
          </div>

          {/* Student Biodata */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
            <div>
              <p><span className="text-gray-500 font-medium">Nama Peserta Didik:</span> <strong>{report.studentName}</strong></p>
              <p><span className="text-gray-500 font-medium">Nomor Induk Siswa Nasional (NISN):</span> <strong>{report.nisn}</strong></p>
              <p><span className="text-gray-500 font-medium">Nomor Induk Siswa (NIS):</span> <strong>{report.nis}</strong></p>
            </div>
            <div>
              <p><span className="text-gray-500 font-medium">Rombongan Belajar:</span> <strong>Kelas {report.className} (Tingkat {report.gradeLevel})</strong></p>
              <p><span className="text-gray-500 font-medium">Wali Kelas:</span> <strong>{report.homeroomTeacher}</strong></p>
              <p><span className="text-gray-500 font-medium">Batas KKM Standar:</span> <strong className="text-indigo-600">75.00</strong></p>
            </div>
          </div>

          {/* Tabel Nilai Mapel */}
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-3">A. Capaian Kompetensi Akademik</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100 text-xs font-bold text-gray-700 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">No</th>
                    <th className="px-4 py-3 text-left">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-center w-24">KKM</th>
                    <th className="px-4 py-3 text-center w-28">Rata Tugas (30%)</th>
                    <th className="px-4 py-3 text-center w-28">UTS (30%)</th>
                    <th className="px-4 py-3 text-center w-28">UAS/UKK (40%)</th>
                    <th className="px-4 py-3 text-center w-28">Nilai Akhir (NA)</th>
                    <th className="px-4 py-3 text-center w-32">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.grades.map((g, idx) => {
                    const isBelow = g.isBelowKkm;
                    return (
                      <tr key={g.subjectId} className={isBelow ? 'bg-rose-50/70' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {g.subjectName} <span className="text-xs text-gray-400">({g.subjectCode})</span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-700">{g.kkm}</td>
                        <td className="px-4 py-3 text-center">{g.dailyAvg.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center">{g.utsScore !== null ? g.utsScore.toFixed(1) : '-'}</td>
                        <td className="px-4 py-3 text-center">{g.uasScore !== null ? g.uasScore.toFixed(1) : '-'}</td>
                        <td className="px-4 py-3 text-center font-black text-base">
                          <span className={isBelow ? 'text-red-700 font-extrabold' : 'text-gray-900'}>
                            {g.finalScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isBelow ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-xs rounded-full">
                              Belum Tuntas
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                              Tuntas
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rata-Rata Keseluruhan & Presensi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <h3 className="font-bold text-sm text-gray-900 mb-2">B. Ketidakhadiran (Presensi)</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500 block">Hadir</span>
                  <span className="font-bold text-emerald-700 text-base">{report.attendance.hadir}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500 block">Izin</span>
                  <span className="font-bold text-blue-700 text-base">{report.attendance.izin}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500 block">Sakit</span>
                  <span className="font-bold text-amber-700 text-base">{report.attendance.sakit}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500 block">Alpa</span>
                  <span className="font-bold text-red-700 text-base">{report.attendance.alpa}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-1">C. Catatan Wali Kelas</h3>
                <p className="text-xs text-gray-600 italic">"{report.homeroomNotes}"</p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-700">Rata-rata Nilai Rapor:</span>
                <span className="font-extrabold text-xl text-indigo-700">{report.overallAverage.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

