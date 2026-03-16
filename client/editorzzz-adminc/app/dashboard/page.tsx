"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users,
  Flag,
  Trophy,
  BarChart3,
  ShieldCheck
} from "lucide-react";

export default function Dashboard() {

  const [stats, setStats] = useState({
    users: 0,
    reports: 0
  });

  useEffect(() => {
    fetch("http://localhost:1001/api/admin/dashboard")
      .then(res => res.json())
      .then(data => {
        setStats(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">

        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldCheck size={20} />
          </div>

          <h1 className="text-xl font-bold">Editorzzz</h1>
        </div>

        <span className="text-sm text-slate-400">
          Admin Dashboard
        </span>

      </header>

      {/* CONTENT */}
      <main className="p-6 max-w-6xl mx-auto space-y-8">

        {/* PAGE HEADER */}
        <div>
          <h2 className="text-2xl font-bold">
            Dashboard
          </h2>

          <p className="text-slate-400 text-sm">
            Monitor platform activity
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 p-6 rounded-xl"
          >
            <div className="flex items-center justify-between">

              <span className="text-slate-400 text-sm">
                Total Users
              </span>

              <Users className="text-blue-400" />

            </div>

            <p className="text-3xl font-bold mt-4">
              {stats.users}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 p-6 rounded-xl"
          >
            <div className="flex items-center justify-between">

              <span className="text-slate-400 text-sm">
                Reports
              </span>

              <Flag className="text-red-400" />

            </div>

            <p className="text-3xl font-bold mt-4">
              {stats.reports}
            </p>
          </motion.div>

        </div>

        {/* MANAGEMENT ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center gap-4"
          >
            <Users className="text-blue-400" size={28} />

            <div>
              <h3 className="font-semibold">
                Manage Users
              </h3>

              <p className="text-sm text-slate-400">
                Ban or verify users
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center gap-4"
          >
            <Trophy className="text-purple-400" size={28} />

            <div>
              <h3 className="font-semibold">
                Judge Tournaments
              </h3>

              <p className="text-sm text-slate-400">
                Create expert judged contests
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center gap-4"
          >
            <BarChart3 className="text-green-400" size={28} />

            <div>
              <h3 className="font-semibold">
                Vote Tournaments
              </h3>

              <p className="text-sm text-slate-400">
                Community voting events
              </p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center gap-4"
          >
            <Flag className="text-red-400" size={28} />

            <div>
              <h3 className="font-semibold">
                Post Reports
              </h3>

              <p className="text-sm text-slate-400">
                Review flagged content
              </p>
            </div>
          </motion.div>

        </div>

      </main>

    </div>
  );
}