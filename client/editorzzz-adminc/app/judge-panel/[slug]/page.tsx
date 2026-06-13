"use client";

import { use, useEffect, useState } from "react";
import {
  getJudgeSubmissions,
  saveJudgeScores,
  submitFinalScores,
  judgeRejectSubmission, // Imported our fresh deletion client method
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Save, Send, CheckCircle2, AlertCircle, Trophy, Star, Maximize2, X, MessageSquare, Trash2 } from "lucide-react";

export default function JudgePanel({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({}); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null); // Track specific button load states

  useEffect(() => {
    if (!slug) return;
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const response = await getJudgeSubmissions(slug);
      const subs = response.submissions || [];
      setSubmissions(subs);

      const initialScores: Record<string, number> = {};
      const initialRemarks: Record<string, string> = {};

      subs.forEach((s: any) => {
        if (s.points !== undefined) {
          initialScores[s._id] = s.points;
        }
        if (s.remark !== undefined) {
          initialRemarks[s._id] = s.remark;
        }
      });
      setScores(initialScores);
      setRemarks(initialRemarks);

      if (response.tournament?.is_judging_completed) {
        setSubmitted(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (id: string, value: number) => {
    setScores((prev) => ({ ...prev, [id]: value }));
  };

  const handleRemarkChange = (id: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      const scoresArray = submissions.map((s) => ({
        submission_id: s._id,
        points: scores[s._id] ?? 0,
        remark: remarks[s._id] || "",
      }));

      await saveJudgeScores(slug, scoresArray);
      toast.success("Progress saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Error saving scores");
    }
  };

  // Immediate Disqualification and Deletion Logic
  const handleRejectSubmission = async (submissionId: string, title: string) => {
    const confirmation = window.confirm(
      `⚠️ JUDGE OVERRIDE DETECTED\n\nAre you sure you want to permanently REJECT and DELETE "${title || "this project"}"?\n\nThis entry will be instantly scrubbed from the database and cannot be restored.`
    );
    if (!confirmation) return;

    try {
      setRejectingId(submissionId);
      const toastId = toast.loading("Expunging submission from systems...");

      await judgeRejectSubmission(slug, submissionId);

      toast.dismiss(toastId);
      toast.success("Submission successfully deleted.");

      // Splice state arrays immediately to remove from UI wrapper array
      setSubmissions((prev) => prev.filter((s) => s._id !== submissionId));
      setScores((prev) => {
        const updated = { ...prev };
        delete updated[submissionId];
        return updated;
      });
      setRemarks((prev) => {
        const updated = { ...prev };
        delete updated[submissionId];
        return updated;
      });

    } catch (err: any) {
      toast.error(err.message || "Failed to reject submission");
    } finally {
      setRejectingId(null);
    }
  };

  const handleOpenModal = () => {
    const allScored = submissions.length > 0 && submissions.every(
      (s) => scores[s._id] !== undefined
    );
    if (!allScored) {
      toast.error("Please assign a score to all entries first");
      return;
    }
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      await submitFinalScores(slug);
      toast.success("Submissions finalized!");
      setSubmitted(true);
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const scoredCount = Object.keys(scores).length;
  const progress = submissions.length ? (scoredCount / submissions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505]">
        <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="mt-4 text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase">Syncing Data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-44">
      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4 md:p-10"
          >
            <button 
              onClick={() => setSelectedMedia(null)}
              className="absolute top-6 right-6 z-[210] p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <div className="relative w-full h-full flex items-center justify-center">
              {selectedMedia.media_type?.includes("video") || (selectedMedia.media_url || selectedMedia.MediaURL).endsWith(".mp4") ? (
                <video 
                  src={selectedMedia.media_url ?? selectedMedia.MediaURL} 
                  controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl"
                />
              ) : (
                <img 
                  src={selectedMedia.media_url ?? selectedMedia.MediaURL} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  alt="Full view"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">Judge Dashboard</h1>
              <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Session: {slug.substring(0, 12)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Progress</p>
              <p className="text-xs sm:text-sm font-black">{scoredCount} / {submissions.length}</p>
            </div>
            <div className="w-20 sm:w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          <AnimatePresence mode="popLayout">
            {submissions.map((item, i) => {
              const mediaSrc = item.media_url ?? item.MediaURL;
              const isVideo = item.media_type?.includes("video") || mediaSrc.endsWith(".mp4");
              const isItemRejecting = rejectingId === item._id;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                  layout
                  className="group flex flex-col bg-zinc-900/40 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden hover:border-purple-500/50 transition-all duration-500 shadow-2xl"
                >
                  {/* Media Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    {isVideo ? (
                      <video
                        src={mediaSrc}
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={mediaSrc}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={item.title}
                      />
                    )}
                    
                    {/* Fullscreen Trigger */}
                    <button 
                      onClick={() => setSelectedMedia(item)}
                      className="absolute top-4 right-4 p-2.5 sm:p-3 bg-black/60 backdrop-blur-md rounded-2xl md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold shadow-md"
                    >
                      <Maximize2 size={14} /> <span className="hidden sm:inline">Open</span>
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 sm:p-8 pt-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight line-clamp-1">
                          {item.title || "Untitled Project"}
                        </h2>
                        
                        {/* Reject & Delete Button */}
                        <button
                          type="button"
                          disabled={submitted || isItemRejecting}
                          onClick={() => handleRejectSubmission(item._id, item.title)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/10 hover:border-transparent transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                          title="Reject and delete submission"
                        >
                          {isItemRejecting ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4 sm:mb-6">
                        <Star size={12} className="text-purple-400 fill-purple-400" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Candidate Entry</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Points Subcard */}
                      <div className="bg-white/[0.03] border border-white/5 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Points</span>
                          <span className="text-xl sm:text-2xl font-black text-purple-500">{scores[item._id] ?? 0}</span>
                        </div>

                        <input
                          type="range" min={0} max={100}
                          disabled={submitted}
                          value={scores[item._id] ?? 0}
                          onChange={(e) => handleScoreChange(item._id, Number(e.target.value))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-30 transition-all"
                        />
                      </div>

                      {/* Remarks Input Subcard */}
                      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-[1.5rem] space-y-2">
                        <div className="flex items-center gap-2 px-1 text-zinc-500">
                          <MessageSquare size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Feedback / Remarks</span>
                        </div>
                        <textarea
                          rows={2}
                          disabled={submitted}
                          value={remarks[item._id] || ""}
                          onChange={(e) => handleRemarkChange(item._id, e.target.value)}
                          placeholder="Write constructive notes here..."
                          className="w-full bg-zinc-950/60 text-zinc-200 border border-white/5 rounded-xl p-3 text-xs placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {submissions.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center mt-24 border-2 border-dashed border-zinc-800/60 rounded-[2.5rem] py-20 max-w-xl mx-auto"
          >
            <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">No entries left to judge</p>
          </motion.div>
        )}
      </main>

      {/* Floating Dynamic Bottom Panel */}
      <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg px-4 z-50">
        <div className="bg-[#111111]/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex items-center justify-between">
          <button
            onClick={handleSave} disabled={submitted || submissions.length === 0}
            className="flex items-center justify-center gap-2 px-5 sm:px-8 py-3.5 sm:py-4 text-zinc-400 hover:text-white transition-all font-bold text-xs sm:text-sm disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>Save Progress</span>
          </button>

          <button
            disabled={submitted || submissions.length === 0} onClick={handleOpenModal}
            className={`flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-10 py-3.5 sm:py-4 rounded-[1.5rem] sm:rounded-[2rem] font-black text-[10px] sm:text-xs tracking-widest transition-all ${
              submitted 
              ? "bg-green-500/20 text-green-400 border border-green-500/20" 
              : "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20 active:scale-95"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitted ? <>LOCKED</> : <>FINALIZE <Send size={14} /></>}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 border border-white/10 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] max-w-sm w-full text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="text-red-500" size={28} /></div>
              <h2 className="text-lg sm:text-xl font-black text-white mb-2 tracking-tight">Confirm Submission</h2>
              <p className="text-zinc-500 mb-6 sm:mb-8 text-xs sm:text-sm leading-relaxed font-medium">Once finalized, scores and remarks are locked permanently. You will not be able to modify them further.</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button onClick={() => setShowModal(false)} className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors font-bold text-zinc-400 text-xs sm:text-sm">Cancel</button>
                <button onClick={handleFinalSubmit} className="py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-zinc-200 transition-colors font-bold text-xs sm:text-sm">Finalize</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}