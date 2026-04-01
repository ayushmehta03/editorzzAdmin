"use client";

import { useEffect, useState } from "react";
import {
  getJudgeSubmissions,
  saveJudgeScores,
  submitFinalScores,
} from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function JudgePanel({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getJudgeSubmissions(slug);
      setSubmissions(data.submissions);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (id: string, value: number) => {
    setScores((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      await saveJudgeScores({
        judge_slug: slug,
        scores: Object.entries(scores).map(([id, pts]) => ({
          submission_id: id,
          points: pts,
        })),
      });

      toast.success("Draft saved 🚀");
    } catch (err: any) {
      toast.error(err.message);
    }
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

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-10 py-10">
      <div className="flex flex-col md:flex-row justify-between mb-10 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold">
          Judge Panel
        </h1>

        <div className="text-sm text-purple-400">
          {Object.keys(scores).length} / {submissions.length} scored
        </div>
      </div>

      {/* GRID */}
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
              src={item.media_url}
              className="w-full h-60 object-cover"
            />

            <div className="p-6">
              <h2 className="text-xl font-bold">{item.title}</h2>

              <input
                type="range"
                min={0}
                max={100}
                disabled={submitted}
                value={scores[item._id] || 0}
                onChange={(e) =>
                  handleScoreChange(item._id, Number(e.target.value))
                }
                className="w-full mt-4"
              />

              <div className="text-purple-400 mt-2">
                {scores[item._id] || 0} / 100
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur flex justify-between px-6 py-4">
        <button
          onClick={handleSave}
          className="text-gray-400 hover:text-white"
        >
          Save Draft
        </button>

        <button
          disabled={submitted}
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-full"
        >
          Submit Final
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 p-8 rounded-2xl max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">
              Submit Final Scores?
            </h2>
            <p className="text-gray-400 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-600 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleFinalSubmit}
                className="flex-1 bg-purple-500 py-2 rounded"
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