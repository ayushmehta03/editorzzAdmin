"use client";

import { motion } from "framer-motion";
import { Users, Trophy, ExternalLink, Settings2 } from "lucide-react";

export default function ContestCard({ t, onEdit }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group relative bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl transition-all duration-500 hover:border-purple-500/30"
    >
      <div className="h-56 relative overflow-hidden">
        <img 
          src={t.banner || "/placeholder.jpg"} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={t.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute top-4 left-4 px-4 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
          ID: {t._id?.slice(-6) || "NEW"}
        </div>
      </div>

      <div className="p-6 -mt-12 relative z-10">
        <h2 className="text-2xl font-black italic tracking-tighter text-white mb-4 line-clamp-1 uppercase">
          {t.title}
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-purple-400 mb-2">
  {t.type}
</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1 flex items-center gap-1">
              <Trophy size={10} className="text-purple-500" /> Pool
            </p>
            <p className="font-mono font-bold text-lg text-white">₹{t.prize_pool}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1 flex items-center gap-1">
              <Users size={10} className="text-blue-500" /> Slots
            </p>
            <p className="font-mono font-bold text-lg text-white">{t.current_count}/{t.max_participants}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(t)}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all duration-300"
          >
            <Settings2 size={16} /> Edit
          </button>
          <button className="px-5 py-4 bg-zinc-800 rounded-2xl hover:bg-blue-500 transition-colors group/btn">
            <ExternalLink size={18} className="group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}