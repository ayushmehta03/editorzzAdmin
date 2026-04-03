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
  Loader2,
  ShieldAlert,
  Info,
  Maximize2,
  FileText,
  Gavel,
  History,
  X,
  ExternalLink,
  EyeOff
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
  info: string;
  reporter_email: string;
  reported_id: string;
  submission_id: string;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | {
    label: string;
    action: () => Promise<any>;
    successMsg: string;
    variant: "red" | "orange" | "slate";
  }>(null);

  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getReportById(params.id as string);
      setReport({
        id: res.ID || res.id,
        info: res.info || "No additional information provided.",
        reason: res.reason,
        status: res.status,
        suspect_name: res.suspect_name || "Unknown User",
        reporter_email: res.reporter_email,
        reported_id: res.reported_id,
        submission_id: res.submission_id,
        submission: res.submission || null,
      });
    } catch {
      toast.error("Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleFinalAction = async () => {
    if (!confirmAction || isProcessing) return;
    setIsProcessing(true);
    try {
      await confirmAction.action();
      await resolveReport(report!.id);
      setShowSuccess(true);
      setTimeout(() => {
        toast.success(confirmAction.successMsg);
        router.push("/reports");
      }, 1200);
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Decrypting Case File</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-rose-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-rose-500/5 to-transparent" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest leading-none mb-1">Investigation</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">Case #{report.id.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${
            report.status === "pending"
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5"
          }`}>
            {report.status}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 pb-56 space-y-8 relative">
        
        {/* Parties Involved */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/40 p-5 rounded-[2rem] border border-white/5 group hover:border-rose-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                <ShieldAlert size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Target Suspect</p>
                <p className="font-bold text-lg text-white truncate animate-pulse">@{report.suspect_name}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-[2rem] border border-white/5 group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <History size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Intelligence Provider</p>
                <p className="font-bold text-slate-300 truncate">{report.reporter_email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Evidence Content */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 ml-2">
            <FileText size={14} className="text-rose-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Violation Records</h3>
          </div>

          <div className="grid gap-4">
            <div className="bg-rose-500/[0.03] border border-rose-500/10 p-6 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-rose-500" />
                <p className="text-[10px] font-black text-rose-500 uppercase">Primary Reason</p>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed">{report.reason}</p>
            </div>

            <div className="bg-blue-500/[0.03] border border-blue-500/10 p-6 rounded-[2rem]">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-blue-500" />
                <p className="text-[10px] font-black text-blue-500 uppercase">Contextual Notes</p>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{report.info}</p>
            </div>
          </div>
        </section>

        {/* Media Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between ml-2">
            <div className="flex items-center gap-3">
              <Maximize2 size={14} className="text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Exhibit A: Media Evidence</h3>
            </div>
          </div>

          <div className="relative group bg-slate-950 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
            {report.submission ? (
              <div className="w-full">
                {report.submission.media_url.match(/\.(mp4|webm)$/) ? (
                  <video
                    src={report.submission.media_url}
                    controls
                    className="w-full aspect-video"
                  />
                ) : (
                  <img
                    src={report.submission.media_url}
                    alt="Evidence"
                    className="w-full h-auto max-h-[600px] object-contain bg-black/40"
                  />
                )}
                <div className="p-5 bg-black/60 backdrop-blur-md border-t border-white/5 flex items-center justify-between">
                   <p className="text-xs font-bold text-slate-300 italic">Title: {report.submission.title}</p>
                   <a href={report.submission.media_url} target="_blank" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <ExternalLink size={14} />
                      
                   </a>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="p-5 bg-slate-900 rounded-full inline-block">
                  <EyeOff className="text-slate-700" size={32} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-600">Content Purged or Unavailable</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-40">
        <div className="max-w-2xl mx-auto bg-[#020617]/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ActionButton
              label="Dismiss"
              sub="No violation"
              icon={<CheckCircle size={18} />}
              onClick={() =>
                setConfirmAction({
                  label: "Dismiss Report",
                  action: async () => {},
                  successMsg: "Case dismissed successfully",
                  variant: "slate"
                })
              }
              className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
            />

            {report.submission && (
              <ActionButton
                label="Purge"
                sub="Remove Content"
                icon={<Trash2 size={18} />}
                onClick={() =>
                  setConfirmAction({
                    label: "Remove Content",
                    action: () => deleteSubmission(report.submission_id),
                    successMsg: "Content removed from system",
                    variant: "orange"
                  })
                }
                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20"
              />
            )}

            <ActionButton
              label="Terminate"
              sub="Permanent Ban"
              icon={<Ban size={18} />}
              onClick={() =>
                setConfirmAction({
                  label: "Ban User Account",
                  action: () => updateUserBan(report.reported_id, true),
                  successMsg: "User access revoked",
                  variant: "red"
                })
              }
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 col-span-2 md:col-span-1"
            />
          </div>
        </div>
      </div>

      {/* Modern Confirm Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
               
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <Gavel size={24} className={confirmAction.variant === 'red' ? 'text-rose-500' : 'text-orange-500'} />
                  </div>
                  <button onClick={() => setConfirmAction(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} className="text-slate-500" />
                  </button>
               </div>

              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">
                Execute Action?
              </h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Confirming <span className="text-white font-bold underline underline-offset-4 decoration-rose-500">{confirmAction.label}</span>. This protocol is irreversible and will be logged in system history.
              </p>

              <div className="flex gap-3">
                <button
                  disabled={isProcessing}
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Aborted
                </button>
                <button
                  disabled={isProcessing}
                  onClick={handleFinalAction}
                  className={`flex-1 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    confirmAction.variant === 'red' ? 'bg-rose-600 text-white' : 
                    confirmAction.variant === 'orange' ? 'bg-orange-500 text-black' : 'bg-white text-black'
                  }`}
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-[#020617] z-[70]"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-emerald-500 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(16,185,129,0.4)]"
            >
              <CheckCircle size={60} className="text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({ onClick, icon, label, sub, className }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`h-16 flex flex-col items-center justify-center rounded-2xl transition-all ${className}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-black uppercase tracking-widest leading-none">{label}</span>
      </div>
      <span className="text-[8px] font-bold uppercase tracking-tighter opacity-60 mt-1">{sub}</span>
    </motion.button>
  );
}