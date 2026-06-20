"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { 
  Megaphone, 
  Image as ImageIcon, 
  Link2, 
  Sparkles, 
  Eye, 
  ArrowUpRight,
  Loader2 
} from "lucide-react";
import { uploadFeaturePost, getCurrentFeaturePost } from "@/lib/api"; // Adjust import path

export default function FeaturePostPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(true);
  const [currentLivePost, setCurrentLivePost] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    actionLink: "",
  });

  // Fetch current live post on mount
  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await getCurrentFeaturePost();
        if (res && !res.message) {
          setCurrentLivePost(res);
        }
      } catch (err) {
        console.error("Failed to fetch live post", err);
      } finally {
        setFetchingLive(false);
      }
    }
    fetchLive();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Please fill in the title and description.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Publishing feature post...");

    try {
      // Matches the structure your Go backend expects
      const payload = {
        title: formData.title,
        description: formData.description,
        imageurl: formData.imageUrl,
        actionlink: formData.actionLink,
      };

      await uploadFeaturePost(payload);
      
      toast.success("Feature post is now live!", { id: toastId });
      setCurrentLivePost({ ...payload, createdat: new Date() });
      
      // Reset form
      setFormData({ title: "", description: "", imageUrl: "", actionLink: "" });
    } catch (error: any) {
      toast.error(error?.message || "Failed to broadcast feature post.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col justify-center items-center">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="w-full max-w-6xl space-y-8">
        {/* Header Heading */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Megaphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Feature Post Controller
            </h1>
            <p className="text-sm text-slate-400">
              Broadcast high-priority global alerts, updates, or events to the top of the feed instantly.
            </p>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Input Form Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl"
          >
            <h2 className="text-lg font-medium text-slate-200 mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Post Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Judge Tournament Now Active!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Description / Body Text *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the highlight context concisely..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <ImageIcon className="w-3.h-3" /> Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Link2 className="w-3.h-3" /> Call to Action URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourdomain.com/contest"
                    value={formData.actionLink}
                    onChange={(e) => setFormData({ ...formData, actionLink: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium rounded-xl text-sm transition-all focus:outline-none shadow-lg shadow-indigo-600/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Overwriting Active Feed...
                  </>
                ) : (
                  "Push Feature Post Live"
                )}
              </button>
            </form>
          </motion.div>

          {/* Right: Live Feed Preview Monitor */}
          <div className="lg:col-span-5 space-y-4 w-full">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 px-1">
              <Eye className="w-4 h-4 text-emerald-400" /> Real-time Feed Preview
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 min-h-[340px] flex flex-col justify-between relative overflow-hidden">
              {/* Decorative subtle backdrop glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
              
              <AnimatePresence mode="wait">
                {formData.title || formData.description ? (
                  /* Live Preview state based on active inputs */
                  <motion.div
                    key="input-preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 flex flex-col h-full justify-between"
                  >
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        Draft Setup
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 break-words line-clamp-2">
                        {formData.title || "Untitled Live Spotlight"}
                      </h3>
                      <p className="text-sm text-slate-400 break-words whitespace-pre-line line-clamp-4">
                        {formData.description || "Your campaign metrics and context details will appear populated dynamically here..."}
                      </p>
                    </div>

                    {formData.imageUrl && (
                      <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.imageUrl} alt="Preview asset" className="object-cover w-full h-full opacity-60" />
                      </div>
                    )}

                    {formData.actionLink && (
                      <div className="pt-2">
                        <div className="inline-flex items-center text-xs text-indigo-400 font-medium gap-1 group cursor-pointer hover:text-indigo-300 transition-colors">
                          View Activity <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : !fetchingLive && currentLivePost ? (
                  /* Fetched production Live data from the database split */
                  <motion.div
                    key="db-preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 flex flex-col h-full justify-between"
                  >
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active Live
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 line-clamp-2">{currentLivePost.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-4">{currentLivePost.description}</p>
                    </div>

                    {currentLivePost.imageurl && (
                      <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentLivePost.imageurl} alt="Live asset" className="object-cover w-full h-full opacity-50" />
                      </div>
                    )}

                    {currentLivePost.actionlink && (
                      <div className="pt-2">
                        <a 
                          href={currentLivePost.actionlink}
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center text-xs text-emerald-400 font-medium gap-1 group hover:text-emerald-300 transition-colors"
                        >
                          Visit Active Campaign <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Empty state monitor */
                  <div className="flex flex-col items-center justify-center text-center h-full my-auto space-y-2 text-slate-600">
                    <Eye className="w-8 h-8 opacity-40" />
                    <p className="text-xs">No active content staging setup found.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}