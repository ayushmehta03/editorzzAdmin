"use client";

import { use, useEffect, useState } from "react";
import {
  getJudgeSubmissions,
  saveJudgeScores,
  submitFinalScores,
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Save, Send, CheckCircle2, AlertCircle, Trophy, Clock } from "lucide-react";

export default function JudgePanel({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tournamentName, setTournamentName] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      // In your Go API, getJudgeSubmissions likely returns { submissions: [] } 
      // based on the sCol.Find logic.
      const response = await getJudgeSubmissions(slug);
      
      // If your API returns the tournament info separately or within this call:
      const subs = response.submissions || [];
      setSubmissions(subs);

      // Initialize scores from existing DB values (points field in Go)
      const initialScores: Record<string, number> = {};
      subs.forEach((s: any) => {
        if (s.points !== undefined) {
          initialScores[s._id] = s.points;
        }
      });
      setScores(initialScores);

      // Check if already locked (is_judging_completed in Go)
      if (response.tournament?.is_judging_completed) {
        setSubmitted(true);
      }
      if (response.tournament?.title) {
        setTournamentName(response.tournament.title);
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

  const handleSave = async () => {
    try {
      // MATCHING YOUR GO STRUCT: 
      // type ScoreUpdate struct { SubmissionID, Points }
      const payload = {
        judge_slug: slug,
        scores: Object.entries(scores).map(([id, pts]) => ({
          submission_id: id,
          points: pts,
        })),
      };

      await saveJudgeScores(payload);
      toast.success("Draft saved to database");
    } catch (err: any) {
      toast.error(err.message || "Error saving draft");
    }
  };

  const handleOpenModal = () => {
    const allScored = submissions.length > 0 && submissions.every(
      (s) => scores[s._id] !== undefined
    );

    if (!allScored) {
      toast.error("Please score all submissions before final submission.");
      return;
    }
    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      // Calls SubmitFinalScores handler in Go
      await submitFinalScores(slug);
      toast.success("Scores locked and submitted! 🎉");
      setSubmitted(true);
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || "Final submission failed");
    }
  };

  const scoredCount = Object.keys(scores).length;
  const progress = submissions.length ? (scoredCount / submissions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-purple-500/10 rounded-full"></div>
            </div>
        </div>
        <p className="mt-6 text-zinc-500 font-medium tracking-widest animate-pulse uppercase text-xs">Initialising Panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 pb-40">
      {/* Premium Header */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Trophy className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {tournamentName || "Judge Review Portal"}
              </h1>
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                LIVE SESSION • {slug.slice(0, 8)}...
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 p-2 px-4 rounded-2xl flex items-center gap-6">
            <div className="text-right">
                <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Completion</p>
                <p className="text-sm font-black text-white">{scoredCount} / {submissions.length}</p>
            </div>
            <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-purple-500"
                />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {submitted && (
            <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3 text-blue-400">
                <Info size={20} />
                <p className="text-sm font-medium">This tournament is locked. Scores are now in read-only mode.</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {submissions.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-4 hover:bg-zinc-900/60 hover:border-purple-500/30 transition-all duration-500"
            >
              <div className="relative h-64 mb-6 overflow-hidden rounded-[2rem]">
                <img
                  src={item.media_url ?? item.MediaURL}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt="Submission"
                />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                  #{i + 1} Candidate
                </div>
              </div>

              <div className="px-2">
                <h2 className="text-lg font-bold text-white mb-6 line-clamp-1">
                  {item.title ?? item.Title ?? "Untitled Submission"}
                </h2>

                <div className="space-y-4 bg-black/20 p-4 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-end">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Score</span>
                    <span className="text-3xl font-black text-purple-500">
                      {scores[item._id] ?? 0}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    disabled={submitted}
                    value={scores[item._id] ?? 0}
                    onChange={(e) => handleScoreChange(item._id, Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-20 transition-all hover:accent-purple-400"
                  />
                  
                  <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Control Dock */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
        <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={submitted}
            className="flex items-center gap-2 px-6 py-4 text-zinc-400 hover:text-white transition-all font-bold text-sm disabled:opacity-20"
          >
            <Save size={18} />
            Save Draft
          </button>

          <button
            disabled={submitted}
            onClick={handleOpenModal}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm tracking-tight transition-all shadow-xl ${
              submitted 
              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
              : "bg-white text-black hover:bg-purple-50 active:scale-95"
            } disabled:opacity-50`}
          >
            {submitted ? (
              <><CheckCircle2 size={18} /> COMPLETE</>
            ) : (
              <><Send size={18} /> FINAL SUBMIT</>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-zinc-900 border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-amber-500" size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Lock Scores?</h2>
              <p className="text-zinc-500 mb-8 text-sm leading-relaxed">
                You are about to finalize judging. This will lock all points and notify the tournament organizer. This cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFinalSubmit}
                  className="w-full py-4 rounded-2xl bg-purple-600 text-white hover:bg-purple-500 transition-colors font-bold shadow-lg shadow-purple-600/20"
                >
                  Confirm & Submit
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 rounded-2xl text-zinc-500 hover:text-white transition-colors font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}