import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, IdCard, Lock } from "lucide-react";
import { getRole, setUser } from "@/lib/session";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setLocalRole] = useState<"student" | "teacher">("student");
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const r = getRole();
    if (!r) navigate({ to: "/" });
    else setLocalRole(r);
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = collegeId.trim() || (role === "student" ? "BT21CS001" : "PROF1042");
    const name = role === "student" ? "Aanya Verma" : "Dr. Rajesh Iyer";
    setUser(name, id);
    navigate({ to: role === "student" ? "/student" : "/teacher" });
  };

  return (
    <div className="relative min-h-screen px-6 pb-10 pt-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-primary opacity-15 blur-3xl" />

      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {role === "student" ? "Student Login" : "Teacher Login"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in with your college credentials to continue.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border"
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            College ID
          </label>
          <div className="relative">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoComplete="username"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              placeholder={role === "student" ? "BT21CS001" : "PROF1042"}
              className="w-full rounded-xl border border-input bg-background px-9 py-3 text-sm font-medium outline-none ring-primary/30 transition focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-input bg-background px-9 py-3 text-sm outline-none ring-primary/30 transition focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform active:scale-[0.98]"
        >
          Sign In
        </button>

        <p className="text-center text-[11px] text-muted-foreground">
          Demo build · any credentials work
        </p>
      </motion.form>
    </div>
  );
}
