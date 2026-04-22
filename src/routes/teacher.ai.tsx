import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, TrendingDown, AlertTriangle, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { AIInsightCard } from "@/components/AIInsightCard";
import { atRiskStudents } from "@/lib/mockData";

export const Route = createFileRoute("/teacher/ai")({
  component: TeacherAI,
});

function TeacherAI() {
  return (
    <div className="min-h-screen pb-28">
      <div className="bg-gradient-hero px-6 pb-6 pt-10 text-primary-foreground">
        <Link to="/teacher" className="inline-flex items-center gap-1 text-xs opacity-80">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">AI Insights</h1>
            <p className="text-xs opacity-80">Class-level patterns & risk analysis</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-5">
        <AIInsightCard
          title="Pattern Detected"
          message="Attendance in DBMS dropped 12% this month. Mondays show 3× more absences than other days."
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <p className="mt-2 font-display text-2xl font-bold">12%</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Drop in DBMS</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
            <Users className="h-5 w-5 text-primary" />
            <p className="mt-2 font-display text-2xl font-bold">{atRiskStudents.length}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">At-Risk Students</p>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="font-display text-base font-semibold">At-Risk Students</h3>
          </div>
          <div className="space-y-2">
            {atRiskStudents.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl bg-muted/40 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.id} · {s.subject}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    s.attendance < 65 ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning-foreground"
                  }`}
                >
                  {s.attendance}%
                </span>
              </motion.div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-xl bg-gradient-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-card">
            Send Reminder to All
          </button>
        </div>

        <AIInsightCard
          title="Smart Suggestion"
          message="OS section attendance is healthy at 87%. Consider replicating its session timing (10am slot) for low-performing classes."
        />
      </div>

      <BottomNav role="teacher" />
    </div>
  );
}
