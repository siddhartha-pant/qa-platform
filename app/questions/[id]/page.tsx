"use client";

import { useState, use, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import AnswerForm from "@/components/AnswerForm";

interface Author {
  _id: string;
  username: string;
  avatarUrl?: string;
  reputation: number;
}

interface Answer {
  _id: string;
  content: string;
  authorId: Author;
  isAnonymous: boolean;
  isBestAnswer: boolean;
  voteScore: number;
  createdAt: string;
}

interface Question {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: Author;
  isAnonymous: boolean;
  voteScore: number;
  viewCount: number;
  answerCount: number;
  createdAt: string;
}

async function fetchQuestionDetail(id: string) {
  const { data } = await axios.get(`/api/questions/${id}`);
  return data;
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Answer[]>([]);

  const { data, isLoading } = useQuery<{
    question: Question;
    answers: Answer[];
  }>({
    queryKey: ["question", id],
    queryFn: () => fetchQuestionDetail(id),
  });

  useEffect(() => {
    if (data?.answers) setAnswers(data.answers);
  }, [data?.answers]);

  const handleAnswerPosted = (newAnswer: unknown) => {
    setAnswers((prev) => [...prev, newAnswer as Answer]);
    queryClient.invalidateQueries({ queryKey: ["question", id] });
  };

  const handleMarkBest = async (answerId: string) => {
    await axios.put(`/api/answers/${answerId}/best`);
    queryClient.invalidateQueries({ queryKey: ["question", id] });
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
    );
  }

  const question = data?.question as Question | undefined;
  const displayedAnswers: Answer[] = answers.length
    ? answers
    : (data?.answers ?? []);

  if (!question)
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-zinc-500">
        Question not found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Question */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 leading-snug">
          {question.title}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-zinc-400 mb-4">
          <span>Asked {timeAgo(question.createdAt)}</span>
          <span>Viewed {question.viewCount} times</span>
          <span>{question.voteScore} votes</span>
        </div>

        <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mb-4">
          {question.description}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {question.tags.map((tag) => (
            <Link
              key={tag}
              href={`/questions?tag=${tag}`}
              className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>

        <div className="text-xs text-zinc-400">
          Asked by{" "}
          {question.isAnonymous ? (
            <span className="text-zinc-500">Anonymous</span>
          ) : (
            <Link
              href={`/user/${question.authorId._id}`}
              className="text-blue-500 hover:underline"
            >
              {question.authorId.username}
            </Link>
          )}
        </div>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-800 mb-6" />

      {/* Answers */}
      <h2 className="text-xl font-semibold mb-4">
        {displayedAnswers.length}{" "}
        {displayedAnswers.length === 1 ? "Answer" : "Answers"}
      </h2>

      <div className="space-y-6 mb-8">
        {displayedAnswers.map((answer) => (
          <div
            key={answer._id}
            className={`p-5 rounded-lg border ${answer.isBestAnswer ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"}`}
          >
            {answer.isBestAnswer && (
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium mb-3">
                <span>✓</span> Best Answer
              </div>
            )}
            <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mb-4">
              {answer.content}
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                {answer.isAnonymous ? (
                  "Anonymous"
                ) : (
                  <Link
                    href={`/user/${answer.authorId._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {answer.authorId.username}
                  </Link>
                )}{" "}
                · {timeAgo(answer.createdAt)} · {answer.voteScore} votes
              </span>
              {session?.user?.id === question.authorId._id && (
                <button
                  onClick={() => handleMarkBest(answer._id)}
                  className="text-green-600 hover:text-green-700 dark:text-green-400"
                >
                  {answer.isBestAnswer ? "Unmark best" : "Mark as best"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Answer form */}
      {session ? (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <AnswerForm questionId={id} onAnswerPosted={handleAnswerPosted} />
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center">
          <p className="text-zinc-500 mb-3">Sign in to post an answer</p>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
