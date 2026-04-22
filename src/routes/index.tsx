import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, Users, Sparkles, ArrowRight } from "lucide-react";
import { setRole } from "@/lib/session";

export const Route = createFileRoute("/")({
  component: RoleSelector,
});

function RoleSelector() {
  const navigate = useNavigate();
  const pick = (role: "student" | "teacher") => {
    setRole(role);
    navigate({ to: "/login" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 pb-10 pt-12">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
          <Sparkles className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Attend<span className="text-gradient-primary">Ease</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Smart attendance, powered by AI insights.
        </p>
      </motion.div>

      <div className="relative mt-12 space-y-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Choose your role
        </p>

        {[
          {
            role: "student" as const,
            title: "I'm a Student",
            desc: "Mark attendance with OTP & track defaulter risk",
            icon: GraduationCap,
            gradient: "bg-gradient-primary",
          },
          {
            role: "teacher" as const,
            title: "I'm a Teacher",
            desc: "Start sessions, broadcast OTPs & view analytics",
            icon: Users,
            gradient: "bg-gradient-hero",
          },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.button
              key={c.role}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => pick(c.role)}
              className="group relative w-full overflow-hidden rounded-3xl bg-card p-5 text-left shadow-card ring-1 ring-border transition-shadow hover:shadow-glow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${c.gradient} text-primary-foreground shadow-glow`}
                >
                  <Icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold">{c.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-12 text-center text-xs text-muted-foreground">
        Built with ❤ for modern campuses
      </p>
    </div>
  );
}
