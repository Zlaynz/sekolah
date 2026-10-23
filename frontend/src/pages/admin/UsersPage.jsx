import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, KeyRound } from 'lucide-react';

export default function UsersPage() {
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
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('GURU');

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);
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
    setUsername('');
    setPassword('');
    setRole('GURU');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/users/${selectedItem.id}`, { username, password: password || null, role });
        toast.success('Pengguna berhasil diperbarui.');
      } else {
        if (!password) {
          toast.error('Password wajib diisi untuk pengguna baru.');
          return;
        }
        await api.post('/users', { username, password, role });
        toast.success('Pengguna berhasil dibuat.');
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
      await api.delete(`/users/${selectedItem.id}`);
      toast.success('Pengguna berhasil dihapus.');
      setIsConfirmOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus pengguna.');
    }
  };

  const columns = [
    { key: 'username', label: 'Username Akun' },
    {
      key: 'role',
      label: 'Hak Akses (Role)',
      render: (val) => {
        const colors = {
          ADMIN: 'bg-purple-100 text-purple-800',
          GURU: 'bg-blue-100 text-blue-800',
          WALIKELAS: 'bg-amber-100 text-amber-800',
          WAKASEK: 'bg-indigo-100 text-indigo-800',
          KEPSEK: 'bg-rose-100 text-rose-800',
          SISWA: 'bg-emerald-100 text-emerald-800',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[val] || 'bg-gray-100 text-gray-800'}`}>
            {val}
          </span>
        );
      }
    },
    { key: 'createdAt', label: 'Tanggal Dibuat', render: (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna & Otoritas</h1>
          <p className="text-sm text-gray-500">Kelola kredensial akun dan hak akses: Admin, Guru, Wali Kelas, Wakasek, Kepsek, Siswa</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Pengguna
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
        searchPlaceholder="Cari username..."
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedItem(row);
                setUsername(row.username);
                setPassword('');
                setRole(row.role);
                setIsModalOpen(true);
              }}
              className="text-gray-500 hover:text-indigo-600 p-1"
            >
              <Edit className="w-4 h-4" />
            </button>
            {row.username !== 'admin' && (
              <button
                onClick={() => {
                  setSelectedItem(row);
                  setIsConfirmOpen(true);
                }}
                className="text-gray-500 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              placeholder="Contoh: guru_budi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {selectedItem ? 'Password Baru (Kosongkan bila tidak diubah)' : 'Password'}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hak Akses (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ADMIN">ADMIN - Administrator Sistem</option>
              <option value="GURU">GURU - Guru Mata Pelajaran</option>
              <option value="WALIKELAS">WALIKELAS - Wali Kelas</option>
              <option value="WAKASEK">WAKASEK - Wakasek Kurikulum</option>
              <option value="KEPSEK">KEPSEK - Kepala Sekolah</option>
              <option value="SISWA">SISWA - Siswa</option>
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
        title="Konfirmasi Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus user "${selectedItem?.username}"?`}
      />
    </div>
  );
}

