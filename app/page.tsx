import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-stone-900 dark:text-stone-100">
          Ask Anonymously.{" "}
          <span className="text-amber-600 dark:text-amber-400">
            Answer Honestly.
          </span>
        </h1>
        <p className="text-xl text-stone-500 max-w-2xl mx-auto mb-8">
          A community where you can ask any question without revealing your
          identity. Get answers from real people who care.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/questions/ask"
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            Ask a Question
          </Link>
          <Link
            href="/questions"
            className="border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 px-6 py-3 rounded-lg font-medium text-lg transition-colors"
          >
            Browse Questions
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: "🎭",
            title: "Stay Anonymous",
            description:
              "Ask sensitive questions without revealing who you are. Post with a toggle.",
          },
          {
            icon: "⬆️",
            title: "Community Voting",
            description:
              "Upvote helpful answers. The best float to the top through community curation.",
          },
          {
            icon: "🏆",
            title: "Earn Reputation",
            description:
              "Build credibility by answering well. Climb the leaderboard.",
          },
        ].map(({ icon, title, description }) => (
          <div
            key={title}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6"
          >
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-stone-500 text-sm">{description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-stone-900 dark:bg-stone-800 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
        <p className="text-stone-400 mb-4">
          Create a free account and start asking questions today.
        </p>
        <Link
          href="/register"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
