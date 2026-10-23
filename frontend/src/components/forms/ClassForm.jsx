import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function ClassForm({ initialData, onSubmit, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    grade_level: 7,
    academic_year_id: '',
    homeroom_teacher_id: '',
  });
  const [academicYears, setAcademicYears] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        grade_level: initialData.grade_level || 7,
        academic_year_id: initialData.academic_year_id || '',
        homeroom_teacher_id: initialData.homeroom_teacher_id || '',
      });
    }
  }, [initialData]);

  const fetchOptions = async () => {
    try {
      const [yearsRes, teachersRes] = await Promise.all([
        api.get('/academic-years'),
        api.get('/teachers'),
      ]);
      setAcademicYears(yearsRes.data.data || yearsRes.data || []);
      setTeachers(teachersRes.data.data || teachersRes.data || []);
    } catch {
      // handled by interceptor
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['grade_level', 'academic_year_id', 'homeroom_teacher_id'].includes(name)
        ? value === '' ? '' : Number(value)
        : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Cth: 7A, 8B, 9C"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Kelas</label>
        <select
          name="grade_level"
          value={formData.grade_level}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value={7}>Kelas 7</option>
          <option value={8}>Kelas 8</option>
          <option value={9}>Kelas 9</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
        <select
          name="academic_year_id"
          value={formData.academic_year_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="">Pilih Tahun Ajaran</option>
          {academicYears.map((ay) => (
            <option key={ay.id} value={ay.id}>
              {ay.year} - Semester {ay.semester} {ay.is_active ? '(Aktif)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas</label>
        <select
          name="homeroom_teacher_id"
          value={formData.homeroom_teacher_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="">Pilih Wali Kelas (opsional)</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.nip})
            </option>
          ))}
        </select>
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
