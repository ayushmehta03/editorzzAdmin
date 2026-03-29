"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createVoteContest } from "@/lib/api";
import { uploadBannerImage } from "@/lib/claudinary";
import {
  Calendar,
  Trophy,
  Users,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function CreateVoteContestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    banner_url: "",
    start_time: "",
    end_time: "",
    voting_start_time: "",
    voting_end_time: "",
    max_participants: "",
    prize_pool: "",
    assets_link: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setPreview(URL.createObjectURL(file));

      const toastId = toast.loading("Uploading banner...");
      const url = await uploadBannerImage(file);

      toast.dismiss(toastId);
      toast.success("Banner uploaded ");

      setForm((prev) => ({ ...prev, banner_url: url }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.banner_url) return toast.error("Upload banner first");

    if (new Date(form.end_time) <= new Date(form.start_time)) {
      return toast.error("End must be after start");
    }

    if (new Date(form.voting_start_time) < new Date(form.end_time)) {
      return toast.error("Voting must start after contest ends");
    }

    if (new Date(form.voting_end_time) <= new Date(form.voting_start_time)) {
      return toast.error("Voting end must be after voting start");
    }

    try {
      setLoading(true);

      await createVoteContest({
        title: form.title,
        description: form.description,
        banner_url: form.banner_url,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        voting_start_time: new Date(form.voting_start_time).toISOString(),
        voting_end_time: new Date(form.voting_end_time).toISOString(),
        max_participants: Number(form.max_participants),
        prize_pool: Number(form.prize_pool),
        assets_link: form.assets_link,
      });

      toast.success("Vote Contest Created 🎉");

      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: any) {
      toast.error(err.message || "Failed");
      setLoading(false);
    }
  };

  const input =
    "w-full bg-[#0b1326] border border-gray-800 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#0b1326] text-white px-4 md:px-10 py-10">

      <div className="max-w-6xl mx-auto mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black tracking-tight"
        >
          Create Vote Contest 🗳️
        </motion.h1>
        <p className="text-gray-500 mt-2">
          Community-driven contests with voting phase
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8"
      >

        <div className="lg:col-span-8 space-y-6">

          <motion.div className="bg-[#11192d] p-6 rounded-2xl border border-gray-800">
            <input
              name="title"
              placeholder="Contest Title"
              onChange={handleChange}
              className={input}
              required
            />
          </motion.div>

          <motion.div className="bg-[#11192d] p-6 rounded-2xl border border-gray-800">
            <textarea
              name="description"
              placeholder="Describe contest..."
              onChange={handleChange}
              className={`${input} min-h-[140px]`}
              required
            />
          </motion.div>

          <motion.div className="bg-[#11192d] p-6 rounded-2xl border border-gray-800">
            <div className="relative border-2 border-dashed border-gray-700 rounded-xl overflow-hidden cursor-pointer group">

              {preview ? (
                <img
                  src={preview}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="p-10 text-center">
                  <ImageIcon className="mx-auto text-gray-500 mb-3" />
                  <p>Upload Banner</p>
                </div>
              )}

              <input
                type="file"
                onChange={handleUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </motion.div>

          <motion.div className="bg-[#11192d] p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-blue-400">Timeline</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <input type="datetime-local" name="start_time" onChange={handleChange} className={input} required />
              <input type="datetime-local" name="end_time" onChange={handleChange} className={input} required />
            </div>

            <div className="border-t border-gray-800 pt-4">
              <p className="text-xs text-gray-500 mb-3">Voting Phase</p>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="datetime-local" name="voting_start_time" onChange={handleChange} className={input} required />
                <input type="datetime-local" name="voting_end_time" onChange={handleChange} className={input} required />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-6">

          <motion.div className="bg-[#11192d] p-6 rounded-2xl border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-blue-400">Economics</h3>

            <input
              name="prize_pool"
              placeholder="Prize Pool"
              type="number"
              onChange={handleChange}
              className={input}
            />

            <input
              name="max_participants"
              placeholder="Max Participants"
              type="number"
              onChange={handleChange}
              className={input}
            />
          </motion.div>

          <motion.div className="bg-[#11192d] p-6 rounded-2xl border border-gray-800">
            <input
              name="assets_link"
              placeholder="Assets Link"
              onChange={handleChange}
              className={input}
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading || uploading}
            className={`w-full py-5 rounded-2xl font-black tracking-widest transition-all ${
              loading
                ? "bg-gray-800"
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
            }`}
          >
            {loading ? "Creating..." : "Create Contest 🚀"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}