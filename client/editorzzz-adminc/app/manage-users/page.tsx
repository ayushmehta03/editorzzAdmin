"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Ban, ShieldCheck, Users } from "lucide-react";

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
      setUsers(res.users);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Debounced search
  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        setLoading(true);

        if (!search) {
          await fetchUsers();
        } else {
          const res = await searchUsers(search);
          setUsers(res.users);
        }
      } catch (err: any) {
        toast.error(err.message);
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
      toast.success("User status updated");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleHiring = async (user: User) => {
    try {
      await updateHiring(user.id, !user.is_hiring_listed);
      toast.success("Hiring updated");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0f172a] dark:to-[#020617] p-4">

      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-blue-500" />
          <h1 className="text-2xl font-bold">Manage Users</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* USERS */}
      <div className="max-w-5xl mx-auto space-y-4">

        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-900 h-24 rounded-xl"
            />
          ))
        ) : (
          users.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">

                <div className="flex items-center gap-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}`}
                    className="w-14 h-14 rounded-full"
                  />

                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">

                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">Hiring</span>

                    <button
                      onClick={() => toggleHiring(user)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                        user.is_hiring_listed
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                          user.is_hiring_listed
                            ? "translate-x-6"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* BAN BUTTON */}
                  <button
                    onClick={() => toggleBan(user)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                      user.ban
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user.ban ? (
                      <>
                        <ShieldCheck size={16} /> Unban
                      </>
                    ) : (
                      <>
                        <Ban size={16} /> Ban
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}

      </div>
    </div>
  );
}