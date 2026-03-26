'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'student') => {
    if (role === 'admin') setForm({ email: 'admin@medibank.com', password: 'admin123' });
    else setForm({ email: 'student@medibank.com', password: 'student123' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-950 via-primary-900 to-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">medibank</span>
          </div>
          <h1 className="text-5xl font-display text-white leading-tight mb-4">
            Learn medicine<br />
            <span className="text-primary-400">the smart way.</span>
          </h1>
          <p className="text-primary-200 text-lg leading-relaxed max-w-sm">
            Thousands of questions, flashcards, and study materials — all in one place.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {[['10K+', 'Questions'], ['500+', 'Flashcards'], ['100+', 'Files']].map(([n, l]) => (
            <div key={l} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{n}</div>
              <div className="text-primary-300 text-sm">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">medibank</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Sign in</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Welcome back — continue your studies.</p>

          {/* Demo buttons */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => fillDemo('admin')} className="flex-1 text-xs py-2 px-3 rounded-lg border border-dashed border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors">
              Fill Admin Demo
            </button>
            <button onClick={() => fillDemo('student')} className="flex-1 text-xs py-2 px-3 rounded-lg border border-dashed border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors">
              Fill Student Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input className="input pr-10" type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
