import { motion } from "framer-motion";

interface Props {
  percentage: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  percentage,
  size = 200,
  stroke = 14,
  label,
  sublabel,
}: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    percentage >= 75
      ? "var(--success)"
      : percentage >= 65
        ? "var(--warning)"
        : "var(--destructive)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary-glow)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={percentage >= 65 ? "url(#ringGrad)" : color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-display font-bold text-gradient-primary"
        >
          {percentage}%
        </motion.span>
        {label && <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>}
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
