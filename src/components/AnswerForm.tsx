"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { answerSchema, AnswerInput } from "@/lib/validation";

interface AnswerFormProps {
  questionId: string;
  onAnswerPosted: (answer: unknown) => void;
}

export default function AnswerForm({
  questionId,
  onAnswerPosted,
}: AnswerFormProps) {
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnswerInput>({
    resolver: zodResolver(answerSchema),
    defaultValues: { isAnonymous: false },
  });

  const onSubmit = async (data: AnswerInput) => {
    setSubmitError("");
    try {
      const res = await axios.post(
        `/api/questions/${questionId}/answers`,
        data,
      );
      onAnswerPosted(res.data.answer);
      reset();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.error ?? "Failed to post answer");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold">Your Answer</h3>
      <div>
        <textarea
          {...register("content")}
          rows={6}
          placeholder="Write a detailed, helpful answer..."
          className="w-full border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="answerAnonymous"
          {...register("isAnonymous")}
          className="w-4 h-4 accent-blue-600"
        />
        <label
          htmlFor="answerAnonymous"
          className="text-sm text-zinc-600 dark:text-zinc-400"
        >
          Answer anonymously
        </label>
      </div>

      {submitError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2 rounded-md font-medium transition-colors"
      >
        {isSubmitting ? "Posting..." : "Post Answer"}
      </button>
    </form>
  );
}
