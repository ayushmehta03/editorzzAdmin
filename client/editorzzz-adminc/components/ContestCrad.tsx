"use client";

import { motion } from "framer-motion";

export default function ContestCard({ t, onEdit }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md hover:scale-[1.02] transition"
    >
      <img src={t.banner} className="h-48 w-full object-cover" />

      <div className="p-5 space-y-4">
        <h2 className="text-xl font-bold">{t.title}</h2>

        <div className="flex justify-between text-sm text-zinc-400">
          <span>₹{t.prize_pool}</span>
          <span>
            {t.current_count}/{t.max_participants}
          </span>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => onEdit(t)}
            className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-purple-500"
          >
            Edit
          </button>

          <button className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-blue-500">
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
}