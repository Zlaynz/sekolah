import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Users, ClipboardList, Award, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherStats();
  }, [user]);

  const fetchTeacherStats = async () => {
    try {
      const res = await api.get('/dashboard/teacher');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat dashboard guru...</div>;
  }

  const hasGrade9 = data?.teachingAssignments?.some((a) => a.gradeLevel === 9);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru & Penilai</h1>
          <p className="text-sm text-gray-500">Selamat datang, {user?.name || user?.username}</p>
        </div>
        {data?.homeroomClass && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Wali Kelas {data.homeroomClass.className} ({data.homeroomClass.studentCount} Siswa)
          </div>
        )}
      </div>

      {/* Teaching assignments grid */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" /> Mata Pelajaran Yang Diampu
        </h2>

        {data?.teachingAssignments?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.teachingAssignments.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors bg-gray-50/50 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      Kelas {item.className} (Tingkat {item.gradeLevel})
                    </span>
                    <h3 className="font-bold text-gray-900 text-base">{item.subjectName}</h3>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2 py-0.5 rounded">
                    KKM: {item.kkm}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                  <Link
                    to={`/teacher/attendance?subjectTeacherId=${item.id}`}
                    className="p-2 bg-white rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center gap-1 font-medium transition-colors"
                  >
                    <ClipboardList className="w-3.5 h-3.5" /> Presensi
                  </Link>
                  <Link
                    to={`/teacher/daily-grades?subjectTeacherId=${item.id}`}
                    className="p-2 bg-white rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center gap-1 font-medium transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Nilai Harian
                  </Link>
                  <Link
                    to={`/teacher/exam-grades?subjectTeacherId=${item.id}`}
                    className="p-2 bg-white rounded border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center gap-1 font-medium transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Nilai Ujian
                  </Link>
                  {item.gradeLevel === 9 && (
                    <Link
                      to={`/teacher/graduation-exams?classId=${item.className}`}
                      className="p-2 bg-orange-50 rounded border border-orange-200 text-orange-700 hover:bg-orange-100 flex items-center justify-center gap-1 font-bold transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-orange-600" /> Ujian Kelulusan
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-6 text-center">
            Anda belum ditugaskan mengampu mata pelajaran di kelas manapun.
          </p>
        )}
      </div>
    </div>
  );
}

