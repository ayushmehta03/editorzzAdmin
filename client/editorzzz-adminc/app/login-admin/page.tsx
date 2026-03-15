"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { adminLogin } from "@/lib/api"; // Ensure this path matches your file structure
import {
  Edit3,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Calling your Go Backend via the api utility
      const data = await adminLogin(formData.identifier, formData.password);

      // Store the JWT token from utils.GenerateToken
      localStorage.setItem("admin_token", data.token);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      // Displays "No such user found" or "Wrong email or password" from your Go code
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen font-sans text-slate-900 dark:text-white flex flex-col overflow-x-hidden">
      
      {/* Background Glow */}
      <div className="absolute w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-blue-500/10 rounded-full blur-[80px] md:blur-[120px] -top-20 -left-20 pointer-events-none"></div>

      {/* NAVBAR */}
      <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-500/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Edit3 size={18} className="md:w-5 md:h-5" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight">Editorzzz</span>
        </Link>

        <Link
          href="/"
          className="text-xs md:text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 md:gap-2 transition"
        >
          <ArrowLeft size={14} className="md:w-4 md:h-4" />
          <span className="hidden xs:inline">Back to Home</span>
          <span className="xs:hidden">Back</span>
        </Link>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[400px]"
        >
          <div className="bg-white dark:bg-[#16212c] p-6 md:p-8 rounded-[2rem] shadow-xl shadow-blue-500/5 border border-blue-500/10">
            <div className="text-center mb-6 md:mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4"
              >
                <ShieldCheck size={24} />
              </motion.div>

              <h1 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
                Admin Login
                <Sparkles size={18} className="text-blue-600" />
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Secure portal authentication
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs md:text-sm flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-medium px-1 text-slate-600 dark:text-slate-300">
                  Email or Username
                </label>
                <div className="relative group">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Enter identifier"
                    className="w-full h-12 md:h-14 pl-11 pr-4 bg-slate-50 dark:bg-[#1c2835] border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition text-sm text-slate-900 dark:text-white appearance-none"
                    value={formData.identifier}
                    onChange={(e) =>
                      setFormData({ ...formData, identifier: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-medium px-1 text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition"
                  />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 md:h-14 pl-11 pr-4 bg-slate-50 dark:bg-[#1c2835] border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition text-sm text-slate-900 dark:text-white appearance-none"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={loading}
                type="submit"
                className="w-full h-12 md:h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-600/50 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all mt-4 md:mt-8"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Authenticate
                  </>
                )}
              </motion.button>
            </form>
          </div>
          
          <p className="text-center mt-6 md:mt-8 text-[11px] md:text-sm text-slate-500 px-4">
            Authorized Personnel Only. Contact system administrator for access issues.
          </p>
        </motion.div>
      </main>
    </div>
  );
}