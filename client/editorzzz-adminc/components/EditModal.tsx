"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { updateTournament, updateVotingTime } from "@/lib/api";
import { X, Save } from "lucide-react";

export default function EditModal({ t, onClose, refresh }: any) {
  const [loading, setLoading] = useState(false);

  const isVoteBased = t.type === "vote_based";

  const formatDate = (date: any) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  const [form, setForm] = useState({
    ...t,
    banner_url: t.banner,
    start_time: formatDate(t.start_time),
    end_time: formatDate(t.end_time),
    voting_start_time: formatDate(t.voting_start_time),
    voting_end_time: formatDate(t.voting_end_time),
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateTournament(t._id, {
        ...form,
        start_time: new Date(form.start_time),
        end_time: new Date(form.end_time),
      });

      if (isVoteBased) {
        await updateVotingTime(t._id, {
          voting_start_time: new Date(form.voting_start_time),
          voting_end_time: new Date(form.voting_end_time),
        });
      } else {
        await updateTournament(t._id, {
          judge_email: form.judge_email,
        });
      }

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-zinc-700";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0c0c0c] border border-white/10 p-8 rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black italic uppercase">
              Edit Parameters
            </h2>
            <p className="text-zinc-500 text-[10px] font-mono">
              OBJ_ID: {t._id}
            </p>
          </div>

          <button onClick={onClose} className="p-3 bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">

          <div className="grid md:grid-cols-2 gap-6">
            <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Title" />
            <input name="banner_url" value={form.banner_url} onChange={handleChange} className={inputClass} placeholder="Banner URL" />
          </div>

          <textarea name="description" value={form.description} onChange={handleChange} className={`${inputClass} min-h-[100px]`} />

          <div className="grid md:grid-cols-2 gap-4">
            <DateTimeInput label="Start Time" name="start_time" value={form.start_time} onChange={handleChange} />
            <DateTimeInput label="End Time" name="end_time" value={form.end_time} onChange={handleChange} />
          </div>

          {isVoteBased ? (
            <div className="grid md:grid-cols-2 gap-4">
              <DateTimeInput label="Voting Start" name="voting_start_time" value={form.voting_start_time} onChange={handleChange} />
              <DateTimeInput label="Voting End" name="voting_end_time" value={form.voting_end_time} onChange={handleChange} />
            </div>
          ) : (
            <input
              name="judge_email"
              value={form.judge_email}
              onChange={handleChange}
              className={inputClass}
              placeholder="Judge Email"
            />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <input name="prize_pool" value={form.prize_pool} onChange={handleChange} className={inputClass} placeholder="Prize Pool" />
            <input name="max_participants" value={form.max_participants} onChange={handleChange} className={inputClass} placeholder="Max Participants" />
          </div>

          <input name="assets_link" value={form.assets_link} onChange={handleChange} className={inputClass} placeholder="Assets Link" />

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-purple-600 py-5 rounded-2xl font-black uppercase flex justify-center gap-2"
          >
            {loading ? "Saving..." : <><Save size={18}/> Save Changes</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DateTimeInput({ label, name, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-zinc-500 uppercase">{label}</label>
      <input
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-3 text-sm focus:border-purple-500 outline-none"
      />
    </div>
  );
}