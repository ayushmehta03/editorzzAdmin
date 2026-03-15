"use client";

import { motion } from "framer-motion";
import {
  Edit3,
  ShieldCheck,
  ArrowRight,
  Gauge,
  Users,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/router";

export default function Home() {

  const router=useRouter()
  return (
    <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen font-sans text-slate-900 dark:text-white flex flex-col">
      
      <header className="w-full flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-500/10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Edit3 size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">Editorzzz</span>
        </div>

        <span className="text-sm text-slate-500 dark:text-slate-400">
         Phase 1
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        
        <div className="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="max-w-2xl text-center space-y-8 py-20 relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-semibold"
          >
            <ShieldCheck size={16} />
            Secure Administrator Portal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold leading-tight"
          >
            Welcome, <span className="text-blue-600">Admin</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto"
          >
            Access the Administrator Portal to manage content, users, and
            platform analytics efficiently.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <button onClick={() => router.push('/login-admin')} className="min-w-[200px] h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center  justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all group">
              Log In Now
              <ArrowRight className="group-hover:translate-x-1 transition" size={18} />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Gauge size={22} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Real-time Dashboard
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Users size={22} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                User Management
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                <BarChart3 size={22} />
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Detailed Insights
              </span>
            </motion.div>

          </div>
        </div>
      </main>

      <footer className="border-t border-blue-500/10 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">

          <div className="flex flex-wrap gap-8 text-sm">
            <a className="text-slate-500 hover:text-blue-600 transition">
              Privacy Policy
            </a>
            <a className="text-slate-500 hover:text-blue-600 transition">
              Terms of Service
            </a>
            <a className="text-slate-500 hover:text-blue-600 transition">
              System Status
            </a>
            <a className="text-slate-500 hover:text-blue-600 transition">
              Support Helpdesk
            </a>
          </div>

          <p className="text-slate-400 text-sm">
            © 2026 Editorzzz. All rights reserved.
          </p>

        </div>
      </footer>
    </div>
  );
}