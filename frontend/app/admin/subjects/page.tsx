'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, GraduationCap, X, Save } from 'lucide-react';

export default function AdminSubjectsPage() {
  const [years, setYears] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showYearForm, setShowYearForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);
  const [editYear, setEditYear] = useState<any>(null);
  const [editSub, setEditSub] = useState<any>(null);
  const [yearForm, setYearForm] = useState({ name: '', year: '', description: '' });
  const [subForm, setSubForm] = useState({ name: '', description: '', academicYear: '', color: '#0EA5E9', icon: '🧬' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [yr, sub] = await Promise.all([api.get('/years'), api.get('/subjects')]);
      setYears(yr.data); setSubjects(sub.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const saveYear = async () => {
    if (!yearForm.name || !yearForm.year) return toast.error('Name and year number required');
    try {
      if (editYear) await api.put(`/years/${editYear._id}`, yearForm);
      else await api.post('/years', yearForm);
      toast.success(editYear ? 'Updated' : 'Created');
      setShowYearForm(false); setEditYear(null); setYearForm({ name: '', year: '', description: '' }); fetchAll();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
  };

  const deleteYear = async (id: string) => {
    if (!confirm('Delete this year? All linked subjects, questions, and files may be affected.')) return;
    try { await api.delete(`/years/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const saveSub = async () => {
    if (!subForm.name || !subForm.academicYear) return toast.error('Name and year required');
    try {
      if (editSub) await api.put(`/subjects/${editSub._id}`, subForm);
      else await api.post('/subjects', subForm);
      toast.success(editSub ? 'Updated' : 'Created');
      setShowSubForm(false); setEditSub(null); setSubForm({ name: '', description: '', academicYear: '', color: '#0EA5E9', icon: '🧬' }); fetchAll();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
  };

  const deleteSub = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try { await api.delete(`/subjects/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const openEditYear = (y: any) => { setYearForm({ name: y.name, year: y.year, description: y.description }); setEditYear(y); setShowYearForm(true); };
  const openEditSub = (s: any) => { setSubForm({ name: s.name, description: s.description, academicYear: s.academicYear?._id || '', color: s.color, icon: s.icon }); setEditSub(s); setShowSubForm(true); };

  const ICONS = ['🧬','💓','🧪','🔬','💊','🏥','🦴','🧠','👁️','🦷','🫀','🫁'];
  const COLORS = ['#EF4444','#F97316','#EAB308','#22C55E','#06B6D4','#0EA5E9','#8B5CF6','#EC4899'];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><GraduationCap className="w-6 h-6 text-amber-500" /> Subjects & Years</h1>
      </div>

      {/* Academic Years */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Academic Years</h2>
          <button onClick={() => { setYearForm({ name: '', year: '', description: '' }); setEditYear(null); setShowYearForm(true); }} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Year</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map(y => (
            <div key={y._id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">Y{y.year}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white mt-1">{y.name}</h3>
                  {y.description && <p className="text-sm text-gray-500 mt-0.5">{y.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditYear(y)} className="btn-ghost p-1.5 text-gray-400 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteYear(y._id)} className="btn-ghost p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                {subjects.filter(s => s.academicYear?._id === y._id).length} subjects
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Subjects</h2>
          <button onClick={() => { setSubForm({ name: '', description: '', academicYear: '', color: '#0EA5E9', icon: '🧬' }); setEditSub(null); setShowSubForm(true); }} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Subject</button>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Subject</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Year</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {subjects.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{s.name}</span>
                        <div className="w-3 h-3 rounded-full inline-block ml-2" style={{ background: s.color }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.academicYear?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{s.description || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditSub(s)} className="btn-ghost p-1.5 text-gray-400 hover:text-primary-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteSub(s._id)} className="btn-ghost p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">No subjects yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Year Form Modal */}
      {showYearForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">{editYear ? 'Edit Year' : 'Add Academic Year'}</h3>
              <button onClick={() => setShowYearForm(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="label">Name *</label><input className="input" value={yearForm.name} onChange={e => setYearForm(f => ({ ...f, name: e.target.value }))} placeholder="First Year" /></div>
              <div><label className="label">Year Number *</label><input className="input" type="number" value={yearForm.year} onChange={e => setYearForm(f => ({ ...f, year: e.target.value }))} placeholder="1" /></div>
              <div><label className="label">Description</label><input className="input" value={yearForm.description} onChange={e => setYearForm(f => ({ ...f, description: e.target.value }))} placeholder="Basic medical sciences" /></div>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setShowYearForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={saveYear} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Form Modal */}
      {showSubForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">{editSub ? 'Edit Subject' : 'Add Subject'}</h3>
              <button onClick={() => setShowSubForm(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="label">Subject Name *</label><input className="input" value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} placeholder="Anatomy" /></div>
              <div><label className="label">Academic Year *</label>
                <select className="input" value={subForm.academicYear} onChange={e => setSubForm(f => ({ ...f, academicYear: e.target.value }))}>
                  <option value="">Select year</option>
                  {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                </select>
              </div>
              <div><label className="label">Description</label><input className="input" value={subForm.description} onChange={e => setSubForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="label">Icon</label>
                <div className="flex gap-2 flex-wrap">{ICONS.map(ic => (
                  <button key={ic} type="button" onClick={() => setSubForm(f => ({ ...f, icon: ic }))} className={`w-9 h-9 rounded-lg text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${subForm.icon === ic ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500' : ''}`}>{ic}</button>
                ))}</div>
              </div>
              <div><label className="label">Color</label>
                <div className="flex gap-2 flex-wrap">{COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setSubForm(f => ({ ...f, color: c }))} className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${subForm.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} style={{ background: c }} />
                ))}</div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setShowSubForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={saveSub} className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
