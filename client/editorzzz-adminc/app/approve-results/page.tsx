"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAdminTournaments } from "@/lib/api";
import { 
  ClipboardCheck, 
  Clock, 
  ChevronRight, 
  Trophy, 
  LayoutGrid,
  SearchX
} from "lucide-react";

type Tournament = {
  _id: string;
  title: string;
  banner?: string;
  type?: string;
  category?: string;
  is_judging_completed: boolean;
  is_leaderboard_live: boolean;
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
      const tournaments = Array.isArray(res) ? res : res.tournaments || [];
      setData(tournaments);
    } catch (err: any) {
      toast.error(err.message || "Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((t) =>
    tab === "judged" ? t.is_judging_completed : !t.is_judging_completed
  );

  const handleClick = (id: string, isJudged: boolean) => {
    if (!isJudged) {
      toast.info("This tournament is still in the judging phase.");
      return;
    }
    router.push(`/review/${id}`);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full"
        />
        <p className="mt-4 text-zinc-500 font-medium tracking-widest text-xs uppercase">Loading Vault</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-purple-500" />
              <span className="text-purple-400 text-xs font-bold uppercase tracking-[0.3em]">Curator Portal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
              Admin <span className="text-zinc-500">Review</span>
            </h1>
            <p className="text-zinc-500 mt-3 max-w-md leading-relaxed">
              Verify tournament outcomes, manage leaderboard visibility, and finalize rewards.
            </p>
          </motion.div>

          <div className="flex bg-zinc-900/50 backdrop-blur-md border border-white/5 p-1 rounded-2xl">
            <button
              onClick={() => setTab("judged")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                tab === "judged"
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <ClipboardCheck size={16} />
              Completed
            </button>
            <button
              onClick={() => setTab("pending")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                tab === "pending"
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <Clock size={16} />
              In Progress
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div 
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((item, i) => {
                const isLive = item.is_leaderboard_live;
                const isDone = item.is_judging_completed;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleClick(item._id, isDone)}
                    className="group relative bg-zinc-900/30 border border-white/5 rounded-[2rem] overflow-hidden hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-500 cursor-pointer"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={item.banner || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                        alt="Banner"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
                      
                      <div className="absolute top-4 left-4 flex gap-2">
                        {item.category && (
                          <span className="bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${
                            isLive ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
                            isDone ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : 
                            "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          }`} />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {isLive ? "Publicly Live" : isDone ? "Awaiting Review" : "In Judging"}
                          </span>
                        </div>
                      </div>

                      <h2 className="text-xl font-bold mb-6 group-hover:text-purple-400 transition-colors line-clamp-1">
                        {item.title}
                      </h2>

                      <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform">
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          isLive ? "text-green-400" : isDone ? "text-blue-400" : "text-amber-400"
                        }`}>
                          {isLive ? "View Leaderboard" : isDone ? "Review Results" : "Check Status"}
                        </span>
                        <ChevronRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-40 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                <SearchX className="text-zinc-700" size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-400">Archive Empty</h3>
              <p className="text-zinc-600 text-sm mt-2">No tournaments match the current filter.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 pt-10 border-t border-white/5 flex flex-wrap gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-3">
            <Trophy className="text-zinc-500" size={20} />
            <div>
              <p className="text-xs font-bold text-white leading-none">{data.length}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Events</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-zinc-500" size={20} />
            <div>
              <p className="text-xs font-bold text-white leading-none">{data.filter(t => t.is_judging_completed).length}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Archived Results</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}