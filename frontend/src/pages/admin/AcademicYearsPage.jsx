import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, Lock, Unlock, Check, Trash2, Edit } from 'lucide-react';

export default function AcademicYearsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [yearName, setYearName] = useState('2025/2026');
  const [semester, setSemester] = useState('GANJIL');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/academic-years?page=${page}&pageSize=${pageSize}`);
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
    setYearName('2025/2026');
    setSemester('GANJIL');
    setIsActive(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/academic-years/${selectedItem.id}`, {
          yearName,
          semester,
          isActive,
          isLocked: selectedItem.isLocked
        });
        toast.success('Tahun ajaran berhasil diperbarui.');
      } else {
        await api.post('/academic-years', {
          yearName,
          semester,
          isActive,
          isLocked: false
        });
        toast.success('Tahun ajaran berhasil dibuat.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan.');
    }
  };

  const handleToggleLock = async (id) => {
    try {
      const res = await api.patch(`/academic-years/${id}/toggle-lock`);
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error('Gagal mengubah status kuncian.');
    }
  };

  const handleSetActive = async (id) => {
    try {
      const res = await api.patch(`/academic-years/${id}/set-active`);
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error('Gagal mengaktifkan tahun ajaran.');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await api.delete(`/academic-years/${selectedItem.id}`);
      toast.success('Tahun ajaran berhasil dihapus.');
      setIsConfirmOpen(false);
      fetchData();
    } catch (err) {
      setIsConfirmOpen(false);
      if (err.response?.status === 422 || err.userMessage) {
        setErrorMessage(err.response?.data?.message || err.userMessage);
        setErrorModalOpen(true);
      } else {
        toast.error('Gagal menghapus tahun ajaran.');
      }
    }
  };

  const columns = [
    { key: 'yearName', label: 'Tahun Ajaran' },
    { key: 'semester', label: 'Semester' },
    {
      key: 'isActive',
      label: 'Status Aktif',
      render: (val, row) => (
        val ? (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            Aktif Digunakan
          </span>
        ) : (
          <button
            onClick={() => handleSetActive(row.id)}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            Jadikan Aktif
          </button>
        )
      )
    },
    {
      key: 'isLocked',
      label: 'Kuncian Nilai (Locking)',
      render: (val, row) => (
        <button
          onClick={() => handleToggleLock(row.id)}
          className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${
            val ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {val ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          {val ? 'Terkunci (Ditutup)' : 'Terbuka (Bisa Input)'}
        </button>
      )
    },
    { key: 'classCount', label: 'Jumlah Kelas' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Konfigurasi Tahun Ajaran</h1>
          <p className="text-sm text-gray-500">Pengaturan tahun ajaran aktif dan status kuncian periode nilai rapor</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Tahun Ajaran
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
                setYearName(row.yearName);
                setSemester(row.semester);
                setIsActive(row.isActive);
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
        title={selectedItem ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
            <input
              type="text"
              required
              placeholder="Contoh: 2025/2026"
              value={yearName}
              onChange={(e) => setYearName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="GANJIL">Ganjil (Semester 1)</option>
              <option value="GENAP">Genap (Semester 2)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActiveCheck" className="text-sm font-medium text-gray-700">
              Jadikan Tahun Ajaran Aktif
            </label>
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
        title="Konfirmasi Hapus Tahun Ajaran"
        message={`Apakah Anda yakin ingin menghapus tahun ajaran "${selectedItem?.yearName}"?`}
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
            Sesuai dokumen PRD Bagian 4, data utama tidak boleh dihapus selama masih memiliki relasi data anak aktif (seperti daftar kelas atau ujian kelulusan).
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

