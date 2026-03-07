export type Role = "admin" | "faculty" | "student" | "smartboard";

export type SubjectRecord = {
  id: string;
  code: string;
  name: string;
  faculty: string;
  pptCount: number;
  color: string;
  progress: number;
};

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type SubmissionRecord = {
  id: string;
  filename: string;
  studentName: string;
  rollNo: string;
  subject: string;
  size: string;
  date: string;
  status: SubmissionStatus;
};

export type DepartmentRecord = {
  id: string;
  name: string;
  code: string;
  hod: string;
  students: number;
  faculty: number;
  status: "active" | "inactive";
};

export type StudentRecord = {
  id: string;
  name: string;
  rollNo: string;
  dept: string;
  sem: string;
  email: string;
  status: "active" | "inactive";
};

export type FacultyRecord = {
  id: string;
  name: string;
  empId: string;
  dept: string;
  designation: string;
  subjectsCount: number;
  email: string;
  status: "active" | "inactive";
};

export type SmartboardRecord = {
  id: string;
  name: string;
  room: string;
  dept: string;
  ip: string;
  status: "online" | "offline";
  lastActive: string;
};

export type ClassOption = {
  id: string;
  label: string;
  dept: string;
};

export type PresentationRecord = {
  id: string;
  title: string;
  subject: string;
  slides: number;
  uploadedBy: string;
};

export type RecentPptRecord = {
  id: string;
  filename: string;
  subject: string;
  size: string;
  date: string;
  status: SubmissionStatus;
};

export const subjects: SubjectRecord[] = [
  {
    id: "cs301",
    code: "CS301",
    name: "Data Structures & Algorithms",
    faculty: "Dr. Anita Sharma",
    pptCount: 14,
    color: "#0f4c81",
    progress: 78,
  },
  {
    id: "cs302",
    code: "CS302",
    name: "Computer Networks",
    faculty: "Prof. Rahul Verma",
    pptCount: 9,
    color: "#00b4d8",
    progress: 55,
  },
  {
    id: "cs303",
    code: "CS303",
    name: "Database Management",
    faculty: "Dr. Priya Singh",
    pptCount: 12,
    color: "#059669",
    progress: 90,
  },
  {
    id: "cs304",
    code: "CS304",
    name: "Operating Systems",
    faculty: "Prof. Vikram Nair",
    pptCount: 11,
    color: "#f59e0b",
    progress: 42,
  },
  {
    id: "cs305",
    code: "CS305",
    name: "Software Engineering",
    faculty: "Dr. Neha Gupta",
    pptCount: 8,
    color: "#7c3aed",
    progress: 65,
  },
  {
    id: "cs306",
    code: "CS306",
    name: "Machine Learning",
    faculty: "Prof. Arjun Mehra",
    pptCount: 16,
    color: "#dc2626",
    progress: 30,
  },
];

export const submissions: SubmissionRecord[] = [
  {
    id: "sub-1",
    filename: "Trees & Graph Algorithms.pptx",
    studentName: "Alex Johnson",
    rollNo: "CS001",
    subject: "DSA",
    size: "4.2MB",
    date: "Feb 20",
    status: "pending",
  },
  {
    id: "sub-2",
    filename: "TCP/IP Protocol Suite.pptx",
    studentName: "Maria Garcia",
    rollNo: "CS002",
    subject: "Networks",
    size: "2.8MB",
    date: "Feb 20",
    status: "pending",
  },
  {
    id: "sub-3",
    filename: "Normalization 3NF.pptx",
    studentName: "Rohan Patel",
    rollNo: "CS003",
    subject: "DBMS",
    size: "3.1MB",
    date: "Feb 19",
    status: "approved",
  },
  {
    id: "sub-4",
    filename: "Process Scheduling.pptx",
    studentName: "Priya Singh",
    rollNo: "CS004",
    subject: "OS",
    size: "2.4MB",
    date: "Feb 19",
    status: "pending",
  },
  {
    id: "sub-5",
    filename: "B-Tree Indexing.pptx",
    studentName: "Amit Kumar",
    rollNo: "CS005",
    subject: "DBMS",
    size: "1.9MB",
    date: "Feb 18",
    status: "approved",
  },
  {
    id: "sub-6",
    filename: "Deadlock Detection.pptx",
    studentName: "Neha Gupta",
    rollNo: "CS006",
    subject: "OS",
    size: "3.5MB",
    date: "Feb 18",
    status: "rejected",
  },
  {
    id: "sub-7",
    filename: "Subnetting & CIDR.pptx",
    studentName: "Vikram Nair",
    rollNo: "CS007",
    subject: "Networks",
    size: "2.2MB",
    date: "Feb 17",
    status: "pending",
  },
];

