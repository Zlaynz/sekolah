import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../../components/common/UserAvatar';
import PhotoUploadModal from '../../components/common/PhotoUploadModal';
import { Camera, Calendar, School, ShieldCheck } from 'lucide-react';

export default function MyProfilePage() {
  const { user, updatePhoto } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (user?.studentId) {
        const res = await api.get(`/students/${user.studentId}`);
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Memuat profil siswa...</div>;
  }

  const currentPhoto = profile?.photoPath || user?.photoPath;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Siswa</h1>
        <p className="text-sm text-gray-500">Identitas diri, foto profil, dan status keaktifan akademik</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white flex items-center gap-5">
          <div className="relative group">
            <UserAvatar
              photoPath={currentPhoto}
              name={profile?.fullName || user?.name || user?.username}
              size="xl"
              className="w-20 h-20 shadow-md ring-4 ring-white/30"
            />
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="absolute bottom-0 right-0 p-2 bg-white text-indigo-600 hover:text-indigo-800 rounded-full shadow-md transition-transform transform active:scale-95"
              title="Ubah Foto Profil"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold">{profile?.fullName || user?.name || user?.username}</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              NISN: {profile?.nisn || '-'} | NIS: {profile?.nis || '-'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold rounded-full">
                Siswa {profile?.status || 'AKTIF'}
              </span>
              <button
                onClick={() => setPhotoModalOpen(true)}
                className="text-xs text-white/90 hover:text-white underline underline-offset-2 flex items-center gap-1"
              >
                <Camera className="w-3 h-3" /> Unggah / Ubah Foto
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-400 block">Rombel Kelas Saat Ini</span>
              <strong className="text-base text-gray-800">
                {profile?.currentClassName ? `Kelas ${profile.currentClassName}` : 'Belum Diplot'}
              </strong>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-400 block">Jenis Kelamin</span>
              <strong className="text-base text-gray-800">
                {profile?.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
              </strong>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-400 block">Tempat & Tanggal Lahir</span>
              <strong className="text-base text-gray-800">
                {profile?.birthPlace}, {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('id-ID') : '-'}
              </strong>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-gray-400 block">Username Akun</span>
              <strong className="text-base text-gray-800">{user?.username}</strong>
            </div>
          </div>
        </div>
      </div>

      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhoto={currentPhoto}
        userName={profile?.fullName || user?.name || user?.username}
        targetType="auth"
        onSuccess={(newPath) => {
          updatePhoto(newPath);
          setProfile((prev) => (prev ? { ...prev, photoPath: newPath } : prev));
        }}
      />
    </div>
  );
}
