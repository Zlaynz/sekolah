import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { School, LogIn, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <School className="w-9 h-9 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          SIAKAD SMP Nusantara
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistem Penilaian Akademik & Presensi Siswa Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Masukkan username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Masuk ke Sistem
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preset Helper Pills */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Akun Uji Coba Cepat:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                className="text-left p-2 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium"
              >
                Admin (admin)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('guru1'); setPassword('password123'); }}
                className="text-left p-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium"
              >
                Guru (guru1)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('guru2'); setPassword('password123'); }}
                className="text-left p-2 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium"
              >
                Wali Kelas (guru2)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('siswa1'); setPassword('password123'); }}
                className="text-left p-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium"
              >
                Siswa (siswa1)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

