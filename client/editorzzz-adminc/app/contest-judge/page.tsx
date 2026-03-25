"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createTournament } from "@/lib/api";

export default function CreateTournamentPage() {
  const [loading, setLoading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    banner_url: "",
    start_time: "",
    end_time: "",
    max_participants: "",
    prize_pool: "",
    assets_link: "",
    judge_email: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBanner = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setBannerPreview(url);

    setForm({ ...form, banner_url: url });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createTournament({
        Title: form.title,
        Description: form.description,
        BannerURL: form.banner_url,
        StartTime: new Date(form.start_time),
        EndTime: new Date(form.end_time),
        MaxParticipants: Number(form.max_participants),
        PrizePool: Number(form.prize_pool),
        AssetsLink: form.assets_link,
        JudgeEmail: form.judge_email,
      });

      toast.success("Tournament created 🚀");

      setForm({
        title: "",
        description: "",
        banner_url: "",
        start_time: "",
        end_time: "",
        max_participants: "",
        prize_pool: "",
        assets_link: "",
        judge_email: "",
      });

      setBannerPreview(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-white px-4 md:px-10 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold mb-8"
      >
        Create Tournament
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid lg:grid-cols-12 gap-8"
      >
        {/* LEFT */}
        <div className="lg:col-span-8 space-y-6 bg-[#131b2e] p-6 rounded-xl">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full p-3 rounded bg-[#0b1326]"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-3 rounded bg-[#0b1326]"
            required
          />

          <div>
            <input type="file" onChange={handleBanner} />
            {bannerPreview && (
              <img
                src={bannerPreview}
                className="mt-3 rounded-lg w-full h-48 object-cover"
              />
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="datetime-local"
              name="start_time"
              onChange={handleChange}
              className="p-3 rounded bg-[#0b1326]"
              required
            />
            <input
              type="datetime-local"
              name="end_time"
              onChange={handleChange}
              className="p-3 rounded bg-[#0b1326]"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              name="max_participants"
              placeholder="Max Participants"
              onChange={handleChange}
              className="p-3 rounded bg-[#0b1326]"
            />
            <input
              name="prize_pool"
              placeholder="Prize Pool"
              onChange={handleChange}
              className="p-3 rounded bg-[#0b1326]"
            />
          </div>

          <input
            name="assets_link"
            placeholder="Assets Link"
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#0b1326]"
          />

          <input
            name="judge_email"
            placeholder="Judge Email"
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#0b1326]"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className="w-full bg-blue-600 py-3 rounded font-bold"
          >
            {loading ? "Creating..." : "Create Tournament"}
          </motion.button>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#131b2e] p-6 rounded-xl">
            <p className="text-sm opacity-70 mb-4">Preview</p>

            {bannerPreview ? (
              <img
                src={bannerPreview}
                className="rounded-lg mb-4 h-40 w-full object-cover"
              />
            ) : (
              <div className="h-40 bg-gray-700 rounded-lg mb-4" />
            )}

            <h2 className="font-bold">{form.title || "Title"}</h2>
            <p className="text-sm opacity-70">
              {form.description || "Description"}
            </p>
          </div>
        </div>
      </motion.form>
    </div>
  );
}