"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import {
  Users,
  Flag,
  Trophy,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  CheckCircle
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

import { getDashboardStats } from "@/lib/api";

export default function Dashboard() {

  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    reports: 0,
    growth: []
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadStats();
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

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* HEADER */}

        <div>
          <h2 className="text-3xl font-bold">
            Admin Dashboard
          </h2>

          <p className="text-slate-400 text-sm">
            System monitoring and management
          </p>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/manage-users")}
            className="cursor-pointer bg-slate-800/60 backdrop-blur-lg border border-slate-700 p-6 rounded-xl"
          >

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">
                Active Users
              </span>

              <Users className="text-blue-400" />
            </div>

            <p className="text-3xl font-bold mt-4">
              {stats.users}
            </p>

          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push("/reports")}
            className="cursor-pointer bg-slate-800/60 backdrop-blur-lg border border-slate-700 p-6 rounded-xl"
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

        {/* USER GROWTH CHART */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-800/60 border border-slate-700 rounded-xl p-6"
        >

          <div className="flex items-center justify-between mb-4">

            <h3 className="text-lg font-semibold">
              User Growth
            </h3>

            <BarChart3 className="text-blue-400" />

          </div>

          <div className="w-full h-[320px]">

            <ResponsiveContainer>

              <LineChart data={stats.growth}>

                <CartesianGrid stroke="#1e293b" />

                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

        {/* MANAGEMENT SECTION */}

        <div className="space-y-4">

          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
            Management
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Manage Users */}

            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => router.push("/manage-users")}
              className="cursor-pointer bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center justify-between"
            >

              <div className="flex items-center gap-4">

                <Users className="text-blue-400" />

                <div>
                  <h4 className="font-semibold">
                    Manage Users
                  </h4>

                  <p className="text-sm text-slate-400">
                    Verify identities and bans
                  </p>
                </div>

              </div>

              <ChevronRight />

            </motion.div>

            {/* Judge Tournaments */}

            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => router.push("/tournaments/judge")}
              className="cursor-pointer bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center justify-between"
            >

              <div className="flex items-center gap-4">

                <Trophy className="text-purple-400" />

                <div>
                  <h4 className="font-semibold">
                    Judge Tournaments
                  </h4>

                  <p className="text-sm text-slate-400">
                    Create expert judged events
                  </p>
                </div>

              </div>

              <ChevronRight />

            </motion.div>

            {/* Vote Tournaments */}

            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => router.push("/tournaments/vote")}
              className="cursor-pointer bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center justify-between"
            >

              <div className="flex items-center gap-4">

                <BarChart3 className="text-green-400" />

                <div>
                  <h4 className="font-semibold">
                    Vote Tournaments
                  </h4>

                  <p className="text-sm text-slate-400">
                    Launch voting contests
                  </p>
                </div>

              </div>

              <ChevronRight />

            </motion.div>

            {/* Post Reports */}

            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => router.push("/reports")}
              className="cursor-pointer bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center justify-between"
            >

              <div className="flex items-center gap-4">

                <Flag className="text-red-400" />

                <div>
                  <h4 className="font-semibold">
                    Post Reports
                  </h4>

                  <p className="text-sm text-slate-400">
                    Review flagged posts
                  </p>
                </div>

              </div>

              <ChevronRight />

            </motion.div>


            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => router.push("/approve-results")}
              className="cursor-pointer bg-slate-800/60 border border-slate-700 p-6 rounded-xl flex items-center justify-between"
            >

              <div className="flex items-center gap-4">

                <CheckCircle className="text-yellow-400" />

                <div>
                  <h4 className="font-semibold">
                    Approve Results
                  </h4>

                  <p className="text-sm text-slate-400">
                    Finalize tournament results
                  </p>
                </div>

              </div>

              <ChevronRight />

            </motion.div>

          </div>

        </div>

      </main>

    </div>
  );
}