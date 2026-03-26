'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Users, Search, Pencil, Trash2, X, Save, ShieldCheck, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'student', isActive: true, academicYear: '' });
  const LIMIT = 15;

  useEffect(() => { api.get('/years').then(r => setYears(r.data)).catch(() => {}); }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await api.get('/users', { params });
      setUsers(data.users); setTotal(data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (u: any) => {
    setForm({ name: u.name, email: u.email, role: u.role, isActive: u.isActive, academicYear: u.academicYear?._id || '' });
    setEditUser(u);
  };

  const handleSave = async () => {
    try {
      await api.put(`/users/${editUser._id}`, form);
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('Deleted'); fetchUsers(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Users className="w-6 h-6 text-rose-500" /> Users</h1>
          <p className="text-gray-500 text-sm mt-1">{total} registered users</p>
        </div>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9 text-sm" placeholder="Search by name…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input text-sm w-40" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Year</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {u.name[0].toUpperCase()}
                        </div>
                        <div><p className="font-medium text-gray-800 dark:text-gray-200">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', u.role === 'admin' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400')}>
                        {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.academicYear?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', u.isActive ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="btn-ghost p-1.5 text-gray-400 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(u._id)} className="btn-ghost p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No users found.</td></tr>}
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

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Role</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="student">Student</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div><label className="label">Status</label>
                  <select className="input" value={String(form.isActive)} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                    <option value="true">Active</option><option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Academic Year</label>
                <select className="input" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))}>
                  <option value="">None</option>
                  {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setEditUser(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
