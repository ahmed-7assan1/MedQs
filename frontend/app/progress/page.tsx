'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BarChart2, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProgressPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const subjectData = stats?.subjectProgress?.map((sp: any) => ({
    name: sp.subject?.name || 'Unknown',
    accuracy: sp.answered > 0 ? Math.round((sp.correct / sp.answered) * 100) : 0,
    answered: sp.answered,
  })) || [];

  const weakAreas = subjectData.filter((s: any) => s.accuracy < 60 && s.answered > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-primary-500" /> My Progress
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Answered', value: stats?.totalAnswered || 0, icon: Target, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Correct Answers', value: stats?.totalCorrect || 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950' },
          { label: 'Overall Accuracy', value: `${stats?.accuracy || 0}%`, icon: BarChart2, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950' },
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

      {/* Accuracy bar chart */}
      {subjectData.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Accuracy by Subject</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Accuracy']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                {subjectData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.accuracy >= 70 ? '#10b981' : entry.accuracy >= 50 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <div className="card p-6 border-l-4 border-l-amber-500">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Areas to Improve
          </h2>
          <div className="space-y-2">
            {weakAreas.map((s: any) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300 w-36 truncate">{s.name}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-red-400 transition-all" style={{ width: `${s.accuracy}%` }} />
                </div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400 w-10 text-right">{s.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.totalAnswered === 0 && (
        <div className="card p-12 text-center text-gray-400">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No data yet. Start practicing to see your progress!</p>
        </div>
      )}
    </div>
  );
}
