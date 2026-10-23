import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, LibraryBig } from 'lucide-react';

export default function SubjectTeachersPage() {
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formClassId, setFormClassId] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');

  useEffect(() => {
    fetchOptions();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedClassId]);

  const fetchOptions = async () => {
    try {
      const [cRes, sRes, tRes] = await Promise.all([
        api.get('/classes?pageSize=50'),
        api.get('/subjects?pageSize=50'),
        api.get('/teachers?pageSize=50')
      ]);

      const cls = cRes.data.items || [];
      const sbs = sRes.data.items || [];
      const tcs = tRes.data.items || [];

      setClasses(cls);
      setSubjects(sbs);
      setTeachers(tcs);

      if (cls.length > 0) setFormClassId(cls[0].id);
      if (sbs.length > 0) setFormSubjectId(sbs[0].id);
      if (tcs.length > 0) setFormTeacherId(tcs[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = selectedClassId ? `/subject-teachers?classId=${selectedClassId}` : '/subject-teachers';
      const res = await api.get(url);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssign = () => {
    if (classes.length > 0) setFormClassId(classes[0].id);
    if (subjects.length > 0) setFormSubjectId(subjects[0].id);
    if (teachers.length > 0) setFormTeacherId(teachers[0].id);
    setIsModalOpen(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subject-teachers', {
        classId: parseInt(formClassId),
        subjectId: parseInt(formSubjectId),
        teacherId: parseInt(formTeacherId)
      });
      toast.success('Guru pengampu berhasil ditugaskan.');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menugaskan.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus penugasan guru pengampu ini?')) return;
    try {
      await api.delete(`/subject-teachers/${id}`);
      toast.success('Penugasan berhasil dihapus.');
      fetchData();
    } catch (err) {
      if (err.response?.status === 422 || err.userMessage) {
        setErrorMessage(err.response?.data?.message || err.userMessage);
        setErrorModalOpen(true);
      } else {
        toast.error('Gagal menghapus penugasan.');
      }
    }
  };

  const columns = [
    { key: 'className', label: 'Kelas', render: (val) => <span className="font-bold">Kelas {val}</span> },
    { key: 'subjectName', label: 'Mata Pelajaran' },
    { key: 'subjectCode', label: 'Kode Mapel' },
    { key: 'teacherName', label: 'Guru Pengampu' },
    {
      key: 'subjectKkm',
      label: 'KKM',
      render: (val) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700">
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guru Pengampu Mata Pelajaran</h1>
          <p className="text-sm text-gray-500">Penugasan guru untuk setiap mata pelajaran di masing-masing rombel</p>
        </div>
        <button
          onClick={handleOpenAssign}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Tugaskan Guru Pengampu
        </button>
      </div>

      {/* Filter by class */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <LibraryBig className="w-5 h-5 text-indigo-600" />
        <label className="text-sm font-semibold text-gray-700">Filter Rombel:</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-xs"
        >
          <option value="">Semua Rombongan Belajar</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              Kelas {c.className} (Tingkat {c.gradeLevel})
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="Belum ada guru pengampu yang ditugaskan."
        actions={(row) => (
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800 p-1 flex items-center gap-1 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus
          </button>
        )}
      />

      {/* Modal Assign */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tugaskan Guru Pengampu Mapel"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Rombongan Belajar (Kelas)</label>
            <select
              value={formClassId}
              onChange={(e) => setFormClassId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Kelas {c.className} (Tingkat {c.gradeLevel})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Mata Pelajaran</label>
            <select
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {subjects.map((sb) => (
                <option key={sb.id} value={sb.id}>
                  {sb.name} ({sb.code}) - KKM {sb.kkm}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Pilih Guru Pengampu</label>
            <select
              value={formTeacherId}
              onChange={(e) => setFormTeacherId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.nip || 'Tanpa NIP'})
                </option>
              ))}
            </select>
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
            >
              Simpan Penugasan
            </button>
          </div>
        </form>
      </Modal>

      {/* PRD Section 4.1 Error Alert Modal (HTTP 422 Constraint) */}
      <Modal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Penolakan Penghapusan (Aturan Integritas Relasi)"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <p className="font-bold mb-1">Operasi Ditolak Sistem (HTTP 422):</p>
            <p>{errorMessage}</p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setErrorModalOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

