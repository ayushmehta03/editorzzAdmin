"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { getSubmissionsWithVotes, updateSubmissionPoints, approveVoteResult } from "@/lib/api";

type Submission = {
  _id: string;
  user_id: string;
  votes_count: number;
  points: number;
  is_judged: boolean;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function TournamentSubmissionsPage({ params }: Props) {
  const { id: tournamentId } = use(params);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, [tournamentId]);

  const loadSubmissions = async () => {
    try {
      const res = await getSubmissionsWithVotes(tournamentId);
      const subList = res.submissions || [];
      setSubmissions(subList);

      const pointsMap: Record<string, number> = {};
      subList.forEach((sub: Submission) => {
        pointsMap[sub._id] = sub.points || 0;
      });
      setScores(pointsMap);
    } catch (err) {
      console.error("Error loading entries:", err);
      toast.error("Failed to load submission data.");
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (subId: string, val: string) => {
    const numValue = parseFloat(val) || 0;
    setScores((prev) => ({ ...prev, [subId]: numValue }));
  };

  const handleSavePoints = async (submissionId: string) => {
    try {
      setUpdatingId(submissionId);
      const pointsToAssign = scores[submissionId] || 0;
      await updateSubmissionPoints(submissionId, pointsToAssign);
      toast.success("Submission points updated!");
      await loadSubmissions();
    } catch (err) {
      toast.error("Failed to update score metrics.");
    } finally {
      setUpdatingId(null);
    }
  };

  const executePublish = async () => {
    try {
      setPublishing(true);
      await approveVoteResult(tournamentId);
      toast.success("Leaderboard finalized and approved successfully!");
      
      // Delay navigation slightly so they can see the success toast
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      toast.error("Failed to approve and finalize contest.");
    } finally {
      setPublishing(false);
    }
  };

  const handleFinalPublish = async () => {
    const unjudged = submissions.filter((s) => !s.is_judged);
    
    if (unjudged.length > 0) {
      // Utilizing sonner's action feature to replace the native browser confirm window cleanly
      toast.warning(`You have ${unjudged.length} un-judged submission(s).`, {
        description: "Proceeding will freeze their entries at 0 points.",
        action: {
          label: "Continue Anyway",
          onClick: () => executePublish(),
        },
        duration: 8000,
      });
      return;
    }

    await executePublish();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-10 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <Link href="/admin/vote" className="text-xs text-zinc-500 hover:text-white transition">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-4xl font-black mt-2">Review Submissions</h1>
        </div>

        <button
          onClick={handleFinalPublish}
          disabled={publishing || submissions.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-purple-600/10 hover:scale-[1.02] transition disabled:opacity-40 disabled:pointer-events-none"
        >
          {publishing ? "Approving..." : "Final Submission & Publish"}
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20 border border-white/5 bg-zinc-900/10 rounded-2xl">
          <p className="text-zinc-500">No submissions uploaded for this contest layout yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/5 rounded-xl bg-zinc-900/20 backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-zinc-400 text-xs font-semibold uppercase bg-zinc-900/60">
                <th className="p-4">Submission ID</th>
                <th className="p-4">Raw Votes</th>
                <th className="p-4">Current Points</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Assign Points</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id} className="border-b border-white/5 hover:bg-white/[0.02] transition text-sm">
                  <td className="p-4 font-mono text-zinc-300 text-xs">{sub._id}</td>
                  <td className="p-4 font-bold text-zinc-100">{sub.votes_count} votes</td>
                  <td className="p-4 text-zinc-400">{sub.points} pts</td>
                  <td className="p-4 text-center">
                    {sub.is_judged ? (
                      <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold">Judged</span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">Unsaved</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        value={scores[sub._id] ?? ""}
                        onChange={(e) => handleScoreChange(sub._id, e.target.value)}
                        placeholder="0"
                        className="w-20 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-purple-500 text-white"
                      />
                      <button
                        onClick={() => handleSavePoints(sub._id)}
                        disabled={updatingId === sub._id}
                        className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded hover:bg-zinc-200 transition disabled:opacity-50"
                      >
                        {updatingId === sub._id ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}