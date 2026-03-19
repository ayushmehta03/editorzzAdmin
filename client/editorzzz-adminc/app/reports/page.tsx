"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  User,
  ChevronRight,
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
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
  
  const router = useRouter();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports();
      const normalized = (res?.reports || []).map((r: any) => ({
        id: r.ID,
        reason: r.reason,
        status: r.status,
        suspect_name: r.SuspectUname,
        reporter_email: r.reporter_email,
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

  const filteredReports = reports.filter(r => 
    filter === "all" ? true : r.status === filter
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 font-sans">
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-red-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-[#020617]/70 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-xl border border-red-500/20 shadow-inner">
              <ShieldAlert className="text-red-500" size={20} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold tracking-tight text-white leading-none mb-1">Security Center</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Moderation Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search cases..." 
                className="bg-slate-900/50 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 transition-all w-64"
              />
            </div>
            <button className="p-2 rounded-full border border-slate-800 hover:bg-slate-900 transition-colors">
              <Filter size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        {/* Statistics & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            {["all", "pending", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  filter === f ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {f} {filter === f && <motion.div layoutId="underline" className="h-0.5 bg-indigo-500 mt-1 rounded-full" />}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium italic">
            Showing {filteredReports.length} total incidents
          </p>
        </div>

        {/* Content Area */}
        <section className="space-y-4">
          {loading ? (
            <SkeletonLoader />
          ) : filteredReports.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="py-20 text-center border border-dashed border-slate-800 rounded-3xl"
            >
              <div className="inline-flex p-4 rounded-full bg-slate-900/50 mb-4">
                <AlertCircle className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">No reports found in this category.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report, i) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -4, backgroundColor: "rgba(30, 41, 59, 0.5)" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => router.push(`/admin/reports/${report.id}`)}
                  className={`group relative overflow-hidden cursor-pointer bg-[#0f172a]/40 border border-slate-800/80 rounded-2xl transition-all shadow-xl hover:shadow-indigo-500/5 ${
                    report.status === "resolved" ? "opacity-60" : ""
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Card Top Header */}
                    <div className="flex justify-between items-start">
                      <div className={`px-2.5 py-1 text-[10px] rounded-md font-black uppercase tracking-[0.1em] border shadow-sm ${
                        report.status === "pending"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {report.status}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={13} />
                        <span className="text-xs font-medium">{report.created_at}</span>
                      </div>
                    </div>

                    {/* Involved Parties Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Reporter</p>
                          <p className="text-sm font-semibold truncate text-slate-200">@{report.reporter_email.split('@')[0]}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                          <User size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Suspect</p>
                          <p className="text-sm font-semibold truncate text-slate-200">@{report.suspect_name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="relative group/reason">
                      <p className="text-[10px] text-slate-500 uppercase font-extrabold mb-1.5 tracking-tight flex items-center gap-1.5">
                        <span className="w-1 h-3 bg-indigo-500 rounded-full" /> Case Description
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 pl-2.5">
                        {report.reason}
                      </p>
                    </div>

                    {/* Card Action Footer */}
                    <div className="pt-2 flex justify-end items-center border-t border-slate-800/50">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-indigo-400 transition-colors uppercase tracking-wider">
                        View Details <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
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

function SkeletonLoader() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 animate-pulse">
          <div className="flex justify-between mb-8">
            <div className="h-6 w-24 bg-slate-800 rounded-md" />
            <div className="h-4 w-32 bg-slate-800 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="h-14 bg-slate-800 rounded-xl" />
            <div className="h-14 bg-slate-800 rounded-xl" />
          </div>
          <div className="h-20 bg-slate-800 rounded-xl" />
        </div>
      ))}
    </>
  );
}