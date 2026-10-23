import { useState, useEffect } from 'react';
import { isValidScore } from '../../utils/gradeCalculation';
import toast from 'react-hot-toast';

export default function GradeForm({ initialData, onSubmit, onCancel, loading = false, type = 'daily' }) {
  const [formData, setFormData] = useState({
    score: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    exam_type: 'UTS',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        score: initialData.score ?? '',
        description: initialData.description || '',
        date: initialData.date ? initialData.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
        exam_type: initialData.exam_type || 'UTS',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidScore(formData.score)) {
      toast.error('Nilai harus antara 0-100');
      return;
    }
    const payload = { ...formData, score: Number(formData.score) };
    onSubmit(payload);
  };

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nilai (0-100)</label>
        <input
          type="number"
          name="score"
          value={formData.score}
          onChange={handleChange}
          required
          min={0}
          max={100}
          step={0.01}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Masukkan nilai"
        />
      </div>

      {type === 'exam' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Ujian</label>
          <select
            name="exam_type"
            value={formData.exam_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="UTS">UTS (Ujian Tengah Semester)</option>
            <option value="UAS">UAS (Ujian Akhir Semester)</option>
            <option value="UKK">UKK (Ujian Kenaikan Kelas)</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Keterangan (opsional)"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isEdit ? 'Perbarui' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
