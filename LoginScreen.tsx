import React, { useState } from 'react';
import { Calculator, Lock, User, KeyRound, AlertCircle, Sparkles, GraduationCap, ShieldCheck } from 'lucide-react';
import { getUserByUsername } from '../lib/firebase';
import { UserAccount } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Special Teacher Check: teacher / 123456
      if (cleanUsername === 'teacher' && cleanPassword === '123456') {
        const teacherAccount: UserAccount = {
          username: 'teacher',
          password: '123456',
          role: 'teacher',
          name: 'Mr. R. K. Sharma',
          subject: 'Maths',
          className: 'Class 8th C',
          createdAt: new Date().toISOString()
        };
        onLoginSuccess(teacherAccount);
        return;
      }

      // 2. Query Firestore for registered user
      const userDoc = await getUserByUsername(cleanUsername);

      if (!userDoc) {
        setError(`No account found for username "${cleanUsername}". Students are registered directly by the Teacher in Firebase.`);
        setLoading(false);
        return;
      }

      // 3. Verify password
      if (userDoc.password && userDoc.password !== cleanPassword) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      // Login Successful
      onLoginSuccess(userDoc);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('An error occurred while logging in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/20 mb-2">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Class 8th C Portal
          </h2>
          <p className="text-sm text-slate-400">
            Mathematics Homework & Test Portal
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="mb-6 pb-4 border-b border-slate-800/80">
            <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Sign In to Your Account
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter your assigned student or teacher credentials
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. teacher or aarav8c"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Login to Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500">
              Note: Student registration is managed internally in Firebase by the Teacher.
            </p>
          </div>
        </div>

        {/* Demo Accounts Quick-Fill Section */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Quick Demo Logins (Click to Auto-Fill)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Teacher Card */}
            <button
              type="button"
              onClick={() => fillQuickLogin('teacher', '123456')}
              className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center justify-between font-bold text-amber-300 mb-0.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Maths Teacher
                </span>
                <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded text-amber-200">
                  Teacher
                </span>
              </div>
              <div className="text-slate-400 font-mono">
                User: <span className="text-slate-200">teacher</span> | Pass: <span className="text-slate-200">123456</span>
              </div>
            </button>

            {/* Student 1 */}
            <button
              type="button"
              onClick={() => fillQuickLogin('aarav8c', 'student123')}
              className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center justify-between font-bold text-indigo-300 mb-0.5">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  Aarav Patel (8C-01)
                </span>
                <span className="text-[10px] bg-indigo-500/30 px-1.5 py-0.5 rounded text-indigo-200">
                  Student
                </span>
              </div>
              <div className="text-slate-400 font-mono">
                User: <span className="text-slate-200">aarav8c</span> | Pass: <span className="text-slate-200">student123</span>
              </div>
            </button>

            {/* Student 2 */}
            <button
              type="button"
              onClick={() => fillQuickLogin('ananya8c', 'student123')}
              className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center justify-between font-semibold text-slate-200 mb-0.5">
                <span>Ananya Gupta (8C-02)</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                  Student
                </span>
              </div>
              <div className="text-slate-400 font-mono">
                User: <span className="text-slate-200">ananya8c</span>
              </div>
            </button>

            {/* Student 3 */}
            <button
              type="button"
              onClick={() => fillQuickLogin('rohit8c', 'student123')}
              className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center justify-between font-semibold text-slate-200 mb-0.5">
                <span>Rohit Verma (8C-03)</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                  Student
                </span>
              </div>
              <div className="text-slate-400 font-mono">
                User: <span className="text-slate-200">rohit8c</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
