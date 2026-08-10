import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  Upload, 
  Send, 
  Image as ImageIcon, 
  Award, 
  Eye, 
  MessageSquare, 
  GraduationCap, 
  Calendar, 
  HelpCircle,
  FileText,
  Calculator
} from 'lucide-react';
import { 
  subscribeToAssignments, 
  subscribeToSubmissions, 
  submitAnswer 
} from '../lib/firebase';
import { Assignment, Submission, UserAccount } from '../types';
import { ImageModal } from './ImageModal';

interface StudentPanelProps {
  studentUser: UserAccount;
}

export const StudentPanel: React.FC<StudentPanelProps> = ({ studentUser }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'completed'>('pending');

  // Selected assignment to solve & submit
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Lightbox modal for previewing images
  const [modalImage, setModalImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const unsubAssign = subscribeToAssignments((list) => {
      setAssignments(list);
    });

    const unsubSub = subscribeToSubmissions((list) => {
      // Filter submissions for this student username
      const mySubs = list.filter(
        (s) => s.studentUsername.toLowerCase() === studentUser.username.toLowerCase()
      );
      setSubmissions(mySubs);
    });

    return () => {
      unsubAssign();
      unsubSub();
    };
  }, [studentUser.username]);

  // Image Upload handler for student answer sheet
  const handleStudentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please upload an image under 5MB.');
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

  // Pre-fill answer if re-editing or answering
  const handleOpenSolveModal = (assign: Assignment) => {
    setSelectedAssignment(assign);
    const existing = submissions.find((s) => s.assignmentId === assign.id);
    if (existing) {
      setAnswerText(existing.answerText || '');
      setImageUrl(existing.imageUrl || '');
    } else {
      setAnswerText('');
      setImageUrl('');
    }
    setSubmitSuccess(false);
  };

  // Submit Answer to Firebase
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (!answerText.trim() && !imageUrl.trim()) {
      alert('Please write your solution steps or attach a solution photo.');
      return;
    }

    setSubmitting(true);
    try {
      await submitAnswer({
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        assignmentType: selectedAssignment.type,
        studentUsername: studentUser.username,
        studentName: studentUser.name,
        studentRollNo: studentUser.rollNo || '8C',
        answerText: answerText.trim(),
        imageUrl: imageUrl.trim(),
        submittedAt: new Date().toISOString(),
        totalMarks: selectedAssignment.totalMarks,
        status: 'submitted'
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedAssignment(null);
      }, 2000);
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper map for submission by assignment ID
  const submissionMap = new Map<string, Submission>();
  submissions.forEach((s) => submissionMap.set(s.assignmentId, s));

  // Pending assignments (not answered yet)
  const pendingAssignments = assignments.filter((a) => !submissionMap.has(a.id));
  const completedAssignments = assignments.filter((a) => submissionMap.has(a.id));

  // Active display list based on tab
  const displayedAssignments = 
    activeTab === 'pending'
      ? pendingAssignments
      : activeTab === 'completed'
      ? completedAssignments
      : assignments;

  // Total Marks earned summary
  const gradedSubs = submissions.filter((s) => s.status === 'graded');
  const totalScoreObtained = gradedSubs.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
  const totalPossibleMarks = gradedSubs.reduce((acc, curr) => acc + curr.totalMarks, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      <ImageModal
        imageUrl={modalImage?.url || null}
        title={modalImage?.title}
        onClose={() => setModalImage(null)}
      />

      {/* Welcome & Student Stats Bar */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-emerald-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            Class 8th C Student Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hello, {studentUser.name}!
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            View your Class 8th C Mathematics homeworks and test papers. Submit your answers with handwritten solution photos, and check teacher grades & feedback.
          </p>
        </div>

        {/* Student Score Summary Badge */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center gap-4 shrink-0 shadow-lg z-10">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Overall Maths Score</div>
            <div className="text-xl font-extrabold text-amber-300">
              {gradedSubs.length > 0 ? `${totalScoreObtained} / ${totalPossibleMarks} Marks` : 'No Graded Work Yet'}
            </div>
            <div className="text-[11px] text-slate-500">
              {gradedSubs.length} graded submission{gradedSubs.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('pending')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            activeTab === 'pending'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Work</div>
            <div className="text-2xl font-extrabold text-white">{pendingAssignments.length} Tasks</div>
            <div className="text-xs text-slate-400">Homeworks & Tests awaiting your answer</div>
          </div>
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            activeTab === 'completed'
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Submitted Work</div>
            <div className="text-2xl font-extrabold text-white">{completedAssignments.length} Tasks</div>
            <div className="text-xs text-slate-400">Answered & sent to Maths Teacher</div>
          </div>
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between ${
            activeTab === 'all'
              ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Total Assignments</div>
            <div className="text-2xl font-extrabold text-white">{assignments.length} Tasks</div>
            <div className="text-xs text-slate-400">All Maths homeworks and class tests</div>
          </div>
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Main List of Assignments */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            Class 8th C Mathematics Assignments
          </h3>
          <span className="text-xs text-slate-400">
            Click "Solve & Submit Answer" to answer with text and solution images.
          </span>
        </div>

        {displayedAssignments.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <FileCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-300">
              {activeTab === 'pending'
                ? 'Great job! No pending homeworks or tests.'
                : 'No assignments found.'}
            </h3>
            <p className="text-xs text-slate-500">
              Check back when your Maths Teacher posts new assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedAssignments.map((assign) => {
              const mySubmission = submissionMap.get(assign.id);

              return (
                <div
                  key={assign.id}
                  className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                    mySubmission?.status === 'graded'
                      ? 'border-emerald-500/30'
                      : mySubmission
                      ? 'border-indigo-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                            assign.type === 'test'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {assign.type}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {assign.chapter || 'Class 8th C Maths'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white mt-1.5 leading-snug">
                          {assign.title}
                        </h4>
                      </div>

                      {mySubmission ? (
                        mySubmission.status === 'graded' ? (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Graded
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            Submitted
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Question / Instructions */}
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                        Teacher Question & Instructions:
                      </div>
                      {assign.instructions}
                    </div>

                    {/* Teacher Problem Diagram / Image */}
                    {assign.imageUrl && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-indigo-400" />
                          Teacher Problem Diagram:
                        </div>
                        <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-36 flex items-center justify-center">
                          <img
                            src={assign.imageUrl}
                            alt={assign.title}
                            className="max-h-32 w-auto object-contain p-2"
                          />
                          <button
                            onClick={() => setModalImage({ url: assign.imageUrl!, title: assign.title })}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white font-semibold transition-opacity"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Zoom Diagram</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Student Submission Card if already submitted */}
                    {mySubmission && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-indigo-300 font-bold">
                          <span>Your Submitted Answer:</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(mySubmission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap font-mono line-clamp-3">
                          {mySubmission.answerText || 'Attached photo solution.'}
                        </p>

                        {mySubmission.imageUrl && (
                          <button
                            onClick={() => setModalImage({ url: mySubmission.imageUrl!, title: `My Answer Photo for ${assign.title}` })}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium pt-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View My Attached Answer Photo
                          </button>
                        )}

                        {/* Teacher Grade & Feedback */}
                        {mySubmission.status === 'graded' && (
                          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                            <div>
                              <span className="font-bold text-emerald-400">Teacher Feedback:</span>
                              <p className="text-slate-200 text-xs italic mt-0.5">
                                "{mySubmission.feedback || 'Good work!'}"
                              </p>
                            </div>
                            <div className="text-sm font-extrabold text-emerald-300 shrink-0 ml-2">
                              {mySubmission.marksObtained} / {mySubmission.totalMarks} Marks
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Due: <strong className="text-slate-200">{assign.dueDate}</strong>
                    </div>

                    <button
                      onClick={() => handleOpenSolveModal(assign)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 ${
                        mySubmission
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{mySubmission ? 'Edit My Answer' : 'Solve & Submit Answer'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ANSWER & SUBMIT SOLUTION */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Class 8th C Mathematics
                </span>
                <h3 className="font-bold text-slate-100 text-base leading-snug">
                  {selectedAssignment.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Your answer and solution image have been submitted to Mr. Sharma!</span>
              </div>
            )}

            {/* Question Details */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase">Question & Instructions:</h5>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedAssignment.instructions}
              </p>
              {selectedAssignment.imageUrl && (
                <button
                  type="button"
                  onClick={() => setModalImage({ url: selectedAssignment.imageUrl!, title: selectedAssignment.title })}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium pt-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Problem Diagram Image
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Your Answer Steps / Written Response
                </label>
                <textarea
                  rows={4}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your algebraic steps, formula calculations, or final answer..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-600 font-mono outline-none focus:border-indigo-500"
                />
              </div>

              {/* Attach Notebook Solution Photo */}
              <div className="space-y-2 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    Attach Solution Photo / Notebook Image
                  </span>
                </label>

                <div className="space-y-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors w-full">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Upload Notebook Solution Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleStudentImageUpload}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL or base64 data..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500"
                  />

                  {imageUrl && (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 h-36 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Your Attached Solution"
                        className="max-h-32 w-auto object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Solution to Teacher</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
