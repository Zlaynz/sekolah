import { useState, useRef } from 'react';
import Modal from './Modal';
import UserAvatar from './UserAvatar';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, Trash2, Camera, AlertCircle, Check } from 'lucide-react';

export default function PhotoUploadModal({
  isOpen,
  onClose,
  currentPhoto,
  userName,
  targetType = 'auth', // 'auth' | 'user' | 'student' | 'teacher'
  targetId = null,     // required if targetType !== 'auth'
  onSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5 MB.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format harus berupa JPG, PNG, WEBP, atau GIF.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const getEndpoint = () => {
    switch (targetType) {
      case 'user':
        return `/users/${targetId}/photo`;
      case 'student':
        return `/students/${targetId}/photo`;
      case 'teacher':
        return `/teachers/${targetId}/photo`;
      default:
        return '/auth/profile-photo';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Pilih file foto terlebih dahulu.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const endpoint = getEndpoint();
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newPhoto = res.data.photoPath;
      toast.success(res.data.message || 'Foto berhasil diunggah!');
      if (onSuccess) onSuccess(newPhoto);
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengunggah foto.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus foto profil ini?')) return;

    setDeleting(true);
    try {
      const endpoint = getEndpoint();
      await api.delete(endpoint);
      toast.success('Foto profil berhasil dihapus.');
      if (onSuccess) onSuccess(null);
      handleClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus foto.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Kelola Foto Profil" size="md">
      <div className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Pratinjau Foto"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500 shadow-md"
              />
            ) : (
              <UserAvatar photoPath={currentPhoto} name={userName} size="2xl" className="w-28 h-28 text-3xl" />
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform transform active:scale-95"
              title="Pilih Foto Baru"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h3 className="mt-3 font-bold text-gray-800 text-base">{userName || 'Pengguna'}</h3>
          <p className="text-xs text-gray-500">Format: JPG, PNG, WEBP, GIF (Maks. 5 MB)</p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Selected file banner */}
        {selectedFile && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-800 font-medium truncate">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-gray-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              type="button"
              onClick={resetState}
              className="text-red-600 hover:text-red-800 font-bold ml-2 shrink-0"
            >
              Batal
            </button>
          </div>
        )}

        {/* Dropzone trigger if no file selected */}
        {!selectedFile && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-xl p-5 text-center cursor-pointer transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700">
              Klik di sini untuk memilih foto baru dari perangkat Anda
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Pilih gambar rasio persegi untuk hasil terbaik</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            {currentPhoto && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || uploading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Menghapus...' : 'Hapus Foto'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading || deleting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Tutup
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || deleting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Mengunggah...' : 'Simpan Foto'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

