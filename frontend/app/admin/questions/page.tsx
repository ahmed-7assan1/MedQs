'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, BookOpen, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const empty = { text: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', explanation: '', subject: '', academicYear: '', difficulty: 'medium', tags: '' };

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [filters, setFilters] = useState({ year: '', subject: '', difficulty: '', search: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const LIMIT = 15;

  useEffect(() => {
    api.get('/years').then(r => setYears(r.data)).catch(() => {});
    api.get('/subjects').then(r => setAllSubjects(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (filters.year || form.academicYear) {
      const yr = filters.year || form.academicYear;
      api.get('/subjects', { params: { year: yr } }).then(r => setSubjects(r.data)).catch(() => {});
    }
  }, [filters.year, form.academicYear]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (filters.year) params.year = filters.year;
      if (filters.subject) params.subject = filters.subject;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.search) params.search = filters.search;
      const { data } = await api.get('/questions', { params });
      setQuestions(data.questions);
      setTotal(data.total);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openCreate = () => { setForm(empty); setEditId(null); setShowForm(true); };
  const openEdit = (q: any) => {
    setForm({ ...q, subject: q.subject?._id || '', academicYear: q.academicYear?._id || '', tags: q.tags?.join(', ') || '' });
    setEditId(q._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.text || !form.subject || !form.academicYear) return toast.error('Fill required fields');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [] };
      if (editId) { await api.put(`/questions/${editId}`, payload); toast.success('Updated'); }
      else { await api.post('/questions', payload); toast.success('Created'); }
      setShowForm(false);
      fetchQuestions();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try { await api.delete(`/questions/${id}`); toast.success('Deleted'); fetchQuestions(); }
    catch { toast.error('Delete failed'); }
  };

  const diffColor = (d: string) => ({ easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400', medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400', hard: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' }[d] || '');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary-500" /> Questions</h1>
          <p className="text-gray-500 text-sm mt-1">{total} questions total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Question</button>
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <select className="input text-sm" value={filters.year} onChange={e => { setFilters(f => ({ ...f, year: e.target.value, subject: '' })); setPage(1); }}>
          <option value="">All Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
        <select className="input text-sm" value={filters.subject} onChange={e => { setFilters(f => ({ ...f, subject: e.target.value })); setPage(1); }}>
          <option value="">All Subjects</option>
          {(filters.year ? subjects : allSubjects).map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select className="input text-sm" value={filters.difficulty} onChange={e => { setFilters(f => ({ ...f, difficulty: e.target.value })); setPage(1); }}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
        <input className="input text-sm" placeholder="Search…" value={filters.search} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Question</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Year</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Difficulty</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Ans</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {questions.map((q, i) => (
                  <tr key={q._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{(page - 1) * LIMIT + i + 1}</td>
                    <td className="px-4 py-3 max-w-xs"><p className="line-clamp-2 text-gray-800 dark:text-gray-200">{q.text}</p></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{q.subject?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{q.academicYear?.name || '-'}</td>
                    <td className="px-4 py-3"><span className={clsx('badge', diffColor(q.difficulty))}>{q.difficulty}</span></td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(q)} className="btn-ghost p-1.5 text-gray-500 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(q._id)} className="btn-ghost p-1.5 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No questions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {Math.ceil(total / LIMIT) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs"><ChevronLeft className="w-3 h-3" /></button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)} className="btn-secondary px-3 py-1.5 text-xs"><ChevronRight className="w-3 h-3" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">{editId ? 'Edit Question' : 'Add Question'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Question Text *</label>
                <textarea className="input resize-none" rows={3} value={form.text} onChange={e => setForm((f: any) => ({ ...f, text: e.target.value }))} placeholder="Enter question…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['A','B','C','D'].map(opt => (
                  <div key={opt}>
                    <label className="label">Option {opt} *</label>
                    <input className="input" value={form.options[opt]} onChange={e => setForm((f: any) => ({ ...f, options: { ...f.options, [opt]: e.target.value } }))} placeholder={`Option ${opt}`} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Correct Answer *</label>
                  <select className="input" value={form.correctAnswer} onChange={e => setForm((f: any) => ({ ...f, correctAnswer: e.target.value }))}>
                    {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Academic Year *</label>
                  <select className="input" value={form.academicYear} onChange={e => setForm((f: any) => ({ ...f, academicYear: e.target.value, subject: '' }))}>
                    <option value="">Select year</option>
                    {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subject *</label>
                  <select className="input" value={form.subject} onChange={e => setForm((f: any) => ({ ...f, subject: e.target.value }))} disabled={!form.academicYear}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm((f: any) => ({ ...f, difficulty: e.target.value }))}>
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tags (comma-separated)</label>
                  <input className="input" value={form.tags} onChange={e => setForm((f: any) => ({ ...f, tags: e.target.value }))} placeholder="anatomy, head, nerve" />
                </div>
              </div>
              <div>
                <label className="label">Explanation (Markdown supported)</label>
                <textarea className="input resize-none font-mono text-sm" rows={4} value={form.explanation} onChange={e => setForm((f: any) => ({ ...f, explanation: e.target.value }))} placeholder="Explain the correct answer… **bold**, *italic* supported" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
