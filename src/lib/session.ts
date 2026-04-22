// Tiny client-only session + account store for demo purposes (no backend).
type Role = "student" | "teacher" | null;

const ROLE_KEY = "attendease.role";
const NAME_KEY = "attendease.name";
const ID_KEY = "attendease.id";
const DEPT_KEY = "attendease.dept";
const SEM_KEY = "attendease.sem";
const OTP_KEY = "attendease.activeOtp";
const OTP_EXP_KEY = "attendease.activeOtpExp";
const OTP_SUBJ_KEY = "attendease.activeOtpSubj";
const ACCOUNTS_KEY = "attendease.accounts";

export type StudentAccount = {
  role: "student";
  name: string;
  id: string; // roll number
  department: string;
  semester: string;
  password: string;
};

export type TeacherAccount = {
  role: "teacher";
  name: string;
  id: string; // employee id
  department: string;
  password: string;
};

export type Account = StudentAccount | TeacherAccount;

export function setRole(r: Role) {
  if (typeof window === "undefined") return;
  if (r) localStorage.setItem(ROLE_KEY, r);
  else localStorage.removeItem(ROLE_KEY);
}
export function getRole(): Role {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(ROLE_KEY) as Role) ?? null;
}

export function setUser(name: string, id: string, department = "", semester = "") {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(ID_KEY, id);
  localStorage.setItem(DEPT_KEY, department);
  localStorage.setItem(SEM_KEY, semester);
}
export function getUser() {
  if (typeof window === "undefined")
    return { name: "", id: "", department: "", semester: "" };
  return {
    name: localStorage.getItem(NAME_KEY) ?? "",
    id: localStorage.getItem(ID_KEY) ?? "",
    department: localStorage.getItem(DEPT_KEY) ?? "",
    semester: localStorage.getItem(SEM_KEY) ?? "",
  };
}
export function logout() {
  if (typeof window === "undefined") return;
  [ROLE_KEY, NAME_KEY, ID_KEY, DEPT_KEY, SEM_KEY, OTP_KEY, OTP_EXP_KEY, OTP_SUBJ_KEY].forEach(
    (k) => localStorage.removeItem(k),
  );
}

// ---- Account registry (localStorage) ----
export function getAccounts(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]") as Account[];
  } catch {
    return [];
  }
}
function saveAccounts(list: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}
export function findAccount(role: "student" | "teacher", id: string) {
  return getAccounts().find(
    (a) => a.role === role && a.id.toLowerCase() === id.toLowerCase(),
  );
}
export function registerAccount(acc: Account): { ok: boolean; error?: string } {
  const list = getAccounts();
  if (list.some((a) => a.role === acc.role && a.id.toLowerCase() === acc.id.toLowerCase())) {
    return { ok: false, error: "An account with this ID already exists." };
  }
  list.push(acc);
  saveAccounts(list);
  return { ok: true };
}
export function getStudents(): StudentAccount[] {
  return getAccounts().filter((a): a is StudentAccount => a.role === "student");
}

// Mock active OTP "broadcast" — stored in localStorage so the student tab can detect it.
export function startSession(otp: string, subjectName: string, durationMs = 30_000) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OTP_KEY, otp);
  localStorage.setItem(OTP_SUBJ_KEY, subjectName);
  localStorage.setItem(OTP_EXP_KEY, String(Date.now() + durationMs));
}
export function endSession() {
  if (typeof window === "undefined") return;
  [OTP_KEY, OTP_EXP_KEY, OTP_SUBJ_KEY].forEach((k) => localStorage.removeItem(k));
}
export function getActiveSession() {
  if (typeof window === "undefined") return null;
  const otp = localStorage.getItem(OTP_KEY);
  const exp = Number(localStorage.getItem(OTP_EXP_KEY) ?? 0);
  const subject = localStorage.getItem(OTP_SUBJ_KEY) ?? "";
  if (!otp || !exp || Date.now() > exp) return null;
  return { otp, subject, expiresAt: exp };
}
