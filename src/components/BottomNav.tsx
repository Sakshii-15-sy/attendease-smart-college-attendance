import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, User, LogOut } from "lucide-react";
import { logout } from "@/lib/session";

interface Props {
  role: "student" | "teacher";
}

export function BottomNav({ role }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const base = role === "student" ? "/student" : "/teacher";
  const items = [
    { to: base, icon: Home, label: "Home" },
    { to: `${base}/profile`, icon: User, label: "Profile" },
  ];

  const onLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-4">
      <div className="glass flex items-center justify-around rounded-2xl border border-border px-2 py-2 shadow-card">
        {items.map((it) => {
          const active = location.pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 transition-all ${
                active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{it.label}</span>
            </Link>
          );
        })}
        <button
          onClick={onLogout}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">Exit</span>
        </button>
      </div>
    </nav>
  );
}
