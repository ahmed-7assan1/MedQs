'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Layers, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';

const empty = { front: '', back: '', deck: '', subject: '', academicYear: '', tags: '' };

export default function AdminFlashcardsPage() {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filters, setFilters] = useState({ year: '', subject: '' });
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
  }, []);

  useEffect(() => {
    const yr = filters.year || form.academicYear;
    if (yr) api.get('/subjects', { params: { year: yr } }).then(r => setSubjects(r.data)).catch(() => {});
  }, [filters.year, form.academicYear]);

  const fetchFlashcards = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (filters.year) params.year = filters.year;
      if (filters.subject) params.subject = filters.subject;
      const { data } = await api.get('/flashcards', { params });
      setFlashcards(data.flashcards); setTotal(data.total);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchFlashcards(); }, [fetchFlashcards]);

  const openCreate = () => { setForm(empty); setEditId(null); setShowForm(true); };
  const openEdit = (fc: any) => {
    setForm({ ...fc, subject: fc.subject?._id || '', academicYear: fc.academicYear?._id || '', tags: fc.tags?.join(', ') || '' });
    setEditId(fc._id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.front || !form.back || !form.deck || !form.subject || !form.academicYear) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [] };
      if (editId) { await api.put(`/flashcards/${editId}`, payload); toast.success('Updated'); }
      else { await api.post('/flashcards', payload); toast.success('Created'); }
      setShowForm(false); fetchFlashcards();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this flashcard?')) return;
    try { await api.delete(`/flashcards/${id}`); toast.success('Deleted'); fetchFlashcards(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Layers className="w-6 h-6 text-purple-500" /> Flashcards</h1>
          <p className="text-gray-500 text-sm mt-1">{total} flashcards total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Flashcard</button>
      </div>

      <div className="card p-4 flex gap-3">
        <select className="input text-sm flex-1" value={filters.year} onChange={e => { setFilters(f => ({ ...f, year: e.target.value, subject: '' })); setPage(1); }}>
          <option value="">All Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
        <select className="input text-sm flex-1" value={filters.subject} onChange={e => { setFilters(f => ({ ...f, subject: e.target.value })); setPage(1); }} disabled={!filters.year}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Front</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Deck</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Year</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {flashcards.map(fc => (
                  <tr key={fc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 max-w-xs"><p className="line-clamp-2 text-gray-800 dark:text-gray-200">{fc.front}</p></td>
                    <td className="px-4 py-3"><span className="badge bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400">{fc.deck}</span></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{fc.subject?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{fc.academicYear?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(fc)} className="btn-ghost p-1.5 text-gray-500 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(fc._id)} className="btn-ghost p-1.5 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {flashcards.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No flashcards found.</td></tr>}
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

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">{editId ? 'Edit Flashcard' : 'Add Flashcard'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="label">Front (Question) *</label>
                <textarea className="input resize-none" rows={2} value={form.front} onChange={e => setForm((f: any) => ({ ...f, front: e.target.value }))} placeholder="What is…?" /></div>
              <div><label className="label">Back (Answer) * — Markdown supported</label>
                <textarea className="input resize-none font-mono text-sm" rows={4} value={form.back} onChange={e => setForm((f: any) => ({ ...f, back: e.target.value }))} placeholder="The answer is **bold**…" /></div>
              <div><label className="label">Deck Name *</label>
                <input className="input" value={form.deck} onChange={e => setForm((f: any) => ({ ...f, deck: e.target.value }))} placeholder="e.g. Cardiac Physiology" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Academic Year *</label>
                  <select className="input" value={form.academicYear} onChange={e => setForm((f: any) => ({ ...f, academicYear: e.target.value, subject: '' }))}>
                    <option value="">Select year</option>
                    {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                  </select></div>
                <div><label className="label">Subject *</label>
                  <select className="input" value={form.subject} onChange={e => setForm((f: any) => ({ ...f, subject: e.target.value }))} disabled={!form.academicYear}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select></div>
              </div>
              <div><label className="label">Tags (comma-separated)</label>
                <input className="input" value={form.tags} onChange={e => setForm((f: any) => ({ ...f, tags: e.target.value }))} placeholder="pharmacology, beta-blocker" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />{saving ? 'Saving…' : 'Save Flashcard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
