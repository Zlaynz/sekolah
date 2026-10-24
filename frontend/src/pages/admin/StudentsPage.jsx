import { useState, useEffect } from 'react';
import api from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserAvatar from '../../components/common/UserAvatar';
import PhotoUploadModal from '../../components/common/PhotoUploadModal';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Camera, AlertTriangle } from 'lucide-react';

export default function StudentsPage() {
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
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('L');
  const [birthPlace, setBirthPlace] = useState('Jakarta');
  const [birthDate, setBirthDate] = useState('2011-01-01');
  const [status, setStatus] = useState('AKTIF');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);
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
    setNisn('');
    setNis('');
    setFullName('');
    setGender('L');
    setBirthPlace('Jakarta');
    setBirthDate('2011-01-01');
    setStatus('AKTIF');
    setUsername('');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/students/${selectedItem.id}`, {
          nisn,
          nis,
          fullName,
          gender,
          birthPlace,
          birthDate: new Date(birthDate).toISOString(),
          status
        });
        toast.success('Data siswa berhasil diperbarui.');
      } else {
        await api.post('/students', {
          nisn,
          nis,
          fullName,
          gender,
          birthPlace,
          birthDate: new Date(birthDate).toISOString(),
          status,
          username,
          password
        });
        toast.success('Data siswa dan akun berhasil didaftarkan.');
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
      await api.delete(`/students/${selectedItem.id}`);
      toast.success('Data siswa berhasil dihapus.');
      setIsConfirmOpen(false);
      fetchData();
    } catch (err) {
      setIsConfirmOpen(false);
      if (err.response?.status === 422 || err.userMessage) {
        setErrorMessage(err.response?.data?.message || err.userMessage);
        setErrorModalOpen(true);
      } else {
        toast.error('Gagal menghapus data siswa.');
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
          title="Klik untuk ubah foto siswa"
        >
          <UserAvatar photoPath={row.photoPath} name={row.fullName} size="sm" />
          <span className="text-[11px] text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Ubah
          </span>
        </div>
      ),
    },
    { key: 'nisn', label: 'NISN' },
    { key: 'nis', label: 'NIS' },
    { key: 'fullName', label: 'Nama Lengkap Siswa' },
    {
      key: 'gender',
      label: 'Gender',
      render: (val) => (val === 'L' ? 'L' : 'P')
    },
    {
      key: 'currentClassName',
      label: 'Kelas Saat Ini',
      render: (val) => val ? (
        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
          Kelas {val}
        </span>
      ) : (
        <span className="text-gray-400 text-xs">Belum diplot</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const bg = val === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' :
                   val === 'LULUS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800';
        return <span className={`px-2 py-0.5 rounded text-xs font-bold ${bg}`}>{val}</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa Terdaftar</h1>
          <p className="text-sm text-gray-500">Pendaftaran NISN, NIS, foto profil, data biodata, dan status akademik siswa</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Daftarkan Siswa Baru
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
        searchPlaceholder="Cari nama, NISN, atau NIS..."
        actions={(row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedItem(row);
                setIsPhotoModalOpen(true);
              }}
              title="Unggah / Ubah Foto Siswa"
              className="text-gray-500 hover:text-indigo-600 p-1"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedItem(row);
                setNisn(row.nisn);
                setNis(row.nis);
                setFullName(row.fullName);
                setGender(row.gender);
                setBirthPlace(row.birthPlace || '');
                setBirthDate(row.birthDate ? row.birthDate.split('T')[0] : '2011-01-01');
                setStatus(row.status);
                setIsModalOpen(true);
              }}
              title="Edit Biodata Siswa"
              className="text-gray-500 hover:text-indigo-600 p-1"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedItem(row);
                setIsConfirmOpen(true);
              }}
              title="Hapus Data Siswa"
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
        title={selectedItem ? 'Edit Data Siswa' : 'Daftarkan Siswa Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">NISN (10 Digit)</label>
              <input
                type="text"
                required
                maxLength={10}
                placeholder="Contoh: 0081234567"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">NIS</label>
              <input
                type="text"
                required
                placeholder="Contoh: 242507001"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap Siswa</label>
            <input
              type="text"
              required
              placeholder="Contoh: Ahmad Dani"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status Keaktifan</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="AKTIF">AKTIF</option>
                <option value="LULUS">LULUS</option>
                <option value="MUTASI">MUTASI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
              <input
                type="text"
                placeholder="Kota Lahir"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg sm:text-sm"
              />
            </div>
          </div>

          {!selectedItem && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kredensial Akun Siswa (Opsional)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Username Siswa</label>
                  <input
                    type="text"
                    placeholder="Contoh: siswa_ahmad"
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
              Simpan Data Siswa
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
          targetType="student"
          targetId={selectedItem.id}
          onSuccess={() => fetchData()}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus siswa "${selectedItem?.fullName}"? Tindakan ini menggunakan soft delete.`}
      />

      {/* 422 Referential Integrity Warning Modal */}
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
            Sesuai PRD Bagian 4.1: "Data siswa tidak dapat dihapus karena memiliki riwayat kelas, presensi, atau nilai aktif."
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
