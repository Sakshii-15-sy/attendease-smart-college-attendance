import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Props {
  title?: string;
  message: string;
}

export function AIInsightCard({ title = "AI Insight", message }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-hero p-5 text-primary-foreground shadow-card"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest opacity-90">{title}</span>
        </div>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}
