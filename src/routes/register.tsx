import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, IdCard, Lock, User, Building2, GraduationCap } from "lucide-react";
import { getRole, registerAccount, setUser } from "@/lib/session";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
];

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setLocalRole] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [semester, setSemester] = useState("1");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const r = getRole();
    if (!r) navigate({ to: "/" });
    else setLocalRole(r);
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !id.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    const result =
      role === "student"
        ? registerAccount({
            role: "student",
            name: name.trim(),
            id: id.trim(),
            department,
            semester,
            password,
          })
        : registerAccount({
            role: "teacher",
            name: name.trim(),
            id: id.trim(),
            department,
            password,
          });
    if (!result.ok) {
      setError(result.error ?? "Registration failed.");
      return;
    }
    setUser(name.trim(), id.trim(), department, role === "student" ? semester : "");
    navigate({ to: role === "student" ? "/student" : "/teacher" });
  };

  return (
    <div className="relative min-h-screen px-6 pb-10 pt-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-primary opacity-15 blur-3xl" />

      <Link
        to="/login"
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
          {role === "student" ? "Student Registration" : "Teacher Registration"}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">Create your account ✨</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your details to get started with AttendEase.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border"
      >
        <Field label="Full Name" icon={User}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Riya Sharma"
            className="w-full rounded-xl border border-input bg-background px-9 py-3 text-sm font-medium outline-none ring-primary/30 transition focus:ring-2"
          />
        </Field>

        <Field
          label={role === "student" ? "Roll Number" : "Employee ID"}
          icon={IdCard}
        >
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={role === "student" ? "BT22CS045" : "PROF1042"}
            className="w-full rounded-xl border border-input bg-background px-9 py-3 text-sm font-medium outline-none ring-primary/30 transition focus:ring-2"
          />
        </Field>

        <Field label="Department" icon={Building2}>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full appearance-none rounded-xl border border-input bg-background px-9 py-3 text-sm font-medium outline-none ring-primary/30 transition focus:ring-2"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>

        {role === "student" && (
          <Field label="Semester" icon={GraduationCap}>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full appearance-none rounded-xl border border-input bg-background px-9 py-3 text-sm font-medium outline-none ring-primary/30 transition focus:ring-2"
            >
              {Array.from({ length: 8 }, (_, i) => String(i + 1)).map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Password" icon={Lock}>
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
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
        </Field>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform active:scale-[0.98]"
        >
          Create Account
        </button>

        <p className="text-center text-[11px] text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
