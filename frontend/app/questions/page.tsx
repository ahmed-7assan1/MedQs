'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Filter, Clock, CheckCircle, XCircle, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import clsx from 'clsx';

type Mode = 'browse' | 'practice' | 'exam';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filters, setFilters] = useState({ year: '', subject: '', difficulty: '', search: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('browse');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const LIMIT = 20;

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
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  useEffect(() => {
    api.get('/years').then(r => setYears(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (filters.year) api.get('/subjects', { params: { year: filters.year } }).then(r => setSubjects(r.data)).catch(() => {});
    else setSubjects([]);
  }, [filters.year]);

  useEffect(() => {
    api.get('/users/me/bookmarks').then(r => {
      setBookmarks(new Set(r.data.map((q: any) => q._id)));
    }).catch(() => {});
  }, []);

  // Exam timer
  useEffect(() => {
    if (mode !== 'exam' || submitted) return;
    const t = setInterval(() => setTimer(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [mode, submitted]);

  const startMode = (m: Mode) => {
    setMode(m);
    setCurrent(0);
    setSelected({});
    setRevealed({});
    setSubmitted(false);
    setScore(null);
    setTimer(0);
  };

  const handleSelect = (qId: string, opt: string) => {
    if (submitted) return;
    setSelected(s => ({ ...s, [qId]: opt }));
    if (mode === 'practice') {
      setRevealed(r => ({ ...r, [qId]: true }));
    }
  };

  const handleSubmitExam = async () => {
    const answers = questions.map(q => ({ questionId: q._id, selected: selected[q._id] || '' }));
    try {
      const { data } = await api.post('/questions/submit', { answers });
      setScore(data);
      setSubmitted(true);
      setRevealed(Object.fromEntries(questions.map(q => [q._id, true])));
    } catch {
      toast.error('Failed to submit');
    }
  };

  const toggleBookmark = async (qId: string) => {
    try {
      await api.post(`/users/me/bookmarks/${qId}`);
      setBookmarks(b => {
        const next = new Set(b);
        next.has(qId) ? next.delete(qId) : next.add(qId);
        return next;
      });
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const diffColor = (d: string) => ({ easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400', medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400', hard: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' }[d] || '');

  // === EXAM SCORE VIEW ===
  if (submitted && score && mode !== 'browse') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">{score.percentage}%</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {score.percentage >= 70 ? '🎉 Great job!' : score.percentage >= 50 ? '📚 Keep practicing!' : '💪 Don\'t give up!'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{score.score} / {score.total} correct{mode === 'exam' && ` · ${fmt(timer)}`}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setMode('browse'); setSubmitted(false); }} className="btn-secondary">Back to Browse</button>
            <button onClick={() => startMode(mode)} className="btn-primary">Try Again</button>
          </div>
        </div>

        {/* Review answers */}
        <div className="space-y-4">
          {score.results?.map((r: any, i: number) => {
            const q = questions.find(q => q._id === r.questionId);
            if (!q) return null;
            return (
              <div key={r.questionId} className={clsx('card p-5 border-l-4', r.correct ? 'border-l-emerald-500' : 'border-l-red-500')}>
                <div className="flex items-start gap-2 mb-3">
                  {r.correct ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{q.text}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {['A','B','C','D'].map(opt => (
                    <div key={opt} className={clsx('text-xs p-2 rounded-lg', opt === q.correctAnswer ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : opt === r.selected && !r.correct ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}>
                      <span className="font-bold">{opt}.</span> {q.options[opt]}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 prose-medical text-sm">
                    <ReactMarkdown>{q.explanation}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === PRACTICE / EXAM MODE ===
  if (mode !== 'browse' && questions.length > 0) {
    const q = questions[current];
    const isBookmarked = bookmarks.has(q._id);
    const userAns = selected[q._id];
    const isRevealed = revealed[q._id];

    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('browse')} className="btn-ghost flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" /> Exit
          </button>
          <div className="flex items-center gap-3">
            {mode === 'exam' && (
              <span className="flex items-center gap-1.5 text-sm font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4" />{fmt(timer)}
              </span>
            )}
            <span className="text-sm text-gray-500">{current + 1} / {questions.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-primary-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question card */}
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={clsx('badge', diffColor(q.difficulty))}>{q.difficulty}</span>
              {q.subject && <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{q.subject.name}</span>}
            </div>
            <button onClick={() => toggleBookmark(q._id)} className="text-gray-400 hover:text-amber-500 transition-colors flex-shrink-0">
              {isBookmarked ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-gray-900 dark:text-white font-medium leading-relaxed mb-6">{q.text}</p>

          <div className="space-y-2.5">
            {['A','B','C','D'].map(opt => {
              let cls = 'border border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 cursor-pointer';
              if (userAns === opt && !isRevealed) cls = 'border-primary-500 bg-primary-50 dark:bg-primary-950';
              if (isRevealed) {
                if (opt === q.correctAnswer) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950';
                else if (userAns === opt) cls = 'border-red-500 bg-red-50 dark:bg-red-950';
                else cls = 'border-gray-100 dark:border-gray-800 opacity-60';
              }
              return (
                <button key={opt} onClick={() => handleSelect(q._id, opt)}
                  className={clsx('w-full text-left px-4 py-3 rounded-xl transition-all text-sm', cls)}>
                  <span className="font-bold mr-2">{opt}.</span>{q.options[opt]}
                  {isRevealed && opt === q.correctAnswer && <CheckCircle className="w-4 h-4 text-emerald-500 inline ml-2" />}
                  {isRevealed && userAns === opt && opt !== q.correctAnswer && <XCircle className="w-4 h-4 text-red-500 inline ml-2" />}
                </button>
              );
            })}
          </div>

          {isRevealed && q.explanation && (
            <div className="mt-5 bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-100 dark:border-blue-900 prose-medical text-sm animate-slide-up">
              <p className="font-semibold text-blue-700 dark:text-blue-400 mb-1">📖 Explanation</p>
              <ReactMarkdown>{q.explanation}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <div className="flex gap-2">
            {mode === 'exam' && current === questions.length - 1 && !submitted && (
              <button onClick={handleSubmitExam} className="btn-primary flex items-center gap-1.5">
                <Send className="w-4 h-4" /> Submit Exam
              </button>
            )}
          </div>
          <button onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1} className="btn-secondary flex items-center gap-1">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // === BROWSE MODE ===
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" /> Question Bank
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{total} questions available</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowFilters(f => !f)} className="btn-secondary flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={() => startMode('practice')} disabled={questions.length === 0} className="btn-primary flex items-center gap-1.5">
            Practice Mode
          </button>
          <button onClick={() => startMode('exam')} disabled={questions.length === 0} className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Exam Mode
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 animate-slide-up">
          <select className="input text-sm" value={filters.year} onChange={e => { setFilters(f => ({ ...f, year: e.target.value, subject: '' })); setPage(1); }}>
            <option value="">All Years</option>
            {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
          </select>
          <select className="input text-sm" value={filters.subject} onChange={e => { setFilters(f => ({ ...f, subject: e.target.value })); setPage(1); }} disabled={!filters.year}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select className="input text-sm" value={filters.difficulty} onChange={e => { setFilters(f => ({ ...f, difficulty: e.target.value })); setPage(1); }}>
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input className="input text-sm" placeholder="Search questions…" value={filters.search} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }} />
        </div>
      )}

      {/* Question list */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : questions.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No questions found. Try changing filters.</div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-400">Q{(page - 1) * LIMIT + i + 1}</span>
                    <span className={clsx('badge', diffColor(q.difficulty))}>{q.difficulty}</span>
                    {q.subject && <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{q.subject.name}</span>}
                    {q.academicYear && <span className="badge bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400">{q.academicYear.name}</span>}
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-2">{q.text}</p>
                </div>
                <button onClick={() => toggleBookmark(q._id)} className="text-gray-300 hover:text-amber-500 transition-colors flex-shrink-0">
                  {bookmarks.has(q._id) ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(total / LIMIT) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400 px-4">Page {page} of {Math.ceil(total / LIMIT)}</span>
          <button onClick={() => setPage(p => Math.min(Math.ceil(total / LIMIT), p + 1))} disabled={page === Math.ceil(total / LIMIT)} className="btn-secondary px-3 py-2">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
