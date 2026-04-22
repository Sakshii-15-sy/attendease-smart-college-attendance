export type Subject = {
  id: string;
  code: string;
  name: string;
  attended: number;
  total: number;
};

export const studentSubjects: Subject[] = [
  { id: "1", code: "CS301", name: "Database Systems", attended: 28, total: 36 },
  { id: "2", code: "MA201", name: "Mathematics III", attended: 19, total: 32 },
  { id: "3", code: "CS302", name: "Operating Systems", attended: 30, total: 35 },
  { id: "4", code: "CS303", name: "Computer Networks", attended: 22, total: 33 },
  { id: "5", code: "HU101", name: "Technical Writing", attended: 24, total: 28 },
];

export const teacherSubjects = [
  { id: "1", code: "CS301", name: "Database Systems", section: "B.Tech CSE-A", students: 62 },
  { id: "2", code: "CS302", name: "Operating Systems", section: "B.Tech CSE-A", students: 60 },
  { id: "3", code: "CS401", name: "Machine Learning", section: "B.Tech CSE-B", students: 58 },
];

export const monthlyAttendance = [
  { month: "Jan", present: 48, absent: 8, defaulter: 4 },
  { month: "Feb", present: 52, absent: 6, defaulter: 3 },
  { month: "Mar", present: 45, absent: 12, defaulter: 6 },
  { month: "Apr", present: 40, absent: 16, defaulter: 9 },
];

export const atRiskStudents = [
  { id: "BT21CS045", name: "Aarav Mehta", attendance: 58, subject: "DBMS" },
  { id: "BT21CS012", name: "Priya Sharma", attendance: 62, subject: "OS" },
  { id: "BT21CS078", name: "Rohan Kumar", attendance: 64, subject: "DBMS" },
  { id: "BT21CS104", name: "Sneha Patel", attendance: 67, subject: "ML" },
];

export function getPercentage(s: Subject) {
  return Math.round((s.attended / s.total) * 100);
}

export function getOverall(subs: Subject[]) {
  const a = subs.reduce((x, s) => x + s.attended, 0);
  const t = subs.reduce((x, s) => x + s.total, 0);
  return Math.round((a / t) * 100);
}

export function statusColor(p: number): "success" | "warning" | "destructive" {
  if (p >= 75) return "success";
  if (p >= 65) return "warning";
  return "destructive";
}
