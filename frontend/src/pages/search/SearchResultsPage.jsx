import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Search, Sparkles, Clock, ArrowRight, User, GraduationCap, School, BookOpen } from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const initialCategory = searchParams.get('type') || 'all';

  const [searchInput, setSearchInput] = useState(query);
  const [category, setCategory] = useState(initialCategory);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      executeSearch(query, category);
    }
  }, [query, category]);

  const executeSearch = async (q, cat) => {
    setLoading(true);
    try {
      const typeParam = cat && cat !== 'all' ? `&type=${cat}` : '';
      const res = await api.get(`/search?q=${encodeURIComponent(q)}${typeParam}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim(), type: category });
    }
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'Siswa':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'Guru':
        return <GraduationCap className="w-5 h-5 text-emerald-600" />;
      case 'Kelas':
        return <School className="w-5 h-5 text-purple-600" />;
      case 'Mata Pelajaran':
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  const categories = [
    { id: 'all', label: 'Semua Hasil' },
    { id: 'students', label: 'Siswa' },
    { id: 'teachers', label: 'Guru & Pejabat' },
    { id: 'classes', label: 'Rombel Kelas' },
    { id: 'subjects', label: 'Mata Pelajaran' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Input Bar */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <form onSubmit={handleFormSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ketik kata kunci pencarian (nama siswa, NIP guru, kode mapel, kelas)..."
            className="w-full pl-12 pr-28 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
          >
            Cari
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                if (query) setSearchParams({ q: query, type: c.id });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                category === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.label}
              {data?.categoryCounts && data.categoryCounts[c.label] && (
                <span className="ml-1.5 opacity-80 text-[10px]">({data.categoryCounts[c.label]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Meta Stats */}
      {data && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-2">
          <span>
            Menemukan <strong>{data.totalMatches}</strong> hasil untuk pencarian &ldquo;{data.query}&rdquo;
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Waktu eksekusi: {data.executionTimeMs} ms
          </span>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Menjalankan mesin pencari...</div>
        ) : !data || data.results.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 text-gray-500">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-base">Tidak ada hasil ditemukan.</p>
            <p className="text-xs text-gray-400 mt-1">Coba gunakan kata kunci lain seperti "Matematika", "Budi", atau "7-A".</p>
          </div>
        ) : (
          data.results.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 shrink-0 mt-0.5">
                {getEntityIcon(item.entityType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                    {item.entityType}
                  </span>
                  <span className="text-xs text-gray-400">Relevansi: {Math.round(item.score)}%</span>
                </div>

                <h3 className="font-bold text-gray-900 text-base mt-1">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-gray-600 mt-0.5">{item.subtitle}</p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>

              <Link
                to={item.routeUrl}
                className="shrink-0 text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Buka <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

