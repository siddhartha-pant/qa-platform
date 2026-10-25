"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface VoteButtonProps {
  targetType: "question" | "answer";
  targetId: string;
  initialScore: number;
  initialUserVote?: 0 | 1 | -1;
}

export default function VoteButton({
  targetType,
  targetId,
  initialScore,
  initialUserVote = 0,
}: VoteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<0 | 1 | -1>(initialUserVote);
  const [loading, setLoading] = useState(false);

  const vote = async (value: 1 | -1) => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      const url =
        targetType === "question"
          ? `/api/questions/${targetId}/vote`
          : `/api/answers/${targetId}/vote`;

      const res = await axios.post(url, { value });
      setScore(res.data.voteScore);
      setUserVote(res.data.userVote as 0 | 1 | -1);
    } catch {
      // silently fail — the API error will log server-side
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => vote(1)}
        disabled={loading}
        aria-label="Upvote"
        className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${userVote === 1 ? "text-orange-500" : "text-zinc-400 hover:text-orange-400"}`}
      >
        ▲
      </button>
      <span
        className={`text-base font-semibold tabular-nums ${score > 0 ? "text-orange-500" : score < 0 ? "text-red-500" : "text-zinc-500"}`}
      >
        {score}
      </span>
      <button
        onClick={() => vote(-1)}
        disabled={loading}
        aria-label="Downvote"
        className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${userVote === -1 ? "text-blue-500" : "text-zinc-400 hover:text-blue-400"}`}
      >
        ▼
      </button>
    </div>
  );
}
