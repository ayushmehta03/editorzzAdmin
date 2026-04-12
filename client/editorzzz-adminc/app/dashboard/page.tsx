"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Gavel,
  Vote,
  Flag,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  CheckCircle,
  LogOut,
  TrophyIcon,
  Sparkles,
  Zap
} from "lucide-react";

import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";

import { getDashboardStats } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

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
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-blue-500/30 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 px-4 md:px-8 py-4 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-md opacity-40 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-400 to-blue-700 p-2.5 rounded-xl shadow-2xl">
                <ShieldCheck size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">
                Editorzzz
              </h1>
              <span className="text-[10px] font-bold text-blue-500 tracking-[0.3em] uppercase">Terminal</span>
            </div>
          </motion.div>

          <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/40 transition-all duration-500"
          >
            <span className="text-xs font-bold uppercase tracking-widest group-hover:text-red-400 transition-colors">Terminate</span>
            <LogOut size={16} className="text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 md:px-8 py-10 pb-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] uppercase tracking-[0.3em]">
                <div className="h-px w-8 bg-blue-500" />
                System Overview
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500">
                Command Center
              </h2>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Operational Alpha</span>
            </motion.div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              { label: "Total Users", val: stats.users, icon: Users, color: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/10", path: "/manage-users" },
              { label: "Alert Reports", val: stats.reports, icon: Flag, color: "from-rose-500 to-orange-500", shadow: "shadow-rose-500/10", path: "/reports" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => router.push(item.path)}
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-8 transition-all hover:border-white/10"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity`} />
                
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">
                    {item.label}
                  </span>
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <item.icon size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl md:text-7xl font-black tracking-tighter tabular-nums text-white">
                    {item.val}
                  </p>
                  <Zap size={20} className="text-slate-700 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            className="group relative bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 md:p-10 backdrop-blur-md overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight italic">User Analytics</h3>
                <p className="text-xs text-slate-500 font-medium">Metric performance over current interval</p>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <BarChart3 size={14} className="text-blue-400" />
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">Real-time Flow</span>
              </div>
            </div>
            
            <div className="w-full h-[400px] group-hover:opacity-100 opacity-80 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.growth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#475569" 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false} 
                    dy={15} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '20px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorUsers)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="space-y-8">
            <motion.div variants={itemVariants} className="flex items-center gap-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] whitespace-nowrap">Access Protocols</h3>
              <div className="h-px flex-1 bg-white/5" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {[
                { title: "Judge Tournament", sub: "Setup expert-based contest", icon: Gavel, color: "text-indigo-400", bg: "group-hover:bg-indigo-500/20", path: "/contest-judge" },
                { title: "Vote Tournament", sub: "Launch public voting contest", icon: Vote, color: "text-pink-400", bg: "group-hover:bg-pink-500/20", path: "/contest-vote" },
                { title: "Contest status", sub: "History and inspection", icon: TrophyIcon, color: "text-blue-500", bg: "group-hover:bg-blue-500/20", path: "/contest-inspection" },
                { title: "Manage Users", sub: "Verification & access", icon: Users, color: "text-blue-400", bg: "group-hover:bg-blue-400/20", path: "/manage-users" },
                { title: "Voting Control", sub: "Audit public contests", icon: BarChart3, color: "text-emerald-400", bg: "group-hover:bg-emerald-500/20", path: "/vote-manage" },
                { title: "Moderation", sub: "Flagged content queue", icon: Flag, color: "text-rose-400", bg: "group-hover:bg-rose-500/20", path: "/reports" },
                { title: "Approve Results", sub: "Confirm Judge Action", icon: CheckCircle, color: "text-amber-400", bg: "group-hover:bg-amber-500/20", path: "/approve-results" },
              ].map((action, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(action.path)}
                  className="cursor-pointer group relative bg-slate-900/30 border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between transition-all duration-300 overflow-hidden"
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`p-4 rounded-2xl bg-white/5 transition-all duration-500 ${action.bg}`}>
                      <action.icon className={`${action.color} group-hover:scale-110 group-hover:rotate-12 transition-transform`} size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">{action.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{action.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <div className="fixed bottom-10 left-10 opacity-20 pointer-events-none">
        <Sparkles size={100} className="text-blue-900 rotate-12" />
      </div>
    </div>
  );
}