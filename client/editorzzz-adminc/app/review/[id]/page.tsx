"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  getLeaderboard,
  approveTournament,
} from "@/lib/api";

type Player = {
  username: string;
  profile_image?: string;
  points: number;
  rank: number;
};

export default function AdminLeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await getLeaderboard(id);

      const leaderboard = Array.isArray(res)
        ? res
        : res.leaderboard || [];

      setData(leaderboard);
    } catch (err: any) {
      toast.error(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);

      const res = await approveTournament(id);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Leaderboard is LIVE 🚀");
      setApproved(true);

      fetchData();
    } catch {
      toast.error("Approval failed");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-10 py-10 pb-32">
      
      <div className="flex flex-col md:flex-row justify-between mb-10 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Leaderboard Preview
        </h1>

        <div className="text-sm text-purple-400">
          {data.length} Participants
        </div>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {data.slice(0, 3).map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 text-center shadow-lg ${
                i === 0
                  ? "bg-yellow-500/10 border border-yellow-500/20"
                  : i === 1
                  ? "bg-gray-400/10 border border-gray-400/20"
                  : "bg-orange-400/10 border border-orange-400/20"
              }`}
            >
              <img
                src={p.profile_image || "/avatar.png"}
                className="w-16 h-16 rounded-full mx-auto mb-3 border border-white/10"
              />

              <h2 className="font-bold text-lg">
                {p.username}
              </h2>

              <p className="text-purple-400 mt-1 font-semibold">
                {p.points} pts
              </p>

              <div className="mt-2 text-sm text-gray-400">
                Rank #{p.rank}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {data.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl hover:bg-zinc-800 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-gray-400 font-bold">
                #{p.rank}
              </div>

              <img
                src={p.profile_image || "/avatar.png"}
                className="w-10 h-10 rounded-full"
              />

              <div className="font-semibold text-sm md:text-base">
                {p.username}
              </div>
            </div>

            <div className="text-purple-400 font-bold text-sm md:text-base">
              {p.points}
            </div>
          </motion.div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center text-gray-500 mt-20">
          No leaderboard data available
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur flex justify-end px-4 md:px-10 py-4 border-t border-zinc-800">
        <button
          onClick={handleApprove}
          disabled={approving || approved}
          className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full font-semibold shadow-lg disabled:opacity-50 w-full md:w-auto"
        >
          {approved
            ? "Approved"
            : approving
            ? "Approving..."
            : "Approve & Publish"}
        </button>
      </div>
    </div>
  );
}