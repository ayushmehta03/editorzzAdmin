"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { uploadFeaturePost, getCurrentFeaturePost } from "@/lib/api";
import { uploadBannerImage } from "@/lib/claudinary";
import {
  Sparkles,
  Megaphone,
  Info,
  Layers,
  Image as ImageIcon,
  ChevronRight,
  Eye,
  RefreshCcw,
} from "lucide-react";

type LiveFeaturePost = {
  _id: string;
  title: string;
  descreption: string;
  banner_url: string;
  is_live: boolean;
  created_at: string;
};

export default function CreateFeaturePostPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Tracks whether a feature post is currently live, so we know
  // whether to say "Upload Now" or "Upload New Feature".
  const [checkingCurrent, setCheckingCurrent] = useState(true);
  const [currentPost, setCurrentPost] = useState<LiveFeaturePost | null>(null);

  const [form, setForm] = useState({
    title: "",
    descreption: "",
    banner_url: "",
  });

  // Fetch whatever feature post is currently live on mount.
  useEffect(() => {
    let cancelled = false;

    const fetchCurrent = async () => {
      try {
        setCheckingCurrent(true);
        const data = await getCurrentFeaturePost();
        if (!cancelled) setCurrentPost(data ?? null);
      } catch (err: any) {
        // A 404 here just means nothing is live yet — that's a valid
        // state, not an error to surface to the admin.
        if (!cancelled) setCurrentPost(null);
      } finally {
        if (!cancelled) setCheckingCurrent(false);
      }
    };

    fetchCurrent();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setPreview(URL.createObjectURL(file));

      const toastId = toast.loading("Uploading feature graphic...");
      const url = await uploadBannerImage(file);

      toast.dismiss(toastId);
      toast.success("Graphic uploaded & optimized");

      // Bug fix: handleSubmit reads form.banner_url, so we must write
      // the uploaded URL to that same key (was previously "imageurl",
      // which meant the banner never actually made it to the request).
      setForm((prev) => ({ ...prev, banner_url: url }));
    } catch (err: any) {
      toast.error(err.message || "Failed to process image file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.descreption) {
      return toast.error("Please fill out both the title and context fields");
    }

    try {
      setLoading(true);
      const toastId = toast.loading(
        currentPost
          ? "Replacing live feature post..."
          : "Publishing feature post to global feed..."
      );

      await uploadFeaturePost({
        title: form.title,
        descreption: form.descreption,
        banner_url: form.banner_url,
      });

      toast.dismiss(toastId);
      toast.success("Feature Post is now Live!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to broadcast feature post");
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500/50 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-gray-600 text-sm text-slate-100";
  const labelStyle =
    "text-[10px] md:text-xs font-bold text-gray-500 mb-2 uppercase tracking-[0.2em] flex items-center gap-2";

  return (
    <div className="min-h-screen bg-[#050810] text-slate-200 selection:bg-indigo-500/30 flex flex-col justify-center items-center p-4 md:p-8">
      <Toaster position="top-right" richColors theme="dark" />

      {/* Atmospheric Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto z-10 space-y-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-3 uppercase tracking-tighter">
              <Sparkles size={16} />
              <span>Admin Terminal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
              Live{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                Feature Post
              </span>
            </h1>
            <p className="text-gray-500 mt-4 max-w-md text-lg">
              Broadcast high-priority global alerts or dashboard configurations
              directly to the top of the feed.
            </p>

            {/* Current state indicator: no feature live vs. one already live */}
            <div className="mt-5">
              {checkingCurrent ? (
                <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                  <RefreshCcw size={12} className="animate-spin" />
                  Checking live feed status...
                </div>
              ) : currentPost ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Currently live: {currentPost.title}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20 uppercase tracking-wider">
                  No feature post right now
                </div>
              )}
            </div>
          </motion.div>
        </header>

        {/* Core Layout Grid Layout */}
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Fields */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-xl"
            >
              <div className="grid gap-6">
                <div>
                  <label className={labelStyle}>
                    <Info size={14} /> Campaign Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    placeholder="e.g. Expert Judge Tournaments Are Now Live!"
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelStyle}>
                    <Layers size={14} /> Context Description
                  </label>
                  <textarea
                    // Bug fix: was "description", but state key is "descreption",
                    // which broke this as a controlled input.
                    name="descreption"
                    value={form.descreption}
                    placeholder="Provide clear detail on the announcement or highlighted action..."
                    onChange={handleChange}
                    className={`${inputStyle} min-h-[160px] resize-none`}
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Media Upload Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.02] border border-white/10 p-2 rounded-3xl overflow-hidden"
            >
              <div className="relative group min-h-[260px] flex items-center justify-center bg-[#0a0f1d] rounded-[22px] transition-all border border-transparent hover:border-indigo-500/30">
                {preview ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      className="w-full h-64 object-cover rounded-[20px]"
                      alt="Preview Assets"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                      <p className="text-sm font-bold flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-white/10">
                        <ImageIcon size={16} /> Swap Cover Graphic
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-8">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon size={28} />
                    </div>
                    <h3 className="text-base font-bold text-white">Cover Media Graphic</h3>
                    <p className="text-gray-500 text-xs mt-1">
                      Recommended aspect ratio: 16:9 Landscape (PNG/JPG)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </motion.div>
          </div>

          {/* Right: Sidebar & Feed Preview Panel */}
          <aside className="lg:col-span-4 space-y-6 sticky top-10">
            {/* Visual Feed Preview */}
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2 px-1">
              <Eye size={14} className="text-indigo-400" /> Dynamic Live Feed Monitor
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 min-h-[300px] flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl pointer-events-none rounded-full" />

              <AnimatePresence mode="wait">
                {form.title || form.descreption || preview ? (
                  <motion.div
                    key="active-preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 flex flex-col h-full justify-between"
                  >
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Live Staging Preview
                      </div>
                      <h3 className="text-lg font-bold text-white break-words line-clamp-2">
                        {form.title || "Untitled Staging Spot"}
                      </h3>
                      <p className="text-xs text-gray-400 break-words whitespace-pre-line line-clamp-4">
                        {form.descreption ||
                          "The message parameters and contextual fields will output live inside the dashboard feed section container here..."}
                      </p>
                    </div>

                    {preview && (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/5 bg-slate-950/80 mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt="Staged display graphic"
                          className="object-cover w-full h-full opacity-60"
                        />
                      </div>
                    )}
                  </motion.div>
                ) : currentPost ? (
                  // Nothing typed yet, but something is live — show what
                  // will be replaced once the admin publishes.
                  <motion.div
                    key="current-live"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest w-fit">
                      Currently Live
                    </div>
                    <h3 className="text-lg font-bold text-white break-words line-clamp-2">
                      {currentPost.title}
                    </h3>
                    <p className="text-xs text-gray-400 break-words whitespace-pre-line line-clamp-4">
                      {currentPost.descreption}
                    </p>
                    {currentPost.banner_url && (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/5 bg-slate-950/80 mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentPost.banner_url}
                          alt="Currently live graphic"
                          className="object-cover w-full h-full opacity-60"
                        />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full my-auto space-y-2 text-gray-600 py-12">
                    <Megaphone size={24} className="opacity-30" />
                    <p className="text-xs max-w-[180px]">
                      Fill out details to preview card layout configuration.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Execution Actions Dashboard Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 p-6 rounded-3xl"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <Megaphone size={14} /> Publication Action
                </h3>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {currentPost
                    ? "Publishing replaces the post currently live on the feed with this one."
                    : "No feature post is live yet. Publishing will put this one at the top of the feed."}
                </p>

                <div className="pt-4 border-t border-white/5">
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || uploading}
                    className="group relative w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)]"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {currentPost ? "Upload New Feature" : "Upload Now"}
                        <ChevronRight
                          size={16}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </aside>
        </form>
      </div>
    </div>
  );
}