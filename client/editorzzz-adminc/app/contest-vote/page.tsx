"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Clock,
  ArrowRight,
  ChevronRight,
  Info,
  DollarSign,
  Layers,
  Tag,
  FolderOpen
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
    category: "",
    label: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setPreview(URL.createObjectURL(file));

      const toastId = toast.loading("Uploading high-res banner...");
      const url = await uploadBannerImage(file);

      toast.dismiss(toastId);
      toast.success("Banner optimized & uploaded");

      setForm((prev) => ({ ...prev, banner_url: url }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.banner_url) return toast.error("Please upload a contest banner");

    const start = new Date(form.start_time);
    const end = new Date(form.end_time);
    const vStart = new Date(form.voting_start_time);
    const vEnd = new Date(form.voting_end_time);

    if (end <= start) return toast.error("Submission end must be after start");
    if (vStart < end) return toast.error("Voting phase must start after submissions end");
    if (vEnd <= vStart) return toast.error("Voting end must be after voting start");

    try {
      setLoading(true);
      await createVoteContest({
        ...form,
        max_participants: Number(form.max_participants),
        prize_pool: Number(form.prize_pool),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        voting_start_time: vStart.toISOString(),
        voting_end_time: vEnd.toISOString(),
      });

      toast.success("Contest Live! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate contest");
      setLoading(false);
    }
  };

  const inputStyle = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-600 text-sm";
  const labelStyle = "text-[10px] md:text-xs font-bold text-gray-500 mb-2 uppercase tracking-[0.2em] flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-3 uppercase tracking-tighter">
              <Sparkles size={16} />
              <span>Admin Terminal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
              New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Vote Contest</span>
            </h1>
            <p className="text-gray-500 mt-4 max-w-md text-lg">
              Configure a community-driven competition with a dedicated voting phase.
            </p>
          </motion.div>
        </header>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-md"
            >
              <div className="grid gap-6">
                <div>
                  <label className={labelStyle}><Info size={14}/> Contest Title</label>
                  <input name="title" value={form.title} placeholder="e.g. Cyberpunk Edit Challenge 2024" onChange={handleChange} className={inputStyle} required />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}><FolderOpen size={14}/> Category (Optional)</label>
                    <input 
                      name="category" 
                      value={form.category}
                      placeholder="e.g. Font work" 
                      onChange={handleChange} 
                      className={inputStyle} 
                    />
                  </div>
                  <div>
                    <label className={labelStyle}><Tag size={14}/> Label (Optional)</label>
                    <input 
                      name="label" 
                      value={form.label}
                      placeholder="e.g. Direct Hire, MegaWin" 
                      onChange={handleChange} 
                      className={inputStyle} 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}><Layers size={14}/> Extended Description</label>
                  <textarea name="description" value={form.description} placeholder="Specify rules, themes, and criteria..." onChange={handleChange} className={`${inputStyle} min-h-[160px] resize-none`} required />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.02] border border-white/10 p-2 rounded-3xl overflow-hidden"
            >
              <div className="relative group min-h-[300px] flex items-center justify-center bg-[#0a0f1d] rounded-[22px] transition-all border border-transparent hover:border-blue-500/30">
                {preview ? (
                  <div className="relative w-full h-full">
                    <img src={preview} className="w-full h-72 object-cover rounded-[20px]" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-sm font-bold flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full">
                        <ImageIcon size={16}/> Change Banner
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-12">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Contest Banner</h3>
                    <p className="text-gray-500 text-sm mt-1">Recommended: 1920x1080 (PNG/JPG)</p>
                  </div>
                )}
                <input type="file" onChange={handleUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Clock size={20}/></div>
                <h2 className="text-xl font-bold">Contest Schedule</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-12 relative">
                <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-[1px] bg-gradient-to-b from-blue-500/50 via-indigo-500/50 to-transparent" />

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest italic">Phase 01: Submissions</div>
                  <div>
                    <label className={labelStyle}>Start Date</label>
                    <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>End Date</label>
                    <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest italic">Phase 02: Community Vote</div>
                  <div>
                    <label className={labelStyle}>Voting Opens</label>
                    <input type="datetime-local" name="voting_start_time" value={form.voting_start_time} onChange={handleChange} className={inputStyle} required />
                  </div>
                  <div>
                    <label className={labelStyle}>Voting Closes</label>
                    <input type="datetime-local" name="voting_end_time" value={form.voting_end_time} onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-6 rounded-3xl sticky top-10"
            >
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                  <Trophy size={16}/> Parameters
                </h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <label className={labelStyle}>Grand Prize Pool</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                      <input name="prize_pool" value={form.prize_pool} placeholder="0.00" type="number" onChange={handleChange} className={`${inputStyle} pl-10`} />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Max Entrants</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                      <input name="max_participants" value={form.max_participants} placeholder="Unlimited" type="number" onChange={handleChange} className={`${inputStyle} pl-10`} />
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>Resource Assets</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16}/>
                      <input name="assets_link" value={form.assets_link} placeholder="Drive / Dropbox URL" onChange={handleChange} className={`${inputStyle} pl-10`} />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || uploading}
                    className="group relative w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Initialize Contest
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                  <p className="text-[10px] text-center text-gray-600 mt-4 uppercase tracking-tighter">
                    Contest data will be indexed and broadcasted to participants immediately upon creation.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
               <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2">Requirement Checklist</h4>
               <ul className="space-y-1 text-[11px] text-gray-500">
                 <li className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${form.title ? 'bg-green-500' : 'bg-gray-700'}`}/> Title defined</li>
                 <li className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${preview ? 'bg-green-500' : 'bg-gray-700'}`}/> Banner uploaded</li>
                 <li className="flex items-center gap-2"><div className={`w-1 h-1 rounded-full ${form.start_time && form.end_time ? 'bg-green-500' : 'bg-gray-700'}`}/> Timeline set</li>
               </ul>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}