export const departments: DepartmentRecord[] = [
  {
    id: "dept-cse",
    name: "Computer Science Engineering",
    code: "CSE",
    hod: "Dr. Rajesh Kumar",
    students: 480,
    faculty: 22,
    status: "active",
  },
  {
    id: "dept-it",
    name: "Information Technology",
    code: "IT",
    hod: "Dr. Sunita Mehta",
    students: 360,
    faculty: 18,
    status: "active",
  },
  {
    id: "dept-ece",
    name: "Electronics & Communication",
    code: "ECE",
    hod: "Prof. Arun Sharma",
    students: 320,
    faculty: 16,
    status: "active",
  },
  {
    id: "dept-me",
    name: "Mechanical Engineering",
    code: "ME",
    hod: "Dr. Vijay Patel",
    students: 280,
    faculty: 14,
    status: "active",
  },
  {
    id: "dept-ce",
    name: "Civil Engineering",
    code: "CE",
    hod: "Prof. Rekha Singh",
    students: 240,
    faculty: 12,
    status: "inactive",
  },
];

export const students: StudentRecord[] = [
  {
    id: "student-1",
    name: "Alex Johnson",
    rollNo: "CS001",
    dept: "CSE",
    sem: "Sem 6",
    email: "alex.johnson@college.edu",
    status: "active",
  },
  {
    id: "student-2",
    name: "Maria Garcia",
    rollNo: "CS002",
    dept: "CSE",
    sem: "Sem 6",
    email: "maria.garcia@college.edu",
    status: "active",
  },
  {
    id: "student-3",
    name: "Rohan Patel",
    rollNo: "CS003",
    dept: "CSE",
    sem: "Sem 4",
    email: "rohan.patel@college.edu",
    status: "active",
  },
  {
    id: "student-4",
    name: "Priya Singh",
    rollNo: "IT001",
    dept: "IT",
    sem: "Sem 5",
    email: "priya.singh@college.edu",
    status: "active",
  },
  {
    id: "student-5",
    name: "Amit Kumar",
    rollNo: "IT002",
    dept: "IT",
    sem: "Sem 3",
    email: "amit.kumar@college.edu",
    status: "inactive",
  },
  {
    id: "student-6",
    name: "Neha Gupta",
    rollNo: "EC001",
    dept: "ECE",
    sem: "Sem 2",
    email: "neha.gupta@college.edu",
    status: "active",
  },
];

export const facultyRecords: FacultyRecord[] = [
  {
    id: "faculty-1",
    name: "Dr. Priya Sharma",
    empId: "FAC001",
    dept: "CSE",
    designation: "Associate Professor",
    subjectsCount: 4,
    email: "priya.sharma@college.edu",
    status: "active",
  },
  {
    id: "faculty-2",
    name: "Prof. Rahul Verma",
    empId: "FAC002",
    dept: "CSE",
    designation: "Assistant Professor",
    subjectsCount: 3,
    email: "rahul.verma@college.edu",
    status: "active",
  },
  {
    id: "faculty-3",
    name: "Dr. Anita Mehta",
    empId: "FAC003",
    dept: "IT",
    designation: "Professor",
    subjectsCount: 5,
    email: "anita.mehta@college.edu",
    status: "active",
  },
  {
    id: "faculty-4",
    name: "Prof. Kiran Nair",
    empId: "FAC004",
    dept: "ECE",
    designation: "Assistant Professor",
    subjectsCount: 2,
    email: "kiran.nair@college.edu",
    status: "inactive",
  },
];

export const smartboards: SmartboardRecord[] = [
  {
    id: "sb-1",
    name: "Smartboard LT-101",
    room: "Room 101",
    dept: "CSE",
    ip: "192.168.1.101",
    status: "online",
    lastActive: "5 min ago",
  },
  {
    id: "sb-2",
    name: "Smartboard LT-201",
    room: "Room 201",
    dept: "IT",
    ip: "192.168.1.201",
    status: "online",
    lastActive: "2 min ago",
  },
  {
    id: "sb-3",
    name: "Smartboard LT-301",
    room: "Room 301",
    dept: "ECE",
    ip: "192.168.1.301",
    status: "offline",
    lastActive: "2 hours ago",
  },
  {
    id: "sb-4",
    name: "Smartboard LT-401",
    room: "Seminar Hall",
    dept: "ALL",
    ip: "192.168.1.401",
    status: "online",
    lastActive: "Just now",
  },
];

