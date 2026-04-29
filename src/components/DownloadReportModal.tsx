import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, FileSpreadsheet, FileType2, Loader2, Download } from "lucide-react";
import { buildReport } from "@/lib/reportData";
import { downloadPdf, downloadXlsx, downloadDocx } from "@/lib/reportGenerators";

type Format = "pdf" | "xlsx" | "docx";

type Props = {
  open: boolean;
  onClose: () => void;
  department: string;
};

const options: {
  id: Format;
  label: string;
  ext: string;
  desc: string;
  icon: typeof FileText;
  tone: string;
}[] = [
  {
    id: "pdf",
    label: "PDF Document",
    ext: ".pdf",
    desc: "Print-ready, shareable summary",
    icon: FileText,
    tone: "from-rose-500 to-red-600",
  },
  {
    id: "xlsx",
    label: "Excel Spreadsheet",
    ext: ".xlsx",
    desc: "Editable data with sortable columns",
    icon: FileSpreadsheet,
    tone: "from-emerald-500 to-green-600",
  },
  {
    id: "docx",
    label: "Word Document",
    ext: ".docx",
    desc: "Formatted report for editing",
    icon: FileType2,
    tone: "from-sky-500 to-blue-600",
  },
];

export function DownloadReportModal({ open, onClose, department }: Props) {
  const [busy, setBusy] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (fmt: Format) => {
    setError(null);
    setBusy(fmt);
    try {
      // Fetch real students from database
      const res = await fetch('http://localhost:3000/api/teacher/students');
      const data = await res.json();
      
      if (!data.students || data.students.length === 0) {
        setError("No students found in database.");
        setBusy(null);
        return;
      }

      // Map database students to report format
      const students = data.students.map((s: any) => ({
        name: s.student_name,
        id: s.student_roll_no,
        department: department || "Electronics & Telecom",
        semester: "6",
        password: "",
        role: "student" as const,
        attendance: s.attendance_pct ? Math.round(s.attendance_pct) : 0,
        subject: s.subject_name,
      }));

      const rows = buildReport(students);
      if (fmt === "pdf") await downloadPdf(rows, department);
      else if (fmt === "xlsx") await downloadXlsx(rows, department);
      else await downloadDocx(rows, department);

      setTimeout(() => {
        setBusy(null);
        onClose();
      }, 400);
    } catch (e) {
      console.error(e);
      setError("Could not generate the file. Please try again.");
      setBusy(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-t-3xl bg-card p-5 shadow-2xl ring-1 ring-border sm:rounded-3xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                  Export
                </p>
                <h3 className="font-display text-lg font-bold">Download Report</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Attendance summary for {department || "all departments"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition hover:bg-muted/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {options.map((o) => {
                const Icon = o.icon;
                const isBusy = busy === o.id;
                const disabled = busy !== null;
                return (
                  <button
                    key={o.id}
                    onClick={() => handle(o.id)}
                    disabled={disabled}
                    className="flex w-full items-center gap-3 rounded-2xl bg-muted/40 p-3.5 text-left ring-1 ring-border transition hover:bg-muted/70 disabled:opacity-50"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${o.tone} text-white shadow-card`}
                    >
                      {isBusy ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold">{o.label}</p>
                        <span className="rounded-md bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground ring-1 ring-border">
                          {o.ext}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{o.desc}</p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <p className="mt-4 text-center text-[10px] text-muted-foreground">
              Includes name, roll number, subject-wise % and defaulter status.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
