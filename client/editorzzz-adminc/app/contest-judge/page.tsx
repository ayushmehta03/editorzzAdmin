"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createTournament } from "@/lib/api";
import { uploadBannerImage } from "@/lib/claudinary";
import { Calendar, Users, Trophy, Link as LinkIcon, Mail, Image as ImageIcon, PlusCircle, CheckCircle2, Sparkles } from "lucide-react";

export default function CreateTournamentPage() {
  const router = useRouter();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const preview = URL.createObjectURL(file);
      setBannerPreview(preview);

      const toastId = toast.loading("Uploading banner...");
      const url = await uploadBannerImage(file);

      toast.dismiss(toastId);
      toast.success("Banner uploaded ");

      setForm((prev) => ({ ...prev, banner_url: url }));
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.banner_url) return toast.error("Please upload banner image");
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      return toast.error("End time must be after start time");
    }

    try {
      setLoading(true);
      await createTournament({
        title: form.title,
        description: form.description,
        banner_url: form.banner_url,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        max_participants: Number(form.max_participants),
        prize_pool: Number(form.prize_pool),
        assets_link: form.assets_link,
        judge_email: form.judge_email,
      });

      toast.success("Tournament created successfully!");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || "Failed to create tournament");
      setLoading(false);
    }
  };

  const inputStyles = "w-full p-3.5 rounded-xl bg-[#0b1326] border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all duration-200 placeholder:text-gray-600 text-sm md:text-base cursor-pointer hover:border-gray-700";
  const labelStyles = "block text-xs md:text-sm font-semibold text-gray-400 mb-2 ml-1 uppercase tracking-wider flex items-center gap-2";
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#080e1b] text-white px-4 sm:px-6 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-flex items-center justify-center p-4 bg-blue-600/10 rounded-2xl mb-4 border border-blue-500/20"
          >
            <PlusCircle className="text-blue-500" size={32} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
          >
            Launch Contest
          </motion.h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Fill in the details to go live</p>
        </header>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="space-y-8 bg-[#11192d]/50 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-gray-800/50 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] pointer-events-none" />

          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <label className={labelStyles}>Tournament Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Pro League Season 1"
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
                placeholder="Describe rules, format, and schedule..."
                className={`${inputStyles} min-h-[140px] resize-none`}
                required
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <label className={labelStyles}>Event Banner</label>
            <div className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden ${bannerPreview ? 'border-blue-500/50' : 'border-gray-800 hover:border-blue-500 bg-[#0b1326]'}`}>
              <AnimatePresence mode="wait">
                {bannerPreview ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-56 w-full">
                    <img src={bannerPreview} className="w-full h-full object-cover" alt="Banner" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="text-white mr-2" size={18} />
                      <p className="text-sm font-bold bg-white text-black px-4 py-2 rounded-full">Replace Banner</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="p-10 flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-gray-800/50 rounded-full text-gray-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                      <ImageIcon size={28} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-300">Click to upload banner</p>
                      <p className="text-xs text-gray-600 mt-1">PNG, JPG or WEBP</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className={labelStyles}><Calendar size={14} /> Start Date & Time</label>
              <input 
                type="datetime-local" 
                name="start_time" 
                value={form.start_time} 
                onChange={handleChange} 
                className={inputStyles} 
                required 
              />
            </div>
            <div className="group">
              <label className={labelStyles}><Calendar size={14} /> End Date & Time</label>
              <input 
                type="datetime-local" 
                name="end_time" 
                value={form.end_time} 
                onChange={handleChange} 
                className={inputStyles} 
                required 
              />
            </div>
            <div className="group">
              <label className={labelStyles}><Users size={14} /> Max Participants</label>
              <input name="max_participants" type="number" value={form.max_participants} placeholder="Unlimited if 0" onChange={handleChange} className={inputStyles} required />
            </div>
            <div className="group">
              <label className={labelStyles}><Trophy size={14} /> Prize Pool ($)</label>
              <input name="prize_pool" type="number" value={form.prize_pool} placeholder="0.00" onChange={handleChange} className={inputStyles} required />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800/50">
            <div>
              <label className={labelStyles}><LinkIcon size={14} /> Resource Assets</label>
              <input name="assets_link" value={form.assets_link} placeholder="G-Drive / Dropbox link" onChange={handleChange} className={inputStyles} required />
            </div>
            <div>
              <label className={labelStyles}><Mail size={14} /> Lead Judge Email</label>
              <input name="judge_email" type="email" value={form.judge_email} placeholder="judge@example.com" onChange={handleChange} className={inputStyles} required />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              whileHover={!(loading || uploading) ? { scale: 1.02 } : {}}
              whileTap={!(loading || uploading) ? { scale: 0.98 } : {}}
              disabled={loading || uploading}
              className={`w-full py-4 rounded-2xl font-black text-base md:text-lg uppercase tracking-widest shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 ${
                loading || uploading 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/25 active:brightness-90"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Publish Contest</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}