export const classOptions: ClassOption[] = [
  {
    id: "class-1",
    label: "CS Sem 6 - Section A",
    dept: "Computer Science",
  },
  {
    id: "class-2",
    label: "CS Sem 6 - Section B",
    dept: "Computer Science",
  },
  {
    id: "class-3",
    label: "CS Sem 4 - Section A",
    dept: "Computer Science",
  },
  {
    id: "class-4",
    label: "IT Sem 5 - Section A",
    dept: "Information Tech",
  },
];

export const presentations: PresentationRecord[] = [
  {
    id: "ppt-1",
    title: "Introduction to Binary Trees",
    subject: "CS301",
    slides: 28,
    uploadedBy: "Dr. Priya Sharma",
  },
  {
    id: "ppt-2",
    title: "Graph Algorithms - BFS & DFS",
    subject: "CS301",
    slides: 34,
    uploadedBy: "Dr. Priya Sharma",
  },
  {
    id: "ppt-3",
    title: "Network Layer Protocols",
    subject: "CS302",
    slides: 22,
    uploadedBy: "Prof. Rahul Verma",
  },
  {
    id: "ppt-4",
    title: "TCP/IP Deep Dive",
    subject: "CS302",
    slides: 19,
    uploadedBy: "Prof. Rahul Verma",
  },
];

export const recentPpts: RecentPptRecord[] = [
  {
    id: "recent-1",
    filename: "Trees & Graph Algorithms.pptx",
    subject: "Data Structures",
    size: "4.2MB",
    date: "Feb 20",
    status: "approved",
  },
  {
    id: "recent-2",
    filename: "TCP/IP Protocol Suite.pptx",
    subject: "Networks",
    size: "2.8MB",
    date: "Feb 20",
    status: "pending",
  },
  {
    id: "recent-3",
    filename: "Deadlock Detection.pptx",
    subject: "Operating Systems",
    size: "3.5MB",
    date: "Feb 18",
    status: "rejected",
  },
  {
    id: "recent-4",
    filename: "Normalization 3NF.pptx",
    subject: "DBMS",
    size: "3.1MB",
    date: "Feb 19",
    status: "approved",
  },
];

export const facultySubjectStats = [
  {
    id: "f-sub-1",
    code: "CS301",
    name: "Data Structures & Algorithms",
    submissions: 28,
    pending: 3,
    color: "#0f4c81",
  },
  {
    id: "f-sub-2",
    code: "CS302",
    name: "Computer Networks",
    submissions: 22,
    pending: 2,
    color: "#00b4d8",
  },
  {
    id: "f-sub-3",
    code: "CS303",
    name: "Database Management",
    submissions: 30,
    pending: 1,
    color: "#059669",
  },
  {
    id: "f-sub-4",
    code: "CS304",
    name: "Operating Systems",
    submissions: 18,
    pending: 4,
    color: "#f59e0b",
  },
];

export const classCards = [
  {
    id: "c-1",
    code: "CS6A",
    name: "CS Sem 6 - Section A",
    students: 60,
    dept: "CSE",
    owner: "Dr. Priya Sharma",
  },
  {
    id: "c-2",
    code: "CS6B",
    name: "CS Sem 6 - Section B",
    students: 58,
    dept: "CSE",
    owner: "Prof. Rahul Verma",
  },
  {
    id: "c-3",
    code: "CS4A",
    name: "CS Sem 4 - Section A",
    students: 62,
    dept: "CSE",
    owner: "Dr. Anita Mehta",
  },
  {
    id: "c-4",
    code: "IT5A",
    name: "IT Sem 5 - Section A",
    students: 55,
    dept: "IT",
    owner: "Prof. Kiran Nair",
  },
];

export const subjectCards = [
  {
    id: "s-1",
    code: "CS301",
    name: "Data Structures & Algorithms",
    credits: 4,
    dept: "CSE",
    owner: "Dr. Priya Sharma",
  },
  {
    id: "s-2",
    code: "CS302",
    name: "Computer Networks",
    credits: 3,
    dept: "CSE",
    owner: "Prof. Rahul Verma",
  },
  {
    id: "s-3",
    code: "CS303",
    name: "Database Management",
    credits: 4,
    dept: "CSE",
    owner: "Dr. Anita Mehta",
  },
  {
    id: "s-4",
    code: "CS304",
    name: "Operating Systems",
    credits: 4,
    dept: "CSE",
    owner: "Prof. Kiran Nair",
  },
];
