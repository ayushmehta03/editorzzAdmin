"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { updateTournament, updateVotingTime } from "@/lib/api";

export default function EditModal({ t, onClose, refresh }: any) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: t.title,
    description: t.description,
    banner_url: t.banner,
    prize_pool: t.prize_pool,
    max_participants: t.max_participants,
    assets_link: t.assets_link,
    judge_email: t.judge_email,
    start_time: t.start_time,
    end_time: t.end_time,
    voting_start_time: t.voting_start_time,
    voting_end_time: t.voting_end_time,
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);

    await updateTournament(t._id, form);

    await updateVotingTime(t._id, {
      voting_start_time: form.voting_start_time,
      voting_end_time: form.voting_end_time,
    });

    setLoading(false);
    refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 p-6 rounded-2xl w-full max-w-2xl space-y-4"
      >
        <h2 className="text-xl font-bold">Edit Tournament</h2>

        <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="Title" />
        <textarea name="description" value={form.description} onChange={handleChange} className="input" placeholder="Description" />

        <input name="banner_url" value={form.banner_url} onChange={handleChange} className="input" placeholder="Banner URL" />

        <div className="grid grid-cols-2 gap-2">
          <input name="start_time" type="date" value={form.start_time} onChange={handleChange} className="input" />
          <input name="end_time" type="date" value={form.end_time} onChange={handleChange} className="input" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input name="voting_start_time" type="date" value={form.voting_start_time} onChange={handleChange} className="input" />
          <input name="voting_end_time" type="date" value={form.voting_end_time} onChange={handleChange} className="input" />
        </div>

        <input name="prize_pool" value={form.prize_pool} onChange={handleChange} className="input" placeholder="Prize Pool" />
        <input name="max_participants" value={form.max_participants} onChange={handleChange} className="input" placeholder="Max Participants" />

        <input name="assets_link" value={form.assets_link} onChange={handleChange} className="input" placeholder="Assets Link" />
        <input name="judge_email" value={form.judge_email} onChange={handleChange} className="input" placeholder="Judge Email" />

        <button
          onClick={handleSave}
          className="w-full bg-purple-500 py-3 rounded-lg font-bold"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button onClick={onClose} className="text-zinc-400 text-sm">
          Cancel
        </button>
      </motion.div>
    </div>
  );
}