import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ClipboardList, Calendar, CheckCircle2, Save } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function AttendancePage() {
  const [searchParams] = useSearchParams();
  const initialStId = searchParams.get('subjectTeacherId') || '';

  const [assignments, setAssignments] = useState([]);
  const [selectedStId, setSelectedStId] = useState(initialStId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedStId) {
      loadAttendanceData();
    }
  }, [selectedStId, date]);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/subject-teachers');
      const items = res.data || [];
      setAssignments(items);
      if (!selectedStId && items.length > 0) {
        setSelectedStId(items[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const st = assignments.find((a) => a.id === parseInt(selectedStId));
      if (!st) return;

      // 1. Fetch students in that class
      const classStudentsRes = await api.get(`/class-students?classId=${st.classId}`);
      const enrolledStudents = classStudentsRes.data || [];

      // 2. Fetch existing attendance records for that date & subjectTeacher
      const attRes = await api.get(`/attendances?subjectTeacherId=${selectedStId}&date=${date}`);
      const existingAtts = attRes.data || [];

      const merged = enrolledStudents.map((s) => {
        const found = existingAtts.find((a) => a.studentId === s.studentId);
        return {
          studentId: s.studentId,
          studentName: s.studentName,
          studentNis: s.studentNis,
          status: found ? found.status : 'HADIR',
          notes: found ? found.notes || '' : ''
        };
      });

      setStudents(merged);
    } catch (err) {
      toast.error('Gagal memuat data presensi.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleNotesChange = (studentId, newNotes) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, notes: newNotes } : s))
    );
  };

  const handleSetAllHadir = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'HADIR' })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/attendances/bulk', {
        subjectTeacherId: parseInt(selectedStId),
        date: new Date(date).toISOString(),
        items: students.map((s) => ({
          studentId: s.studentId,
          status: s.status,
          notes: s.notes
        }))
      });
      toast.success('Presensi berhasil disimpan.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan presensi.');
    } finally {
      setSaving(false);
    }
  };

  const selectedAssignment = assignments.find((a) => a.id === parseInt(selectedStId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Input Presensi Siswa</h1>
          <p className="text-sm text-gray-500">Pencatatan kehadiran sesi tatap muka mata pelajaran</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Presensi'}
        </button>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Mata Pelajaran & Kelas
          </label>
          <select
            value={selectedStId}
            onChange={(e) => setSelectedStId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                Kelas {a.className} - {a.subjectName} ({a.teacherName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Tanggal Pertemuan
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSetAllHadir}
            className="w-full py-2 px-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Set Semua Hadir
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-12">No</th>
              <th className="px-4 py-3 text-left">NIS</th>
              <th className="px-4 py-3 text-left">Nama Lengkap Siswa</th>
              <th className="px-4 py-3 text-center w-72">Status Presensi</th>
              <th className="px-4 py-3 text-left">Catatan Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Memuat daftar presensi...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Tidak ada siswa dalam rombel ini.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => (
                <tr key={st.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{st.studentNis}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{st.studentName}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-bold">
                      {['HADIR', 'IZIN', 'SAKIT', 'ALPA'].map((stat) => {
                        const active = st.status === stat;
                        const activeClasses = {
                          HADIR: 'bg-emerald-600 text-white shadow-sm',
                          IZIN: 'bg-blue-600 text-white shadow-sm',
                          SAKIT: 'bg-amber-500 text-white shadow-sm',
                          ALPA: 'bg-red-600 text-white shadow-sm',
                        };
                        return (
                          <button
                            key={stat}
                            type="button"
                            onClick={() => handleStatusChange(st.studentId, stat)}
                            className={`px-3 py-1 rounded-md transition-all ${
                              active ? activeClasses[stat] : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {stat}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Keterangan izin / sakit..."
                      value={st.notes}
                      onChange={(e) => handleNotesChange(st.studentId, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded p-1.5 focus:border-indigo-500 focus:outline-none"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

