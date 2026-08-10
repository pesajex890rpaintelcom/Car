import React, { useState, useEffect } from 'react';
import { UserAccount } from './types';
import { seedInitialDataIfNeeded } from './lib/seed';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { TeacherPanel } from './components/TeacherPanel';
import { StudentPanel } from './components/StudentPanel';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('class8c_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Seed initial teacher & student data in Firebase if not present
    seedInitialDataIfNeeded().finally(() => {
      setInitializing(false);
    });
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('class8c_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('class8c_user');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading Class 8th C Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

      <main>
        {!currentUser ? (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : currentUser.role === 'teacher' ? (
          <TeacherPanel teacherUser={currentUser} />
        ) : (
          <StudentPanel studentUser={currentUser} />
        )}
      </main>
    </div>
  );
}
