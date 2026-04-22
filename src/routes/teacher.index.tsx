import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Radio, X, Bell, BookOpen, Users, Download } from "lucide-react";
import { DownloadReportModal } from "@/components/DownloadReportModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { BottomNav } from "@/components/BottomNav";
import { AIInsightCard } from "@/components/AIInsightCard";
import { teacherSubjects, monthlyAttendance } from "@/lib/mockData";
import {
  startSession,
  endSession,
  getActiveSession,
  getUser,
  getStudents,
} from "@/lib/session";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function TeacherDashboard() {
  const user =
    typeof window !== "undefined"
      ? getUser()
      : { name: "", id: "", department: "", semester: "" };
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [remaining, setRemaining] = useState(30);
  const [students, setStudents] = useState<ReturnType<typeof getStudents>>([]);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const myStudents = user.department
    ? students.filter((s) => s.department === user.department)
    : students;

  useEffect(() => {
    const s = getActiveSession();
    if (s) {
      setActiveSubject(s.subject);
      setOtp(s.otp);
    }
  }, []);

  useEffect(() => {
    if (!activeSubject) return;
    const t = setInterval(() => {
      const s = getActiveSession();
      if (!s) {
        setActiveSubject(null);
        setOtp("");
        clearInterval(t);
        return;
      }
      const left = Math.max(0, Math.ceil((s.expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        endSession();
        setActiveSubject(null);
        setOtp("");
        clearInterval(t);
      }
    }, 250);
    return () => clearInterval(t);
  }, [activeSubject]);

  const start = (subject: string) => {
    const code = genOtp();
    startSession(code, subject, 30_000);
    setActiveSubject(subject);
    setOtp(code);
    setRemaining(30);
  };

  const stop = () => {
    endSession();
    setActiveSubject(null);
    setOtp("");
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-gradient-hero px-6 pb-24 pt-10 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Faculty</p>
            <h1 className="font-display text-2xl font-bold">{user.name || "Teacher"}</h1>
            <p className="mt-1 text-xs opacity-80">
              {user.id}
              {user.department ? ` · ${user.department}` : ""}
            </p>
          </div>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Bell className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={() => setReportOpen(true)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-white/25"
        >
          <Download className="h-4 w-4" />
          Download Attendance Report
        </button>
      </div>

      <div className="-mt-16 space-y-5 px-4">
        {/* Active session card */}
        <AnimatePresence>
          {activeSubject && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-card ring-2 ring-primary"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-primary opacity-20 blur-2xl" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">Live Session</p>
                  <h3 className="mt-0.5 font-display text-lg font-bold">{activeSubject}</h3>
                </div>
                <button
                  onClick={stop}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <Radio className="h-3 w-3" /> BLE Active · Broadcasting
              </div>

              <div className="my-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Session OTP
                </p>
                <p className="mt-1 font-display text-5xl font-bold tracking-[0.4em] text-gradient-primary">
                  {otp}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Expires in</span>
                <span className={`font-display text-lg font-bold ${remaining <= 10 ? "text-destructive" : "text-primary"}`}>
                  {remaining}s
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-300 ${remaining <= 10 ? "bg-gradient-danger" : "bg-gradient-primary"}`}
                  style={{ width: `${(remaining / 30) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subjects */}
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Your Classes</h2>
          <div className="space-y-3">
            {teacherSubjects.map((s, i) => {
              const isActive = activeSubject === s.name;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card ring-1 ring-border"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.code} · {s.section}
                    </p>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.students} students</p>
                  </div>
                  <button
                    onClick={() => start(s.name)}
                    disabled={!!activeSubject && !isActive}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-card transition disabled:opacity-40 ${
                      isActive
                        ? "bg-success text-success-foreground"
                        : "bg-gradient-primary text-primary-foreground"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Radio className="h-3.5 w-3.5" /> Live
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" /> Start
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* My Students */}
        <div className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold">My Students</h2>
                <p className="text-[11px] text-muted-foreground">
                  {user.department || "All departments"}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {myStudents.length} registered
            </span>
          </div>

          {myStudents.length === 0 ? (
            <div className="rounded-2xl bg-muted/40 p-5 text-center">
              <p className="text-sm font-medium">No students yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Students who register in {user.department || "your department"} will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {myStudents.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.id} · Sem {s.semester}
                    </p>
                  </div>
                  <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border">
                    {s.department.split(" ")[0]}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>


        <div className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Monthly Trends · DBMS</h2>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">2025</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAttendance} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 300)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.50 0.04 290)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.50 0.04 290)" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.92 0.02 300)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="present" fill="oklch(0.65 0.18 150)" radius={[6, 6, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="oklch(0.75 0.17 60)" radius={[6, 6, 0, 0]} name="Absent" />
                <Bar dataKey="defaulter" fill="oklch(0.60 0.22 22)" radius={[6, 6, 0, 0]} name="Defaulter" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <AIInsightCard
          title="AI Pattern Analysis"
          message="Attendance in DBMS dropped 12% this month. Mondays show 3× more absences — consider sending a reminder Sunday evening."
        />
      </div>

      <BottomNav role="teacher" />

      <DownloadReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        department={user.department}
      />
    </div>
  );
}
