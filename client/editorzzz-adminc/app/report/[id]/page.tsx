"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Trash2,
  Ban,
  AlertTriangle,
  User,
  Mail,
  ExternalLink,
  Loader2,
  EyeOff,
  Info,
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
    } catch (err) {
      toast.error("Failed to load report details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleFinalAction = async (
    primaryTask: () => Promise<any>,
    successMsg: string
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      await primaryTask();
      await resolveReport(report!.id);
      toast.success(successMsg);
      router.push("/reports");
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="font-bold text-base md:text-lg tracking-tight">
              Report Analysis
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
              report.status === "pending"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            }`}
          >
            {report.status}
          </motion.div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-40 md:pb-12 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "Suspect",
              value: `@${report.suspect_name}`,
              icon: User,
              color: "text-blue-500",
            },
            {
              label: "Reporter",
              value: report.reporter_email,
              icon: Mail,
              color: "text-purple-500",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex items-center gap-4 hover:border-slate-700 transition-colors"
            >
              <item.icon className={item.color} size={20} />
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
                  {item.label}
                </p>
                <p className="font-bold truncate text-slate-200 leading-tight">
                  {item.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex gap-4 items-start shadow-inner"
        >
          <div className="p-2 bg-red-500/10 rounded-xl">
            <AlertTriangle className="text-red-500 shrink-0" size={22} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">
              Incident Report
            </h4>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {report.reason}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl flex gap-4 items-start shadow-inner"
        >
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Info className="text-blue-400 shrink-0" size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
              Additional Info
            </h4>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {report.info}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl"
        >
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-bold text-slate-200 truncate pr-4">
              {report.submission?.title || "Submission Reference"}
            </h3>
            <ExternalLink size={16} className="text-slate-600" />
          </div>

          <div className="aspect-video bg-[#000] flex items-center justify-center overflow-hidden">
            {report.submission ? (
              report.submission.media_url.match(/\.(mp4|webm)$/) ? (
                <video
                  src={report.submission.media_url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={report.submission.media_url}
                  className="w-full h-full object-contain"
                  alt="Content Preview"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500 p-8 text-center">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <EyeOff size={40} className="opacity-20" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">
                  This post has been removed
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 md:pb-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent md:static md:bg-none">
          <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-3">
            <ActionButton
              onClick={() =>
                handleFinalAction(async () => {}, "Report cleared & resolved")
              }
              isLoading={isProcessing}
              icon={<CheckCircle size={20} className="text-emerald-400" />}
              label="Keep Post"
              className="bg-slate-800 hover:bg-slate-700"
            />

            {report.submission && (
              <ActionButton
                onClick={() =>
                  handleFinalAction(
                    () => deleteSubmission(report.submission_id), 
                    "Post removed & resolved"
                  )
                }
                isLoading={isProcessing}
                icon={<Trash2 size={20} />}
                label="Remove Post"
                className="bg-orange-600 hover:bg-orange-500"
              />
            )}

            <ActionButton
              onClick={() =>
                handleFinalAction(
                  () => updateUserBan(report.reported_id, true),
                  "User banned & resolved"
                )
              }
              isLoading={isProcessing}
              icon={<Ban size={20} />}
              label="Ban User"
              className="bg-red-600 hover:bg-red-500"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ActionButton({ onClick, isLoading, icon, label, className }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading}
      onClick={onClick}
      className={`flex-1 h-14 md:h-12 flex items-center justify-center gap-2 rounded-2xl md:rounded-xl font-bold text-xs md:text-sm uppercase tracking-wide transition-all disabled:opacity-50 ${className}`}
    >
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : icon}
      {label}
    </motion.button>
  );
}