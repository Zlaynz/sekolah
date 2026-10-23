import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function SubjectsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/subjects?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);
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
    setCode('');
    setName('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/subjects/${selectedItem.id}`, { code, name, kkm: 75.00 });
        toast.success('Mata pelajaran berhasil diperbarui.');
      } else {
        await api.post('/subjects', { code, name, kkm: 75.00 });
        toast.success('Mata pelajaran berhasil ditambahkan.');
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
      await api.delete(`/subjects/${selectedItem.id}`);
      toast.success('Mata pelajaran berhasil dihapus.');
      setIsConfirmOpen(false);
      fetchData();
    } catch (err) {
      setIsConfirmOpen(false);
      if (err.response?.status === 422 || err.userMessage) {
        setErrorMessage(err.response?.data?.message || err.userMessage);
        setErrorModalOpen(true);
      } else {
        toast.error('Gagal menghapus mata pelajaran.');
      }
    }
  };

  const columns = [
    { key: 'code', label: 'Kode Mapel' },
    { key: 'name', label: 'Nama Mata Pelajaran' },
    {
      key: 'kkm',
      label: 'Batas KKM Tunggal',
      render: (val) => (
        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-lg">
          {val} (Standar SMP)
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Pelajaran (Kurikulum)</h1>
          <p className="text-sm text-gray-500">Daftar mata pelajaran dengan batas Kriteria Ketuntasan Minimal (KKM) tunggal 75</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
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
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kode atau nama mapel..."
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedItem(row);
                setCode(row.code);
                setName(row.name);
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
        title={selectedItem ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kode Mata Pelajaran</label>
            <input
              type="text"
              required
              placeholder="Contoh: MAT-7"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Mata Pelajaran</label>
            <input
              type="text"
              required
              placeholder="Contoh: Matematika 7"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Catatan Aturan Bisnis:</strong> Sesuai PRD Bab 2.1, KKM standar seluruh mata pelajaran terkunci pada nilai <strong>75.00</strong>.
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
        title="Konfirmasi Hapus Mata Pelajaran"
        message={`Apakah Anda yakin ingin menghapus mata pelajaran "${selectedItem?.name}"?`}
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
            Sesuai PRD Bagian 4.1: "Mata pelajaran tidak dapat dihapus karena masih digunakan pada penugasan pengampu/ujian."
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

