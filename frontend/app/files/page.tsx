'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FileText, Download, Search, Filter, Eye, Calendar, HardDrive } from 'lucide-react';
import clsx from 'clsx';

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filters, setFilters] = useState({ year: '', subject: '', search: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  useEffect(() => {
    api.get('/years').then(r => setYears(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (filters.year) api.get('/subjects', { params: { year: filters.year } }).then(r => setSubjects(r.data)).catch(() => {});
    else setSubjects([]);
  }, [filters.year]);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit: LIMIT };
    if (filters.year) params.year = filters.year;
    if (filters.subject) params.subject = filters.subject;
    if (filters.search) params.search = filters.search;
    api.get('/files', { params })
      .then(r => { setFiles(r.data.files); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load files'))
      .finally(() => setLoading(false));
  }, [page, filters]);

  const handleDownload = async (file: any) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const token = localStorage.getItem('medibank_token');
      const res = await fetch(`${baseUrl}/api/files/${file._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-500" /> File Library
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{total} resources available</p>
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select className="input text-sm" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value, subject: '' }))}>
          <option value="">All Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
        <select className="input text-sm" value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))} disabled={!filters.year}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search files…" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : files.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No files found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map(file => (
            <div key={file._id} className="card p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                  {file.mimeType === 'application/pdf' ? 'PDF' : 'IMG'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{file.title}</h3>
              {file.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{file.description}</p>}
              <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{fmtSize(file.size)}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" />{file.downloads} downloads</span>
                </div>
                {file.subject && <p className="text-xs text-primary-600 dark:text-primary-400">{file.subject.name}</p>}
                <button onClick={() => handleDownload(file)} className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5 mt-2">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {Math.ceil(total / LIMIT) > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-2">Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)} className="btn-secondary text-sm px-3 py-2">Next</button>
        </div>
      )}
    </div>
  );
}
