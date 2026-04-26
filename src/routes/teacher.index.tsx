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
import { monthlyAttendance } from "@/lib/mockData";
import { startSessionAPI, getSessionAttendance } from "@/lib/api";
import { getUser } from "@/lib/session";
import { getMonthlyTrends } from "@/lib/api";
import { getAIInsight } from "@/lib/api";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const user =
    typeof window !== "undefined"
      ? getUser()
      : { name: "", id: "", department: "", semester: "" };

  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [remaining, setRemaining] = useState(30);
  const [students, setStudents] = useState<any[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);
  const [sessionAttendance, setSessionAttendance] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState<string>("Analyzing attendance patterns...");

  // Fetch teacher subjects
  useEffect(() => {
    if (!user.id) return;
    fetch(`http://10.141.105.80:3000/api/teacher/subjects/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.subjects) setTeacherSubjects(data.subjects);
      })
      .catch(console.error);
  }, [user.id]);

  // Fetch all students
  useEffect(() => {
    fetch('http://10.141.105.80:3000/api/teacher/students')
      .then(res => res.json())
      .then(data => {
        if (data.students) setStudents(data.students);
      })
      .catch(console.error);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!activeSubject || !currentSessionId) return;
    const expiresAt = Date.now() + 30000;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setActiveSubject(null);
        setOtp("");
        setCurrentSessionId(null);
        clearInterval(t);
      }
    }, 250);
    return () => clearInterval(t);
  }, [activeSubject, currentSessionId]);

  useEffect(() => {
  if (teacherSubjects.length === 0) return;
  getMonthlyTrends(teacherSubjects[0].id)
    .then(data => {
      if (data.trends) setMonthlyTrends(data.trends);
    })
    .catch(console.error);
}, [teacherSubjects]);

useEffect(() => {
  if (students.length === 0) return;
  getAIInsight(students)
    .then(data => {
      if (data.insight) setAiInsight(data.insight);
    })
    .catch(console.error);
}, [students]);

  const start = async (subjectId: number, subjectName: string) => {
    try {
      const data = await startSessionAPI(Number(user.id), subjectId);
      if (data.success) {
        setActiveSubject(subjectName);
        setOtp(data.otp);
        setRemaining(30);
        setCurrentSessionId(data.session_id);
        setSessionAttendance([]);

        // Poll attendance every 3 seconds for 35 seconds
        const pollAttendance = setInterval(async () => {
          const result = await getSessionAttendance(data.session_id);
          if (result.attendance) setSessionAttendance(result.attendance);
        }, 3000);
        setTimeout(() => clearInterval(pollAttendance), 35000);
      }
    } catch (err) {
      console.error('Failed to start session', err);
    }
  };

  const stop = () => {
    setActiveSubject(null);
    setOtp("");
    setCurrentSessionId(null);
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-gradient-hero px-6 pb-24 pt-10 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Faculty</p>
            <h1 className="font-display text-2xl font-bold">{user.name || "Teacher"}</h1>
            <p className="mt-1 text-xs opacity-80">
              {user.id}{user.department ? ` · ${user.department}` : ""}
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

              {/* Present students */}
              {sessionAttendance.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    ✅ Marked Present ({sessionAttendance.filter((a: any) => a.present).length})
                  </p>
                  {sessionAttendance.filter((a: any) => a.present).map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl bg-success/10 p-2 mb-1">
                      <div className="h-7 w-7 rounded-full bg-success flex items-center justify-center text-xs font-bold text-success-foreground">
                        {(a.student_name || "S")[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{a.student_name}</p>
                        <p className="text-[10px] text-muted-foreground">{a.roll_no}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subjects */}
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Your Classes</h2>
          <div className="space-y-3">
            {teacherSubjects.map((s, i) => {
              const isActive = activeSubject === s.subject_name;
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
                      Electronics & Telecom
                    </p>
                    <p className="text-sm font-semibold">{s.subject_name}</p>
                  </div>
                  <button
                    onClick={() => start(Number(s.id), s.subject_name)}
                    disabled={!!activeSubject && !isActive}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-card transition disabled:opacity-40 ${
                      isActive
                        ? "bg-success text-success-foreground"
                        : "bg-gradient-primary text-primary-foreground"
                    }`}
                  >
                    {isActive ? (
                      <><Radio className="h-3.5 w-3.5" /> Live</>
                    ) : (
                      <><Play className="h-3.5 w-3.5" /> Start</>
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
                <p className="text-[11px] text-muted-foreground">All Students</p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {students.length} registered
            </span>
          </div>

          {students.length === 0 ? (
            <div className="rounded-2xl bg-muted/40 p-5 text-center">
              <p className="text-sm font-medium">No students yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((s: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                    {(s.student_name || "S")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{s.student_name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.student_roll_no}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                    Number(s.attendance_pct) < 65
                      ? "bg-destructive/10 text-destructive ring-destructive/20"
                      : Number(s.attendance_pct) < 75
                      ? "bg-warning/10 text-warning-foreground ring-warning/20"
                      : "bg-success/10 text-success ring-success/20"
                  }`}>
                    {s.attendance_pct ? `${Math.round(s.attendance_pct)}%` : "N/A"}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">
              Monthly Trends · {teacherSubjects[0]?.subject_name || "Subject"}
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">2026</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAttendance} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 300)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.50 0.04 290)" }} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.50 0.04 290)" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 300)", fontSize: 12 }} />
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
          message={aiInsight}
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