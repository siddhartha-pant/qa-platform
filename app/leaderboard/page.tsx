"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import axios from "axios";

interface LeaderboardUser {
  _id: string;
  username: string;
  avatarUrl?: string;
  reputation: number;
  questionCount: number;
  answerCount: number;
}

async function fetchLeaderboard(period: string) {
  const { data } = await axios.get(`/api/leaderboard?period=${period}`);
  return data;
}

const MEDAL_COLORS = ["text-yellow-500", "text-zinc-400", "text-amber-600"];
const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all-time");

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => fetchLeaderboard(period),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🏆 Leaderboard</h1>
        <p className="text-zinc-500">Top contributors ranked by reputation</p>
      </div>

      {/* Period filter */}
      <div className="flex justify-center gap-2 mb-8">
        {["all-time", "this-month", "this-week"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${period === p ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
          >
            {p.replace("-", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {data?.users?.map((user: LeaderboardUser, index: number) => (
            <div
              key={user._id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${index < 3 ? "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"}`}
            >
              <div
                className={`w-8 text-center font-bold ${index < 3 ? MEDAL_COLORS[index] : "text-zinc-400"}`}
              >
                {index < 3 ? MEDALS[index] : index + 1}
              </div>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
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
                <Link
                  href={`/user/${user._id}`}
                  className="font-medium hover:text-blue-600 transition-colors"
                >
                  {user.username}
                </Link>
                <div className="flex gap-3 text-xs text-zinc-400 mt-0.5">
                  <span>{user.questionCount} questions</span>
                  <span>{user.answerCount} answers</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-orange-500">
                  {user.reputation.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-400">reputation</div>
              </div>
            </div>
          ))}

          {data?.users?.length === 0 && (
            <p className="text-zinc-500 text-center py-12">
              No users found for this period.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
