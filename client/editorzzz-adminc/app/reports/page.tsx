"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  User,
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
  Hash,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getReports } from "@/lib/api";

interface Report {
  id: string;
  reason: string;
  status: "pending" | "resolved";
  suspect_name: string;
  reporter_email: string;
  created_at: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports();
      const normalized = (res?.reports || []).map((r: any) => ({
        id: r.ID || r._id,
        reason: r.reason,
        status: r.status || "pending",
        suspect_name: r.SuspectUname || "Unknown",
        reporter_email: r.reporter_email || "Anonymous",
        created_at: formatDate(r.created_at),
      }));
      setReports(normalized);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchesFilter = filter === "all" ? true : r.status === filter;
    const matchesSearch = r.suspect_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-rose-500/30 font-sans pb-20">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px] opacity-50" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-rose-600/5 blur-[120px] opacity-30" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4"
          >
            <div className="relative group">
               <div className="absolute inset-0 bg-rose-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
               <div className="relative p-3 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl">
                <ShieldAlert className="text-rose-500" size={22} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none mb-1 uppercase italic">Intelligence</h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Live Threat Queue</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={14} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search suspect or reason..." 
                className="bg-slate-950 border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-xs focus:outline-none focus:border-rose-500/50 transition-all w-72 placeholder:text-slate-700 font-medium"
              />
            </div>
            <button className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
              <History size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
        {/* Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Tickets" val={reports.length} icon={<Hash size={14}/>} />
            <StatCard label="Pending" val={reports.filter(r => r.status === 'pending').length} icon={<Clock size={14}/>} color="text-amber-500" />
            <StatCard label="Resolved" val={reports.filter(r => r.status === 'resolved').length} icon={<CheckCircle2 size={14}/>} color="text-emerald-500" />
            <StatCard label="High Priority" val={reports.length > 5 ? 'Active' : 'Low'} icon={<AlertTriangle size={14}/>} color="text-rose-500" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-white/5">
          <div className="flex p-1 bg-slate-950 border border-white/5 rounded-xl w-fit">
            {["all", "pending", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`relative px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filter === f ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {filter === f && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white/10 rounded-lg -z-0" />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </div>
        </div>

        <section className="space-y-6">
          {loading ? (
            <SkeletonLoader />
          ) : filteredReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="py-32 text-center border-2 border-dashed border-white/5 rounded-[3rem]"
            >
              <div className="inline-flex p-6 rounded-3xl bg-slate-900/50 mb-6 border border-white/5">
                <SearchX className="text-slate-700" size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-300">No Incident Records</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">The containment facility is currently clear. No active reports found for this sector.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report, i) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => router.push(`/report/${report.id}`)}
                  className="group cursor-pointer"
                >
                  <div className={`relative overflow-hidden bg-slate-900/20 border border-white/5 rounded-[2rem] hover:border-rose-500/30 transition-all duration-500 p-6 md:p-8 ${
                    report.status === "resolved" ? "grayscale opacity-50" : "hover:shadow-[0_20px_50px_rgba(225,29,72,0.05)]"
                  }`}>
                    
                    {/* Top row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                       <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${report.status === 'pending' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-emerald-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                CASE #{report.id.slice(-6).toUpperCase()}
                            </span>
                       </div>
                       <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                <Calendar size={12} className="text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{report.created_at}</span>
                            </div>
                       </div>
                    </div>

                    {/* Entities row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <EntityBox type="reporter" name={report.reporter_email.split('@')[0]} color="blue" />
                        <EntityBox type="suspect" name={report.suspect_name} color="rose" />
                    </div>

                    {/* Content */}
                    <div className="bg-black/20 rounded-2xl p-5 border border-white/5 mb-6">
                        <p className="text-[9px] font-black uppercase text-rose-500/70 tracking-widest mb-3 flex items-center gap-2">
                           <AlertCircle size={10} /> Violation Details
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 italic">
                           "{report.reason}"
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                         <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${
                            report.status === 'pending' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                         }`}>
                            {report.status}
                         </div>
                         <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-slate-500 group-hover:text-white transition-colors">
                            Inspect Case <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                         </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </section>
      </main>
    </div>
  );
}

function EntityBox({ type, name, color }: { type: string, name: string, color: 'blue' | 'rose' }) {
    const isRose = color === 'rose';
    return (
        <div className="flex items-center gap-4 p-4 bg-slate-950/40 border border-white/5 rounded-[1.25rem]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:rotate-6 ${
                isRose ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
            }`}>
                <User size={18} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-0.5">{type}</p>
                <p className="text-sm font-bold text-slate-100 truncate">@{name}</p>
            </div>
        </div>
    )
}

function StatCard({ label, val, icon, color = "text-slate-400" }: any) {
    return (
        <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
                <span className={color}>{icon}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
            </div>
            <p className="text-xl font-black text-white">{val}</p>
        </div>
    )
}

function SearchX(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
}

function SkeletonLoader() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900/10 border border-white/5 rounded-[2rem] p-8 animate-pulse space-y-6">
          <div className="flex justify-between">
            <div className="h-4 w-32 bg-slate-800 rounded-full" />
            <div className="h-4 w-24 bg-slate-800 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-800 rounded-2xl" />
            <div className="h-16 bg-slate-800 rounded-2xl" />
          </div>
          <div className="h-24 bg-slate-800 rounded-2xl" />
        </div>
      ))}
    </>
  );
}