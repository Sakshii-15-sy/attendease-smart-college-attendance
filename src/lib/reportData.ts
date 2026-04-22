import { teacherSubjects } from "./mockData";
import type { StudentAccount } from "./session";

export type ReportRow = {
  rollNo: string;
  name: string;
  department: string;
  semester: string;
  subjects: { code: string; name: string; percentage: number }[];
  overall: number;
  defaulter: boolean;
};

// Deterministic pseudo-random based on a string seed (so the report is stable per student)
function seededPct(seed: string, salt: string) {
  let h = 2166136261;
  const s = seed + "::" + salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Range 55..98
  const v = Math.abs(h) % 44;
  return 55 + v;
}

export function buildReport(students: StudentAccount[]): ReportRow[] {
  return students.map((s) => {
    const subjects = teacherSubjects.map((t) => ({
      code: t.code,
      name: t.name,
      percentage: seededPct(s.id, t.code),
    }));
    const overall = Math.round(
      subjects.reduce((a, x) => a + x.percentage, 0) / subjects.length,
    );
    return {
      rollNo: s.id,
      name: s.name,
      department: s.department,
      semester: s.semester,
      subjects,
      overall,
      defaulter: overall < 75,
    };
  });
}
