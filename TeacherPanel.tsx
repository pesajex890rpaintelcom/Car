import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  BookOpen, 
  FileCheck, 
  Users, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  Award, 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  MessageSquare, 
  Clock, 
  Calculator,
  Camera
} from 'lucide-react';
import { 
  createAssignment, 
  deleteAssignment, 
  subscribeToAssignments, 
  subscribeToSubmissions, 
  gradeSubmission, 
  registerUser, 
  getAllStudents 
} from '../lib/firebase';
import { Assignment, Submission, UserAccount, AssignmentType } from '../types';
import { ImageModal } from './ImageModal';

interface TeacherPanelProps {
  teacherUser: UserAccount;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({ teacherUser }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'assignments' | 'create' | 'students'>('submissions');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [studentsList, setStudentsList] = useState<UserAccount[]>([]);
  
  // Image Lightbox Modal
  const [selectedModalImage, setSelectedModalImage] = useState<{ url: string; title: string } | null>(null);

  // New Assignment Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AssignmentType>('homework');
  const [chapter, setChapter] = useState('');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(20);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Filters for Submissions
  const [searchStudent, setSearchStudent] = useState('');
  const [filterAssignmentId, setFilterAssignmentId] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'homework' | 'test'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'graded'>('all');

  // Grading Modal/Inline State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);

  // Register New Student Form State
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('student123');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRollNo, setNewStudentRollNo] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerMsg, setRegisterMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Real-time Subscriptions
  useEffect(() => {
    const unsubscribeAssign = subscribeToAssignments((list) => {
      setAssignments(list);
    });

    const unsubscribeSub = subscribeToSubmissions((list) => {
      setSubmissions(list);
    });

    loadStudents();

    return () => {
      unsubscribeAssign();
      unsubscribeSub();
    };
  }, []);

  const loadStudents = async () => {
    const list = await getAllStudents();
    setStudentsList(list);
  };

