"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setLoading(false);
    if (res.ok) router.push("/projects");
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4">New Project</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
          <button type="button" onClick={() => router.back()} className="border px-3 py-1 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}


