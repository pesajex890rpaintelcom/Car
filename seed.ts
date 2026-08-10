import { doc, getDoc, setDoc, addDoc, getDocs } from 'firebase/firestore';
import { db, usersCol, assignmentsCol, submissionsCol } from './firebase';
import { UserAccount, Assignment, Submission } from '../types';

// Sample Math Diagrams as inline Data URIs / SVGs
const PYTHAGORAS_DIAGRAM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background-color:%230f172a;font-family:sans-serif;"><rect width="100%" height="100%" fill="%230f172a"/><text x="300" y="35" fill="%2338bdf8" font-size="20" font-weight="bold" text-anchor="middle">Class 8th C - Right Angle Triangle (Pythagoras Theorem)</text><path d="M 120 260 L 420 260 L 420 80 Z" fill="%231e293b" stroke="%2338bdf8" stroke-width="4"/><rect x="395" y="235" width="25" height="25" fill="none" stroke="%23f43f5e" stroke-width="2"/><text x="270" y="290" fill="%23e2e8f0" font-size="18" font-weight="bold">Base (b) = 12 cm</text><text x="440" y="180" fill="%23e2e8f0" font-size="18" font-weight="bold">Height (a) = 5 cm</text><text x="230" y="150" fill="%23fbbf24" font-size="20" font-weight="bold">Hypotenuse (c) = ?</text><text x="110" y="285" fill="%23a855f7" font-size="16">A</text><text x="435" y="285" fill="%23a855f7" font-size="16">B</text><text x="435" y="70" fill="%23a855f7" font-size="16">C</text></svg>`;

const LINEAR_EQ_DIAGRAM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background-color:%230f172a;font-family:sans-serif;"><rect width="100%" height="100%" fill="%230f172a"/><text x="300" y="40" fill="%23818cf8" font-size="20" font-weight="bold" text-anchor="middle">Algebraic Equations - Balance Scale Method</text><line x1="100" y1="200" x2="500" y2="200" stroke="%2394a3b8" stroke-width="6"/><polygon points="300,200 280,260 320,260" fill="%23f59e0b"/><rect x="120" y="120" width="120" height="80" rx="8" fill="%230284c7" stroke="%2338bdf8" stroke-width="2"/><text x="180" y="165" fill="white" font-size="18" font-weight="bold" text-anchor="middle">3x + 7</text><rect x="360" y="120" width="120" height="80" rx="8" fill="%23059669" stroke="%2334d399" stroke-width="2"/><text x="420" y="165" fill="white" font-size="18" font-weight="bold" text-anchor="middle">22</text><text x="300" y="310" fill="%23f1f5f9" font-size="18" font-weight="bold" text-anchor="middle">Solve for x:  3x + 7 = 22</text></svg>`;

const MENSURATION_CYLINDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background-color:%230f172a;font-family:sans-serif;"><rect width="100%" height="100%" fill="%230f172a"/><text x="300" y="40" fill="%23ec4899" font-size="20" font-weight="bold" text-anchor="middle">Chapter 11: Mensuration - Cylinder Volume</text><ellipse cx="300" cy="110" rx="100" ry="30" fill="%231e293b" stroke="%23ec4899" stroke-width="3"/><line x1="200" y1="110" x2="200" y2="250" stroke="%23ec4899" stroke-width="3"/><line x1="400" y1="110" x2="400" y2="250" stroke="%23ec4899" stroke-width="3"/><ellipse cx="300" cy="250" rx="100" ry="30" fill="%231e293b" stroke="%23ec4899" stroke-width="3"/><line x1="300" y1="110" x2="400" y2="110" stroke="%23fbbf24" stroke-width="2" stroke-dasharray="4"/><text x="340" y="100" fill="%23fbbf24" font-size="16" font-weight="bold">r = 7 cm</text><line x1="430" y1="110" x2="430" y2="250" stroke="%2338bdf8" stroke-width="2"/><text x="445" y="185" fill="%2338bdf8" font-size="16" font-weight="bold">h = 15 cm</text><text x="300" y="320" fill="%23e2e8f0" font-size="16" text-anchor="middle">Find Curved Surface Area and Total Volume of Cylinder</text></svg>`;

const STUDENT_ANSWER_IMAGE_1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300" style="background-color:%23f8fafc;font-family:monospace;"><rect width="100%" height="100%" fill="%23fffbeb" stroke="%23fcd34d" stroke-width="4"/><text x="20" y="40" fill="%231e3a8a" font-size="18" font-weight="bold">Aarav Patel - Solution Sheet</text><text x="20" y="80" fill="%230f172a" font-size="16">Given: Base b = 12cm, Height a = 5cm</text><text x="20" y="110" fill="%230f172a" font-size="16">By Pythagoras Theorem: c² = a² + b²</text><text x="20" y="140" fill="%230f172a" font-size="16">c² = 5² + 12² = 25 + 144 = 169</text><text x="20" y="170" fill="%230f172a" font-size="16">c = √169 = 13 cm</text><text x="20" y="210" fill="%23047857" font-size="18" font-weight="bold">Answer: Hypotenuse c = 13 cm</text></svg>`;

