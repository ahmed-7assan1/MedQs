'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import api from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Layers, FileText, Bookmark, TrendingUp, Target, Award, ChevronRight } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'student') {
      api.get('/users/me/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const isAdmin = user?.role === 'admin';

  const adminCards = [
    { href: '/admin/questions', icon: BookOpen, label: 'Manage Questions', desc: 'Add, edit, delete MCQs', color: 'from-blue-500 to-blue-600' },
    { href: '/admin/flashcards', icon: Layers, label: 'Manage Flashcards', desc: 'Create study decks', color: 'from-purple-500 to-purple-600' },
    { href: '/admin/files', icon: FileText, label: 'File Library', desc: 'Upload PDFs & resources', color: 'from-emerald-500 to-emerald-600' },
    { href: '/admin/subjects', icon: Target, label: 'Subjects & Years', desc: 'Organize curriculum', color: 'from-amber-500 to-amber-600' },
    { href: '/admin/users', icon: Award, label: 'User Management', desc: 'Manage student accounts', color: 'from-rose-500 to-rose-600' },
  ];

  const studentCards = [
    { href: '/questions', icon: BookOpen, label: 'Practice Questions', desc: 'MCQ question bank', color: 'from-blue-500 to-blue-600' },
    { href: '/flashcards', icon: Layers, label: 'Flashcards', desc: 'Spaced repetition', color: 'from-purple-500 to-purple-600' },
    { href: '/files', icon: FileText, label: 'Study Files', desc: 'PDFs & lecture notes', color: 'from-emerald-500 to-emerald-600' },
    { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks', desc: 'Saved questions', color: 'from-amber-500 to-amber-600' },
  ];

  const cards = isAdmin ? adminCards : studentCards;

  const accuracyData = stats ? [{ name: 'Accuracy', value: stats.accuracy, fill: '#0ea5e9' }] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-primary-600 dark:text-primary-400">{user?.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isAdmin ? 'Manage your medical learning platform.' : "Let's continue where you left off."}
        </p>
      </div>

      {/* Stats row (student only) */}
      {!isAdmin && !loading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Answered', value: stats.totalAnswered, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
            { label: 'Correct', value: stats.totalCorrect, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950' },
            { label: 'Accuracy', value: `${stats.accuracy}%`, icon: Target, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950' },
            { label: 'Bookmarks', value: stats.bookmarkCount, icon: Bookmark, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Subject progress */}
      {!isAdmin && stats?.subjectProgress?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary-500" />
            Subject Performance
          </h2>
          <div className="space-y-3">
            {stats.subjectProgress.slice(0, 5).map((sp: any) => {
              const acc = sp.answered > 0 ? Math.round((sp.correct / sp.answered) * 100) : 0;
              return (
                <div key={sp.subject?._id || sp.subject} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-32 truncate">{sp.subject?.name || 'Unknown'}</span>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all" style={{ width: `${acc}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">{acc}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick access cards */}
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map(({ href, icon: Icon, label, desc, color }) => (
            <Link key={href} href={href} className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
