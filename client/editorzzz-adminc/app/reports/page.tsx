"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  User,
  ChevronRight,
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

// 🔥 Optional: shorten email for UI
const formatEmail = (email?: string) => {
  if (!email) return "unknown";

  const [name] = email.split("@");
  return name.length > 12 ? name.slice(0, 12) + "..." : name;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur border-b border-slate-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertCircle className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold">Reported Content</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Skeleton */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-[#1e293b] border border-slate-700 rounded-xl p-4 space-y-4"
            >
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-slate-700 rounded" />
                <div className="h-4 w-32 bg-slate-700 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-700 rounded" />
                <div className="h-10 bg-slate-700 rounded" />
              </div>

              <div className="h-16 bg-slate-700 rounded" />
              <div className="h-4 w-32 bg-slate-700 rounded ml-auto" />
            </div>
          ))}

        {/* Empty */}
        {!loading && reports.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            🚫 No reports found
          </div>
        )}

        {/* List */}
        {!loading &&
          reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => router.push(`/admin/reports/${report.id}`)}
              className={`cursor-pointer bg-[#1e293b] border border-slate-700 rounded-xl shadow-lg hover:border-slate-500 transition ${
                report.status === "resolved" ? "opacity-70" : ""
              }`}
            >
              <div className="p-4 space-y-4">
                <div className="flex justify-between">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      report.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        : "bg-green-500/10 text-green-400 border border-green-500/20"
                    }`}
                  >
                    {report.status === "pending"
                      ? "Pending Review"
                      : "Resolved"}
                  </span>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {report.created_at}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Reporter */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      Reporter
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                        <User size={14} />
                      </div>
                      <span className="text-sm">
                        @{formatEmail(report.reporter_email)}
                      </span>
                    </div>
                  </div>

                  {/* Suspect */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                      Suspect
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-900/30 border border-red-500/20 flex items-center justify-center">
                        <User size={14} className="text-red-400" />
                      </div>
                      <span className="text-sm">
                        @{report.suspect_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Reason
                  </p>
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {report.reason}
                  </p>
                </div>

                <div className="flex justify-end text-sm text-slate-400 items-center gap-1">
                  View Submission <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
      </main>
    </div>
  );
}