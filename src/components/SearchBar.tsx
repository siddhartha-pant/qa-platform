"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions..."
        className="flex-1 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
      />
      <button
        type="submit"
        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
      >
        Search
      </button>
    </form>
  );
}