  // Image File Upload Helper
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample Math Diagrams presets for rapid testing
  const setPresetMathImage = (presetType: string) => {
    if (presetType === 'pythagoras') {
      setImageUrl(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background-color:%230f172a;font-family:sans-serif;"><rect width="100%" height="100%" fill="%230f172a"/><text x="300" y="35" fill="%2338bdf8" font-size="20" font-weight="bold" text-anchor="middle">Class 8th C - Right Angle Triangle (Pythagoras Theorem)</text><path d="M 120 260 L 420 260 L 420 80 Z" fill="%231e293b" stroke="%2338bdf8" stroke-width="4"/><rect x="395" y="235" width="25" height="25" fill="none" stroke="%23f43f5e" stroke-width="2"/><text x="270" y="290" fill="%23e2e8f0" font-size="18" font-weight="bold">Base (b) = 12 cm</text><text x="440" y="180" fill="%23e2e8f0" font-size="18" font-weight="bold">Height (a) = 5 cm</text><text x="230" y="150" fill="%23fbbf24" font-size="20" font-weight="bold">Hypotenuse (c) = ?</text></svg>`);
    } else if (presetType === 'algebra') {
      setImageUrl(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background-color:%230f172a;font-family:sans-serif;"><rect width="100%" height="100%" fill="%230f172a"/><text x="300" y="40" fill="%23818cf8" font-size="20" font-weight="bold" text-anchor="middle">Algebraic Equations - Balance Scale Method</text><line x1="100" y1="200" x2="500" y2="200" stroke="%2394a3b8" stroke-width="6"/><polygon points="300,200 280,260 320,260" fill="%23f59e0b"/><rect x="120" y="120" width="120" height="80" rx="8" fill="%230284c7" stroke="%2338bdf8" stroke-width="2"/><text x="180" y="165" fill="white" font-size="18" font-weight="bold" text-anchor="middle">3x + 7</text><rect x="360" y="120" width="120" height="80" rx="8" fill="%23059669" stroke="%2334d399" stroke-width="2"/><text x="420" y="165" fill="white" font-size="18" font-weight="bold" text-anchor="middle">22</text></svg>`);
    } else if (presetType === 'geometry') {
      setImageUrl(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background-color:%230f172a;font-family:sans-serif;"><rect width="100%" height="100%" fill="%230f172a"/><text x="300" y="40" fill="%2334d399" font-size="20" font-weight="bold" text-anchor="middle">Understanding Quadrilaterals - Parallelogram</text><polygon points="150,230 400,230 470,110 220,110" fill="%231e293b" stroke="%2334d399" stroke-width="3"/><text x="135" y="245" fill="%23e2e8f0" font-size="16">A</text><text x="410" y="245" fill="%23e2e8f0" font-size="16">B</text><text x="480" y="105" fill="%23e2e8f0" font-size="16">C</text><text x="205" y="105" fill="%23e2e8f0" font-size="16">D</text><text x="290" y="255" fill="%23fbbf24" font-size="16">Base = 25 cm</text><text x="360" y="170" fill="%23f43f5e" font-size="16">Height = 12 cm</text></svg>`);
    }
  };

  // Handle Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      alert('Please fill in title and instructions.');
      return;
    }

    setCreating(true);
    try {
      await createAssignment({
        title: title.trim(),
        type,
        subject: 'Mathematics',
        chapter: chapter.trim() || 'General Maths',
        instructions: instructions.trim(),
        imageUrl: imageUrl.trim(),
        dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        totalMarks: totalMarks || 20,
        createdAt: new Date().toISOString(),
        teacherUsername: teacherUser.username
      });

      // Reset form
      setTitle('');
      setChapter('');
      setInstructions('');
      setImageUrl('');
      setTotalMarks(20);
      setCreateSuccess(true);
      setTimeout(() => setCreateSuccess(false), 4000);
      setActiveTab('assignments');
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert('Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id: string, assignTitle: string) => {
    if (confirm(`Are you sure you want to delete "${assignTitle}"?`)) {
      await deleteAssignment(id);
    }
  };

  // Submit Grade for Student Submission
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setGradingLoading(true);
    try {
      await gradeSubmission(gradingSubmission.id, gradeMarks, gradeFeedback);
      setGradingSubmission(null);
    } catch (err) {
      console.error('Error saving grade:', err);
      alert('Failed to save grade.');
    } finally {
      setGradingLoading(false);
    }
  };

  // Register New Student in Firestore
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterMsg(null);

    if (!newStudentUsername.trim() || !newStudentName.trim()) {
      setRegisterMsg({ type: 'error', text: 'Username and Full Name are required.' });
      return;
    }

    setRegistering(true);
    try {
      await registerUser({
        username: newStudentUsername.trim().toLowerCase(),
        password: newStudentPassword.trim() || 'student123',
        role: 'student',
        name: newStudentName.trim(),
        rollNo: newStudentRollNo.trim() || `8C-${studentsList.length + 1}`,
        className: 'Class 8th C'
      });

      setRegisterMsg({ 
        type: 'success', 
        text: `Student "${newStudentName}" (Username: ${newStudentUsername.trim().toLowerCase()}) successfully registered in Firebase!` 
      });

      setNewStudentUsername('');
      setNewStudentName('');
      setNewStudentRollNo('');
      setNewStudentPassword('student123');
      loadStudents();
    } catch (err: any) {
      setRegisterMsg({ type: 'error', text: err.message || 'Failed to register student.' });
    } finally {
      setRegistering(false);
    }
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    // Search student username or name
    const matchStudent = 
      sub.studentUsername.toLowerCase().includes(searchStudent.toLowerCase()) ||
      sub.studentName.toLowerCase().includes(searchStudent.toLowerCase());

    // Assignment filter
    const matchAssignment = filterAssignmentId === 'all' || sub.assignmentId === filterAssignmentId;

    // Type filter
    const matchType = filterType === 'all' || sub.assignmentType === filterType;

    // Status filter
    const matchStatus = filterStatus === 'all' || sub.status === filterStatus;

    return matchStudent && matchAssignment && matchType && matchStatus;
  });

