"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Trophy, Medal, Crown, CheckCircle2, Loader2, Users, ArrowUpRight } from "lucide-react";
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
      // Ensure data is sorted by rank just in case
      setData(leaderboard.sort((a: Player, b: Player) => a.rank - b.rank));
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
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <Loader2 className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500" />
        </div>
        <p className="mt-4 text-zinc-500 font-mono text-xs animate-pulse uppercase tracking-[0.3em]">Syncing Data...</p>
      </div>
    );
  }

  const topThree = data.slice(0, 3);
  const remainingPlayers = data.slice(3);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-purple-500/30 font-sans">
      {/* Visual background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-10 py-12 pb-40">
        {/* Navbar-style Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] font-bold text-purple-400 uppercase tracking-widest">Admin Portal</span>
              <div className="h-[1px] w-12 bg-zinc-800" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              Elite <span className="text-purple-500">Rankings</span>
            </h1>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Participants" value={data.length} icon={<Users size={16}/>} />
            <StatCard label="Status" value={approved ? "Live" : "Draft"} icon={<div className={`w-2 h-2 rounded-full ${approved ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />} />
          </div>
        </header>

        {/* Top 3 Podium (Hidden if no data) */}
        {topThree.length > 0 && (
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 mb-24 mt-10">
            {topThree[1] && <PodiumCard player={topThree[1]} rank={2} color="silver" delay={0.2} />}
            {topThree[0] && <PodiumCard player={topThree[0]} rank={1} color="gold" delay={0.1} />}
            {topThree[2] && <PodiumCard player={topThree[2]} rank={3} color="bronze" delay={0.3} />}
          </div>
        )}

        {/* Detailed Leaderboard List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between px-6 py-2 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>Rank & Player</span>
            <span>Performance Points</span>
          </div>
          
          <div className="grid gap-3">
            <AnimatePresence>
              {(remainingPlayers.length > 0 ? remainingPlayers : (topThree.length > 0 ? [] : data)).map((p, i) => (
                <motion.div
                  key={p.username}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between bg-zinc-900/40 hover:bg-white/[0.03] backdrop-blur-md border border-white/5 p-4 md:p-5 rounded-2xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className="w-6 font-mono text-zinc-600 text-sm group-hover:text-purple-500 transition-colors">
                      {p.rank.toString().padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={p.profile_image || "/avatar.png"}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 ring-2 ring-white/5 group-hover:ring-purple-500/50"
                        />
                      </div>
                      <span className="font-bold text-zinc-300 group-hover:text-white transition-colors tracking-tight md:text-lg">
                        {p.username}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-xl font-mono font-bold text-white leading-none">{p.points.toLocaleString()}</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">Credits Earned</span>
                    </div>
                    <ArrowUpRight className="text-zinc-700 group-hover:text-purple-500 transition-colors" size={18} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {data.length === 0 && (
            <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-dashed border-zinc-800">
              <p className="text-zinc-600 font-medium tracking-widest uppercase text-xs">No active data found in registry</p>
            </div>
          )}
        </div>
      </div>

      {/* Futuristic Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-6 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 px-4">
               <div className={`w-3 h-3 rounded-full animate-pulse ${approved ? 'bg-green-500' : 'bg-purple-500'}`} />
               <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {approved ? "Data Published to Live Server" : "Review Stage: Pending Approval"}
               </p>
            </div>
            
            <button
              onClick={handleApprove}
              disabled={approving || approved}
              className={`
                relative overflow-hidden group flex items-center justify-center gap-3 px-8 py-4 rounded-[1.8rem] font-black uppercase tracking-widest text-xs transition-all duration-500 w-full md:w-auto
                ${approved 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                  : "bg-white text-black hover:bg-purple-500 hover:text-white shadow-xl shadow-white/5"}
              `}
            >
              <AnimatePresence mode="wait">
                {approving ? (
                  <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </motion.div>
                ) : approved ? (
                  <motion.div key="done" initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> Verified
                  </motion.div>
                ) : (
                  <motion.span key="text" initial={{opacity:0}} animate={{opacity:1}}>
                    Authorize & Publish
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-4 rounded-2xl flex items-center gap-4 min-w-[140px]">
      <div className="p-2.5 bg-white/5 rounded-xl text-purple-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xl font-mono font-bold leading-none text-white">{value}</p>
      </div>
    </div>
  );
}

function PodiumCard({ player, rank, color, delay }: { player: Player; rank: number; color: 'gold' | 'silver' | 'bronze', delay: number }) {
  const themes = {
    gold: {
      border: "border-yellow-500/30",
      bg: "from-yellow-500/10 via-transparent to-transparent",
      text: "text-yellow-500",
      shadow: "shadow-[0_0_40px_rgba(234,179,8,0.1)]",
      height: "h-[320px] md:h-[380px]",
      icon: <Crown className="w-10 h-10 md:w-14 md:h-14 mb-4 text-yellow-500" />
    },
    silver: {
      border: "border-zinc-400/20",
      bg: "from-zinc-400/5 via-transparent to-transparent",
      text: "text-zinc-400",
      shadow: "shadow-none",
      height: "h-[280px] md:h-[320px]",
      icon: <Medal className="w-8 h-8 md:w-12 md:h-12 mb-4 text-zinc-400" />
    },
    bronze: {
      border: "border-orange-700/20",
      bg: "from-orange-700/5 via-transparent to-transparent",
      text: "text-orange-700",
      shadow: "shadow-none",
      height: "h-[240px] md:h-[280px]",
      icon: <Trophy className="w-8 h-8 md:w-10 md:h-10 mb-4 text-orange-700" />
    }
  };

  const theme = themes[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full max-w-[280px] rounded-[3rem] border ${theme.border} p-8 flex flex-col items-center justify-end bg-gradient-to-t ${theme.bg} backdrop-blur-md transition-all duration-500 hover:scale-[1.02] ${theme.height} ${theme.shadow}`}
    >
      <div className="absolute top-8 flex flex-col items-center">
        {theme.icon}
        <div className="relative">
          <img
            src={player.profile_image || "/avatar.png"}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-[#020202] ring-2 ring-white/10"
          />
          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-black font-black text-xs ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-zinc-300' : 'bg-orange-600'}`}>
            RANK {rank}
          </div>
        </div>
      </div>

      <div className="text-center w-full">
        <h2 className="font-black text-lg md:text-2xl text-white tracking-tighter truncate mb-1">
          {player.username}
        </h2>
        <div className="flex flex-col items-center opacity-80">
          <span className="text-2xl md:text-3xl font-mono font-black text-white">{player.points.toLocaleString()}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500">Points</span>
        </div>
      </div>
    </motion.div>
  );
}