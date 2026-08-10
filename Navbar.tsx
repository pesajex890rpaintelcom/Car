import React from 'react';
import { BookOpen, LogOut, GraduationCap, UserCheck, Calculator } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white">Class 8th C</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Mathematics
              </span>
            </div>
            <p className="text-xs text-slate-400">Homework & Test Submissions Portal</p>
          </div>
        </div>

        {/* User Info & Actions */}
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className={`p-1.5 rounded-lg ${currentUser.role === 'teacher' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {currentUser.role === 'teacher' ? <UserCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                  {currentUser.name}
                  {currentUser.rollNo && (
                    <span className="text-xs text-slate-400">({currentUser.rollNo})</span>
                  )}
                </div>
                <div className="text-xs text-slate-400 capitalize">
                  {currentUser.role === 'teacher' ? 'Maths Teacher Panel' : 'Student Account'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all shadow-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
