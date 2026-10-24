import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserAvatar from '../../components/common/UserAvatar';
import PhotoUploadModal from '../../components/common/PhotoUploadModal';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Camera, Shield } from 'lucide-react';

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
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
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
    {
      key: 'photo',
      label: 'Foto Profil',
      render: (_, row) => (
        <div
          onClick={() => {
            setSelectedItem(row);
            setIsPhotoModalOpen(true);
          }}
          className="cursor-pointer group flex items-center gap-2"
          title="Klik untuk ubah foto"
        >
          <UserAvatar photoPath={row.photoPath} name={row.username} size="sm" />
          <span className="text-[11px] text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Ubah
          </span>
        </div>
      ),
    },
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
      },
    },
    { key: 'createdAt', label: 'Tanggal Dibuat', render: (val) => val ? new Date(val).toLocaleDateString('id-ID') : '-' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna & Otoritas</h1>
          <p className="text-sm text-gray-500">Kelola kredensial akun, foto profil, dan hak akses seluruh pengguna</p>
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
                setIsPhotoModalOpen(true);
              }}
              title="Unggah / Ubah Foto Akun"
              className="text-gray-500 hover:text-indigo-600 p-1"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedItem(row);
                setUsername(row.username);
                setPassword('');
                setRole(row.role);
                setIsModalOpen(true);
              }}
              title="Edit Akun"
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
                title="Hapus Akun"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {selectedItem ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
            </label>
            <input
              type="password"
              placeholder={selectedItem ? '••••••••' : 'Password aman'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Peran & Hak Akses</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="ADMIN">ADMIN (Administrator Sistem)</option>
              <option value="GURU">GURU (Guru Pengampu Mapel)</option>
              <option value="WALIKELAS">WALIKELAS (Wali Kelas & Guru)</option>
              <option value="WAKASEK">WAKASEK (Wakil Kepala Sekolah)</option>
              <option value="KEPSEK">KEPSEK (Kepala Sekolah)</option>
              <option value="SISWA">SISWA (Siswa Sekolah)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Simpan Pengguna
            </button>
          </div>
        </form>
      </Modal>

      {/* Photo Upload Modal */}
      {selectedItem && (
        <PhotoUploadModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          currentPhoto={selectedItem.photoPath}
          userName={selectedItem.username}
          targetType="user"
          targetId={selectedItem.id}
          onSuccess={() => fetchData()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${selectedItem?.username}"? Tindakan ini menggunakan soft delete.`}
      />
    </div>
  );
}
