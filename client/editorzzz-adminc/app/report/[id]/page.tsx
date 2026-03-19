"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Trash2,
  Ban,
  AlertTriangle,
  User,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import {
  getReportById,
  deleteSubmission,
  resolveReport,
  updateUserBan,
} from "@/lib/api";

interface Report {
  id: string;
  reason: string;
  status: string;
  suspect_name: string;
  reporter_email: string;
  reported_id: string;
  submission?: {
    title: string;
    media_url: string;
  } | null;
}

export default function ReportDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await getReportById(params.id as string);
      // Ensure we map the backend fields correctly to our local state
      setReport({
        id: res.ID || res.id,
        reason: res.reason,
        status: res.status,
        suspect_name: res.suspect_name || "Unknown User",
        reporter_email: res.reporter_email,
        reported_id: res.reported_user?.id || res.reported_id, 
        submission: res.submission || null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    try {
      await action();
      toast.success(successMsg);
      router.push("/admin/reports"); 
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg tracking-tight">Review Report</h1>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
            report.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {report.status}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <User size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Suspect</p>
              <p className="font-medium text-slate-200">@{report.suspect_name}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Mail size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase font-bold text-slate-500">Reporter</p>
              <p className="font-medium text-slate-200 truncate">{report.reporter_email}</p>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex gap-4 items-start"
        >
          <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Violation Reason</h4>
            <p className="text-slate-300 leading-relaxed">{report.reason}</p>
          </div>
        </motion.div>

        {report.submission && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 group shadow-2xl"
          >
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-slate-200">{report.submission.title}</h3>
              <ExternalLink size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="aspect-video bg-black relative">
              {report.submission.media_url.match(/\.(mp4|webm|ogg)$/) ? (
                <video src={report.submission.media_url} controls className="w-full h-full object-contain" />
              ) : (
                <img src={report.submission.media_url} alt="Submission content" className="w-full h-full object-contain" />
              )}
            </div>
          </motion.div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent md:static md:p-0 md:bg-none">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleAction(() => resolveReport(report.id), "Report cleared")}
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all active:scale-95"
            >
              <CheckCircle size={18} className="text-emerald-400" />
              Keep Post
            </button>
            <button 
              onClick={() => handleAction(() => deleteSubmission(report.id), "Content removed")}
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-orange-600/20"
            >
              <Trash2 size={18} />
              Remove Post
            </button>
            <button 
              onClick={() => handleAction(() => updateUserBan(report.reported_id, true), "User banned")}
              className="flex-1 h-12 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-red-600/20"
            >
              <Ban size={18} />
              Ban User
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}