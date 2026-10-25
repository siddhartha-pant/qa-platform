"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import SearchBar from "@/components/SearchBar";
import QuestionCard from "@/components/QuestionCard";

async function searchQuestions(
  q: string,
  page: number,
  sort: string,
  tag: string,
) {
  if (!q) return null;
  const params = new URLSearchParams({ q, page: String(page), sort });
  if (tag) params.set("tag", tag);
  const { data } = await axios.get(`/api/search?${params}`);
  return data;
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = use(searchParams);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("relevance");
  const [tagFilter, setTagFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["search", q, page, sort, tagFilter],
    queryFn: () => searchQuestions(q, page, sort, tagFilter),
    enabled: !!q,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar defaultValue={q} />
      </div>

      {!q && (
        <div className="text-center text-zinc-500 py-12">
          <p className="text-xl mb-2">Search for questions</p>
          <p className="text-sm">Find answers from the community</p>
        </div>
      )}

      {q && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">
              {data?.pagination?.total ?? 0} results for &ldquo;{q}&rdquo;
            </h1>
          </div>

          {/* Sort options */}
          <div className="flex gap-1 mb-4">
            {["relevance", "newest", "most-voted"].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSort(s);
                  setPage(1);
                }}
                className={`text-sm px-3 py-1.5 rounded border transition-colors ${sort === s ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400" : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"}`}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
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
                    No results found. Try different keywords.
                  </p>
                )}
              </div>

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
        </>
      )}
    </div>
  );
}
