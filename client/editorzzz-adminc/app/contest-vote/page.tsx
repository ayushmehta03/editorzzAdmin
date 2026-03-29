"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { uploadBannerImage } from "@/lib/claudinary";

export default function CreateVoteContestPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    banner_url: "",
    start_time: "",
    end_time: "",
    voting_start_time: "",
    voting_end_time: "",
    max_participants: "",
    prize_pool: "",
    assets_link: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setPreview(URL.createObjectURL(file));

      const toastId = toast.loading("Uploading banner...");
      const url = await uploadBannerImage(file);

      toast.dismiss(toastId);
      toast.success("Banner uploaded");

      setForm((prev) => ({ ...prev, banner_url: url }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.banner_url) return toast.error("Upload banner first");

    if (new Date(form.end_time) <= new Date(form.start_time)) {
      return toast.error("End time must be after start");
    }

    if (new Date(form.voting_start_time) < new Date(form.end_time)) {
      return toast.error("Voting must start after contest ends");
    }

    if (new Date(form.voting_end_time) <= new Date(form.voting_start_time)) {
      return toast.error("Voting end must be after voting start");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/create-vote-contest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          banner_url: form.banner_url,
          start_time: new Date(form.start_time).toISOString(),
          end_time: new Date(form.end_time).toISOString(),
          voting_start_time: new Date(form.voting_start_time).toISOString(),
          voting_end_time: new Date(form.voting_end_time).toISOString(),
          max_participants: Number(form.max_participants),
          prize_pool: Number(form.prize_pool),
          assets_link: form.assets_link,
        }),
      });

      if (!res.ok) throw new Error("Failed to create");

      toast.success("Vote contest created 🚀");

      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const input =
    "w-full p-3 rounded-xl bg-[#0b1326] border border-gray-800 focus:border-blue-500 outline-none";

  return (
    <div className="min-h-screen bg-[#0b1326] text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black mb-6"
        >
          Create Vote Contest 🗳️
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 bg-[#11192d] p-6 rounded-2xl border border-gray-800"
        >

          <input
            name="title"
            placeholder="Contest Title"
            value={form.title}
            onChange={handleChange}
            className={input}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className={`${input} h-32`}
            required
          />

          <div className="border-dashed border-2 border-gray-700 p-6 rounded-xl text-center cursor-pointer relative">
            {preview ? (
              <img src={preview} className="w-full h-48 object-cover rounded-xl" />
            ) : (
              <p>Click to upload banner</p>
            )}
            <input
              type="file"
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input type="datetime-local" name="start_time" onChange={handleChange} className={input} required />
            <input type="datetime-local" name="end_time" onChange={handleChange} className={input} required />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input type="datetime-local" name="voting_start_time" onChange={handleChange} className={input} required />
            <input type="datetime-local" name="voting_end_time" onChange={handleChange} className={input} required />
          </div>

          <input name="max_participants" type="number" placeholder="Max Participants" onChange={handleChange} className={input} />
          <input name="prize_pool" type="number" placeholder="Prize Pool" onChange={handleChange} className={input} />
          <input name="assets_link" placeholder="Assets Link" onChange={handleChange} className={input} />

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={loading || uploading}
            className="w-full py-4 bg-blue-600 rounded-xl font-bold"
          >
            {loading ? "Creating..." : "Create Vote Contest"}
          </motion.button>

        </motion.form>
      </div>
    </div>
  );
}