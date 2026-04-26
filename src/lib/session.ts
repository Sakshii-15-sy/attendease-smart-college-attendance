type Role = "student" | "teacher" | null;

const ROLE_KEY = "attendease.role";
const STUDENT_NAME_KEY = "attendease.student.name";
const STUDENT_ID_KEY = "attendease.student.id";
const TEACHER_NAME_KEY = "attendease.teacher.name";
const TEACHER_ID_KEY = "attendease.teacher.id";
const DEPT_KEY = "attendease.dept";
const SEM_KEY = "attendease.sem";
const ACCOUNTS_KEY = "attendease.accounts";

export type StudentAccount = {
  role: "student";
  name: string;
  id: string;
  department: string;
  semester: string;
  password: string;
};

export type TeacherAccount = {
  role: "teacher";
  name: string;
  id: string;
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
  const role = getRole();
  if (role === "teacher") {
    localStorage.setItem(TEACHER_NAME_KEY, name);
    localStorage.setItem(TEACHER_ID_KEY, id);
  } else {
    localStorage.setItem(STUDENT_NAME_KEY, name);
    localStorage.setItem(STUDENT_ID_KEY, id);
  }
  localStorage.setItem(DEPT_KEY, department);
  localStorage.setItem(SEM_KEY, semester);
}

export function getUser() {
  if (typeof window === "undefined")
    return { name: "", id: "", department: "", semester: "" };
  const role = getRole();
  if (role === "teacher") {
    return {
      name: localStorage.getItem(TEACHER_NAME_KEY) ?? "",
      id: localStorage.getItem(TEACHER_ID_KEY) ?? "",
      department: localStorage.getItem(DEPT_KEY) ?? "",
      semester: "",
    };
  }
  return {
    name: localStorage.getItem(STUDENT_NAME_KEY) ?? "",
    id: localStorage.getItem(STUDENT_ID_KEY) ?? "",
    department: localStorage.getItem(DEPT_KEY) ?? "",
    semester: localStorage.getItem(SEM_KEY) ?? "",
  };
}

export function logout() {
  if (typeof window === "undefined") return;
  [ROLE_KEY, STUDENT_NAME_KEY, STUDENT_ID_KEY, TEACHER_NAME_KEY, 
   TEACHER_ID_KEY, DEPT_KEY, SEM_KEY].forEach(
    (k) => localStorage.removeItem(k),
  );
}

// ---- Account registry ----
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

export function endSession() {
  if (typeof window === "undefined") return;
}
export function getActiveSession() {
  return null;
}