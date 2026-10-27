"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { questionSchema, QuestionInput } from "@/lib/validation";

export default function AskQuestionPage() {
  const router = useRouter();
  const [tagInput, setTagInput] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestionInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: { tags: [], isAnonymous: false },
  });

  const tags = watch("tags");

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 5) return;
    setValue("tags", [...tags, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag),
    );
  };

  const onSubmit = async (data: QuestionInput) => {
    setSubmitError("");
    try {
      const res = await axios.post("/api/questions", data);
      router.push(`/questions/${res.data.question._id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.error ?? "Failed to post question");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Ask a Question</h1>
      <p className="text-stone-500 mb-8">
        Be specific. Provide enough context for a great answer.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title")}
            placeholder="What is your question? Be specific."
            className="w-full border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description")}
            rows={8}
            placeholder="Provide all the details needed to understand your question."
            className="w-full border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tags <span className="text-red-500">*</span>
            <span className="text-stone-400 font-normal ml-1">(up to 5)</span>
          </label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add a tag and press Enter"
              className="flex-1 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 bg-white dark:bg-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-400 text-sm px-2 py-0.5 rounded"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.tags && (
            <p className="text-red-500 text-sm mt-1">{errors.tags.message}</p>
          )}
        </div>

        {/* Anonymous toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isAnonymous"
            {...register("isAnonymous")}
            className="w-4 h-4 accent-amber-500"
          />
          <label htmlFor="isAnonymous" className="text-sm">
            Post anonymously{" "}
            <span className="text-stone-400">
              (your username will be hidden)
            </span>
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
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white px-6 py-2.5 rounded-md font-medium transition-colors"
        >
          {isSubmitting ? "Posting..." : "Post Question"}
        </button>
      </form>
    </div>
  );
}
