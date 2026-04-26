import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Radio, AlertTriangle, BookOpen } from "lucide-react";
import { CircularProgress } from "@/components/CircularProgress";
import { AIInsightCard } from "@/components/AIInsightCard";
import { BottomNav } from "@/components/BottomNav";
import { getPercentage, getOverall, statusColor } from "@/lib/mockData";
import { getActiveSession, getUser } from "@/lib/session";
import { getStudentAttendance, getActiveSessionAPI } from "@/lib/api";

export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  const navigate = useNavigate();
  const user =
    typeof window !== "undefined"
      ? getUser()
      : { name: "", id: "", department: "", semester: "" };

  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<ReturnType<typeof getActiveSession>>(null);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    // Fetch real attendance from backend
    if (user.id) {
      getStudentAttendance(user.id)
        .then((summary) => {
          if (summary && summary.length > 0) {
            const mapped = summary.map((s: any, i: number) => ({
              id: String(i + 1),
              code: `SUB${String(i + 1).padStart(3, "0")}`,
              name: s.subject_name,
              attended: Number(s.attended),
              total: Number(s.total_lectures),
            }));
            setSubjects(mapped);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user.id]);

  const overall = subjects.length > 0 ? getOverall(subjects) : 0;
  const isDefaulter = overall < 75;
  const [realSession, setRealSession] = useState<any>(null);

useEffect(() => {
  const poll = async () => {
    try {
      const data = await getActiveSessionAPI();
      if (data.active) {
        setRealSession(data.session);
      } else {
        setRealSession(null);
      }
    } catch (e) {
      console.error(e);
    }
  };
  poll();
  const t = setInterval(poll, 3000);
  return () => clearInterval(t);
}, []);
 

  return (
    <div className="relative min-h-screen pb-28">
      {/* Header */}
      <div className="bg-gradient-hero px-6 pb-24 pt-10 text-primary-foreground">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Welcome</p>
            <h1 className="font-display text-2xl font-bold">
              {(user.name || "Student").split(" ")[0]} 👋
            </h1>
            <p className="mt-1 text-xs opacity-80">{user.id}</p>
          </div>
          <button
            onClick={() => setShowNotif((s) => !s)}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"
          >
            <Bell className="h-5 w-5" />
            {isDefaulter && (
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-primary-deep" />
            )}
          </button>
        </div>
      </div>

      {/* Notif drawer */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-4 right-4 top-20 z-30 rounded-2xl bg-card p-4 shadow-card ring-1 ring-border"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">FCM Alerts</p>
            <div className="mt-2 space-y-2">
              {subjects.filter(s => getPercentage(s) < 75).map((s, i) => (
                <div key={i} className="rounded-xl bg-destructive/10 p-3 text-sm">
                  <p className="font-semibold text-destructive">⚠ Defaulter Risk in {s.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Your attendance is {getPercentage(s)}%. Attend more classes to recover.
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live session card */}
      <div className="relative -mt-16 px-4">
        <AnimatePresence>
          {realSession && (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              onClick={() => navigate({ to: "/student/otp" })}
              className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-success p-4 text-success-foreground shadow-card ring-1 ring-success/40"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold uppercase tracking-widest opacity-90">Session Detected Nearby 📡</p>
                <p className="text-sm font-bold">Tap to mark attendance</p>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Overall ring card */}
        <div className="rounded-3xl bg-card p-6 shadow-card ring-1 ring-border">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground">Loading attendance...</p>
          ) : (
            <div className="flex flex-col items-center">
              <CircularProgress percentage={overall} label="Overall" sublabel="this semester" />
              <div className="mt-4 grid w-full grid-cols-3 divide-x divide-border text-center">
                <div className="px-2">
                  <p className="font-display text-xl font-bold">{subjects.reduce((a, s) => a + s.attended, 0)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Attended</p>
                </div>
                <div className="px-2">
                  <p className="font-display text-xl font-bold">
                    {subjects.reduce((a, s) => a + (s.total - s.attended), 0)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Missed</p>
                </div>
                <div className="px-2">
                  <p className="font-display text-xl font-bold">{subjects.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Subjects</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI insight */}
        <div className="mt-5">
          <AIInsightCard message={
            subjects.filter(s => getPercentage(s) < 75).length > 0
              ? `You're at risk in ${subjects.filter(s => getPercentage(s) < 75)[0]?.name}. Attend more classes to climb above 75%.`
              : "Great job! Your attendance is on track. Keep it up! 🎉"
          } />
        </div>

        {/* Subjects */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Subjects</h2>
            <span className="text-xs text-muted-foreground">{subjects.length} courses</span>
          </div>
          <div className="space-y-3">
            {subjects.map((s, i) => {
              const pct = getPercentage(s);
              const tone = statusColor(pct);
              const barClass = tone === "success" ? "bg-gradient-success" : tone === "warning" ? "bg-gradient-warning" : "bg-gradient-danger";
              const textClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning-foreground" : "text-destructive";
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.code}</p>
                        <p className="text-sm font-semibold leading-tight">{s.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-display text-lg font-bold ${textClass}`}>{pct}%</p>
                      <p className="text-[10px] text-muted-foreground">{s.attended}/{s.total}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${barClass}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Defaulter banner */}
      {isDefaulter && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 px-4"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-danger p-4 text-destructive-foreground shadow-glow">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">⚠ Defaulter Risk</p>
              <p className="text-xs opacity-90">Overall attendance below 75%. Action recommended.</p>
            </div>
          </div>
        </motion.div>
      )}

      <BottomNav role="student" />
    </div>
  );
}