"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit3, Lock, User, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("admin_token", data.token);
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen font-sans text-slate-900 dark:text-white flex flex-col">
      <header className="w-full flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-500/10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition">
            <Edit3 size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">Editorzzz</span>
        </Link>
        <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -top-20"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white dark:bg-[#16212c] p-8 rounded-3xl shadow-xl shadow-blue-500/5 border border-blue-500/10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Enter your credentials to access the portal
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium px-1">Email or Username</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="admin_user"
                    className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-[#1c2835] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition"
                    value={formData.identifier}
                    onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium px-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-4 bg-slate-50 dark:bg-[#1c2835] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-600 transition"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all mt-8"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Authenticate"
                )}
              </button>
            </form>
          </div>
          
        
        </motion.div>
      </main>
    </div>
  );
}