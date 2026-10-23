import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ClassesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Options
  const [academicYears, setAcademicYears] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [academicYearId, setAcademicYearId] = useState('');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [gradeLevel, setGradeLevel] = useState(7);
  const [className, setClassName] = useState('7-A');

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const fetchOptions = async () => {
    try {
      const [ayRes, teachRes] = await Promise.all([
        api.get('/academic-years?pageSize=50'),
        api.get('/teachers?pageSize=50')
      ]);
      const ays = ayRes.data.items || [];
      setAcademicYears(ays);
      if (ays.length > 0) setAcademicYearId(ays[0].id);

      const tchs = teachRes.data.items || [];
      setTeachers(tchs);
      if (tchs.length > 0) setHomeroomTeacherId(tchs[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/classes?page=${page}&pageSize=${pageSize}`);
      setData(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setGradeLevel(7);
    setClassName('7-A');
    if (academicYears.length > 0) setAcademicYearId(academicYears[0].id);
    if (teachers.length > 0) setHomeroomTeacherId(teachers[0].id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/classes/${selectedItem.id}`, {
          academicYearId: parseInt(academicYearId),
          homeroomTeacherId: parseInt(homeroomTeacherId),
          gradeLevel: parseInt(gradeLevel),
          className
        });
        toast.success('Kelas berhasil diperbarui.');
      } else {
        await api.post('/classes', {
          academicYearId: parseInt(academicYearId),
          homeroomTeacherId: parseInt(homeroomTeacherId),
          gradeLevel: parseInt(gradeLevel),
          className
        });
        toast.success('Kelas berhasil ditambahkan.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan.');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/classes/${selectedItem.id}`);
      toast.success('Kelas berhasil dihapus.');
      setIsConfirmOpen(false);
      fetchData();
    } catch (err) {
      setIsConfirmOpen(false);
      if (err.response?.status === 422 || err.userMessage) {
        setErrorMessage(err.response?.data?.message || err.userMessage);
        setErrorModalOpen(true);
      } else {
        toast.error('Gagal menghapus kelas.');
      }
    }
  };

  const columns = [
    { key: 'className', label: 'Nama Kelas', render: (val) => <span className="font-bold text-gray-900">Kelas {val}</span> },
    {
      key: 'gradeLevel',
      label: 'Tingkat',
      render: (val) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          val === 9 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
        }`}>
          Tingkat {val}
        </span>
      )
    },
    { key: 'academicYearName', label: 'Tahun Ajaran' },
    { key: 'homeroomTeacherName', label: 'Wali Kelas' },
    { key: 'studentCount', label: 'Jumlah Siswa' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rombongan Belajar (Kelas)</h1>
          <p className="text-sm text-gray-500">Struktur rombel SMP tingkat 7, 8, dan 9 beserta penugasan wali kelas</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Rombel Baru
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedItem(row);
                setAcademicYearId(row.academicYearId);
                setHomeroomTeacherId(row.homeroomTeacherId);
                setGradeLevel(row.gradeLevel);
                setClassName(row.className);
                setIsModalOpen(true);
              }}
              className="text-gray-500 hover:text-indigo-600 p-1"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedItem(row);
                setIsConfirmOpen(true);
              }}
              className="text-gray-500 hover:text-red-600 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Edit Rombongan Belajar' : 'Tambah Rombongan Belajar Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
            <select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.yearName} ({ay.semester}) {ay.isActive ? ' - [Aktif]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tingkat Kelas</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(parseInt(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={7}>Kelas 7</option>
                <option value={8}>Kelas 8</option>
                <option value={9}>Kelas 9</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Rombel</label>
              <input
                type="text"
                required
                placeholder="Contoh: 7-A, 8-B, 9-A"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Wali Kelas</label>
            <select
              value={homeroomTeacherId}
              onChange={(e) => setHomeroomTeacherId(e.target.value)}
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
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus Rombel"
        message={`Apakah Anda yakin ingin menghapus rombel "${selectedItem?.className}"?`}
      />

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
          <p className="text-xs text-gray-500">
            Sesuai PRD Bagian 4.1: "Kelas tidak dapat dihapus karena masih memiliki daftar siswa atau penugasan mapel aktif."
          </p>
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

