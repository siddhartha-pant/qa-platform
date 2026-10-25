"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import axios from "axios";

interface UserProfile {
  _id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  reputation: number;
  questionCount: number;
  answerCount: number;
  joinedAt: string;
}

async function fetchUserProfile(id: string) {
  const { data } = await axios.get(`/api/users/${id}`);
  return data;
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserProfile(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
    );
  }

  const user: UserProfile = data?.user;
  if (!user)
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">
        User not found.
      </div>
    );

  const joinedDate = new Date(user.joinedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.username[0].toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            {user.bio && <p className="text-zinc-500 mt-1">{user.bio}</p>}
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-400">
              {user.location && <span>📍 {user.location}</span>}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  🌐 {user.website}
                </a>
              )}
              <span>📅 Member since {joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          {[
            {
              label: "Reputation",
              value: user.reputation,
              color: "text-orange-500",
            },
            {
              label: "Questions",
              value: user.questionCount,
              color: "text-blue-500",
            },
            {
              label: "Answers",
              value: user.answerCount,
              color: "text-green-500",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-zinc-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent questions */}
      {data?.recentQuestions?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Recent Questions</h2>
          <div className="space-y-2">
            {data.recentQuestions.map(
              (q: {
                _id: string;
                title: string;
                voteScore: number;
                answerCount: number;
                createdAt: string;
              }) => (
                <div
                  key={q._id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                >
                  <Link
                    href={`/questions/${q._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    {q.title}
                  </Link>
                  <div className="flex gap-3 text-xs text-zinc-400 shrink-0 ml-3">
                    <span>{q.voteScore} votes</span>
                    <span>{q.answerCount} answers</span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Recent answers */}
      {data?.recentAnswers?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Answers</h2>
          <div className="space-y-2">
            {data.recentAnswers.map(
              (a: {
                _id: string;
                content: string;
                voteScore: number;
                isBestAnswer: boolean;
                questionId: { _id: string; title: string };
              }) => (
                <div
                  key={a._id}
                  className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                >
                  <Link
                    href={`/questions/${a.questionId._id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline block mb-1"
                  >
                    Re: {a.questionId.title}
                  </Link>
                  <p className="text-sm text-zinc-500 line-clamp-2">
                    {a.content}
                  </p>
                  <div className="flex gap-3 mt-1 text-xs text-zinc-400">
                    <span>{a.voteScore} votes</span>
                    {a.isBestAnswer && (
                      <span className="text-green-500">✓ Best answer</span>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
