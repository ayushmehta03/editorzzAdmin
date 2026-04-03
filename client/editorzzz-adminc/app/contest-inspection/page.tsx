"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getActiveTournaments, 
  getUpcomingTournaments, 
  getCompletedTournaments 
} from "@/lib/api";
import ContestCard from "@/components/ContestCrad";
import EditModal from "@/components/EditModal";
import { LayoutGrid, Calendar, CheckCircle2, Plus } from "lucide-react";

export default function AdminPage() {
  const [tab, setTab] = useState("active");
  const [data, setData] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (tab === "active") res = await getActiveTournaments();
      else if (tab === "upcoming") res = await getUpcomingTournaments();
      else res = await getCompletedTournaments();
      setData(res.tournaments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "active", label: "Active", icon: <LayoutGrid size={16} /> },
    { id: "upcoming", label: "Upcoming", icon: <Calendar size={16} /> },
    { id: "completed", label: "Completed", icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 md:px-10 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] -z-10" />
      
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase"
          >
            Tournament <span className="text-purple-500">Vault</span>
          </motion.h1>
          <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-[0.2em]">Management Terminal v1.0.4</p>
        </div>

        <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                tab === t.id ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.icon}
              <span className="capitalize">{t.label}</span>
            </button>
          ))}
        </div>
      </header>

      <motion.div 
        layout
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {data.map((t: any, index: number) => (
            <ContestCard key={t._id || index} t={t} onEdit={setSelected} />
          ))}
        </AnimatePresence>
      </motion.div>

      {data.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-center mt-32 border-2 border-dashed border-zinc-800 rounded-[3rem] py-20 max-w-2xl mx-auto"
        >
          <p className="text-zinc-600 font-bold uppercase tracking-widest">No Sector Data Found</p>
        </motion.div>
      )}

      {selected && (
        <EditModal t={selected} onClose={() => setSelected(null)} refresh={fetchData} />
      )}
    </div>
  );
}