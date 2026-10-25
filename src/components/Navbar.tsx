"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-lg text-zinc-900 dark:text-white"
        >
          AskAnon
        </Link>

        <div className="hidden sm:flex flex-1 max-w-xs mx-6">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/questions"
            className="hidden sm:block text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Questions
          </Link>
          <Link
            href="/leaderboard"
            className="hidden sm:block text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
          <ThemeToggle />

          {session ? (
            <>
              <Link
                href="/questions/ask"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
              >
                Ask Question
              </Link>
              <Link
                href={`/user/${session.user.id}`}
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {session.user.name}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
