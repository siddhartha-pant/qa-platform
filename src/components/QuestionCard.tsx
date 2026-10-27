"use client";

import { useState } from "react";
import Link from "next/link";

interface Author {
  _id: string;
  username: string;
  avatarUrl?: string;
}

interface QuestionCardProps {
  question: {
    _id: string;
    title: string;
    description: string;
    tags: string[];
    voteScore: number;
    answerCount: number;
    viewCount: number;
    isAnonymous: boolean;
    authorId: Author;
    createdAt: string;
  };
  isDefault?: boolean;
}

export default function QuestionCard({
  question,
  isDefault,
}: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <>
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-5 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2 min-w-[60px] text-center text-sm text-zinc-500">
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                {question.voteScore}
              </div>
              <div>votes</div>
            </div>
            <div>
              <div
                className={`font-semibold ${question.answerCount > 0 ? "text-green-600" : "text-zinc-800 dark:text-zinc-200"}`}
              >
                {question.answerCount}
              </div>
              <div>answers</div>
            </div>
            <div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                {question.viewCount}
              </div>
              <div>views</div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {isDefault ? (
              <button
                onClick={() => setExpanded(true)}
                className="text-amber-700 dark:text-amber-400 hover:underline font-medium text-lg leading-snug text-left"
              >
                {question.title}
              </button>
            ) : (
              <Link
                href={`/questions/${question._id}`}
                className="text-amber-700 dark:text-amber-400 hover:underline font-medium text-lg leading-snug"
              >
                {question.title}
              </Link>
            )}
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 line-clamp-2">
              {question.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {question.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/questions?tag=${tag}`}
                  className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs px-2 py-0.5 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
            <div className="flex items-center justify-end gap-1 mt-3 text-xs text-zinc-400">
              <span>
                asked {timeAgo(question.createdAt)} by{" "}
                {question.isAnonymous ? (
                  <span className="text-zinc-500">Anonymous</span>
                ) : (
                  <Link
                    href={`/user/${question.authorId._id}`}
                    className="text-amber-600 hover:underline"
                  >
                    {question.authorId.username}
                  </Link>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for default (sample) questions */}
      {isDefault && expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setExpanded(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold leading-snug">
                {question.title}
              </h2>
              <button
                onClick={() => setExpanded(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-zinc-400 mb-4">
              <span>Asked {timeAgo(question.createdAt)}</span>
              <span>Viewed {question.viewCount} times</span>
              <span>{question.voteScore} votes</span>
              <span>{question.answerCount} answers</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mb-5">
              {question.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-zinc-400 italic border-t border-zinc-100 dark:border-zinc-800 pt-4">
              This is a sample question. Sign in and ask your own to get real
              answers!
            </p>
          </div>
        </div>
      )}
    </>
  );
}
