import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, BookOpen, Award } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { getUser } from "@/lib/session";

export const Route = createFileRoute("/teacher/profile")({
  component: TeacherProfile,
});

function TeacherProfile() {
  const user =
    typeof window !== "undefined"
      ? getUser()
      : { name: "", id: "", department: "", semester: "" };
  const initials =
    user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "T";
  return (
    <div className="min-h-screen pb-28">
      <div className="bg-gradient-hero px-6 pb-20 pt-10 text-primary-foreground">
        <h1 className="font-display text-xl font-bold">Profile</h1>
      </div>
      <div className="-mt-16 px-4">
        <div className="rounded-3xl bg-card p-6 text-center shadow-card ring-1 ring-border">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary font-display text-2xl font-bold text-primary-foreground shadow-glow">
            {initials}
          </div>
          <h2 className="mt-3 font-display text-xl font-bold">
            {user.name || "Teacher"}
          </h2>
          <p className="text-xs text-muted-foreground">{user.id}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Award className="h-3.5 w-3.5" /> Faculty
          </div>
        </div>
        <div className="mt-4 space-y-2 rounded-2xl bg-card p-4 shadow-card ring-1 ring-border">
          {[
            { icon: BookOpen, label: "Department", value: user.department || "—" },
            { icon: Award, label: "Employee ID", value: user.id || "—" },
            {
              icon: Mail,
              label: "Email",
              value: user.id
                ? `${user.id.toLowerCase()}@college.edu`
                : "—",
            },
            { icon: Phone, label: "Office", value: "Not provided" },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.label}</p>
                  <p className="text-sm font-medium">{row.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav role="teacher" />
    </div>
  );
}
