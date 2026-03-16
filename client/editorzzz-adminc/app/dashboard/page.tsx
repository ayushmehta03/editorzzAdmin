"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Flag,
  Trophy,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  CheckCircle,
  LogOut,
  Activity,
  TrophyIcon
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
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
        console.error("Failed to load dashboard data", err);
      }
    }
    loadStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login-admin");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-blue-500/30">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-[#020617]/70 backdrop-blur-xl border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight hidden sm:block">
            Editorzzz <span className="text-blue-500 text-xs font-medium ml-1 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">Admin</span>
          </h1>
        </div>

        <button 
          onClick={handleLogout}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/50 transition-all duration-300"
        >
          <span className="text-sm font-medium group-hover:text-red-400 transition-colors">Logout</span>
          <LogOut size={18} className="group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
        {/* WELCOME SECTION */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <h2 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Overview
            </h2>
            <p className="text-slate-400 font-medium flex items-center gap-2">
              <Activity size={14} className="text-blue-400" />
              Real-time system monitoring
            </p>
          </motion.div>
        </section>

        {/* KEY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
          {[
            { label: "Total Users", val: stats.users, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", path: "/manage-users" },
            { label: "Pending Reports", val: stats.reports, icon: Flag, color: "text-rose-400", bg: "bg-rose-400/10", path: "/reports" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.path)}
              className="group cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-600 p-8 rounded-2xl transition-all shadow-xl shadow-black/20"
            >
              <div className="flex items-center justify-between">
                <p className="text-slate-400 font-semibold tracking-wide uppercase text-xs">{item.label}</p>
                <div className={`${item.bg} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} className={item.color} />
                </div>
              </div>
              <p className="text-4xl md:text-5xl font-black mt-4 tabular-nums">{item.val}</p>
            </motion.div>
          ))}
        </div>

        {/* CHART SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 md:p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">User Analytics</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Live Growth</span>
            </div>
          </div>
          
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.growth}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#020617' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Management Hub</h3>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: " Contest status", sub: "View all contests history and details", icon: TrophyIcon, color: "text-blue-500", path: "/approve-results" },
              { title: "Manage Users", sub: "Control access & verify", icon: Users, color: "text-blue-400", path: "/manage-users" },
              { title: "Judge Panel", sub: "Review expert results", icon: Trophy, color: "text-purple-400", path: "/tournaments/judge" },
              { title: "Voting Control", sub: "Audit public contests", icon: BarChart3, color: "text-emerald-400", path: "/tournaments/vote" },
              { title: "Moderation", sub: "Flagged content queue", icon: Flag, color: "text-rose-400", path: "/reports" },
              { title: "Approve Results", sub: "Finalize payouts & winners", icon: CheckCircle, color: "text-amber-400", path: "/approve-results" },

            ].map((action, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(30, 41, 59, 0.5)" }}
                onClick={() => router.push(action.path)}
                className="cursor-pointer group bg-slate-900/30 border border-slate-800 p-5 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors`}>
                    <action.icon className={`${action.color}`} size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{action.title}</h4>
                    <p className="text-xs text-slate-500">{action.sub}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}