"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createTournament } from "@/lib/api";
import { uploadProfileImage } from "@/lib/claudinary";
import { Calendar, Users, Trophy, Link as LinkIcon, Mail, Image as ImageIcon, PlusCircle, CheckCircle2 } from "lucide-react";

export default function CreateTournamentPage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleBannerUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const preview = URL.createObjectURL(file);
      setBannerPreview(preview);

      const toastId = toast.loading("Uploading banner...");
      const url = await uploadProfileImage(file);

      toast.dismiss(toastId);
      toast.success("Banner uploaded ");

      setForm((prev) => ({
        ...prev,
        banner_url: url,
      }));
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!form.banner_url) {
      return toast.error("Please upload banner image");
    }

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

      toast.success("Tournament created successfully!");

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

  const inputStyles = "w-full p-3.5 rounded-xl bg-[#0b1326] border border-gray-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-200 placeholder:text-gray-600 text-sm md:text-base";
  const labelStyles = "block text-xs md:text-sm font-semibold text-gray-400 mb-2 ml-1 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#080e1b] text-white px-4 sm:px-6 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-3 bg-blue-600/10 rounded-2xl mb-4 border border-blue-500/20"
          >
            <PlusCircle className="text-blue-500" size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
          >
            New Tournament
          </motion.h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Enter the details below to launch your event</p>
        </header>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 bg-[#11192d]/50 backdrop-blur-sm p-6 md:p-10 rounded-3xl border border-gray-800/50 shadow-2xl"
        >
          <div className="space-y-6">
            <div>
              <label className={labelStyles}>Tournament Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Global Valorant Open"
                className={inputStyles}
                required
              />
            </div>

            <div>
              <label className={labelStyles}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the format, rules, and requirements..."
                className={`${inputStyles} min-h-[140px] resize-none`}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className={labelStyles}>Event Banner</label>
            <div className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden ${bannerPreview ? 'border-blue-500/50' : 'border-gray-800 hover:border-blue-500/50 bg-[#0b1326]'}`}>
              {bannerPreview ? (
                <div className="relative h-56 w-full">
                  <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-bold bg-white text-black px-4 py-2 rounded-full">Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center gap-3">
                  <div className="p-4 bg-gray-800/50 rounded-full text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                    <ImageIcon size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-300">{uploading ? "Uploading..." : "Click or drag banner image"}</p>
                    <p className="text-xs text-gray-600 mt-1">Recommended: 1200x675px</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyles}><Calendar className="inline mr-2 mb-0.5" size={14} /> Start Time</label>
              <input type="datetime-local" name="start_time" onChange={handleChange} className={inputStyles} required />
            </div>
            <div>
              <label className={labelStyles}><Calendar className="inline mr-2 mb-0.5" size={14} /> End Time</label>
              <input type="datetime-local" name="end_time" onChange={handleChange} className={inputStyles} required />
            </div>
            <div>
              <label className={labelStyles}><Users className="inline mr-2 mb-0.5" size={14} /> Max Slots</label>
              <input name="max_participants" type="number" placeholder="0" onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}><Trophy className="inline mr-2 mb-0.5" size={14} /> Prize Pool ($)</label>
              <input name="prize_pool" type="number" placeholder="0.00" onChange={handleChange} className={inputStyles} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-800/50">
            <div>
              <label className={labelStyles}><LinkIcon className="inline mr-2 mb-0.5" size={14} /> Resource Link</label>
              <input name="assets_link" placeholder="Drive or Notion link" onChange={handleChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}><Mail className="inline mr-2 mb-0.5" size={14} /> Lead Judge</label>
              <input name="judge_email" type="email" placeholder="contact@domain.com" onChange={handleChange} className={inputStyles} />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || uploading}
            className={`w-full py-4 rounded-2xl font-black text-base md:text-lg uppercase tracking-widest shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 ${
              loading || uploading 
              ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-blue-500/25"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Launching...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={20} />
                <span>Publish Tournament</span>
              </>
            )}
          </motion.button>
        </motion.form>

        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-tighter">Secure Tournament Dashboard © 2026</p>
        </footer>
      </div>
    </div>
  );
}