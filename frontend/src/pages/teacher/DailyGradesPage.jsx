import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { BookOpenCheck, Save, Plus, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function DailyGradesPage() {
  const [searchParams] = useSearchParams();
  const initialStId = searchParams.get('subjectTeacherId') || '';

  const [assignments, setAssignments] = useState([]);
  const [selectedStId, setSelectedStId] = useState(initialStId);
  const [existingTasks, setExistingTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('Tugas 1: Pemahaman Konsep');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedStId) {
      loadTasksAndGrades();
    }
  }, [selectedStId, taskTitle]);

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

  const loadTasksAndGrades = async () => {
    setLoading(true);
    try {
      const st = assignments.find((a) => a.id === parseInt(selectedStId));
      if (!st) return;

      // 1. Load distinct task titles
      const tasksRes = await api.get(`/daily-grades/tasks?subjectTeacherId=${selectedStId}`);
      setExistingTasks(tasksRes.data || []);

      // 2. Load class students
      const csRes = await api.get(`/class-students?classId=${st.classId}`);
      const enrolled = csRes.data || [];

      // 3. Load daily grades for current taskTitle
      const gradesRes = await api.get(
        `/daily-grades?subjectTeacherId=${selectedStId}&taskTitle=${encodeURIComponent(taskTitle)}`
      );
      const grades = gradesRes.data || [];

      const merged = enrolled.map((s) => {
        const found = grades.find((g) => g.studentId === s.studentId);
        return {
          studentId: s.studentId,
          studentName: s.studentName,
          studentNis: s.studentNis,
          score: found ? found.score : 80.00
        };
      });

      setStudents(merged);
    } catch (err) {
      toast.error('Gagal memuat data nilai harian.');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId, val) => {
    const num = parseFloat(val);
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, score: isNaN(num) ? '' : num } : s))
    );
  };

  const handleSave = async () => {
    if (!taskTitle.trim()) {
      toast.error('Judul tugas tidak boleh kosong.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/daily-grades/bulk', {
        subjectTeacherId: parseInt(selectedStId),
        taskTitle: taskTitle.trim(),
        items: students.map((s) => ({
          studentId: s.studentId,
          score: typeof s.score === 'number' ? s.score : 0
        }))
      });
      toast.success('Nilai tugas harian berhasil disimpan.');
      loadTasksAndGrades();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan nilai.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Input Nilai Tugas Harian</h1>
          <p className="text-sm text-gray-500">
            Penilaian tugas, PR, dan kuis berkala (Standar KKM 75.00)
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || students.length === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Nilai Harian'}
        </button>
      </div>

      {/* PRD Alert KKM */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-800">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <span>
          <strong>Ketentuan PRD Bab 6.1:</strong> Nilai siswa di bawah KKM <strong>75.00</strong> secara otomatis ditandai dengan highlight merah muda (Belum Tuntas/Remedi).
        </span>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Judul Penugasan / Kuis
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              list="task-titles"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Contoh: Tugas 1: Aljabar"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <datalist id="task-titles">
              {existingTasks.map((t, idx) => (
                <option key={idx} value={t} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Grade input table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-12">No</th>
              <th className="px-4 py-3 text-left">NIS</th>
              <th className="px-4 py-3 text-left">Nama Lengkap Siswa</th>
              <th className="px-4 py-3 text-center w-48">Nilai Angka (0-100)</th>
              <th className="px-4 py-3 text-center w-40">Status KKM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Memuat data siswa...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Tidak ada siswa dalam rombel ini.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => {
                const isBelow = st.score < 75.00;
                return (
                  <tr
                    key={st.studentId}
                    className={`transition-colors ${
                      isBelow ? 'bg-rose-50/70 hover:bg-rose-100/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{st.studentNis}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{st.studentName}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={st.score}
                        onChange={(e) => handleScoreChange(st.studentId, e.target.value)}
                        className={`w-28 text-center font-bold text-base border rounded-lg py-1.5 focus:outline-none focus:ring-2 ${
                          isBelow
                            ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-500'
                            : 'border-gray-300 text-gray-900 focus:ring-indigo-500'
                        }`}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isBelow ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full inline-block">
                          Belum Tuntas (&lt; 75)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full inline-block">
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

