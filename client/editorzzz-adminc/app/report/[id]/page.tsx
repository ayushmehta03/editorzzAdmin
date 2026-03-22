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

  const [confirmAction, setConfirmAction] = useState<null | {
    label: string;
    action: () => Promise<any>;
    successMsg: string;
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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-800 rounded-xl"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold">Report Analysis</h1>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              report.status === "pending"
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {report.status}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-2xl mx-auto p-4 pb-40 space-y-6">
        {/* USER INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "Suspect",
              value: `@${report.suspect_name}`,
              icon: User,
            },
            {
              label: "Reporter",
              value: report.reporter_email,
              icon: Mail,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 flex items-center gap-3"
            >
              <item.icon size={18} />
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* REASON */}
        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
          <p className="text-red-400 text-xs uppercase">Reason</p>
          <p>{report.reason}</p>
        </div>

        {/* INFO */}
        <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
          <p className="text-blue-400 text-xs uppercase">Info</p>
          <p>{report.info}</p>
        </div>

        {/* MEDIA */}
        <div className="bg-slate-900 rounded-xl overflow-hidden">
          {report.submission ? (
            report.submission.media_url.match(/\.(mp4|webm)$/) ? (
              <video
                src={report.submission.media_url}
                controls
                className="w-full"
              />
            ) : (
              <img
                src={report.submission.media_url}
                className="w-full"
              />
            )
          ) : (
            <div className="p-10 text-center text-slate-500">
              Removed
            </div>
          )}
        </div>
      </main>

      {/* ACTION BUTTONS */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#020617]/95 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
          <ActionButton
            label="Keep"
            icon={<CheckCircle size={18} />}
            onClick={() =>
              setConfirmAction({
                label: "Keep Post",
                action: async () => {},
                successMsg: "Report resolved",
              })
            }
            className="bg-slate-800"
          />

          {report.submission && (
            <ActionButton
              label="Remove"
              icon={<Trash2 size={18} />}
              onClick={() =>
                setConfirmAction({
                  label: "Remove Post",
                  action: () =>
                    deleteSubmission(report.submission_id),
                  successMsg: "Post removed",
                })
              }
              className="bg-orange-600"
            />
          )}

          <ActionButton
            label="Ban User"
            icon={<Ban size={18} />}
            onClick={() =>
              setConfirmAction({
                label: "Ban User",
                action: () =>
                  updateUserBan(report.reported_id, true),
                successMsg: "User banned",
              })
            }
            className="bg-red-600 col-span-2"
          />
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-slate-900 p-6 rounded-xl w-[90%] max-w-sm"
            >
              <h2 className="font-bold text-lg mb-3">
                Are you sure?
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 bg-slate-700 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalAction}
                  className="flex-1 bg-red-600 py-2 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-500 p-6 rounded-full"
            >
              <CheckCircle size={50} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({ onClick, icon, label, className }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`h-14 flex items-center justify-center gap-2 rounded-xl font-semibold ${className}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}