"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search, Ban, ShieldCheck, Users, Mail, Phone,
  UserX, SearchX, AtSign, ChevronLeft, ChevronRight, Sparkles,
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
        ? await searchUsers(query, pageNum, LIMIT)
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 dark:from-[#020617] dark:via-[#020617] dark:to-[#050b1f] text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-10 transition-colors">

      {/* header */}
      <div className="max-w-7xl mx-auto mb-8">
        <header className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-7 rounded-[1.75rem] border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/10 to-transparent blur-3xl"
          />
          <div className="relative space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <Users className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">Accounts</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-500" />
                  {total} {total === 1 ? "user" : "users"} on record
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-full lg:w-[420px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search username or email..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-transparent focus:border-blue-500/30 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
            />
          </div>
        </header>
      </div>

      {/* grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] w-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse rounded-3xl"
              />
            ))
          ) : users.length > 0 ? (
            <AnimatePresence>
              {users.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => goToUser(user)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && goToUser(user)}
                  className="group cursor-pointer relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-500/40 transition-all duration-300"
                >
                  {/* square top image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img
                      src={user.profile_image}
                      alt={user.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    {user.ban && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                        <UserX size={11} /> Banned
                      </div>
                    )}

                    {user.is_hiring_listed && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                        Listed
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-base font-bold tracking-tight truncate drop-shadow-sm">
                        {user.name}
                      </h3>
                      <span className="flex items-center gap-1 text-blue-200 font-semibold text-xs mt-0.5">
                        <AtSign size={11} /> {user.username || "no_username"}
                      </span>
                    </div>
                  </div>

                  {/* details + actions */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        <Mail size={12} className="shrink-0" /> <span className="truncate">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          <Phone size={12} className="shrink-0" /> {user.phone}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                          Listed
                        </span>
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
                        className={`h-8 px-3 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 ${
                          user.ban
                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        {user.ban ? <ShieldCheck size={13} /> : <Ban size={13} />}
                        {user.ban ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
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
          <div className="flex items-center justify-between mt-8 px-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500/50 hover:text-blue-500 transition-all shadow-sm"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-500/50 hover:text-blue-500 transition-all shadow-sm"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}