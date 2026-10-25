import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// Simple in-memory cache: invalidated on next request after 1 hour
let cache: { data: unknown; expiresAt: number } | null = null;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const period = searchParams.get("period") ?? "all-time";

    // Use cache for all-time leaderboard only
    if (period === "all-time" && cache && Date.now() < cache.expiresAt) {
      return NextResponse.json(cache.data);
    }

    await connectDB();

    // For period filters we'd query by createdAt on reputation events;
    // for now we sort by reputation and filter by join date as a proxy
    const dateFilter: Record<string, { $gte: Date }> = {};
    if (period === "this-week") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      dateFilter.joinedAt = { $gte: weekAgo };
    } else if (period === "this-month") {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      dateFilter.joinedAt = { $gte: monthAgo };
    }

    const users = await User.find(dateFilter)
      .sort({ reputation: -1 })
      .limit(100)
      .select(
        "username avatarUrl reputation questionCount answerCount joinedAt",
      )
      .lean();

    const response = { users, period, generatedAt: new Date().toISOString() };

    if (period === "all-time") {
      cache = { data: response, expiresAt: Date.now() + 60 * 60 * 1000 };
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
