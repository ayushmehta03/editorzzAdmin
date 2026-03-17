"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  getAllUsers,
  searchUsers,
  updateUserBan,
  updateHiring,
} from "@/lib/api";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  ban: boolean;
  is_hiring_listed: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.users);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSearch = async (value: string) => {
    setSearch(value);
    try {
      if (!value) return fetchUsers();
      const res = await searchUsers(value);
      setUsers(res.users);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleBan = async (user: User) => {
    try {
      await updateUserBan(user.id, !user.ban);
      toast.success("User updated");
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      
      <div className="sticky top-0 z-50 backdrop-blur border-b bg-white/70 dark:bg-black/40">
        <div className="max-w-5xl mx-auto p-4">
          <h1 className="text-xl font-bold mb-3">Manage Users</h1>

          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 outline-none"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow border"
          >
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              
              <div className="flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.name}`}
                  className="w-14 h-14 rounded-full"
                />

                <div>
                  <h3 className="font-bold">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </div>
              </div>

              <div className="flex gap-6 flex-wrap items-center">
                
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Hiring</span>
                  <input
                    type="checkbox"
                    checked={user.is_hiring_listed}
                    onChange={() => toggleHiring(user)}
                    className="w-5 h-5"
                  />
                </div>

                <button
                  onClick={() => toggleBan(user)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    user.ban
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {user.ban ? "Unban" : "Ban"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}