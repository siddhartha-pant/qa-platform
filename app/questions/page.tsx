"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import axios from "axios";
import QuestionCard from "@/components/QuestionCard";

const POPULAR_TAGS = [
  "javascript",
  "react",
  "typescript",
  "nodejs",
  "python",
  "css",
  "nextjs",
  "mongodb",
];

async function fetchQuestions(page: number, sort: string, tag: string) {
  const params = new URLSearchParams({ page: String(page), sort, limit: "10" });
  if (tag) params.set("tag", tag);
  const { data } = await axios.get(`/api/questions?${params}`);
  return data;
}

export default function QuestionsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [selectedTag, setSelectedTag] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["questions", page, sort, selectedTag],
    queryFn: () => fetchQuestions(page, sort, selectedTag),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar */}
        <aside className="sm:w-48 shrink-0">
          <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wide mb-3">
            Popular Tags
          </h3>
          <div className="flex flex-wrap sm:flex-col gap-1.5">
            <button
              onClick={() => {
                setSelectedTag("");
                setPage(1);
              }}
              className={`text-left text-sm px-2 py-1 rounded transition-colors ${!selectedTag ? "bg-blue-600 text-white" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            >
              All tags
            </button>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  setPage(1);
                }}
                className={`text-left text-sm px-2 py-1 rounded transition-colors ${selectedTag === tag ? "bg-blue-600 text-white" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {selectedTag
                ? `Questions tagged [${selectedTag}]`
                : "All Questions"}
            </h1>
            <Link
              href="/questions/ask"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Ask Question
            </Link>
          </div>

          {/* Sort controls */}
          <div className="flex gap-1 mb-4">
            {["newest", "most-voted", "most-answered"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSort(s);
                  setPage(1);
                }}
                className={`text-sm px-3 py-1.5 rounded border transition-colors ${sort === s ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"}`}
              >
                {s.replace("-", " ")}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {data?.questions?.map(
                  (q: Parameters<typeof QuestionCard>[0]["question"]) => (
                    <QuestionCard key={q._id} question={q} />
                  ),
                )}
                {data?.questions?.length === 0 && (
                  <p className="text-zinc-500 text-center py-12">
                    No questions found.
                  </p>
                )}
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-sm rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-zinc-500">
                    {page} / {data.pagination.totalPages}
                  </span>
                  <button
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-sm rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
