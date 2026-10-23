import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Award, AlertOctagon, CheckCircle2, Save } from 'lucide-react';

export default function GraduationExamsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeAyId, setActiveAyId] = useState(null);

  useEffect(() => {
    initPage();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSubjectId && activeAyId) {
      loadGraduationData();
    }
  }, [selectedClassId, selectedSubjectId, activeAyId]);

  const initPage = async () => {
    try {
      const [ayRes, clsRes, subRes] = await Promise.all([
        api.get('/academic-years/active'),
        api.get('/classes?pageSize=50'),
        api.get('/subjects?pageSize=50')
      ]);

      if (ayRes.data) setActiveAyId(ayRes.data.id);

      // PRD Restriction: Only Kelas 9 allowed!
      const grade9Classes = (clsRes.data.items || []).filter((c) => c.gradeLevel === 9);
      setClasses(grade9Classes);
      if (grade9Classes.length > 0) setSelectedClassId(grade9Classes[0].id);

      const sbs = subRes.data.items || [];
      setSubjects(sbs);
      if (sbs.length > 0) setSelectedSubjectId(sbs[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGraduationData = async () => {
    setLoading(true);
    try {
      const selectedClass = classes.find((c) => c.id === parseInt(selectedClassId));
      if (!selectedClass) return;

      // Restriksi PRD Front-End
      if (selectedClass.gradeLevel !== 9) {
        toast.error('Restriksi PRD: Ujian Kelulusan hanya untuk siswa Kelas 9.');
        setStudents([]);
        return;
      }

      // 1. Load enrolled students in this class
      const csRes = await api.get(`/class-students?classId=${selectedClassId}`);
      const enrolled = csRes.data || [];

      // 2. Load existing graduation exams
      const examRes = await api.get(
        `/graduation-exams?academicYearId=${activeAyId}&subjectId=${selectedSubjectId}`
      );
      const existing = examRes.data || [];

      const merged = enrolled.map((s) => {
        const found = existing.find((e) => e.studentId === s.studentId);
        return {
          studentId: s.studentId,
          studentName: s.studentName,
          studentNisn: s.studentNisn,
          writtenScore: found ? found.writtenScore : 80.00,
          practicalScore: found ? found.practicalScore : 80.00,
          finalScore: found ? found.finalScore : 80.00
        };
      });

      setStudents(merged);
    } catch (err) {
      toast.error('Gagal memuat data ujian kelulusan.');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId, field, val) => {
    const num = parseFloat(val);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;
        const updated = { ...s, [field]: isNaN(num) ? '' : num };
        const written = typeof updated.writtenScore === 'number' ? updated.writtenScore : 0;
        const practical = typeof updated.practicalScore === 'number' ? updated.practicalScore : 0;
        updated.finalScore = Math.round(((written + practical) / 2) * 100) / 100;
        return updated;
      })
    );
  };

  const handleSaveStudent = async (student) => {
    try {
      await api.post('/graduation-exams', {
        academicYearId: activeAyId,
        studentId: student.studentId,
        subjectId: parseInt(selectedSubjectId),
        writtenScore: typeof student.writtenScore === 'number' ? student.writtenScore : 0,
        practicalScore: typeof student.practicalScore === 'number' ? student.practicalScore : 0
      });
      toast.success(`Nilai kelulusan ${student.studentName} berhasil disimpan.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan.');
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    let successCount = 0;
    for (const s of students) {
      try {
        await api.post('/graduation-exams', {
          academicYearId: activeAyId,
          studentId: s.studentId,
          subjectId: parseInt(selectedSubjectId),
          writtenScore: typeof s.writtenScore === 'number' ? s.writtenScore : 0,
          practicalScore: typeof s.practicalScore === 'number' ? s.practicalScore : 0
        });
        successCount++;
      } catch (err) {
        console.error(err);
      }
    }
    setSaving(false);
    toast.success(`Berhasil menyimpan ${successCount} nilai ujian kelulusan.`);
    loadGraduationData();
  };

  const currentClass = classes.find((c) => c.id === parseInt(selectedClassId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-orange-600" /> Modul Khusus Ujian Kelulusan (Kelas 9)
          </h1>
          <p className="text-sm text-gray-500">
            Penilaian Ujian Tulis & Praktik untuk penentuan kelulusan siswa tingkat akhir SMP
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving || students.length === 0}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Semua Nilai'}
        </button>
      </div>

      {/* PRD Strict Constraint Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 text-xs text-orange-900">
        <AlertOctagon className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Restriksi Ketat PRD Bab 2.2 & 3.2.12:</p>
          <p className="mt-0.5">
            Modul Ujian Kelulusan hanya aktif dan diizinkan untuk siswa dengan tingkatan kelas <strong>9</strong>.
            Sistem secara otomatis menolak operasi penilaian untuk siswa kelas 7 dan 8 baik di antarmuka maupun validasi API.
          </p>
        </div>
      </div>

      {/* Filter Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Rombel Kelas 9
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-orange-500 focus:border-orange-500 font-bold"
          >
            {classes.length === 0 ? (
              <option value="">Tidak ada kelas tingkat 9 terdaftar</option>
            ) : (
              classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Kelas {c.className} (Tingkat {c.gradeLevel})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Mata Pelajaran Ujian
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
          >
            {subjects.map((sb) => (
              <option key={sb.id} value={sb.id}>
                {sb.name} ({sb.code}) - Standar KKM {sb.kkm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Graduation Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-12">No</th>
              <th className="px-4 py-3 text-left">NISN</th>
              <th className="px-4 py-3 text-left">Nama Siswa (Kelas 9)</th>
              <th className="px-4 py-3 text-center w-36">Nilai Tulis</th>
              <th className="px-4 py-3 text-center w-36">Nilai Praktik</th>
              <th className="px-4 py-3 text-center w-36">Nilai Akhir (NA)</th>
              <th className="px-4 py-3 text-center w-36">Evaluasi KKM</th>
              <th className="px-4 py-3 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Memuat data siswa kelas 9...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  Belum ada siswa di kelas 9 ini.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => {
                const isBelow = st.finalScore < 75.00;
                return (
                  <tr
                    key={st.studentId}
                    className={`transition-colors ${
                      isBelow ? 'bg-rose-50/70 hover:bg-rose-100/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{st.studentNisn}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{st.studentName}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={st.writtenScore}
                        onChange={(e) => handleScoreChange(st.studentId, 'writtenScore', e.target.value)}
                        className="w-24 text-center font-bold text-sm border border-gray-300 rounded-lg py-1.5 focus:ring-orange-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={st.practicalScore}
                        onChange={(e) => handleScoreChange(st.studentId, 'practicalScore', e.target.value)}
                        className="w-24 text-center font-bold text-sm border border-gray-300 rounded-lg py-1.5 focus:ring-orange-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-extrabold text-base ${isBelow ? 'text-red-700' : 'text-gray-900'}`}>
                        {st.finalScore.toFixed(2)}
                      </span>
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
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSaveStudent(st)}
                        className="text-xs bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-800 font-bold px-2 py-1 rounded transition-colors"
                      >
                        Simpan
                      </button>
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

