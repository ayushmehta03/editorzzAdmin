"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Trash2,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import {
  getReportById,
  deleteSubmission,
  resolveReport,
} from "@/lib/api";

interface Report {
  id: string;
  reason: string;
  status: string;
  suspect_name: string;
  reporter_email: string;
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

      setReport({
        id: res.ID,
        reason: res.reason,
        status: res.status,
        suspect_name: res.SuspectUname,
        reporter_email: res.reporter_email,
        submission: res.submission || null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKeepPost = async () => {
    try {
      await resolveReport(report!.id);
      toast.success("Marked as resolved");
      router.back();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDeletePost = async () => {
    try {
      if (!report?.submission) {
        toast.error("No submission found");
        return;
      }

      await deleteSubmission((report as any).submission_id);

      await resolveReport(report.id);

      toast.success("Post removed");
      router.back();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleBanUser = async () => {
    toast.success("User banned (add backend)");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-4 animate-pulse">
        <div className="h-60 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur border-b border-slate-800 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-800 rounded-full"
          >
            <ArrowLeft />
          </button>
          <h1 className="font-bold text-lg">Report Details</h1>
        </div>

        <span
          className={`px-3 py-1 text-xs rounded-full ${
            report.status === "pending"
              ? "bg-yellow-500/10 text-yellow-400"
              : "bg-green-500/10 text-green-400"
          }`}
        >
          {report.status}
        </span>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400">Reported User</p>
            <p className="font-semibold">@{report.suspect_name}</p>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400">Reporter</p>
            <p className="font-semibold truncate">
              {report.reporter_email}
            </p>
          </div>
        </motion.div>

        {report.submission && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold">
                {report.submission.title}
              </h3>
            </div>

            <div className="aspect-video bg-black">
              {report.submission.media_url.endsWith(".mp4") ? (
                <video
                  src={report.submission.media_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={report.submission.media_url}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl"
        >
          <div className="flex gap-3">
            <AlertTriangle className="text-red-400" />
            <div>
              <p className="text-red-400 text-xs font-bold">
                REPORT REASON
              </p>
              <p className="text-slate-200">{report.reason}</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleKeepPost}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl border border-slate-700 transition active:scale-[0.98]"
          >
            <CheckCircle className="text-green-400" />
            Keep Post
          </button>

          <button
            onClick={handleDeletePost}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 py-3 rounded-xl transition active:scale-[0.98]"
          >
            <Trash2 />
            Remove Post
          </button>

          <button
            onClick={handleBanUser}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 py-3 rounded-xl transition active:scale-[0.98]"
          >
            <Ban />
            Ban User
          </button>
        </div>
      </main>
    </div>
  );
}