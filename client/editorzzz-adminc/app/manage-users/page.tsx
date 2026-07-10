"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Search, Ban, ShieldCheck, Users, Mail, Phone, 
  Briefcase, UserX, SearchX, AtSign, ChevronLeft, ChevronRight
} from "lucide-react";

import { getAllUsers, searchUsers, updateUserBan, updateHiring } from "@/lib/api";

interface User {
  id: string;
  name: string;
  username: string; 
  profile_image: string;
  email: string;
  phone: string;
  ban: boolean;
  is_hiring_listed: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10; // Explicit 10 limit configuration

  const fetchUsers = async (query = "", currentPage = 1) => {
    try {
      setLoading(true);
      // Ensure your getAllUsers backend call accepts limit and page parameters
      const res = query.trim() 
        ? await searchUsers(query) 
        : await getAllUsers({ page: currentPage, limit });
      
      setUsers(res?.users || []);
      setTotal(res?.total || 0);
    } catch (err: any) {
      toast.error("Data sync failed");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1); // Reset page on query shift
      fetchUsers(search, 1);
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    if (!search.trim()) {
      fetchUsers(search, page);
    }
  }, [page]);

  const toggleBan = async (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Prevents navigating to profile url when clicking actions
    try {
      await updateUserBan(user.id, !user.ban);
      toast.success(user.ban ? "Access Restored" : "Account Suspended");
      fetchUsers(search, page);
    } catch (err: any) { toast.error(err.message); }
  };

  const toggleHiring = async (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Prevents navigating to profile url when clicking actions
    try {
      await updateHiring(user.id, !user.is_hiring_listed);
      toast.success("Hiring status updated");
      fetchUsers(search, page);
    } catch (err: any) { toast.error(err.message); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] text-slate-900 dark:text-slate-100 p-4 md:p-6 transition-all">
      
      <div className="max-w-6xl mx-auto mb-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
                <Users className="text-white" size={18} />
              </div>
              <h1 className="text-xl font-black tracking-tight">Accounts</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium ml-1">Database Management Terminal</p>
          </div>

          <div className="relative w-full sm:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or email..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-950 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </header>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Compact gap and tight margin mapping */}
        <div className="grid grid-cols-1 gap-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
            ))
          ) : users.length > 0 ? (
            <AnimatePresence>
              {users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => window.open(`https://editorzzz.com/user/${user.id}`, "_blank")}
                  className="group relative cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl hover:border-blue-500/50 hover:shadow-md transition-all flex items-center justify-between gap-4 overflow-hidden"
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={user.profile_image}
                        alt={user.name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-50 dark:ring-slate-950"
                      />
                      {user.ban && (
                        <div className="absolute -top-1 -right-1 bg-red-500 p-0.5 rounded-full border-2 border-white dark:border-slate-900">
                          <UserX size={10} className="text-white"/>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
                      <h3 className="text-sm font-bold tracking-tight truncate sm:w-1/4">{user.name}</h3>
                      <div className="flex flex-row items-center gap-x-3 text-xs">
                        <span className="flex items-center gap-1 text-blue-500 font-bold truncate">
                          <AtSign size={12} className="shrink-0" /> {user.username || "no_username"}
                        </span>
                        <span className="hidden sm:flex items-center gap-1 text-slate-400 truncate">
                          <Mail size={12} className="shrink-0" /> {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 hidden sm:inline">Listed</span>
                      <button
                        onClick={(e) => toggleHiring(e, user)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${user.is_hiring_listed ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full transition-transform ${user.is_hiring_listed ? "translate-x-4" : ""}`} />
                      </button>
                    </div>

                    <button
                      onClick={(e) => toggleBan(e, user)}
                      className={`h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1 transition-all active:scale-95 ${
                        user.ban 
                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" 
                        : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      {user.ban ? <ShieldCheck size={14}/> : <Ban size={14}/>}
                      <span className="hidden xs:inline">{user.ban ? "Unban" : "Ban"}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-12 text-center bg-white dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <SearchX size={36} className="mx-auto text-slate-300 mb-2" />
              <h2 className="text-md font-bold">No results for "{search}"</h2>
              <button onClick={() => setSearch("")} className="mt-2 text-sm text-blue-500 font-bold hover:underline">View all users</button>
            </div>
          )}
        </div>

        {/* Dynamic Pagination Controls when not running a pure inline query filtering */}
        {!search.trim() && totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-4 text-xs font-bold">
            <span className="text-slate-400">Page {page} of {totalPages}</span>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}