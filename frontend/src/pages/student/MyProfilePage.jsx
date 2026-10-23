import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import { User, School, Calendar, ShieldCheck } from 'lucide-react';

export default function MyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Siswa</h1>
        <p className="text-sm text-gray-500">Identitas diri dan status keaktifan akademik</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-2xl">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.fullName || user?.name || user?.username}</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              NISN: {profile?.nisn || '-'} | NIS: {profile?.nis || '-'}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold rounded-full">
              Siswa {profile?.status || 'AKTIF'}
            </span>
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
    </div>
  );
}

