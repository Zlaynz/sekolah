import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserAvatar from '../../components/common/UserAvatar';
import PhotoUploadModal from '../../components/common/PhotoUploadModal';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Camera, AlertTriangle } from 'lucide-react';

export default function TeachersPage() {
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
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Form State
  const [nip, setNip] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('L');
  const [position, setPosition] = useState('GURU');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teachers?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);
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
    setNip('');
    setFullName('');
    setGender('L');
    setPosition('GURU');
    setUsername('');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/teachers/${selectedItem.id}`, { nip, fullName, gender, position });
        toast.success('Data guru berhasil diperbarui.');
      } else {
        await api.post('/teachers', { nip, fullName, gender, position, username, password });
        toast.success('Data guru dan akun pengguna berhasil dibuat.');
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
      await api.delete(`/teachers/${selectedItem.id}`);
      toast.success('Data guru berhasil dihapus.');
      setIsConfirmOpen(false);
      fetchData();
    } catch (err) {
      setIsConfirmOpen(false);
      if (err.response?.status === 422 || err.userMessage) {
        setErrorMessage(err.response?.data?.message || err.userMessage);
        setErrorModalOpen(true);
      } else {
        toast.error('Gagal menghapus data guru.');
      }
    }
  };

  const columns = [
    {
      key: 'photo',
      label: 'Foto',
      render: (_, row) => (
        <div
          onClick={() => {
            setSelectedItem(row);
            setIsPhotoModalOpen(true);
          }}
          className="cursor-pointer group flex items-center gap-1.5"
          title="Klik untuk ubah foto guru"
        >
          <UserAvatar photoPath={row.photoPath} name={row.fullName} size="sm" />
          <span className="text-[11px] text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Ubah
          </span>
        </div>
      ),
    },
    { key: 'nip', label: 'NIP / NIK', render: (val) => val || '-' },
    { key: 'fullName', label: 'Nama Lengkap & Gelar' },
    {
      key: 'gender',
      label: 'Gender',
      render: (val) => (val === 'L' ? 'Laki-laki' : 'Perempuan')
    },
    {
      key: 'position',
      label: 'Jabatan',
      render: (val) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700">
          {val}
        </span>
      )
    },
    { key: 'username', label: 'Username Login', render: (val) => val || '-' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Guru & Tenaga Pendidik</h1>
          <p className="text-sm text-gray-500">Pengelolaan profil pengajar, foto profil, wali kelas, wakasek, dan kepala sekolah</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Guru Baru
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
        searchPlaceholder="Cari nama atau NIP guru..."
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedItem(row);
                setIsPhotoModalOpen(true);
              }}
              title="Unggah / Ubah Foto Guru"
              className="text-gray-500 hover:text-indigo-600 p-1"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedItem(row);
                setNip(row.nip || '');
                setFullName(row.fullName);
                setGender(row.gender);
                setPosition(row.position);
                setIsModalOpen(true);
              }}
              title="Edit Data Guru"
              className="text-gray-500 hover:text-indigo-600 p-1"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedItem(row);
                setIsConfirmOpen(true);
              }}
              title="Hapus Data Guru"
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
        title={selectedItem ? 'Edit Data Guru' : 'Tambah Guru Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">NIP / NIK (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: 19800101 200501 1 001"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap & Gelar</label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso, S.Pd."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Jabatan Struktural</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="GURU">Guru Pengampu</option>
                <option value="WAKASEK">Wakil Kepala Sekolah</option>
                <option value="KEPSEK">Kepala Sekolah</option>
              </select>
            </div>
          </div>

          {!selectedItem && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kredensial Akun Login (Opsional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Username Akun</label>
                  <input
                    type="text"
                    placeholder="Contoh: guru_budi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
            >
              Simpan Data Guru
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
          userName={selectedItem.fullName}
          targetType="teacher"
          targetId={selectedItem.id}
          onSuccess={() => fetchData()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data Guru"
        message={`Apakah Anda yakin ingin menghapus data guru "${selectedItem?.fullName}"? Tindakan ini menggunakan soft delete.`}
      />

      {/* Referential Constraint 422 Error Modal */}
      <Modal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Penghapusan Ditolak (Proteksi Integritas Relasi)"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong className="block font-semibold">Pelanggaran Referential Constraint (HTTP 422)</strong>
              {errorMessage}
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Guru ini masih tercatat aktif sebagai wali kelas atau mengampu mata pelajaran pada rombel tertentu. Harap ganti penugasan guru terlebih dahulu sebelum menghapus.
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
