"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAdminTournaments } from "@/lib/api"; 

type Tournament = {
  _id: string;
  title: string;
  banner?: string;
  type?: string;
  category?: string;
  is_judging_completed: boolean;
  is_leaderboard_live: boolean;
  total_submissions?: number;
};

export default function AdminReviewEntry() {
  const [data, setData] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"judged" | "pending">("judged");

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAdminTournaments();

      const tournaments = Array.isArray(res)
        ? res
        : res.tournaments || [];

      setData(tournaments);
    } catch (err: any) {
      toast.error(err.message || "Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((t) =>
    tab === "judged"
      ? t.is_judging_completed
      : !t.is_judging_completed
  );

  const handleClick = (id: string, isJudged: boolean) => {
    if (!isJudged) {
      toast.warning("Judging not completed yet");
      return;
    }
    router.push(`/admin/review/${id}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-10 py-10">
      
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Admin Review Panel
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">
            Review and approve tournament results
          </p>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-full w-fit">
          <button
            onClick={() => setTab("judged")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === "judged"
                ? "bg-gradient-to-r from-purple-500 to-blue-500"
                : "text-gray-400"
            }`}
          >
            Judged
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === "pending"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "text-gray-400"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item, i) => {
          const status = item.is_leaderboard_live
            ? "approved"
            : item.is_judging_completed
            ? "completed"
            : "pending";

          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900 rounded-2xl overflow-hidden hover:scale-[1.02] transition cursor-pointer"
              onClick={() =>
                handleClick(item._id, item.is_judging_completed)
              }
            >
              <img
                src={item.banner || "/placeholder.jpg"}
                className="w-full h-48 object-cover"
              />

              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {item.type && (
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                      {item.type}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold mb-3">
                  {item.title}
                </h2>

                <div className="mb-4">
                  {status === "pending" && (
                    <span className="text-yellow-400 text-sm">
                      Pending Judging
                    </span>
                  )}
                  {status === "completed" && (
                    <span className="text-blue-400 text-sm">
                      Ready for Review
                    </span>
                  )}
                  {status === "approved" && (
                    <span className="text-green-400 text-sm">
                      Approved
                    </span>
                  )}
                </div>

                <button
                  className={`w-full py-2 rounded-full font-semibold transition ${
                    status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : status === "approved"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gradient-to-r from-purple-500 to-blue-500"
                  }`}
                >
                  {status === "pending"
                    ? "View Status"
                    : status === "approved"
                    ? "View Leaderboard"
                    : "Review Results"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 mt-20">
          No tournaments found
        </div>
      )}
    </div>
  );
}