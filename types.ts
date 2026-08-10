export type UserRole = 'teacher' | 'student';

export interface UserAccount {
  id?: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
  rollNo?: string;
  subject?: string; // For teacher e.g. "Maths"
  className?: string; // "Class 8th C"
  createdAt?: string;
}

export type AssignmentType = 'homework' | 'test';

export interface Assignment {
  id: string;
  title: string;
  type: AssignmentType;
  subject: string; // e.g. "Mathematics"
  chapter?: string; // e.g. "Linear Equations in One Variable"
  instructions: string;
  imageUrl?: string;
  dueDate: string;
  totalMarks: number;
  createdAt: string;
  teacherUsername: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentType: AssignmentType;
  studentUsername: string;
  studentName: string;
  studentRollNo?: string;
  answerText: string;
  imageUrl?: string;
  submittedAt: string;
  marksObtained?: number;
  totalMarks: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}
