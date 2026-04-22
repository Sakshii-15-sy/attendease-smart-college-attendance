import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { getUser } from "@/lib/session";

export const Route = createFileRoute("/student/ai")({
  component: StudentAI,
});

type Msg = { role: "user" | "ai"; content: string };

function smartReply(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("miss") && t.includes("math"))
    return "You currently have 59% in Mathematics III. To stay above 75%, you can miss 0 more classes. Attend the next 3 to recover to ~74%.";
  if (t.includes("defaulter"))
    return "Yes — based on your trend, you're projected to finish at 71% overall. Attend at least 6 more classes this month to avoid the defaulter list.";
  if (t.includes("best") || t.includes("good"))
    return "Your strongest subject is Operating Systems at 86%. Keep it up! 🎯";
  if (t.includes("dbms") || t.includes("database"))
    return "Database Systems is at 78% — comfortably safe. You can afford to miss 2 classes this month.";
  if (t.includes("network"))
    return "Computer Networks is at 67%. One more absence drops you below 65% (defaulter zone). Be careful!";
  return "I analyzed your data: overall 73%. Focus on Mathematics III and Computer Networks — those are pulling your average down. Want a study plan?";
}

function StudentAI() {
  const firstName =
    (typeof window !== "undefined" ? getUser().name : "").split(" ")[0] || "there";
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      content: `Hi ${firstName}! I'm your attendance assistant 🤖. Ask me anything — like 'How many classes can I miss in Maths?'`,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", content: smartReply(q) }]);
    }, 600);
  };

  const suggestions = [
    "How many classes can I miss in Maths?",
    "Will I be a defaulter this month?",
    "What's my best subject?",
  ];

  return (
    <div className="flex min-h-screen flex-col pb-28">
      <div className="bg-gradient-hero px-6 pb-6 pt-10 text-primary-foreground">
        <Link to="/student" className="inline-flex items-center gap-1 text-xs opacity-80">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">AI Assistant</h1>
            <p className="text-xs opacity-80">Your attendance copilot</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-card ${
                m.role === "user"
                  ? "rounded-br-md bg-gradient-primary text-primary-foreground"
                  : "rounded-bl-md bg-card text-foreground ring-1 ring-border"
              }`}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-4">
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={send}
          className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your attendance..."
            className="flex-1 bg-transparent px-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <BottomNav role="student" />
    </div>
  );
}
