"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createTournament } from "@/lib/api";
import { uploadBannerImage } from "@/lib/claudinary";
import { 
  Calendar, 
  Users, 
  Trophy, 
  Link as LinkIcon, 
  Mail, 
  Image as ImageIcon, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Clock,
  ShieldCheck,
  DollarSign,
  Tag,
  FolderOpen
} from "lucide-react";

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
    category: "",
    label: "",
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

      const toastId = toast.loading("Uploading high-res banner...");
      const url = await uploadBannerImage(file);

      toast.dismiss(toastId);
      toast.success("Banner optimized & ready");

      setForm((prev) => ({ ...prev, banner_url: url }));
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.banner_url) return toast.error("Please upload a contest banner");
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      return toast.error("Tournament must end after the start time");
    }

    try {
      setLoading(true);
      await createTournament({
        ...form,
        max_participants: Number(form.max_participants),
        prize_pool: Number(form.prize_pool),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      });

      toast.success("Tournament Live! Redirecting to Dashboard...");
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (err: any) {
      toast.error(err.message || "Failed to create tournament");
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500/50 focus:bg-white/5 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all duration-300 placeholder:text-gray-600 text-sm";
  const labelStyles = "text-[10px] md:text-xs font-bold text-gray-500 mb-2 ml-1 uppercase tracking-[0.2em] flex items-center gap-2";
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-200 selection:bg-blue-500/30 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-blue-400 font-bold text-xs uppercase tracking-widest mb-4"
          >
            <ShieldCheck size={16} />
            <span>Judge-Based System</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-white"
          >
            Launch <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Tournament</span>
          </motion.h1>
          <p className="text-gray-500 mt-4 max-w-lg text-lg">
            Create professional-grade editor competitions with manual judging and ranking.
          </p>
        </header>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-12 gap-10"
        >
          <div className="lg:col-span-8 space-y-10">
            
            <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
              <div className="space-y-6">
                <div>
                  <label className={labelStyles}>Tournament Identity</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Contest Name"
                    className={inputStyles}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyles}><FolderOpen size={14}/> Category (Optional)</label>
                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="e.g. Anime, Gaming"
                      className={inputStyles}
                    />
                  </div>
                  <div>
                    <label className={labelStyles}><Tag size={14}/> Label (Optional)</label>
                    <input
                      name="label"
                      value={form.label}
                      onChange={handleChange}
                      placeholder="e.g. MegaWin, Direct Hire"
                      className={inputStyles}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyles}>Rules & Briefing</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Explain the rules, technical requirements, and submission format..."
                    className={`${inputStyles} min-h-[180px] resize-none`}
                    required
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
               <label className={labelStyles}>Brand Visual</label>
               <div className={`relative group border border-dashed rounded-[2rem] transition-all duration-500 overflow-hidden bg-[#0a0f1d] ${bannerPreview ? 'border-blue-500/40' : 'border-white/10 hover:border-blue-500/50'}`}>
                <AnimatePresence mode="wait">
                  {bannerPreview ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-72 w-full">
                      <img src={bannerPreview} className="w-full h-full object-cover rounded-[2rem]" alt="Banner" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <div className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon size={14} /> Replace Artwork
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                        <ImageIcon size={32} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white tracking-wide">Upload Event Banner</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">Recommended: 16:9 Aspect Ratio</p>
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

            <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={labelStyles}><Clock size={14} /> Starts</label>
                  <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} className={inputStyles} required />
                </div>
                <div className="space-y-2">
                  <label className={labelStyles}><Clock size={14} /> Deadline</label>
                  <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} className={inputStyles} required />
                </div>
                <div className="space-y-2">
                  <label className={labelStyles}><Users size={14} /> Slots</label>
                  <input name="max_participants" type="number" value={form.max_participants} placeholder="Unlimited" onChange={handleChange} className={inputStyles} required />
                </div>
                <div className="space-y-2">
                  <label className={labelStyles}><DollarSign size={14} /> Prize Pool</label>
                  <input name="prize_pool" type="number" value={form.prize_pool} placeholder="0.00" onChange={handleChange} className={inputStyles} required />
                </div>
              </div>
            </motion.div>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-6 rounded-3xl sticky top-10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-6 flex items-center gap-2">
                <Sparkles size={14}/> Final Logistics
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className={labelStyles}><LinkIcon size={14} /> Raw Assets</label>
                  <input name="assets_link" value={form.assets_link} placeholder="G-Drive Link" onChange={handleChange} className={inputStyles} required />
                </div>
                <div>
                  <label className={labelStyles}><Mail size={14} /> Lead Judge</label>
                  <input name="judge_email" type="email" value={form.judge_email} placeholder="judge@example.com" onChange={handleChange} className={inputStyles} required />
                  <p className="text-[10px] text-gray-600 mt-2 italic px-1">
                    * Judge will receive a unique link via email to score submissions.
                  </p>
                </div>

                <div className="pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || uploading}
                    className={`group relative w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] ${
                      loading || uploading 
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none" 
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Publish Tournament
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
               <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-4 tracking-wider">Publication Note</h4>
               <p className="text-[11px] text-gray-500 leading-relaxed">
                 By publishing, this tournament will be listed in the upcoming events tab. Ensure judges are briefed before deploying the judge email link.
               </p>
            </motion.div>
          </aside>
        </motion.form>
      </div>
    </div>
  );
}