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
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
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
          <Link
            href={`/questions/${question._id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-lg leading-snug"
          >
            {question.title}
          </Link>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 line-clamp-2">
            {question.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {question.tags.map((tag) => (
              <Link
                key={tag}
                href={`/questions?tag=${tag}`}
                className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
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
                  className="text-blue-500 hover:underline"
                >
                  {question.authorId.username}
                </Link>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
