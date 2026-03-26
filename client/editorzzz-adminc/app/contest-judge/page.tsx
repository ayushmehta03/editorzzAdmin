"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createTournament } from "@/lib/api";
import { uploadProfileImage } from "@/lib/claudinary";
import { Calendar, Users, Trophy, Link as LinkIcon, Mail, Image as ImageIcon, PlusCircle } from "lucide-react";

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
      toast.success("Banner uploaded ✅");

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

      toast.success("Contest created successfully!");

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

  const inputStyles = "w-full p-3 rounded-lg bg-[#0b1326] border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 placeholder:text-gray-500";
  const labelStyles = "block text-sm font-medium text-gray-400 mb-1.5 ml-1";

  return (
    <div className="min-h-screen bg-[#080e1b] text-white px-4 sm:px-6 lg:px-12 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <PlusCircle className="text-blue-500" size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Create Tournament</h1>
              <p className="text-gray-400 mt-1">Set up your next legendary competition</p>
            </div>
          </motion.div>
        </header>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-12 gap-8"
        >
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-8 bg-[#131b2e] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl">
            
            <section className="space-y-4">
              <div>
                <label className={labelStyles}>Tournament Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Pro Cyber League 2026"
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
                  placeholder="Tell participants about the rules and format..."
                  className={`${inputStyles} min-h-[120px] resize-none`}
                  required
                />
              </div>
            </section>

            <section className="space-y-4">
              <label className={labelStyles}>Banner Image</label>
              <div className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${bannerPreview ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-700 hover:border-blue-500 bg-[#0b1326]'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="bannerUpload"
                />
                <div className="p-4 bg-gray-800 group-hover:bg-blue-600 transition-colors rounded-full text-blue-400 group-hover:text-white">
                  <ImageIcon size={24} />
                </div>
                <div className="text-center">
                  <p className="font-semibold">{uploading ? "Uploading to Cloud..." : "Upload High-Res Banner"}</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP (Recommended 16:9)</p>
                </div>
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyles}><Calendar className="inline mr-1" size={14} /> Start Time</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  onChange={handleChange}
                  className={inputStyles}
                  required
                />
              </div>
              <div>
                <label className={labelStyles}><Calendar className="inline mr-1" size={14} /> End Time</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  onChange={handleChange}
                  className={inputStyles}
                  required
                />
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyles}><Users className="inline mr-1" size={14} /> Max Participants</label>
                <input
                  name="max_participants"
                  type="number"
                  placeholder="64"
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className={labelStyles}><Trophy className="inline mr-1" size={14} /> Prize Pool ($)</label>
                <input
                  name="prize_pool"
                  type="number"
                  placeholder="5000"
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyles}><LinkIcon className="inline mr-1" size={14} /> Assets Link</label>
                <input
                  name="assets_link"
                  placeholder="Google Drive / Dropbox"
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
              <div>
                <label className={labelStyles}><Mail className="inline mr-1" size={14} /> Judge Email</label>
                <input
                  name="judge_email"
                  type="email"
                  placeholder="judge@example.com"
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>
            </section>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || uploading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                loading || uploading 
                ? "bg-gray-700 cursor-not-allowed text-gray-400" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : "Create Tournament"}
            </motion.button>
          </div>

          {/* Sidebar Preview */}
          <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit">
            <div className="bg-[#131b2e] p-6 rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
              <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-4">Live Preview</h3>
              
              <div className="rounded-xl overflow-hidden bg-[#0b1326] border border-gray-700">
                <AnimatePresence mode="wait">
                  {bannerPreview ? (
                    <motion.img
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={bannerPreview}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <motion.div 
                      key="placeholder"
                      className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-600"
                    >
                      <ImageIcon size={40} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h2 className="font-bold text-xl truncate pr-2">
                      {form.title || "Tournament Title"}
                    </h2>
                    {form.prize_pool && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold">
                        ${form.prize_pool}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                    {form.description || "Your tournament description will appear here as you type. Make it sound exciting!"}
                  </p>

                  <div className="pt-4 border-t border-gray-800 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {form.max_participants || "0"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {form.start_time ? new Date(form.start_time).toLocaleDateString() : "TBD"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                <p className="text-xs text-blue-400 leading-relaxed">
                  💡 <strong>Tip:</strong> Use a clear, high-quality banner image to attract more participants to your tournament.
                </p>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}