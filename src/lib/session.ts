// Tiny client-only session store for demo purposes (mock data, no auth).
type Role = "student" | "teacher" | null;

const ROLE_KEY = "attendease.role";
const NAME_KEY = "attendease.name";
const ID_KEY = "attendease.id";
const OTP_KEY = "attendease.activeOtp";
const OTP_EXP_KEY = "attendease.activeOtpExp";
const OTP_SUBJ_KEY = "attendease.activeOtpSubj";

export function setRole(r: Role) {
  if (typeof window === "undefined") return;
  if (r) localStorage.setItem(ROLE_KEY, r);
  else localStorage.removeItem(ROLE_KEY);
}
export function getRole(): Role {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(ROLE_KEY) as Role) ?? null;
}
export function setUser(name: string, id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name);
  localStorage.setItem(ID_KEY, id);
}
export function getUser() {
  if (typeof window === "undefined") return { name: "Student", id: "BT21CS001" };
  return {
    name: localStorage.getItem(NAME_KEY) ?? "Student",
    id: localStorage.getItem(ID_KEY) ?? "BT21CS001",
  };
}
export function logout() {
  if (typeof window === "undefined") return;
  [ROLE_KEY, NAME_KEY, ID_KEY, OTP_KEY, OTP_EXP_KEY, OTP_SUBJ_KEY].forEach((k) =>
    localStorage.removeItem(k),
  );
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
