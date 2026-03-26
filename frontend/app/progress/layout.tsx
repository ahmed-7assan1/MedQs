'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import {
  LayoutDashboard, BookOpen, Layers, FileText, Users,
  Settings, LogOut, Stethoscope, ChevronLeft, Moon, Sun,
  GraduationCap, Bookmark, BarChart2, Menu, X, ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

const studentNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/questions', icon: BookOpen, label: 'Question Bank' },
  { href: '/flashcards', icon: Layers, label: 'Flashcards' },
  { href: '/files', icon: FileText, label: 'File Library' },
  { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { href: '/progress', icon: BarChart2, label: 'My Progress' },
];

const adminNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/questions', icon: BookOpen, label: 'Questions' },
  { href: '/admin/flashcards', icon: Layers, label: 'Flashcards' },
  { href: '/admin/files', icon: FileText, label: 'Files' },
  { href: '/admin/subjects', icon: GraduationCap, label: 'Subjects & Years' },
  { href: '/admin/users', icon: Users, label: 'Users' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loading } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    const stored = localStorage.getItem('medibank_dark');
    if (stored === 'true') { document.documentElement.classList.add('dark'); setDark(true); }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('medibank_dark', String(next));
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nav = user.role === 'admin' ? adminNav : studentNav;
  const isAdmin = user.role === 'admin';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800', collapsed && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="font-bold text-gray-900 dark:text-white text-lg">medibank</span>}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4">
          <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium', isAdmin ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400' : 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-400')}>
            {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
            {isAdmin ? 'Administrator' : 'Student'}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} onClick={() => setMobileOpen(false)}
            className={clsx('sidebar-link', pathname === href && 'active', collapsed && 'justify-center px-2')}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <button onClick={toggleDark} className={clsx('sidebar-link w-full', collapsed && 'justify-center px-2')}>
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button onClick={() => { logout(); router.push('/auth/login'); }} className={clsx('sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950', collapsed && 'justify-center px-2')}>
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - desktop */}
      <aside className={clsx(
        'hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-[68px]' : 'w-64'
      )}>
        <SidebarContent />
        <button onClick={() => setCollapsed(c => !c)} className="absolute left-[calc(var(--sidebar-w)-12px)] top-6 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm z-10 transition-all"
          style={{ '--sidebar-w': collapsed ? '68px' : '256px' } as any}>
          <ChevronLeft className={clsx('w-3 h-3 text-gray-500 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Sidebar - mobile */}
      <aside className={clsx(
        'fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-30 transition-transform duration-300 lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-900 dark:text-white">medibank</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