export async function seedInitialDataIfNeeded() {
  try {
    // 1. Check if teacher account exists
    const teacherDocRef = doc(usersCol, 'teacher');
    const teacherSnap = await getDoc(teacherDocRef);

    if (!teacherSnap.exists()) {
      console.log('Seeding Teacher account...');
      const teacherAccount: UserAccount = {
        username: 'teacher',
        password: '123456',
        role: 'teacher',
        name: 'Mr. R. K. Sharma',
        subject: 'Maths',
        className: 'Class 8th C',
        createdAt: new Date().toISOString()
      };
      await setDoc(teacherDocRef, teacherAccount);
    }

    // 2. Seed default students if empty
    const students = [
      { username: 'aarav8c', password: 'student123', name: 'Aarav Patel', rollNo: '8C-01' },
      { username: 'ananya8c', password: 'student123', name: 'Ananya Gupta', rollNo: '8C-02' },
      { username: 'rohit8c', password: 'student123', name: 'Rohit Verma', rollNo: '8C-03' },
      { username: 'priya8c', password: 'student123', name: 'Priya Singh', rollNo: '8C-04' },
      { username: 'karan8c', password: 'student123', name: 'Karan Sharma', rollNo: '8C-05' },
    ];

    for (const st of students) {
      const stDocRef = doc(usersCol, st.username);
      const stSnap = await getDoc(stDocRef);
      if (!stSnap.exists()) {
        const studentAccount: UserAccount = {
          username: st.username,
          password: st.password,
          role: 'student',
          name: st.name,
          rollNo: st.rollNo,
          className: 'Class 8th C',
          createdAt: new Date().toISOString()
        };
        await setDoc(stDocRef, studentAccount);
      }
    }

    // 3. Seed initial assignments if empty
    const assignSnap = await getDocs(assignmentsCol);
    if (assignSnap.empty) {
      console.log('Seeding initial Maths Homework and Tests...');
      
      // Homework 1
      const hw1: Omit<Assignment, 'id'> = {
        title: 'Homework #1: Linear Equations in One Variable',
        type: 'homework',
        subject: 'Mathematics',
        chapter: 'Chapter 2: Linear Equations',
        instructions: 'Refer to the diagram provided. Solve for x step-by-step: 3x + 7 = 22. Show all algebraic steps clearly.',
        imageUrl: LINEAR_EQ_DIAGRAM,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        totalMarks: 20,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        teacherUsername: 'teacher'
      };
      const hw1Ref = await addDoc(assignmentsCol, hw1);

      // Homework 2
      const hw2: Omit<Assignment, 'id'> = {
        title: 'Homework #2: Mensuration - Cylinder Volume & Area',
        type: 'homework',
        subject: 'Mathematics',
        chapter: 'Chapter 11: Mensuration',
        instructions: 'A right circular cylinder has radius r = 7 cm and height h = 15 cm. Calculate (i) Curved Surface Area (2πrh) and (ii) Volume (πr²h). Take π = 22/7.',
        imageUrl: MENSURATION_CYLINDER,
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        totalMarks: 25,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        teacherUsername: 'teacher'
      };
      await addDoc(assignmentsCol, hw2);

      // Test 1
      const test1: Omit<Assignment, 'id'> = {
        title: 'Class Test #1: Geometry & Pythagoras Theorem',
        type: 'test',
        subject: 'Mathematics',
        chapter: 'Chapter 6: Squares and Square Roots',
        instructions: 'Examine the right-angled triangle diagram carefully. Find the hypotenuse c given base = 12 cm and height = 5 cm. Upload your notebook solution image.',
        imageUrl: PYTHAGORAS_DIAGRAM,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        totalMarks: 30,
        createdAt: new Date().toISOString(),
        teacherUsername: 'teacher'
      };
      const test1Ref = await addDoc(assignmentsCol, test1);

      // Seed initial sample submission from student aarav8c
      const sub1: Omit<Submission, 'id'> = {
        assignmentId: hw1Ref.id,
        assignmentTitle: hw1.title,
        assignmentType: 'homework',
        studentUsername: 'aarav8c',
        studentName: 'Aarav Patel',
        studentRollNo: '8C-01',
        answerText: 'Step 1: 3x + 7 = 22\nStep 2: 3x = 22 - 7\nStep 3: 3x = 15\nStep 4: x = 15 / 3\nAnswer: x = 5',
        imageUrl: STUDENT_ANSWER_IMAGE_1,
        submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        marksObtained: 20,
        totalMarks: 20,
        feedback: 'Excellent work Aarav! Very neat step-by-step solution.',
        status: 'graded'
      };
      await addDoc(submissionsCol, sub1);

      const sub2: Omit<Submission, 'id'> = {
        assignmentId: test1Ref.id,
        assignmentTitle: test1.title,
        assignmentType: 'test',
        studentUsername: 'ananya8c',
        studentName: 'Ananya Gupta',
        studentRollNo: '8C-02',
        answerText: 'Pythagoras theorem: c^2 = 5^2 + 12^2 = 25 + 144 = 169. Therefore c = sqrt(169) = 13 cm.',
        imageUrl: STUDENT_ANSWER_IMAGE_1,
        submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        totalMarks: 30,
        status: 'submitted'
      };
      await addDoc(submissionsCol, sub2);
    }
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
}
