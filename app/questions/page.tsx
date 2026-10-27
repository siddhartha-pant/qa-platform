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

const DEFAULT_QUESTIONS = [
  {
    _id: "default-1",
    title:
      "How do I use async/await properly in JavaScript with error handling?",
    description:
      "I keep getting unhandled promise rejection warnings in my Node.js app. What is the correct pattern for using async/await with try/catch and how should I handle errors at different levels?",
    tags: ["javascript", "nodejs"],
    authorId: { _id: "anon", username: "Anonymous", reputation: 0 },
    isAnonymous: true,
    voteScore: 42,
    viewCount: 1280,
    answerCount: 7,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "default-2",
    title:
      "What is the difference between useEffect and useLayoutEffect in React?",
    description:
      "I understand useEffect runs after render, but when should I use useLayoutEffect instead? Are there performance implications I should know about?",
    tags: ["react", "javascript"],
    authorId: { _id: "anon", username: "dev_curious", reputation: 120 },
    isAnonymous: false,
    voteScore: 31,
    viewCount: 940,
    answerCount: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "default-3",
    title:
      "How to properly type React props with TypeScript when using generics?",
    description:
      "I have a generic list component that should work with any data type. How do I type the component props so TypeScript can infer the item type from the data I pass in?",
    tags: ["typescript", "react"],
    authorId: { _id: "anon", username: "Anonymous", reputation: 0 },
    isAnonymous: true,
    voteScore: 58,
    viewCount: 2100,
    answerCount: 9,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "default-4",
    title:
      "Best practices for structuring a Next.js App Router project with MongoDB?",
    description:
      "Starting a new project with Next.js 15 App Router and MongoDB/Mongoose. What folder structure and connection patterns should I follow? Should I use server components for all DB calls?",
    tags: ["nextjs", "mongodb"],
    authorId: { _id: "anon", username: "fullstack_dev", reputation: 350 },
    isAnonymous: false,
    voteScore: 76,
    viewCount: 3400,
    answerCount: 12,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "default-5",
    title: "How do Mongoose indexes work and when should I add them?",
    description:
      "My MongoDB queries are getting slow as data grows. I have added indexes in my Mongoose schema but I am unsure if I am doing it right. What fields should be indexed and how do compound indexes work?",
    tags: ["mongodb", "nodejs"],
    authorId: { _id: "anon", username: "Anonymous", reputation: 0 },
    isAnonymous: true,
    voteScore: 29,
    viewCount: 870,
    answerCount: 4,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "default-6",
    title:
      "What are the CSS flexbox and grid differences and when to use each?",
    description:
      "I always end up just using flexbox for everything but I know CSS Grid exists. Can someone explain the practical differences and give real-world examples of when grid is the better choice?",
    tags: ["css"],
    authorId: { _id: "anon", username: "css_learner", reputation: 45 },
    isAnonymous: false,
    voteScore: 91,
    viewCount: 5600,
    answerCount: 15,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "default-7",
    title:
      "How to implement authentication in Next.js without exposing secrets to the client?",
    description:
      "Using NextAuth.js v5 with the App Router. Where should I validate sessions — in middleware, server components, or API routes? How do I make sure JWTs and secrets never leak to the browser?",
    tags: ["nextjs", "typescript"],
    authorId: { _id: "anon", username: "Anonymous", reputation: 0 },
    isAnonymous: true,
    voteScore: 47,
    viewCount: 1900,
    answerCount: 8,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "default-8",
    title:
      "Python type hints with mypy — how strict should I be in a production codebase?",
    description:
      "Our team just started adding type hints to an existing Python codebase. Running mypy in strict mode gives hundreds of errors. Should we enable strict mode from the start or gradually increase strictness?",
    tags: ["python"],
    authorId: { _id: "anon", username: "py_dev99", reputation: 210 },
    isAnonymous: false,
    voteScore: 22,
    viewCount: 730,
    answerCount: 6,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
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
              className={`text-left text-sm px-2 py-1 rounded transition-colors ${!selectedTag ? "bg-amber-500 text-white" : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"}`}
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
                className={`text-left text-sm px-2 py-1 rounded transition-colors ${selectedTag === tag ? "bg-amber-500 text-white" : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"}`}
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
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
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
                className={`text-sm px-3 py-1.5 rounded border transition-colors ${sort === s ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950" : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-400"}`}
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
                  className="h-32 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {data?.questions?.length > 0
                  ? data.questions.map(
                      (q: Parameters<typeof QuestionCard>[0]["question"]) => (
                        <QuestionCard key={q._id} question={q} />
                      ),
                    )
                  : DEFAULT_QUESTIONS.filter(
                      (q) => !selectedTag || q.tags.includes(selectedTag),
                    ).map((q) => (
                      <QuestionCard key={q._id} question={q} isDefault />
                    ))}
                {data?.questions?.length === 0 &&
                  selectedTag &&
                  DEFAULT_QUESTIONS.filter((q) => q.tags.includes(selectedTag))
                    .length === 0 && (
                    <p className="text-zinc-500 text-center py-12">
                      No questions found for this tag.
                    </p>
                  )}
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-sm rounded border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-zinc-500">
                    {page} / {data.pagination.totalPages}
                  </span>
                  <button
                    disabled={page === data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-sm rounded border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800"
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
