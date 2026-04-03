"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Search, Ban, ShieldCheck, Users, Mail, Phone, 
  Briefcase, UserX, SearchX, AtSign, Fingerprint 
} from "lucide-react";

import { getAllUsers, searchUsers, updateUserBan, updateHiring } from "@/lib/api";

interface User {
  id: string;
  name: string;
  username: string; 
  profile_image:string;
  email: string;
  phone: string;
  ban: boolean;
  is_hiring_listed: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const res = query.trim() ? await searchUsers(query) : await getAllUsers();
      setUsers(res?.users || []);
    } catch (err: any) {
      toast.error("Data sync failed");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(search), 500);
    return () => clearTimeout(delay);
  }, [search]);

  const toggleBan = async (user: User) => {
    try {
      await updateUserBan(user.id, !user.ban);
      toast.success(user.ban ? "Access Restored" : "Account Suspended");
      fetchUsers(search);
    } catch (err: any) { toast.error(err.message); }
  };

  const toggleHiring = async (user: User) => {
    try {
      await updateHiring(user.id, !user.is_hiring_listed);
      toast.success("Hiring status updated");
      fetchUsers(search);
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] text-slate-900 dark:text-slate-100 p-4 md:p-10 transition-all">
      
      <div className="max-w-6xl mx-auto mb-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
                <Users className="text-white" size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Accounts</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium ml-1">Database Management Terminal</p>
          </div>

          <div className="relative w-full lg:w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search unique username or email..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </header>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-[2rem]" />
            ))
          ) : users.length > 0 ? (
            <AnimatePresence>
              {users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] hover:border-blue-500/50 transition-all shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
                >
                  <div className="flex items-center gap-5 w-full">
                    <div className="relative shrink-0">
                      <img
                        src={user.profile_image}
                        alt={user.name}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-3xl object-cover ring-4 ring-slate-50 dark:ring-slate-950"
                      />
                      {user.ban && <div className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full border-4 border-white dark:border-slate-900"><UserX size={14} className="text-white"/></div>}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold tracking-tight">{user.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4">
                        <span className="flex items-center gap-1.5 text-blue-500 font-bold text-sm">
                          <AtSign size={14} /> {user.username || "no_username"}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400 text-sm italic">
                          <Mail size={14} /> {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto md:gap-10 border-t md:border-t-0 pt-5 md:pt-0 border-slate-100 dark:border-slate-800">
                    
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Listed</span>
                      <button
                        onClick={() => toggleHiring(user)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${user.is_hiring_listed ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full transition-transform ${user.is_hiring_listed ? "translate-x-6" : ""}`} />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleBan(user)}
                      className={`h-12 px-6 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${
                        user.ban 
                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" 
                        : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      {user.ban ? <ShieldCheck size={18}/> : <Ban size={18}/>}
                      {user.ban ? "Unban" : "Ban User"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-20 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <SearchX size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold">No results for "{search}"</h2>
              <button onClick={() => setSearch("")} className="mt-4 text-blue-500 font-bold hover:underline">View all users</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}