import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserPlus, School } from 'lucide-react';

export default function ClassStudentsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassStudents();
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

  const fetchClassStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/class-students?classId=${selectedClassId}`);
      setStudents(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = async () => {
    try {
      const res = await api.get('/students?pageSize=100');
      const all = res.data.items || [];
      const currentIds = students.map((s) => s.studentId);
      const unassigned = all.filter((s) => !currentIds.includes(s.id));
      setAvailableStudents(unassigned);
      if (unassigned.length > 0) setSelectedStudentId(unassigned[0].id);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Gagal memuat daftar siswa.');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      await api.post('/class-students', {
        classId: parseInt(selectedClassId),
        studentId: parseInt(selectedStudentId)
      });
      toast.success('Siswa berhasil dimasukkan ke dalam kelas.');
      setIsModalOpen(false);
      fetchClassStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan siswa.');
    }
  };

  const handleRemove = async (id, studentName) => {
    if (!window.confirm(`Keluarkan ${studentName} dari kelas ini?`)) return;
    try {
      await api.delete(`/class-students/${id}`);
      toast.success('Siswa berhasil dikeluarkan dari kelas.');
      fetchClassStudents();
    } catch (err) {
      toast.error('Gagal mengeluarkan siswa.');
    }
  };

  const columns = [
    { key: 'studentNisn', label: 'NISN' },
    { key: 'studentNis', label: 'NIS' },
    { key: 'studentName', label: 'Nama Lengkap Siswa' },
    { key: 'gender', label: 'Gender', render: (val) => val === 'L' ? 'Laki-laki' : 'Perempuan' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plotting Siswa Rombel</h1>
          <p className="text-sm text-gray-500">Alokasi siswa ke dalam rombongan belajar kelas per tahun ajaran</p>
        </div>

        {selectedClassId && (
          <button
            onClick={handleOpenAssign}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Masukkan Siswa ke Kelas
          </button>
        )}
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <School className="w-5 h-5 text-indigo-600" />
        <label className="text-sm font-semibold text-gray-700">Pilih Kelas:</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-xs"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              Kelas {c.className} (Tingkat {c.gradeLevel}) - {c.academicYearName}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500 ml-auto">
          Total Terdaftar: <strong>{students.length} Siswa</strong>
        </span>
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyMessage="Belum ada siswa yang diplot ke kelas ini."
        actions={(row) => (
          <button
            onClick={() => handleRemove(row.id, row.studentName)}
            className="text-red-600 hover:text-red-800 p-1 flex items-center gap-1 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Keluarkan
          </button>
        )}
      />

      {/* Modal Assign */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pilih Siswa untuk Dialokasikan"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Daftar Siswa Belum Diplot</label>
            {availableStudents.length > 0 ? (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {availableStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} (NISN: {st.nisn} | NIS: {st.nis})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500 py-3">Semua siswa sudah teralokasikan ke kelas.</p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={availableStudents.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Plotkan ke Kelas
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

