"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Search, Ban, ShieldCheck, Users, Mail, Phone, Briefcase, UserX, SearchX } from "lucide-react";

import {
  getAllUsers,
  searchUsers,
  updateUserBan,
  updateHiring,
} from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  ban: boolean;
  is_hiring_listed: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res?.users || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        if (!search.trim()) {
          const res = await getAllUsers();
          setUsers(res?.users || []);
        } else {
          const res = await searchUsers(search);
          setUsers(res?.users || []);
        }
      } catch (err: any) {
        console.error("Search error:", err);
        setUsers([]); 
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (user: User) => {
    try {
      await updateUserBan(user.id, !user.ban);
      toast.success(user.ban ? "User unbanned" : "User banned successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleHiring = async (user: User) => {
    try {
      await updateHiring(user.id, !user.is_hiring_listed);
      toast.success("Hiring status updated");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 p-6 md:p-10 transition-colors duration-300">
      
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">User Directory</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">Manage permissions, hiring status, and account access.</p>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 w-full bg-slate-200 dark:bg-slate-800/50 animate-pulse rounded-2xl" />
            ))
          ) : users.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5 w-full">
                    <div className="relative">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&bold=true`}
                        alt={user.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-blue-500/20 transition-all"
                      />
                      {user.ban && (
                        <div className="absolute -top-1 -right-1 bg-red-500 border-2 border-white dark:border-slate-900 p-1 rounded-full text-white">
                          <UserX size={12} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                          <Mail size={14} /> {user.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                          <Phone size={14} /> {user.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                    
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                        <Briefcase size={10} /> Hiring
                      </span>
                      <button
                        onClick={() => toggleHiring(user)}
                        className={`relative w-12 h-6 flex items-center rounded-full px-1 transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-950 ${
                          user.is_hiring_listed ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${
                            user.is_hiring_listed ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleBan(user)}
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 min-w-[110px] ${
                        user.ban
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {user.ban ? <><ShieldCheck size={18} /> Restore</> : <><Ban size={18} /> Ban</>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl"
            >
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <SearchX size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No users found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs mt-2">
                We couldn't find any users matching "<span className="font-semibold text-blue-500">{search}</span>".
              </p>
              <button 
                onClick={() => setSearch("")}
                className="mt-6 text-sm font-medium text-blue-500 hover:underline"
              >
                Clear search and view all
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}