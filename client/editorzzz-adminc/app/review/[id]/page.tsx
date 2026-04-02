"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trophy, Medal, Crown, CheckCircle2, Loader2, Users } from "lucide-react";
import { getLeaderboard, approveTournament } from "@/lib/api";

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
      const leaderboard = Array.isArray(res) ? res : res.leaderboard || [];
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
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
        <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs">Initializing Neural Link...</p>
      </div>
    );
  }

  const topThree = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      {/* Animated Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-10 py-12 pb-40">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-purple-500 mb-2"
            >
              <div className="h-[1px] w-8 bg-purple-500" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Tournament Management</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              LEADERBOARD <span className="text-purple-500">PREVIEW</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-zinc-900/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Total Talent</p>
              <p className="text-xl font-mono font-bold">{data.length}</p>
            </div>
          </div>
        </header>

        {/* Podium Section */}
        {topThree.length > 0 && (
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 mb-20">
            {/* Rank 2 */}
            {topThree[1] && <PodiumCard player={topThree[1]} rank={2} color="silver" delay={0.2} />}
            {/* Rank 1 */}
            {topThree[0] && <PodiumCard player={topThree[0]} rank={1} color="gold" delay={0.1} />}
            {/* Rank 3 */}
            {topThree[2] && <PodiumCard player={topThree[2]} rank={3} color="bronze" delay={0.3} />}
          </div>
        )}

        {/* List Section */}
        <div className="grid gap-3 relative">
          <AnimatePresence>
            {rest.map((p, i) => (
              <motion.div
                key={p.username}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group flex items-center justify-between bg-zinc-900/30 hover:bg-zinc-800/50 backdrop-blur-sm border border-white/5 p-4 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <span className="w-8 font-mono text-zinc-600 group-hover:text-purple-400 transition-colors">
                    {p.rank.toString().padStart(2, '0')}
                  </span>
                  <div className="relative">
                    <img
                      src={p.profile_image || "/avatar.png"}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/5"
                    />
                  </div>
                  <span className="font-bold text-zinc-200 group-hover:text-white transition-colors">
                    {p.username}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-bold text-white">{p.points.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">PTS</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {data.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
              <p className="text-zinc-500">No data synchronized yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent backdrop-blur-sm border-t border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:block">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Status</p>
            <p className="flex items-center gap-2 text-sm text-yellow-500 font-medium italic">
              {approved ? "Synchronized with Mainnet" : "Awaiting final verification"}
            </p>
          </div>
          <button
            onClick={handleApprove}
            disabled={approving || approved}
            className={`
              relative group flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 w-full md:w-auto overflow-hidden
              ${approved ? "bg-zinc-800 text-zinc-500" : "bg-white text-black hover:scale-[1.02] active:scale-95"}
            `}
          >
            {approving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : approved ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Live on System
              </>
            ) : (
              <>
                Confirm & Push Data
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

function PodiumCard({ player, rank, color, delay }: { player: Player; rank: number; color: 'gold' | 'silver' | 'bronze', delay: number }) {
  const styles = {
    gold: "from-yellow-400/20 via-yellow-400/5 to-transparent border-yellow-500/40 text-yellow-500 h-[280px]",
    silver: "from-zinc-400/20 via-zinc-400/5 to-transparent border-zinc-400/30 text-zinc-300 h-[240px]",
    bronze: "from-orange-700/20 via-orange-700/5 to-transparent border-orange-700/30 text-orange-500 h-[220px]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      className={`relative w-full max-w-[280px] rounded-[2rem] border p-8 flex flex-col items-center justify-center bg-gradient-to-b backdrop-blur-xl transition-transform hover:translate-y-[-8px] ${styles[color]}`}
    >
      <div className="absolute -top-6">
        {rank === 1 ? <Crown className="w-12 h-12" /> : <Medal className="w-10 h-10" />}
      </div>

      <div className="relative mb-4">
         <img
          src={player.profile_image || "/avatar.png"}
          className="w-20 h-20 rounded-full object-cover ring-4 ring-current/20 p-1"
        />
        <div className="absolute -bottom-2 -right-2 bg-white text-black w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">
          {rank}
        </div>
      </div>

      <h2 className="font-black text-xl text-white tracking-tight text-center truncate w-full">
        {player.username}
      </h2>
      <div className="mt-2 flex flex-col items-center">
        <span className="text-3xl font-mono font-black text-white">{player.points.toLocaleString()}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">Points</span>
      </div>
    </motion.div>
  );
}