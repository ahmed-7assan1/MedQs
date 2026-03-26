'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileText, X, Upload, HardDrive, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminFilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filters, setFilters] = useState({ year: '', subject: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', subject: '', academicYear: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const LIMIT = 15;

  useEffect(() => { api.get('/years').then(r => setYears(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    const yr = filters.year || form.academicYear;
    if (yr) api.get('/subjects', { params: { year: yr } }).then(r => setSubjects(r.data)).catch(() => {});
  }, [filters.year, form.academicYear]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (filters.year) params.year = filters.year;
      if (filters.subject) params.subject = filters.subject;
      const { data } = await api.get('/files', { params });
      setFiles(data.files); setTotal(data.total);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async () => {
    if (!selectedFile || !form.title || !form.subject || !form.academicYear) return toast.error('Fill all fields and select a file');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('subject', form.subject);
      fd.append('academicYear', form.academicYear);
      await api.post('/files', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('File uploaded');
      setShowForm(false);
      setForm({ title: '', description: '', subject: '', academicYear: '' });
      setSelectedFile(null);
      fetchFiles();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Upload failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try { await api.delete(`/files/${id}`); toast.success('Deleted'); fetchFiles(); }
    catch { toast.error('Delete failed'); }
  };

  const fmtSize = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileText className="w-6 h-6 text-emerald-500" /> File Library</h1>
          <p className="text-gray-500 text-sm mt-1">{total} files</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Upload File</button>
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Year</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Size</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Downloads</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {files.map(f => (
                  <tr key={f._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{f.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-48">{f.originalName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.subject?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.academicYear?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtSize(f.size)}</td>
                    <td className="px-4 py-3 text-gray-500">{f.downloads}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleDelete(f._id)} className="btn-ghost p-1.5 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No files uploaded yet.</td></tr>}
              </tbody>
            </table>
          </div>
          {Math.ceil(total / LIMIT) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / LIMIT)}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs"><ChevronLeft className="w-3 h-3" /></button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)} className="btn-secondary px-3 py-1.5 text-xs"><ChevronRight className="w-3 h-3" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Upload File</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* File drop zone */}
              <div onClick={() => fileRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${selectedFile ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'}`}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                {selectedFile ? (
                  <div><p className="font-medium text-primary-700 dark:text-primary-400">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{fmtSize(selectedFile.size)}</p></div>
                ) : <p className="text-sm text-gray-500">Click to select PDF or image</p>}
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,image/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
              </div>
              <div><label className="label">Title *</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Lecture 1 - Anatomy of the Head" /></div>
              <div><label className="label">Description</label>
                <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Year *</label>
                  <select className="input" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value, subject: '' }))}>
                    <option value="">Select year</option>
                    {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                  </select></div>
                <div><label className="label">Subject *</label>
                  <select className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} disabled={!form.academicYear}>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleUpload} disabled={saving} className="btn-primary flex items-center gap-2">
                <Upload className="w-4 h-4" />{saving ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
