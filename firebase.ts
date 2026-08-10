import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, Assignment, Submission } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore Instance with custom database ID
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection References
export const usersCol = collection(db, 'users');
export const assignmentsCol = collection(db, 'assignments');
export const submissionsCol = collection(db, 'submissions');

// Firestore Helper Functions

// 1. Get user by username
export async function getUserByUsername(username: string): Promise<UserAccount | null> {
  try {
    const q = query(usersCol, where('username', '==', username.trim().toLowerCase()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      return { id: snapshot.docs[0].id, ...docData } as UserAccount;
    }
    return null;
  } catch (err) {
    console.error('Error getting user by username:', err);
    return null;
  }
}

// 2. Register / Add student or user
export async function registerUser(user: Omit<UserAccount, 'id'>): Promise<string> {
  const normalizedUsername = user.username.trim().toLowerCase();
  const existing = await getUserByUsername(normalizedUsername);
  if (existing) {
    throw new Error(`Username "${normalizedUsername}" is already registered.`);
  }

  const userDocRef = doc(usersCol, normalizedUsername);
  const newUser: UserAccount = {
    ...user,
    username: normalizedUsername,
    className: user.className || 'Class 8th C',
    createdAt: user.createdAt || new Date().toISOString()
  };
  
  await setDoc(userDocRef, newUser);
  return normalizedUsername;
}

// 3. Get all students
export async function getAllStudents(): Promise<UserAccount[]> {
  try {
    const q = query(usersCol, where('role', '==', 'student'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount));
  } catch (err) {
    console.error('Error fetching students:', err);
    return [];
  }
}

// 4. Create Assignment (Homework or Test)
export async function createAssignment(assignmentData: Omit<Assignment, 'id'>): Promise<string> {
  const docRef = await addDoc(assignmentsCol, assignmentData);
  return docRef.id;
}

// 5. Delete Assignment
export async function deleteAssignment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'assignments', id));
}

// 6. Get all Assignments
export async function getAllAssignments(): Promise<Assignment[]> {
  try {
    const snapshot = await getDocs(assignmentsCol);
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Assignment));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error getting assignments:', err);
    return [];
  }
}

// 7. Subscribe to Assignments in real-time
export function subscribeToAssignments(callback: (assignments: Assignment[]) => void) {
  return onSnapshot(assignmentsCol, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Assignment));
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (error) => {
    console.error('Realtime assignments error:', error);
  });
}

// 8. Submit Student Answer
export async function submitAnswer(submissionData: Omit<Submission, 'id'>): Promise<string> {
  // Check if student already submitted for this assignment
  const q = query(
    submissionsCol, 
    where('assignmentId', '==', submissionData.assignmentId),
    where('studentUsername', '==', submissionData.studentUsername.trim().toLowerCase())
  );
  const existingSnapshot = await getDocs(q);
  
  if (!existingSnapshot.empty) {
    // Update existing submission
    const existingDoc = existingSnapshot.docs[0];
    await updateDoc(doc(db, 'submissions', existingDoc.id), {
      ...submissionData,
      submittedAt: new Date().toISOString()
    });
    return existingDoc.id;
  } else {
    // New submission
    const docRef = await addDoc(submissionsCol, {
      ...submissionData,
      studentUsername: submissionData.studentUsername.trim().toLowerCase()
    });
    return docRef.id;
  }
}

// 9. Subscribe to Submissions
export function subscribeToSubmissions(callback: (submissions: Submission[]) => void) {
  return onSnapshot(submissionsCol, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
    list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    callback(list);
  }, (error) => {
    console.error('Realtime submissions error:', error);
  });
}

// 10. Grade Student Submission
export async function gradeSubmission(
  submissionId: string, 
  marksObtained: number, 
  feedback: string
): Promise<void> {
  const subDoc = doc(db, 'submissions', submissionId);
  await updateDoc(subDoc, {
    marksObtained,
    feedback,
    status: 'graded'
  });
}
