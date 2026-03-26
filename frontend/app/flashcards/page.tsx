'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Layers, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, RefreshCw, Filter } from 'lucide-react';
import clsx from 'clsx';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filters, setFilters] = useState({ year: '', subject: '', deck: '' });
  const [activeDeck, setActiveDeck] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'decks' | 'study'>('decks');

  useEffect(() => {
    api.get('/years').then(r => setYears(r.data)).catch(() => {});
    fetchDecks();
  }, []);

  useEffect(() => {
    if (filters.year) api.get('/subjects', { params: { year: filters.year } }).then(r => setSubjects(r.data)).catch(() => {});
  }, [filters.year]);

  const fetchDecks = async () => {
    try {
      const params: any = {};
      if (filters.year) params.year = filters.year;
      if (filters.subject) params.subject = filters.subject;
      const { data } = await api.get('/flashcards/decks', { params });
      setDecks(data);
    } catch { toast.error('Failed to load decks'); }
  };

  useEffect(() => { fetchDecks(); }, [filters]);

  const startDeck = async (deckName: string) => {
    setLoading(true);
    try {
      const params: any = { deck: deckName, limit: 100 };
      if (filters.year) params.year = filters.year;
      if (filters.subject) params.subject = filters.subject;
      const { data } = await api.get('/flashcards', { params });
      setFlashcards(data.flashcards);
      setActiveDeck(deckName);
      setCurrent(0);
      setFlipped(false);
      setProgress({});
      setView('study');
    } catch { toast.error('Failed to load flashcards'); }
    finally { setLoading(false); }
  };

  const handleReview = async (known: boolean) => {
    const fc = flashcards[current];
    setProgress(p => ({ ...p, [fc._id]: known }));
    try { await api.post(`/flashcards/${fc._id}/review`, { known }); } catch {}
    setTimeout(() => {
      setFlipped(false);
      if (current < flashcards.length - 1) setCurrent(c => c + 1);
    }, 200);
  };

  const knownCount = Object.values(progress).filter(Boolean).length;
  const reviewCount = Object.values(progress).filter(v => !v).length;

  if (view === 'study' && flashcards.length > 0) {
    const fc = flashcards[current];
    const allDone = Object.keys(progress).length === flashcards.length;

    if (allDone) {
      return (
        <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Deck Complete!</h2>
          <p className="text-gray-500 mb-2">{knownCount} known · {reviewCount} to review</p>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-8">
            <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${(knownCount / flashcards.length) * 100}%` }} />
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setView('decks')} className="btn-secondary">All Decks</button>
            <button onClick={() => { setCurrent(0); setFlipped(false); setProgress({}); }} className="btn-primary flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Restart
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('decks')} className="btn-ghost flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" /> Decks
          </button>
          <div className="text-sm text-gray-500">{current + 1} / {flashcards.length}</div>
        </div>

        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-primary-500 transition-all" style={{ width: `${((current + 1) / flashcards.length) * 100}%` }} />
        </div>

        {/* Flashcard */}
        <div className="perspective w-full h-72 cursor-pointer" onClick={() => setFlipped(f => !f)}>
          <div className={clsx('card-inner relative w-full h-full', flipped && 'flipped')}>
            {/* Front */}
            <div className="card-face card absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <span className="badge bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 mb-4">
                {fc.deck}
              </span>
              <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">{fc.front}</p>
              <p className="text-xs text-gray-400 mt-6">Click to reveal answer</p>
            </div>
            {/* Back */}
            <div className="card-face card-back card absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950 dark:to-blue-950">
              <div className="prose-medical text-sm text-gray-800 dark:text-gray-200 text-center max-w-full">
                <ReactMarkdown>{fc.back}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Review buttons - only show when flipped */}
        {flipped && (
          <div className="flex gap-3 animate-slide-up">
            <button onClick={() => handleReview(false)} className="flex-1 py-3 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-medium hover:bg-red-200 dark:hover:bg-red-900 transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Review Again
            </button>
            <button onClick={() => handleReview(true)} className="flex-1 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Got It!
            </button>
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-500">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ {knownCount} known</span>
          <button onClick={() => { setFlipped(false); setCurrent(c => Math.max(0, c - 1)); }} disabled={current === 0} className="btn-ghost py-1 px-2 text-xs disabled:opacity-30">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-red-500 dark:text-red-400 font-medium">↻ {reviewCount} to review</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-500" /> Flashcard Decks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Study with spaced repetition</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-3 flex-wrap">
        <select className="input text-sm flex-1 min-w-36" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value, subject: '' }))}>
          <option value="">All Years</option>
          {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
        </select>
        <select className="input text-sm flex-1 min-w-36" value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))} disabled={!filters.year}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {decks.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No flashcard decks found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck, i) => (
            <button key={i} onClick={() => startDeck(deck._id.deck)} disabled={loading}
              className="card p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{deck._id.deck}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{deck.count} cards</p>
              {deck.subject && <p className="text-xs text-gray-400 mt-1">{deck.subject.name}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
