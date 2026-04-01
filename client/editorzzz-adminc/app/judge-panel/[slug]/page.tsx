"use client";

import { use, useEffect, useState } from "react"; // ✅ added use
import {
  getJudgeSubmissions,
  saveJudgeScores,
  submitFinalScores,
} from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

  useEffect(() => {
    if (!slug) return; 
    fetchData();
  }, [slug]); 

  const fetchData = async () => {
    try {
      const data = await getJudgeSubmissions(slug);

      const subs = Array.isArray(data)
        ? data
        : data.submissions || [];

      setSubmissions(subs);

      const initialScores: Record<string, number> = {};
      subs.forEach((s: any) => {
        if (s.points !== undefined) {
          initialScores[s._id] = s.points;
        }
      });

      setScores(initialScores);
    } catch (err: any) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (id: string, value: number) => {
    setScores((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      await saveJudgeScores(
        slug,
        Object.entries(scores).map(([id, pts]) => ({
          submission_id: id,
          points: pts,
        }))
      );

      toast.success("Draft saved 🚀");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleOpenModal = () => {
    const allScored = submissions.every(
      (s) => scores[s._id] !== undefined
    );

    if (!allScored) {
      toast.error("Please score all submissions first");
      return;
    }

    setShowModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      await submitFinalScores(slug);
      toast.success("Scores submitted 🎉");
      setSubmitted(true);
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-10 py-10 pb-32">
      
      <div className="flex flex-col md:flex-row justify-between mb-10 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Judge Panel
        </h1>

        <div className="text-sm text-purple-400">
          {Object.keys(scores).length} / {submissions.length} scored
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {submissions.map((item, i) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition"
          >
            <img
              src={item.media_url ?? item.MediaURL}
              className="w-full h-60 object-cover"
              alt={item.title ?? item.Title}
            />

            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">
                {item.title ?? item.Title}
              </h2>

              <input
                type="range"
                min={0}
                max={100}
                disabled={submitted}
                value={scores[item._id] ?? 0}
                onChange={(e) =>
                  handleScoreChange(item._id, Number(e.target.value))
                }
                className="w-full mt-4 accent-purple-500"
              />

              <div className="text-purple-400 mt-2 text-sm">
                {scores[item._id] ?? 0} / 100
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur flex justify-between px-6 py-4 border-t border-zinc-800">
        
        <button
          onClick={handleSave}
          disabled={submitted}
          className="text-gray-400 hover:text-white transition"
        >
          Save Draft
        </button>

        <button
          disabled={submitted}
          onClick={handleOpenModal}
          className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-full font-semibold shadow-lg disabled:opacity-50"
        >
          {submitted ? "Submitted" : "Submit Final"}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 p-8 rounded-2xl max-w-md w-full border border-zinc-700"
          >
            <h2 className="text-xl font-bold mb-4">
              Submit Final Scores?
            </h2>

            <p className="text-gray-400 mb-6">
              Once submitted, you cannot edit scores.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-600 py-2 rounded hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                onClick={handleFinalSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 py-2 rounded font-semibold"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}