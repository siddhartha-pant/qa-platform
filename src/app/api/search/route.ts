import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") ?? "10"));
    const sort = searchParams.get("sort") ?? "relevance";
    const tag = searchParams.get("tag");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter q is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const textFilter = { $text: { $search: query } };
    const filter = tag ? { ...textFilter, tags: tag } : textFilter;

    type SortSpec = { [key: string]: 1 | -1 | { $meta: string } };
    const sortMap: Record<string, SortSpec> = {
      relevance: { score: { $meta: "textScore" } },
      newest: { createdAt: -1 },
      "most-voted": { voteScore: -1 },
    };

    const sortQuery = sortMap[sort] ?? sortMap.relevance;

    const [questions, total] = await Promise.all([
      Question.find(
        filter,
        sort === "relevance" ? { score: { $meta: "textScore" } } : {},
      )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort(sortQuery as any)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("authorId", "username avatarUrl")
        .lean(),
      Question.countDocuments(filter),
    ]);

    return NextResponse.json({
      query,
      questions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
