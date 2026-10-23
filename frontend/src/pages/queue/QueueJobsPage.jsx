import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Layers, RefreshCw, CheckCircle, Clock, Play, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QueueJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2500); // Polling status
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/queue/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerTestJob = async (type) => {
    setTriggering(true);
    try {
      const res = await api.post('/queue/jobs', {
        reportType: type,
        targetId: 1,
        academicYearId: 1
      });
      toast.success(`Tugas background berhasil dimasukkan ke antrean! (ID: ${res.data.id.substring(0, 8)})`);
      fetchJobs();
    } catch (err) {
      toast.error('Gagal memasukkan tugas.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600" /> Restful API Background Queue
          </h1>
          <p className="text-sm text-gray-500">
            Pemrosesan kompilasi rapor, agregasi nilai, dan antrean tugas asynchronous
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleTriggerTestJob('STUDENT_REPORT_CARD')}
            disabled={triggering}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Uji Antrean Rapor
          </button>
          <button
            onClick={() => handleTriggerTestJob('CLASS_RECAP')}
            disabled={triggering}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Uji Antrean Rekap Kelas
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900">
        <strong>Arsitektur Restful API Queue:</strong> Tugas berat seperti pembentukan dokumen PDF dan rekap nilai diantrekan menggunakan <code>System.Threading.Channels</code> dan diproses di latar belakang oleh <code>BackgroundService</code> worker. Frontend melakukan polling status HTTP REST secara periodik.
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 text-base">Daftar Antrean & Status Pemrosesan</h2>
          <button
            onClick={fetchJobs}
            className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Segarkan
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {jobs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Belum ada antrean tugas yang diproses. Silakan klik tombol uji di atas.
            </div>
          ) : (
            jobs.map((job) => {
              const isDone = job.status === 2 || job.status === 'Completed';
              const isProcessing = job.status === 1 || job.status === 'Processing';
              return (
                <div key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">#{job.id.substring(0, 8)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isProcessing
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isDone ? 'Selesai' : isProcessing ? 'Sedang Diproses' : 'Dalam Antrean'}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-sm">{job.title}</h3>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isDone ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{job.progress}% Progres</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isDone && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Siap Diunduh
                      </span>
                    )}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {new Date(job.createdAt).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

