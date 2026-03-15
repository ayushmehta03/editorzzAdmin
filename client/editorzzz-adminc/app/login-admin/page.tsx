"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { adminLogin } from "@/lib/api";
import { toast } from "sonner";

import {
  Edit3,
  Lock,
  User,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await adminLogin(formData.identifier, formData.password);

      localStorage.setItem("admin_token", data.token);

      toast.success("Login successful 🚀");

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);

    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#101922] min-h-screen text-white flex flex-col overflow-x-hidden">

      <div className="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -top-40 -left-40 pointer-events-none"></div>

      <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 bg-[#101922]/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-500/10">

        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Edit3 size={18} />
          </div>
          <span className="text-lg md:text-xl font-bold">Editorzzz</span>
        </Link>

        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-blue-400 flex items-center gap-2 transition"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px]"
        >

          <div className="bg-[#16212c] p-6 md:p-8 rounded-[28px] border border-slate-700 shadow-xl">

            <div className="text-center mb-8">

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mx-auto w-14 h-14 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4"
              >
                <ShieldCheck size={24} />
              </motion.div>

              <h1 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
                Admin Login
                <Sparkles size={18} className="text-blue-400" />
              </h1>

              <p className="text-slate-400 text-sm mt-2">
                Secure portal authentication
              </p>

            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="space-y-2">

                <label className="text-sm text-slate-400">
                  Email or Username
                </label>

                <div className="relative group">

                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
                  />

                  <input
                    required
                    type="text"
                    placeholder="admin_user"
                    className="w-full h-12 pl-11 pr-4 bg-[#101922] border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-white placeholder-slate-500"
                    value={formData.identifier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identifier: e.target.value
                      })
                    }
                  />

                </div>
              </div>

              <div className="space-y-2">

                <label className="text-sm text-slate-400">
                  Password
                </label>

                <div className="relative group">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
                  />

                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-4 bg-[#101922] border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-white placeholder-slate-500"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value
                      })
                    }
                  />

                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all mt-6"
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

          <p className="text-center mt-6 text-xs text-slate-500 px-4">
            Authorized Personnel Only. Contact system administrator for access issues.
          </p>

        </motion.div>

      </main>
    </div>
  );
}