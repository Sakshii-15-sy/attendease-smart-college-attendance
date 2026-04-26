import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Radio, CheckCircle2, XCircle } from "lucide-react";
import { getActiveSessionAPI, markAttendanceAPI } from "@/lib/api";
import { getUser } from "@/lib/session";

export const Route = createFileRoute("/student/otp")({
  component: OtpEntry,
});

function OtpEntry() {
  const navigate = useNavigate();
  const user = getUser();
  const [session, setSession] = useState<any>(null);
  const [otp, setOtp] = useState("");
  const [remaining, setRemaining] = useState(30);
  const [status, setStatus] = useState<"idle" | "success" | "fail">("idle");

  // Fetch active session from real database
  useEffect(() => {
    getActiveSessionAPI().then((data) => {
      if (!data.active) {
        navigate({ to: "/student" });
        return;
      }
      setSession(data.session);
      // Calculate remaining time
      const expiresAt = new Date(data.session.otp_expires_at).getTime();
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemaining(left);
    });
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (status !== "idle" || !session) return;
    const t = setInterval(() => {
      const expiresAt = new Date(session.otp_expires_at).getTime();
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setStatus("fail");
        clearInterval(t);
      }
    }, 250);
    return () => clearInterval(t);
  }, [status, session]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle" || !session) return;

    try {
      console.log('Marking attendance:', session.id, user.id, otp.trim());
      const result = await markAttendanceAPI(
        session.id,
        user.id,
        otp.trim()
      );
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("fail");
      }
    } catch (err) {
      setStatus("fail");
    }
  };

  const handleInput = (v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 6);
    setOtp(clean);
  };

  return (
    <div className="relative min-h-screen px-6 pb-10 pt-10">
      <Link to="/student" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Radio className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Session Detected</p>
          <h1 className="font-display text-2xl font-bold">Live Session 📡</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={submit}
            className="mt-8 rounded-3xl bg-card p-6 shadow-card ring-1 ring-border"
          >
            <p className="text-center text-sm text-muted-foreground">
              Enter the 6-digit OTP shown by your teacher
            </p>

            <input
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              value={otp}
              onChange={(e) => handleInput(e.target.value)}
              maxLength={6}
              placeholder="••••••"
              className="mt-5 w-full rounded-2xl border-2 border-border bg-background py-4 text-center font-display text-4xl font-bold tracking-[0.5em] outline-none ring-primary transition focus:border-primary focus:ring-2"
            />

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Time remaining</span>
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

            <button
              type="submit"
              disabled={otp.length !== 6}
              className="mt-6 w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-card transition disabled:opacity-50"
            >
              Mark Attendance
            </button>
          </motion.form>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-success shadow-glow"
            >
              <CheckCircle2 className="h-16 w-16 text-success-foreground" strokeWidth={2.5} />
            </motion.div>
            <h2 className="mt-6 font-display text-2xl font-bold">Attendance Marked! ✅</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your presence has been recorded successfully.
            </p>
            <button
              onClick={() => navigate({ to: "/student" })}
              className="mt-8 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-card"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}

        {status === "fail" && (
          <motion.div
            key="fail"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 0.5 }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-danger shadow-glow"
            >
              <XCircle className="h-16 w-16 text-destructive-foreground" strokeWidth={2.5} />
            </motion.div>
            <h2 className="mt-6 font-display text-2xl font-bold text-destructive">
              Attendance not recorded
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {remaining === 0
                ? "Session timed out."
                : "OTP didn't match. Please ask your teacher to retry."}
            </p>
            <button
              onClick={() => navigate({ to: "/student" })}
              className="mt-8 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-card"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
