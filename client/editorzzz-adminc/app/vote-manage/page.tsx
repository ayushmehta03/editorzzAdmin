"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getVoteTournaments, getTotalCastedVotes } from "@/lib/api";

type Tournament = {
  _id: string;
  title: string;
  banner?: string;
  is_score_calculated: boolean;
  is_leaderboard_live: boolean;
};

export default function VoteAdminDashboard() {
  const [data, setData] = useState<Tournament[]>([]);
  const [votesMap, setVotesMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getVoteTournaments();
      const tournaments = res.tournaments || [];
      setData(tournaments);

      const votesObj: Record<string, number> = {};
      await Promise.all(
        tournaments.map(async (t: Tournament) => {
          try {
            const v = await getTotalCastedVotes(t._id);
            votesObj[t._id] = v.total_votes || 0;
          } catch (err) {
            votesObj[t._id] = 0;
          }
        })
      );
      setVotesMap(votesObj);
    } catch (err) {
      console.error("Tournament fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-10 py-10">
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-black">
          Vote <span className="text-zinc-500">Contests</span>
        </h1>
        <p className="text-zinc-500 mt-2">Manage submissions and manually assign scoring variables</p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40">
          <p className="text-zinc-400 text-lg font-semibold">No Contests Available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item, i) => {
            const votes = votesMap[item._id] || 0;

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={item.banner || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold mb-3 line-clamp-1">{item.title}</h2>

                  <div className="flex justify-between text-sm text-zinc-400 mb-4">
                    <span>Total Raw Votes</span>
                    <span className="text-white font-semibold">{votes}</span>
                  </div>

                  <div className="mb-4">
                    {!item.is_score_calculated ? (
                      <span className="text-amber-400 text-xs font-bold px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        Pending Admin Grades
                      </span>
                    ) : item.is_leaderboard_live ? (
                      <span className="text-green-400 text-xs font-bold px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        Leaderboard Live
                      </span>
                    ) : (
                      <span className="text-blue-400 text-xs font-bold px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        Ready to Publish
                      </span>
                    )}
                  </div>

                  <Link href={`/vote/${item._id}`} className="block w-full text-center bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-zinc-700 transition">
                    Manage Submissions
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}