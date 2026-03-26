'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Bookmark, BookmarkX } from 'lucide-react';
import clsx from 'clsx';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/bookmarks').then(r => setBookmarks(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const removeBookmark = async (qId: string) => {
    try {
      await api.post(`/users/me/bookmarks/${qId}`);
      setBookmarks(b => b.filter(q => q._id !== qId));
      toast.success('Removed from bookmarks');
    } catch { toast.error('Failed'); }
  };

  const diffColor = (d: string) => ({ easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400', medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400', hard: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' }[d] || '');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-500" /> Bookmarked Questions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{bookmarks.length} saved questions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : bookmarks.length === 0 ? (
        <div className="card p-12 text-center">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No bookmarked questions yet.</p>
          <p className="text-gray-400 text-sm mt-1">Bookmark questions while practicing to review them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(q => (
            <div key={q._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={clsx('badge', diffColor(q.difficulty))}>{q.difficulty}</span>
                    {q.subject && <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{q.subject.name}</span>}
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{q.text}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {['A','B','C','D'].map(opt => (
                      <div key={opt} className={clsx('text-xs p-2 rounded-lg', opt === q.correctAnswer ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-medium' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400')}>
                        <span className="font-bold">{opt}.</span> {q.options[opt]}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => removeBookmark(q._id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0" title="Remove bookmark">
                  <BookmarkX className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
