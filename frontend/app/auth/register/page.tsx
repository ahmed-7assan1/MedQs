'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/authStore';
import { Stethoscope } from 'lucide-react';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [years, setYears] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', academicYear: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/years').then(r => setYears(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">medibank</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Start your medical learning journey.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Dr. John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Academic Year</label>
            <select className="input" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}>
              <option value="">Select year (optional)</option>
              {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
