"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search, Ban, ShieldCheck, Users, Mail,
  UserX, SearchX, AtSign, ChevronLeft, ChevronRight,
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

const LIMIT = 10; // page size sent to the API

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchUsers = async (query = "", pageNum = 1) => {
    try {
      setLoading(true);
      const res = query.trim()
        ? await searchUsers(query)
        : await getAllUsers({ page: pageNum, limit: LIMIT });

      setUsers(res?.users || []);
      setTotal(res?.total ?? 0);
    } catch (err: any) {
      toast.error("Data sync failed");
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Combined into a single useEffect with proper debouncing to prevent infinite loops
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(search, page);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, page]);

  const toggleBan = async (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    try {
      await updateUserBan(user.id, !user.ban);
      toast.success(user.ban ? "Access Restored" : "Account Suspended");
      fetchUsers(search, page);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleHiring = async (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    try {
      await updateHiring(user.id, !user.is_hiring_listed);
      toast.success("Hiring status updated");
      fetchUsers(search, page);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const goToUser = (user: User) => {
    window.location.href = `https://editorzzz.com/user/${user.id}`;
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#020617] text-slate-900 dark:text-slate-100 p-4 md:p-10 transition-all">

      <div className="max-w-6xl mx-auto mb-6">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-500/5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
                <Users className="text-white" size={20} />
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Accounts</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium ml-1">
              Database Management Terminal · {total} total
            </p>
          </div>

          <div className="relative w-full lg:w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => {
                setPage(1); // Reset page selection back to 1 instantly when query updates
                setSearch(e.target.value);
              }}
              placeholder="Search unique username or email..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
            />
          </div>
        </header>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* compact list */}
        <div className="flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
            ))
          ) : users.length > 0 ? (
            <AnimatePresence>
              {users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => goToUser(user)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && goToUser(user)}
                  className="group cursor-pointer relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-blue-500/5 transition-all shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img
                        src={user.profile_image}
                        alt={user.name}
                        className="w-9 h-9 rounded-lg object-cover ring-2 ring-slate-50 dark:ring-slate-950"
                      />
                      {user.ban && (
                        <div className="absolute -top-1 -right-1 bg-red-500 p-[3px] rounded-full border-2 border-white dark:border-slate-900">
                          <UserX size={9} className="text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold tracking-tight truncate">{user.name}</h3>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-blue-500 font-semibold">
                          <AtSign size={11} /> {user.username || "no_username"}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400 italic truncate">
                          <Mail size={11} /> {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex flex-col items-center gap-1">
                      <span className="text-[8px] uppercase font-black tracking-widest text-slate-400">Listed</span>
                      <button
                        onClick={(e) => toggleHiring(e, user)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          user.is_hiring_listed ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full transition-transform ${
                            user.is_hiring_listed ? "translate-x-4" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={(e) => toggleBan(e, user)}
                      className={`h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                        user.ban
                          ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                          : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                      }`}
                    >
                      {user.ban ? <ShieldCheck size={14} /> : <Ban size={14} />}
                      {user.ban ? "Unban" : "Ban"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-20 text-center bg-white dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <SearchX size={48} className="mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold">No results for "{search}"</h2>
              <button onClick={() => setSearch("")} className="mt-4 text-blue-500 font-bold hover:underline">
                View all users
              </button>
            </div>
          )}
        </div>

        {/* pagination */}
        {!loading && total > LIMIT && (
          <div className="flex items-center justify-between mt-6 px-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500/50 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500/50 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}