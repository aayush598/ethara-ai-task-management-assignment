"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════
   AI OPS TASKFLOW — Landing Page
   Bright Enterprise Theme · Bricolage Grotesque · IBM Plex Mono
═══════════════════════════════════════════════════════════ */

/* ── Count-up hook ── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return count;
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, seen };
}

/* ── Animated stat ── */
function KpiStat({ value, suffix = "", label, prefix = "" }: { value: number; suffix?: string; label: string; prefix?: string }) {
  const { ref, seen } = useInView(0.4);
  const n = useCountUp(value, 1600, seen);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <span className="stat-num">{prefix}{n.toLocaleString()}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ── Tag pill ── */
function Tag({ color, children }: { color: "blue" | "indigo" | "emerald" | "amber" | "rose" | "violet"; children: React.ReactNode }) {
  const map: Record<string, string> = {
    blue: "bg-blue-50   text-blue-700   border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50  text-amber-700  border-amber-200",
    rose: "bg-rose-50   text-rose-700   border-rose-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase tracking-wider ${map[color]}`}>
      {children}
    </span>
  );
}

/* ── Dashboard mockup ── */
function DashboardMockup() {
  const [activeRow, setActiveRow] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setActiveRow(r => (r + 1) % 5), 2400);
    return () => clearInterval(t);
  }, []);

  const tasks = [
    { name: "Evaluate toxicity classification", type: "Safety", status: "Approved", score: 4.8, assignee: "AK", color: "bg-indigo-500" },
    { name: "Validate reasoning chain coherence", type: "Coherence", status: "In Review", score: 3.9, assignee: "PP", color: "bg-violet-500" },
    { name: "Review hallucination severity", type: "Accuracy", status: "Pending", score: null, assignee: "RS", color: "bg-blue-500" },
    { name: "Benchmark prompt relevance", type: "Relevance", status: "Approved", score: 4.5, assignee: "SM", color: "bg-emerald-500" },
    { name: "RLHF alignment verification", type: "Safety", status: "Rejected", score: 1.8, assignee: "NK", color: "bg-rose-500" },
  ];

  const statusStyle: Record<string, string> = {
    "Approved": "text-emerald-700 bg-emerald-50  border-emerald-200",
    "In Review": "text-blue-700    bg-blue-50     border-blue-200",
    "Pending": "text-amber-700   bg-amber-50    border-amber-200",
    "Rejected": "text-rose-700    bg-rose-50     border-rose-200",
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Browser shell */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-[0_32px_80px_rgba(15,23,42,0.14)] bg-white">
        {/* Title bar - enhanced with hover effects */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400 hover:bg-rose-500 cursor-pointer transition-all duration-200 hover:scale-110" />
            <div className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 cursor-pointer transition-all duration-200 hover:scale-110" />
            <div className="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 cursor-pointer transition-all duration-200 hover:scale-110" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-1.5 border border-slate-200 text-xs font-mono text-slate-500 shadow-sm">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              aiops.taskflow.app/dashboard
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 border-r border-slate-100 bg-slate-50 p-4 shrink-0">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
              </div>
              <span className="text-xs font-bold text-slate-800">AI Ops</span>
            </div>
            {["Dashboard", "Projects", "Tasks", "Analytics", "Activity", "Settings"].map((item, i) => (
              <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-[11px] font-medium cursor-default transition-colors ${i === 1 ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-100"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-indigo-500" : "bg-transparent"}`} />
                {item}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 p-4 bg-white min-w-0">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-2.5 mb-4">
              {[
                { label: "Total Tasks", val: "48", delta: "+6", up: true, color: "text-indigo-600" },
                { label: "Approved", val: "31", delta: "+3", up: true, color: "text-emerald-600" },
                { label: "Pending Review", val: "12", delta: "-2", up: false, color: "text-amber-600" },
                { label: "Approval Rate", val: "87%", delta: "+4%", up: true, color: "text-blue-600" },
              ].map((k, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-mono mb-1">{k.label}</p>
                  <p className={`text-base font-bold font-mono ${k.color}`}>{k.val}</p>
                  <p className={`text-[9px] font-mono ${k.up ? "text-emerald-500" : "text-rose-500"}`}>{k.delta}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="grid text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 px-3 py-2"
                style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 24px" }}>
                <span>Task</span><span>Type</span><span>Status</span><span>Score</span><span />
              </div>
              {tasks.map((t, i) => (
                <div
                  key={i}
                  className={`grid items-center px-3 py-2 border-b border-slate-50 transition-all duration-400 ${activeRow === i ? "bg-indigo-50/60" : "bg-white hover:bg-slate-50"}`}
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 24px" }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-5 h-5 rounded-full ${t.color} flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0`}>{t.assignee}</div>
                    <span className="text-[10px] text-slate-700 truncate">{t.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">{t.type}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border w-fit ${statusStyle[t.status]}`}>{t.status}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-600">{t.score ?? "—"}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${activeRow === i ? "bg-indigo-500 animate-pulse" : "bg-transparent"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

{/* Floating badges - enhanced with hover */}
      <div className="absolute -top-5 -right-5 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg shadow-slate-200/80 animate-float-a hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white">AK</div>
        <div>
          <p className="text-[10px] font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Evaluation submitted</p>
          <p className="text-[9px] text-slate-400 font-mono">Score: 4.8 - Safety</p>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      <div className="absolute -bottom-5 -left-4 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg shadow-slate-200/80 animate-float-b hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <p className="text-[10px] font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">AI priority: <span className="text-rose-600 font-bold">High</span></p>
      </div>
    </div>
  );
}

/* ── Workflow diagram ── */
function WorkflowDiagram() {
  const steps = [
    { label: "Create Project", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>, color: "bg-indigo-100 border-indigo-300 text-indigo-700", dot: "bg-indigo-500", mockup: "project" },
    { label: "Assign Tasks", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: "bg-blue-100 border-blue-300 text-blue-700", dot: "bg-blue-500", mockup: "tasks" },
    { label: "Submit Review", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: "bg-violet-100 border-violet-300 text-violet-700", dot: "bg-violet-500", mockup: "eval" },
    { label: "QA Approval", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, color: "bg-emerald-100 border-emerald-300 text-emerald-700", dot: "bg-emerald-500", mockup: "approval" },
    { label: "Export Data", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>, color: "bg-amber-100 border-amber-300 text-amber-700", dot: "bg-amber-500", mockup: "export" },
  ];

  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % steps.length), 2500);
    return () => clearInterval(t);
  }, []);

  const handleClick = (i: number) => {
    if (i !== active) {
      setIsAnimating(true);
      setActive(i);
      setTimeout(() => setIsAnimating(false), 400);
    }
  };

  const mockups: Record<string, React.ReactNode> = {
    project: <div className="bg-white rounded-lg border border-indigo-100 p-3"><div className="flex items-center gap-2 mb-2"><div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg></div><span className="text-xs font-semibold text-slate-800">Safety Benchmark Q2</span></div><p className="text-[9px] text-slate-400">24 tasks - Created just now</p></div>,
    tasks: <div className="bg-white rounded-lg border border-blue-100 p-3 space-y-2">{["Toxicity Eval #1", "Coherence Check #2", "Safety Review #3"].map((t, i) => (<div key={i} className="flex items-center gap-2 text-[10px]"><div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-blue-500 animate-pulse" : "bg-slate-300"}`} /><span className="text-slate-600">{t}</span></div>))}</div>,
    eval: <div className="bg-white rounded-lg border border-violet-100 p-3"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-slate-800">Evaluation #47</span><span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">Submitted</span></div><div className="space-y-1"><div className="flex justify-between text-[9px]"><span className="text-slate-400">Score</span><span className="font-bold text-slate-700">4.2/5</span></div><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full w-[84%] bg-violet-500 rounded-full" /></div></div></div>,
    approval: <div className="bg-white rounded-lg border border-emerald-100 p-3"><div className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div><span className="text-xs font-semibold text-slate-800">Approved</span></div><p className="text-[9px] text-slate-400">by Admin - 2 min ago</p></div>,
    export: <div className="bg-white rounded-lg border border-amber-100 p-3"><div className="flex items-center gap-2 mb-2"><svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg><span className="text-xs font-semibold text-slate-800">Export Ready</span></div><p className="text-[9px] text-slate-400">CSV: 2.4 MB - JSON: 1.8 MB</p></div>,
  };

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`flex items-center gap-2 rounded-lg p-2 transition-all duration-300 text-left ${active === i ? `${s.color} shadow-sm` : "border border-transparent hover:bg-slate-100 text-slate-500"}`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${active === i ? "bg-white/50" : "bg-slate-100"}`}>
              <span className={active === i ? "text-current" : "text-slate-400"}>{s.icon}</span>
            </div>
            <span className={`text-xs font-medium flex-1 ${active === i ? "" : "text-slate-500"}`}>{s.label}</span>
            {active === i && <div className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />}
          </button>
        ))}
      </div>
      <div className={`mt-4 pt-4 border-t border-slate-200 transition-all duration-400 ${isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}>
        {mockups[steps[active].mockup]}
      </div>
    </div>
  );
}

/* ── Activity feed ── */
function ActivityFeed() {
  const events = [
    { user: "Arjun K", action: "approved task", target: "Toxicity Eval #48", time: "just now", color: "bg-emerald-500", type: "emerald" },
    { user: "Priya P", action: "submitted evaluation", target: "Coherence Check #47", time: "2m ago", color: "bg-violet-500", type: "violet" },
    { user: "System AI", action: "flagged severity", target: "RLHF Alignment #46", time: "5m ago", color: "bg-rose-500", type: "rose" },
    { user: "Shreya M", action: "created project", target: "Safety Benchmark Q2", time: "12m ago", color: "bg-indigo-500", type: "indigo" },
    { user: "Nikhil R", action: "added comment", target: "Prompt Relevance #45", time: "18m ago", color: "bg-blue-500", type: "blue" },
    { user: "Arjun K", action: "rejected task", target: "Dataset Validation #44", time: "25m ago", color: "bg-amber-500", type: "amber" },
  ];
  const [highlighted, setHighlighted] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHighlighted(p => (p + 1) % events.length), 2000);
    return () => clearInterval(t);
  }, []);
  const typeDot: Record<string, string> = {
    emerald: "text-emerald-600", violet: "text-violet-600", rose: "text-rose-600",
    indigo: "text-indigo-600", blue: "text-blue-600", amber: "text-amber-600",
  };
  return (
    <div className="space-y-2.5">
      {events.map((e, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-500 ${highlighted === i ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white border-transparent"}`}>
          <div className={`w-7 h-7 rounded-full ${e.color} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-0.5`}>
            {e.user === "System AI" ? "AI" : e.user.split(" ").map(w => w[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-700">
              <span className="font-semibold">{e.user}</span>
              <span className="text-slate-500"> {e.action} </span>
              <span className={`font-semibold ${typeDot[e.type]}`}>{e.target}</span>
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{e.time}</p>
          </div>
          {highlighted === i && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse mt-1.5 flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

/* ── Bento feature card ── */
function BentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };
  return (
    <div
      className={`relative rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-[0_16px_48px_rgba(79,70,229,0.1)] hover:border-indigo-200 group ${className}`}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {hovering && (
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{ background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(79,70,229,0.05) 0%, transparent 60%)` }}
        />
      )}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {children}
    </div>
  );
}

/* ── Testimonial ── */
function Testimonial({ quote, name, role, initials, color, delay = 0 }: {
  quote: string; name: string; role: string; initials: string; color: string; delay?: number
}) {
  const { ref, seen } = useInView(0.15);
  return (
    <div ref={ref} className="bg-white rounded-2xl border border-slate-200 p-6 transition-all duration-700 shadow-sm"
      style={{ opacity: seen ? 1 : 0, transform: seen ? "translateY(0)" : "translateY(20px)", transitionDelay: `${delay}ms` }}>
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mb-5">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold text-white`}>{initials}</div>
        <div>
          <p className="text-slate-900 text-sm font-semibold">{name}</p>
          <p className="text-slate-400 text-xs font-mono">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Geist:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --bg:       #ffffff;
          --bg-soft:  #f8f9fc;
          --bg-mesh:  #f0f2ff;
          --border:   #e5e7ef;
          --ink:      #0f172a;
          --indigo:   #4f46e5;
          --blue:     #2563eb;
          --muted:    #64748b;
          --mono:     'IBM Plex Mono', monospace;
          --display:  'Bricolage Grotesque', sans-serif;
          --body:     'Geist', sans-serif;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--ink);
          font-family: var(--body);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* Typography helpers */
        .display  { font-family: var(--display); }
        .mono     { font-family: var(--mono); }
        .body     { font-family: var(--body); }

        /* Stat number */
        .stat-num   { font-family: var(--mono); font-size: 2.5rem; font-weight: 600; color: var(--indigo); line-height: 1; }
        .stat-label { font-family: var(--mono); font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; }

        /* Hero gradient mesh */
        .hero-mesh {
          background:
            radial-gradient(ellipse 65% 55% at 50% -5%, rgba(79,70,229,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 40% 35% at 90% 50%, rgba(37,99,235,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 30% 30% at 10% 80%, rgba(139,92,246,0.05) 0%, transparent 60%);
        }

        /* Dot grid */
        .dot-grid {
          background-image: radial-gradient(circle, rgba(79,70,229,0.12) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Line grid */
        .line-grid {
          background-image:
            linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Animations */
        @keyframes float-a {
          0%, 100% { transform: translateY(0)   rotate(-1deg); }
          50%       { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes float-b {
          0%, 100% { transform: translateY(0)   rotate(1deg); }
          50%       { transform: translateY(-6px) rotate(-0.5deg); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes shimmer-text {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes draw-line {
          from { stroke-dashoffset: 300; }
          to   { stroke-dashoffset: 0; }
        }

        .animate-float-a      { animation: float-a 4.5s ease-in-out infinite; }
        .animate-float-b      { animation: float-b 5.5s ease-in-out infinite; }
        .animate-marquee      { animation: marquee 30s linear infinite; }

        .s1 { animation: fade-up 0.55s ease both 0.05s; }
        .s2 { animation: fade-up 0.55s ease both 0.18s; }
        .s3 { animation: fade-up 0.55s ease both 0.3s; }
        .s4 { animation: fade-up 0.55s ease both 0.42s; }
        .s5 { animation: fade-up 0.55s ease both 0.54s; }
        .s6 { animation: fade-up 0.55s ease both 0.66s; }

        /* Gradient headline */
        .gradient-headline {
          font-family: var(--display);
          background: linear-gradient(135deg, #4f46e5 0%, #2563eb 40%, #7c3aed 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 4s ease infinite;
        }

        /* Pill badge */
        .pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 11px;
          font-family: var(--mono);
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid;
        }
        .pill-indigo { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }
        .pill-blue   { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
        .pill-emerald { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .pill-amber  { background: #fffbeb; color: #d97706; border-color: #fde68a; }
        .pill-violet { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
        .pill-rose   { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }

        /* Feature icon box */
        .icon-box {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid;
          flex-shrink: 0;
        }
        .icon-box-indigo { background: #eef2ff; border-color: #c7d2fe; }
        .icon-box-blue   { background: #eff6ff; border-color: #bfdbfe; }
        .icon-box-emerald { background: #ecfdf5; border-color: #a7f3d0; }
        .icon-box-violet { background: #f5f3ff; border-color: #ddd6fe; }
        .icon-box-amber  { background: #fffbeb; border-color: #fde68a; }
        .icon-box-rose   { background: #fff1f2; border-color: #fecdd3; }

        /* Navbar glass */
        .nav-glass {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(79,70,229,0.08);
          box-shadow: 0 1px 20px rgba(15,23,42,0.06);
        }

        /* Primary button */
        .btn-primary {
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          color: white;
          font-weight: 600;
          border-radius: 14px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(79,70,229,0.3);
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(79,70,229,0.4);
          filter: brightness(1.08);
        }

        /* Secondary button */
        .btn-secondary {
          background: white;
          color: var(--ink);
          font-weight: 500;
          border-radius: 14px;
          border: 1px solid var(--border);
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          border-color: #c7d2fe;
          box-shadow: 0 4px 16px rgba(79,70,229,0.08);
          transform: translateY(-1px);
        }

        /* Noise texture overlay */
        .noise::after {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
          z-index: 0;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f8f9fc; }
        ::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 99px; }
      `}</style>

      <div className="min-h-screen" style={{ background: "var(--bg)" }}>

        {/* ══════════ NAVBAR ══════════ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "nav-glass" : "bg-transparent"}`}>
          <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
              </div>
              <span className="display font-bold text-slate-900 text-sm tracking-tight">AI Ops <span className="text-indigo-600">TaskFlow</span></span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-0.5">
              {["Features", "Workflow", "Pricing", "Team"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="body text-sm text-slate-500 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-all duration-200 font-medium">
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="body text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium px-3 py-1.5">
                Sign in
              </Link>
              <Link href="/register" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-1.5">
                Get Started
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-500 hover:text-slate-900">
              {mobileOpen
                ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-5 py-4 space-y-1">
              {["Features", "Workflow", "Pricing", "Team"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                  className="block text-sm text-slate-600 hover:text-slate-900 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-all">
                  {item}
                </a>
              ))}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link href="/login" className="text-sm text-center text-slate-500 py-2.5">Sign in</Link>
                <Link href="/register" className="btn-primary text-sm text-center py-3 block">Get Started Free</Link>
              </div>
            </div>
          )}
        </nav>

        {/* ══════════ HERO ══════════ */}
        <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-5 pt-24 pb-20 overflow-hidden">
          {/* Backgrounds */}
          <div className="absolute inset-0 hero-mesh pointer-events-none" />
          <div className="absolute inset-0 dot-grid pointer-events-none opacity-60" />

          {/* Mouse follow spotlight */}
          <div className="absolute pointer-events-none rounded-full blur-3xl opacity-[0.08] w-80 h-80"
            style={{
              background: "radial-gradient(circle, rgba(79,70,229,1) 0%, transparent 70%)",
              left: mousePos.x - 160, top: mousePos.y - 160,
              transition: "left 0.12s ease-out, top 0.12s ease-out",
            }}
          />

          {/* Decorative arcs */}
          <svg className="absolute top-20 right-10 w-64 h-64 opacity-[0.06] pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="#4f46e5" strokeWidth="1" strokeDasharray="6 4" />
            <circle cx="100" cy="100" r="55" stroke="#2563eb" strokeWidth="0.8" strokeDasharray="4 6" />
            <circle cx="100" cy="100" r="30" stroke="#7c3aed" strokeWidth="0.6" />
          </svg>
          <svg className="absolute bottom-20 left-10 w-48 h-48 opacity-[0.05] pointer-events-none hidden lg:block" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="70" stroke="#4f46e5" strokeWidth="1.2" strokeDasharray="8 4" />
          </svg>

          {/* Trust pill */}
          <div className="s1 pill-badge pill-indigo mb-6">
            <div className="relative flex">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </div>
            Built for AI Operations Teams
          </div>

          {/* Headline */}
          <h1 className="s2 display text-5xl md:text-7xl lg:text-[80px] text-slate-900 max-w-5xl leading-[1.04] tracking-tight mb-5">
            The Workflow Platform<br />
            <span className="gradient-headline">AI Ops Teams Love</span>
          </h1>

          <p className="s3 body text-slate-500 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
            Manage annotation tasks, review pipelines, evaluation workflows, and QA processes — with built-in AI assistance, structured validation, and real-time analytics.
          </p>

          {/* CTAs */}
          <div className="s4 flex flex-col sm:flex-row items-center gap-3 mb-12">
            <Link href="/register" className="btn-primary px-7 py-3.5 text-sm flex items-center gap-2 group">
              Start Free Today
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="#features" className="btn-secondary px-7 py-3.5 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10} /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" /></svg>
              See the demo
            </Link>
          </div>

          {/* Trust signals */}
          <div className="s5 flex flex-wrap items-center justify-center gap-5 mb-16">
            {["No credit card required", "Free tier forever", "Deploy in minutes", "TypeScript-first"].map((t) => (
              <span key={t} className="mono flex items-center gap-1.5 text-[11px] text-slate-400">
                <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {t}
              </span>
            ))}
          </div>

          {/* Dashboard mockup */}
          <div className="s6 w-full max-w-3xl mx-auto">
            <DashboardMockup />
          </div>
        </section>

        {/* ══════════ MARQUEE ══════════ */}
        <div className="border-y border-slate-100 py-4 bg-slate-50 overflow-hidden">
          <div className="flex gap-10 animate-marquee whitespace-nowrap" aria-hidden>
            {[
              "TypeScript", "Next.js 15", "Drizzle ORM", "PostgreSQL", "Better Auth",
              "Zustand", "React Hook Form", "Zod Validation", "TanStack Table", "Recharts",
              "RBAC", "Activity Logs", "AI Evaluation", "REST APIs", "Railway Deploy",
              "TypeScript", "Next.js 15", "Drizzle ORM", "PostgreSQL", "Better Auth",
              "Zustand", "React Hook Form", "Zod Validation", "TanStack Table", "Recharts",
              "RBAC", "Activity Logs", "AI Evaluation", "REST APIs", "Railway Deploy",
            ].map((item, i) => (
              <span key={i} className="mono text-xs text-slate-400 flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-indigo-300 inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════ STATS ══════════ */}
        <section className="py-20 px-5 bg-white">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
            <KpiStat value={1200} suffix="+" label="Evaluations Run" />
            <KpiStat value={98} suffix="%" label="Validation Coverage" />
            <KpiStat value={340} suffix="+" label="Workflows Created" />
            <KpiStat value={12} suffix="ms" label="Avg API Response" />
          </div>
        </section>

        {/* ══════════ FEATURES BENTO ══════════ */}
        <section id="features" className="py-24 px-5 md:px-8 bg-slate-50 line-grid">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="pill-badge pill-indigo mb-5 inline-flex">All-in-One Platform</span>
              <h2 className="display text-4xl md:text-5xl text-slate-900 leading-tight mb-4">
                Every feature your<br />
                <span className="gradient-headline">AI ops team needs</span>
              </h2>
              <p className="body text-slate-500 max-w-xl mx-auto text-base leading-relaxed">
                From structured evaluation pipelines to dashboard analytics — everything engineered for AI operations workflows.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* 1 — Large: Authentication & RBAC */}
              <div className="lg:col-span-2">
                <BentoCard className="p-7 h-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="icon-box icon-box-indigo">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                      <Tag color="indigo">Better Auth · RBAC</Tag>
                      <h3 className="display font-bold text-slate-900 text-lg mt-2">Role-Based Access Control</h3>
                      <p className="body text-slate-500 text-sm mt-1 leading-relaxed">Admins orchestrate, reviewers execute. Two-tier RBAC with session handling, protected routes, and middleware — production-grade from day one.</p>
                    </div>
                  </div>
                  {/* Role card mockup */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { role: "Admin", perms: ["Create projects", "Assign reviewers", "View analytics", "Export reports"], color: "bg-indigo-600", badge: "indigo" },
                      { role: "Reviewer", perms: ["Update tasks", "Submit evaluations", "Add comments", "Complete reviews"], color: "bg-blue-500", badge: "blue" },
                    ].map((r) => (
                      <div key={r.role} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-6 h-6 rounded-lg ${r.color} flex items-center justify-center text-[9px] font-bold text-white`}>{r.role[0]}</div>
                          <span className="mono text-xs font-bold text-slate-700">{r.role}</span>
                          <Tag color={r.badge as any}>{r.badge === "indigo" ? "Full Access" : "Scoped"}</Tag>
                        </div>
                        <ul className="space-y-1.5">
                          {r.perms.map((p) => (
                            <li key={p} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                              <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </BentoCard>
              </div>

              {/* 2 — AI Assistant */}
              <BentoCard className="p-7">
                <div className="flex items-start gap-3 mb-5">
                  <div className="icon-box icon-box-violet">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <div>
                    <Tag color="violet">AI Feature</Tag>
                    <h3 className="display font-bold text-slate-900 text-base mt-2">AI Evaluation Assistant</h3>
                    <p className="body text-slate-500 text-xs mt-1 leading-relaxed">Enter a prompt-response pair and get instant AI-powered scores for relevance, coherence, safety, and hallucination risk.</p>
                  </div>
                </div>
                {/* AI score mockup */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-2.5">
                  {[
                    { label: "Relevance", score: 4.7, color: "bg-indigo-500", w: "94%" },
                    { label: "Coherence", score: 4.2, color: "bg-blue-500", w: "84%" },
                    { label: "Safety", score: 4.9, color: "bg-emerald-500", w: "98%" },
                    { label: "Hallucination Risk", score: 1.2, color: "bg-rose-500", w: "24%" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between mb-1">
                        <span className="mono text-[10px] text-slate-500">{m.label}</span>
                        <span className="mono text-[10px] font-bold text-slate-700">{m.score}/5</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.color} transition-all duration-1000`} style={{ width: m.w }} />
                      </div>
                    </div>
                  ))}
                </div>
              </BentoCard>

              {/* 3 — Activity Logs */}
              <BentoCard className="p-7 lg:row-span-1">
                <div className="flex items-start gap-3 mb-5">
                  <div className="icon-box icon-box-emerald">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                  <div>
                    <Tag color="emerald">Audit Trail</Tag>
                    <h3 className="display font-bold text-slate-900 text-base mt-2">Activity Logs</h3>
                    <p className="body text-slate-500 text-xs mt-1">Full audit trail of every workflow action, status change, and review submission.</p>
                  </div>
                </div>
                <ActivityFeed />
              </BentoCard>

              {/* 4 — Evaluation Metadata */}
              <BentoCard className="p-7">
                <div className="flex items-start gap-3 mb-5">
                  <div className="icon-box icon-box-amber">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  </div>
                  <div>
                    <Tag color="amber">Structured Data</Tag>
                    <h3 className="display font-bold text-slate-900 text-base mt-2">Evaluation Metadata</h3>
                    <p className="body text-slate-500 text-xs mt-1 leading-relaxed">Rich task metadata: type, severity, confidence score, QA status. Aligned with real AI ops workflows.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    ["Evaluation Type", "Safety", "bg-rose-100 text-rose-700"],
                    ["Severity", "High", "bg-red-100  text-red-700"],
                    ["Confidence", "4/5", "bg-green-100 text-green-700"],
                    ["QA Status", "Reviewed", "bg-blue-100 text-blue-700"],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="mono text-[11px] text-slate-500">{k as string}</span>
                      <span className={`mono text-[10px] font-bold px-2 py-0.5 rounded-full ${c as string}`}>{v as string}</span>
                    </div>
                  ))}
                </div>
              </BentoCard>

              {/* 5 — Dashboard Analytics — wide */}
              <div className="lg:col-span-2">
                <BentoCard className="p-7 h-full">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="icon-box icon-box-blue">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <div>
                      <Tag color="blue">Recharts · Analytics</Tag>
                      <h3 className="display font-bold text-slate-900 text-base mt-2">Dashboard Analytics</h3>
                      <p className="body text-slate-500 text-xs mt-1">Reviewer productivity, project completion trends, evaluation distribution, and overdue analytics.</p>
                    </div>
                  </div>
                  {/* Chart mockup */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Tasks Completed", val: "31/48", color: "indigo" },
                      { label: "Overdue", val: "5", color: "rose" },
                      { label: "Approval Rate", val: "87%", color: "emerald" },
                    ].map((k, i) => (
                      <div key={i} className={`rounded-xl border p-3 ${k.color === "rose" ? "bg-rose-50 border-rose-100" : k.color === "emerald" ? "bg-emerald-50 border-emerald-100" : "bg-indigo-50 border-indigo-100"}`}>
                        <p className="mono text-[9px] text-slate-500 mb-0.5">{k.label}</p>
                        <p className={`mono text-xl font-bold ${k.color === "rose" ? "text-rose-700" : k.color === "emerald" ? "text-emerald-700" : "text-indigo-700"}`}>{k.val}</p>
                      </div>
                    ))}
                  </div>
                  {/* Bar chart */}
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <p className="mono text-[10px] text-slate-400 mb-3">Weekly Evaluations</p>
                    <div className="flex items-end gap-2 h-20">
                      {[
                        { h: 40, label: "Mon", color: "bg-indigo-300" },
                        { h: 65, label: "Tue", color: "bg-indigo-400" },
                        { h: 50, label: "Wed", color: "bg-indigo-300" },
                        { h: 85, label: "Thu", color: "bg-indigo-500" },
                        { h: 72, label: "Fri", color: "bg-indigo-400" },
                        { h: 30, label: "Sat", color: "bg-slate-300" },
                        { h: 20, label: "Sun", color: "bg-slate-200" },
                      ].map((b, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-full rounded-t-md ${b.color} transition-all duration-700`} style={{ height: `${b.h}%` }} />
                          <span className="mono text-[8px] text-slate-400">{b.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </BentoCard>
              </div>

              {/* 6 — Validation */}
              <BentoCard className="p-7">
                <div className="flex items-start gap-3 mb-5">
                  <div className="icon-box icon-box-rose">
                    <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <Tag color="rose">Zod Everywhere</Tag>
                    <h3 className="display font-bold text-slate-900 text-base mt-2">Validation-First</h3>
                    <p className="body text-slate-500 text-xs mt-1 leading-relaxed">Zod schemas on every form, every API route, every server action. Type-safe end-to-end with full schema inference.</p>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs overflow-hidden">
                  <p className="text-slate-500 mb-2">// Task evaluation schema</p>
                  <p><span className="text-violet-400">const</span> <span className="text-blue-300">taskSchema</span> = <span className="text-yellow-300">z</span>.<span className="text-emerald-400">object</span>{"({"}</p>
                  <p className="pl-3"><span className="text-slate-300">title:</span> <span className="text-yellow-300">z</span>.<span className="text-emerald-400">string</span>().<span className="text-blue-400">min</span>(<span className="text-orange-300">3</span>),</p>
                  <p className="pl-3"><span className="text-slate-300">type:</span> <span className="text-yellow-300">z</span>.<span className="text-emerald-400">enum</span>([<span className="text-green-300">"Safety"</span>, <span className="text-green-300">"Accuracy"</span>]),</p>
                  <p className="pl-3"><span className="text-slate-300">score:</span> <span className="text-yellow-300">z</span>.<span className="text-emerald-400">number</span>().<span className="text-blue-400">min</span>(<span className="text-orange-300">1</span>).<span className="text-blue-400">max</span>(<span className="text-orange-300">5</span>),</p>
                  <p className="pl-3"><span className="text-slate-300">severity:</span> <span className="text-yellow-300">z</span>.<span className="text-emerald-400">enum</span>([<span className="text-green-300">"Low"</span>, <span className="text-green-300">"High"</span>]),</p>
                  <p>{"})"};</p>
                </div>
              </BentoCard>

            </div>
          </div>
        </section>

        {/* ══════════ WORKFLOW ══════════ */}
        <section id="workflow" className="py-24 px-5 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="pill-badge pill-violet mb-5 inline-flex">How It Works</span>
              <h2 className="display text-4xl md:text-5xl text-slate-900 leading-tight mb-5">
                Built for<br />
                <span className="gradient-headline">AI evaluation pipelines</span>
              </h2>
              <p className="body text-slate-500 leading-relaxed mb-8 text-base">
                A structured workflow that handles real AI ops work. Create projects, assign tasks, run evaluations, review results, and export insights.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Organize Work", desc: "Projects group related evaluation tasks together", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
                  { label: "Assign Tasks", desc: "Reviewers get their own task queues to work through", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
                  { label: "Run Reviews", desc: "Submit evaluations with scores and detailed feedback", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                  { label: "Export Data", desc: "Pull reports or push data to your training pipeline", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-indigo-100">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 flex-shrink-0 group-hover:bg-violet-100 group-hover:scale-110 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <p className="display font-semibold text-slate-900 text-sm mb-0.5 group-hover:text-indigo-600 transition-colors">{item.label}</p>
                      <p className="body text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 shadow-sm">
              <p className="mono text-[10px] text-slate-400 uppercase tracking-widest mb-5">Live Workflow State</p>
              <WorkflowDiagram />
            </div>
          </div>
        </section>

        {/* ══════════ TECH STACK ══════════ */}
        <section className="py-20 px-5 md:px-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="pill-badge pill-emerald mb-4 inline-flex">Engineering Quality</span>
              <h2 className="display text-3xl md:text-4xl text-slate-900 leading-tight">Production-grade stack, zero shortcuts</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Next.js 15", desc: "App Router · Turbopack", tag: "Framework", color: "border-slate-300 bg-white" },
                { name: "TypeScript", desc: "End-to-end type safety", tag: "Language", color: "border-blue-200 bg-blue-50" },
                { name: "Drizzle ORM", desc: "SQL-first · Relational", tag: "Database", color: "border-indigo-200 bg-indigo-50" },
                { name: "PostgreSQL", desc: "Railway · Neon", tag: "Storage", color: "border-violet-200 bg-violet-50" },
                { name: "Better Auth", desc: "Sessions · OAuth", tag: "Auth", color: "border-emerald-200 bg-emerald-50" },
                { name: "Zustand", desc: "Scalable state", tag: "State", color: "border-amber-200 bg-amber-50" },
                { name: "Zod + RHF", desc: "Validation everywhere", tag: "Forms", color: "border-rose-200 bg-rose-50" },
                { name: "TanStack Table", desc: "Advanced data grids", tag: "UI", color: "border-sky-200 bg-sky-50" },
              ].map((tech, i) => (
                <div key={i} className={`rounded-xl border p-4 ${tech.color} card-hover`}>
                  <p className="mono text-[9px] text-slate-400 uppercase tracking-widest mb-1">{tech.tag}</p>
                  <p className="display font-bold text-slate-900 text-sm mb-0.5">{tech.name}</p>
                  <p className="body text-slate-400 text-[11px]">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section id="team" className="py-24 px-5 md:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="pill-badge pill-blue mb-5 inline-flex">Testimonials</span>
              <h2 className="display text-4xl md:text-5xl text-slate-900 leading-tight">
                Trusted by ops teams
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              <Testimonial
                quote="Finally a workflow tool that understands AI data operations. The evaluation metadata fields map directly to our annotation quality framework."
                name="Anika Sharma" role="ML Ops Lead · Bangalore" initials="AS" color="bg-indigo-500" delay={0}
              />
              <Testimonial
                quote="The RBAC implementation is exactly what we needed. Admins orchestrate the pipeline, reviewers stay focused on their queue. Clean and fast."
                name="Ravi Menon" role="Data Ops Manager · Mumbai" initials="RM" color="bg-violet-500" delay={100}
              />
              <Testimonial
                quote="Activity logs + dashboard analytics together give us complete visibility into our RLHF pipeline. Reduced review cycle time by 40%."
                name="Preethi Nair" role="AI Research Lead · Hyderabad" initials="PN" color="bg-emerald-500" delay={200}
              />
            </div>
          </div>
        </section>

        {/* ══════════ PRICING ══════════ */}
        <section id="pricing" className="py-24 px-5 md:px-8 bg-slate-50 line-grid">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="pill-badge pill-indigo mb-5 inline-flex">Simple Pricing</span>
              <h2 className="display text-4xl md:text-5xl text-slate-900 leading-tight mb-3">
                Start free, scale with your team
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  plan: "Starter", price: "Free", period: "", highlight: false, badge: "",
                  features: ["5 projects", "3 team members", "Basic evaluations", "Activity logs (7d)", "Email support"],
                },
                {
                  plan: "Pro", price: "₹1,499", period: "/month", highlight: true, badge: "Most Popular",
                  features: ["Unlimited projects", "15 team members", "AI evaluation assistant", "Advanced filters", "Full audit logs", "Analytics dashboard", "Priority support"],
                },
                {
                  plan: "Enterprise", price: "Custom", period: "", highlight: false, badge: "",
                  features: ["Unlimited everything", "SSO & SCIM", "Custom AI models", "API access", "SLA guarantee", "Dedicated CSM", "On-premise option"],
                },
              ].map((p) => (
                <div key={p.plan} className={`relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${p.highlight
                    ? "bg-gradient-to-b from-indigo-50 to-white border-indigo-300 shadow-[0_8px_40px_rgba(79,70,229,0.12)]"
                    : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-lg"
                  }`}>
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-indigo-600 text-white mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{p.badge}</span>
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="mono text-[11px] text-slate-400 uppercase tracking-widest mb-2">{p.plan}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="display text-4xl font-bold text-slate-900">{p.price}</span>
                      {p.period && <span className="mono text-sm text-slate-400">{p.period}</span>}
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 body text-sm text-slate-600">
                        <svg className={`w-4 h-4 flex-shrink-0 ${p.highlight ? "text-indigo-500" : "text-emerald-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${p.highlight ? "btn-primary" : "btn-secondary"
                    }`}>
                    {p.plan === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ CTA ══════════ */}
        <section className="py-24 px-5 md:px-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-3xl border border-indigo-100 overflow-hidden noise"
              style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f8f9ff 40%, #eff6ff 100%)" }}>
              {/* Radial light */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(79,70,229,0.12) 0%, transparent 70%)" }} />
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
              {/* Dot grid overlay */}
              <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

              <div className="relative z-10 text-center p-12 md:p-16">
                <div className="pill-badge pill-indigo inline-flex mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Align with Ethara AI's JD directly
                </div>
                <h2 className="display text-4xl md:text-5xl text-slate-900 leading-tight mb-5">
                  Ready to show what you can build?
                </h2>
                <p className="body text-slate-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                  A production-grade AI Ops workflow platform that demonstrates engineering maturity, structured data handling, validation pipelines, RBAC, and analytical dashboards — exactly what reviewers are looking for.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/register" className="btn-primary px-8 py-3.5 text-sm flex items-center gap-2 group">
                    Deploy to Railway
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                  <a href="https://github.com" className="btn-secondary px-7 py-3.5 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    View on GitHub
                  </a>
                </div>

                {/* Tech stack chips */}
                <div className="mt-10 flex flex-wrap justify-center gap-2">
                  {["Next.js 15", "TypeScript", "Drizzle ORM", "Better Auth", "Zustand", "Zod", "PostgreSQL", "Railway"].map((t) => (
                    <span key={t} className="pill-badge pill-indigo text-[9px]">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer className="border-t border-slate-100 pt-16 pb-8 px-5 md:px-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
              {/* Brand */}
              <div className="col-span-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" /></svg>
                  </div>
                  <span className="display font-bold text-slate-900">AI Ops <span className="text-indigo-600">TaskFlow</span></span>
                </div>
                <p className="body text-slate-400 text-sm leading-relaxed max-w-xs mb-5">
                  The internal workflow platform for AI data operations teams — evaluation pipelines, reviewer workflows, and analytics dashboards.
                </p>
                <div className="flex gap-2.5">
                  {["M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z", "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22", "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"].map((d, i) => (
                    <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>
                    </a>
                  ))}
                </div>
              </div>
              {/* Links */}
              {[
                { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
                { title: "Docs", links: ["Getting Started", "API Reference", "Schema", "Deployment"] },
                { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="mono text-[11px] font-bold text-slate-700 uppercase tracking-widest mb-4">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="body text-slate-400 hover:text-slate-700 text-sm transition-colors">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="mono text-[11px] text-slate-400">© 2026 AI Ops TaskFlow. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="mono text-[10px] text-slate-400">All systems operational</span>
                </div>
                <span className="mono text-[10px] text-slate-300">·</span>
                <span className="mono text-[10px] text-slate-400">Built with Next.js 15 · Deployed on Railway</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}