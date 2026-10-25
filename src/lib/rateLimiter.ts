// In-memory rate limiter: max 20 votes per user per hour
const voteLog = new Map<string, number[]>();

const VOTE_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function checkVoteRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const key = `vote:${userId}`;
  const timestamps = voteLog.get(key) ?? [];

  // Filter to only timestamps within the window
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  voteLog.set(key, recent);

  const allowed = recent.length <= VOTE_LIMIT;
  return { allowed, remaining: Math.max(0, VOTE_LIMIT - recent.length) };
}

export function logSuspiciousVoting(userId: string, targetId: string): void {
  // In production this would write to a monitoring system
  if (process.env.NODE_ENV !== "production") return;
  const entry = { userId, targetId, timestamp: new Date().toISOString() };
  // eslint-disable-next-line no-console
  console.warn("[suspicious-vote]", JSON.stringify(entry));
}
