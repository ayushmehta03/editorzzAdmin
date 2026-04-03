"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateTournament, updateVotingTime } from "@/lib/api";
import { X, Save, ShieldAlert } from "lucide-react";

export default function EditModal({ t, onClose, refresh }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...t, banner_url: t.banner });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTournament(t._id, form);
      await updateVotingTime(t._id, {
        voting_start_time: form.voting_start_time,
        voting_end_time: form.voting_end_time,
      });
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-zinc-700";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0c0c0c] border border-white/10 p-8 rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Edit Parameters</h2>
            <p className="text-zinc-500 text-[10px] font-mono tracking-widest">OBJ_ID: {t._id}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Tournament Title</label>
              <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Title" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Banner Asset URL</label>
              <input name="banner_url" value={form.banner_url} onChange={handleChange} className={inputClass} placeholder="Banner URL" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className={`${inputClass} min-h-[100px] resize-none`} placeholder="Briefing..." />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <DateInput label="Start" name="start_time" value={form.start_time} onChange={handleChange} />
            <DateInput label="End" name="end_time" value={form.end_time} onChange={handleChange} />
            <DateInput label="Vote Start" name="voting_start_time" value={form.voting_start_time} onChange={handleChange} />
            <DateInput label="Vote End" name="voting_end_time" value={form.voting_end_time} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/5">
            <div className="space-y-4">
              <input name="prize_pool" value={form.prize_pool} onChange={handleChange} className={inputClass} placeholder="Prize Pool" />
              <input name="max_participants" value={form.max_participants} onChange={handleChange} className={inputClass} placeholder="Max Participants" />
            </div>
            <div className="space-y-4">
              <input name="assets_link" value={form.assets_link} onChange={handleChange} className={inputClass} placeholder="Assets Link" />
              <input name="judge_email" value={form.judge_email} onChange={handleChange} className={inputClass} placeholder="Judge Email" />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-600/20 active:scale-[0.98]"
          >
            {loading ? "Syncing..." : <><Save size={18}/> Deploy Updates</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DateInput({ label, name, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold uppercase text-zinc-600 ml-1 tracking-tighter">{label}</label>
      <input 
        type="date" 
        name={name} 
        value={value?.split('T')[0]} // Normalizes date string for input
        onChange={onChange} 
        className="w-full bg-zinc-900 border border-white/5 rounded-lg px-2 py-2 text-[10px] outline-none focus:border-purple-500" 
      />
    </div>
  );
}