  const pendingGradingCount = submissions.filter(s => s.status === 'submitted').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      <ImageModal
        imageUrl={selectedModalImage?.url || null}
        title={selectedModalImage?.title}
        onClose={() => setSelectedModalImage(null)}
      />

      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-violet-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            Class 8th C Maths Teacher Panel
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {teacherUser.name}
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Create and manage Class 8th C Mathematics homeworks and class tests. View student answers, grade attached solution photos, and register new student accounts.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setActiveTab('create')}
          className="z-10 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-amber-500/20 transition-all shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Homework / Test</span>
        </button>
      </div>

      {/* Analytics Counter Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{assignments.length}</div>
            <div className="text-xs text-slate-400 font-medium">Total Assignments</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-300">{pendingGradingCount}</div>
            <div className="text-xs text-slate-400 font-medium">Pending Review</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-300">{submissions.length}</div>
            <div className="text-xs text-slate-400 font-medium">Student Submissions</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{studentsList.length}</div>
            <div className="text-xs text-slate-400 font-medium">Registered Students</div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'submissions'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Student Answers & Grading</span>
          {pendingGradingCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-amber-500 text-slate-950 font-bold rounded-full">
              {pendingGradingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'assignments'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Homeworks & Tests ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'create'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create Homework / Test</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'students'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Students</span>
        </button>
      </div>

      {/* TAB 1: STUDENT SUBMISSIONS & GRADING */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Filter className="w-4 h-4 text-indigo-400" />
                <span>Filter Student Submissions by Username</span>
              </div>
              <div className="text-xs text-slate-400">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Search by Username */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Search Student Username..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Assignment Filter */}
              <select
                value={filterAssignmentId}
                onChange={(e) => setFilterAssignmentId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="all">All Assignments</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    [{a.type.toUpperCase()}] {a.title}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="all">All Types (Homework & Tests)</option>
                <option value="homework">Homework Only</option>
                <option value="test">Tests Only</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Needs Grading</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <FileCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-300">No student submissions found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When students answer homeworks or tests and attach images, their responses will appear here sorted by username.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`bg-slate-900 border rounded-2xl p-6 space-y-4 transition-all ${
                    sub.status === 'submitted'
                      ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                        8C
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">
                            Student: <span className="text-indigo-400">{sub.studentUsername}</span>
                          </span>
                          <span className="text-xs text-slate-400">
                            ({sub.studentName} - Roll: {sub.studentRollNo || 'N/A'})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Submitted for: <strong className="text-slate-200">{sub.assignmentTitle}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        sub.assignmentType === 'test'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {sub.assignmentType.toUpperCase()}
                      </span>

                      {sub.status === 'graded' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Graded ({sub.marksObtained}/{sub.totalMarks})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submission Body: Student Written Response & Image */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Student Written Solution / Steps
                      </h5>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap font-mono leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        {sub.answerText || 'No text answer provided.'}
                      </p>
                      <div className="text-[11px] text-slate-500 mt-2">
                        Submitted at: {new Date(sub.submittedAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Attached Answer Image */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                        Student Attached Solution Photo
                      </h5>
                      {sub.imageUrl ? (
                        <div className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-900 max-h-48 flex items-center justify-center">
                          <img
                            src={sub.imageUrl}
                            alt="Student attached answer"
                            className="max-h-44 w-auto object-contain p-1"
                          />
                          <button
                            onClick={() => setSelectedModalImage({ url: sub.imageUrl!, title: `Answer by ${sub.studentUsername} (${sub.studentName})` })}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-xs text-white font-semibold transition-opacity"
                          >
                            <Eye className="w-4 h-4" />
                            Click to View Full Size
                          </button>
                        </div>
                      ) : (
                        <div className="h-32 bg-slate-900/50 rounded-lg border border-slate-800/80 flex items-center justify-center text-xs text-slate-500">
                          No solution image attached
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teacher Feedback / Grading Section */}
                  {sub.status === 'graded' ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Teacher Feedback
                        </div>
                        <p className="text-sm text-slate-200 mt-1">
                          "{sub.feedback || 'Good attempt!'}"
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl font-extrabold text-emerald-300">
                          {sub.marksObtained} / {sub.totalMarks} Marks
                        </div>
                        <button
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradeMarks(sub.marksObtained || 0);
                            setGradeFeedback(sub.feedback || '');
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline mt-1"
                        >
                          Edit Grade
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setGradingSubmission(sub);
                          setGradeMarks(sub.totalMarks);
                          setGradeFeedback('Good work! Steps followed correctly.');
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        <span>Grade Answer & Give Feedback</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: GRADE SUBMISSION */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Grade Answer for Student: <span className="text-indigo-400">{gradingSubmission.studentUsername}</span>
              </h3>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Marks Obtained (Out of {gradingSubmission.totalMarks})
                </label>
                <input
                  type="number"
                  min={0}
                  max={gradingSubmission.totalMarks}
                  required
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-300 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Teacher Feedback / Comments
                </label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="e.g. Well done! Correct step-by-step algebra solution."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradingLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Grade & Notify Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE ASSIGNMENTS LIST */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Class 8th C Mathematics Assignments
            </h3>
            <button
              onClick={() => setActiveTab('create')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Assignment</span>
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-300">No Homeworks or Tests Created Yet</h3>
              <p className="text-xs text-slate-500">
                Click "+ Create Homework / Test" above to assign new tasks to Class 8th C students.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((assign) => (
                <div
                  key={assign.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                          assign.type === 'test'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {assign.type}
                        </span>
                        <h4 className="text-base font-bold text-white mt-1.5 leading-snug">
                          {assign.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                          {assign.chapter || 'Class 8th C Maths'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAssignment(assign.id, assign.title)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {assign.instructions}
                    </p>

                    {/* Attached Image Preview */}
                    {assign.imageUrl && (
                      <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-36 flex items-center justify-center">
                        <img
                          src={assign.imageUrl}
                          alt={assign.title}
                          className="max-h-32 w-auto object-contain p-2"
                        />
                        <button
                          onClick={() => setSelectedModalImage({ url: assign.imageUrl!, title: assign.title })}
                          className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white font-semibold transition-opacity"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Problem Image</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                    <div>
                      Due: <span className="text-slate-200 font-semibold">{assign.dueDate}</span>
                    </div>
                    <div className="font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {assign.totalMarks} Total Marks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CREATE HOMEWORK / TEST */}
      {activeTab === 'create' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-amber-400" />
              Add Class Homework or Test
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Create a new Mathematics assignment for Class 8th C students with attached problem images or diagrams.
            </p>
          </div>

          {createSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Assignment created successfully and published for students!</span>
            </div>
          )}

          <form onSubmit={handleCreateAssignment} className="space-y-5">
            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Assignment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('homework')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    type === 'homework'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Class Homework</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('test')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    type === 'test'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Class Test</span>
                </button>
              </div>
            </div>

            {/* Title & Chapter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Homework #3: Algebraic Identities"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Chapter / Topic Name
                </label>
                <input
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="e.g. Chapter 9: Algebraic Expressions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Questions / Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Questions & Instructions *
              </label>
              <textarea
                rows={4}
                required
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Write the questions, instructions, or algebra problems to solve..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Attached Image Section */}
            <div className="space-y-3 p-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  Attach Math Diagram / Problem Image
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Optional</span>
              </label>

              {/* Upload image or choose preset */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="text-xs text-slate-500 text-center sm:text-left">or choose a quick preset:</div>
                </div>

                {/* Preset Math Diagram Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetMathImage('pythagoras')}
                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition-all"
                  >
                    📐 Pythagoras Triangle
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetMathImage('algebra')}
                    className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium transition-all"
                  >
                    ⚖️ Algebra Scale Equation
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetMathImage('geometry')}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all"
                  >
                    🔷 Parallelogram Geometry
                  </button>
                </div>

                {/* Image URL input fallback */}
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste image URL or base64 data..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500"
                />

                {/* Image Preview Box */}
                {imageUrl && (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-40 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-36 w-auto object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Due Date & Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={creating}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              {creating ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  <span>Publish Assignment to Class 8th C</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: REGISTER NEW STUDENTS */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Register Form */}
          <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl h-fit">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                Register New Student
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Add student credentials directly into Firebase Firestore so they can log in.
              </p>
            </div>

            {registerMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold ${
                registerMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {registerMsg.text}
              </div>
            )}

            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Student Username *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentUsername}
                  onChange={(e) => setNewStudentUsername(e.target.value)}
                  placeholder="e.g. dev8c"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Dev Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={newStudentRollNo}
                  onChange={(e) => setNewStudentRollNo(e.target.value)}
                  placeholder="e.g. 8C-06"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Initial Password
                </label>
                <input
                  type="text"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="student123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {registering ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register Student in Firebase</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Registered Students Directory */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Class 8th C Student Directory ({studentsList.length})
              </h3>
              <button
                onClick={loadStudents}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Refresh List
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {studentsList.map((st) => (
                <div key={st.username} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
                      {st.rollNo || '8C'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{st.name}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        Username: <span className="text-indigo-300">{st.username}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      Class 8th C
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
