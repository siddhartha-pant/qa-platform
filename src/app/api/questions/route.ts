import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import User from "@/models/User";
import { questionSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = questionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await connectDB();
    const question = await Question.create({
      ...parsed.data,
      authorId: session.user.id,
    });

    await User.findByIdAndUpdate(session.user.id, {
      $inc: { questionCount: 1 },
    });

    const populated = await question.populate("authorId", "username avatarUrl");
    return NextResponse.json({ question: populated }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"));
    const sort = searchParams.get("sort") ?? "newest";
    const tag = searchParams.get("tag");

    const sortMap: Record<string, [string, 1 | -1][]> = {
      newest: [["createdAt", -1]],
      "most-voted": [["voteScore", -1]],
      "most-answered": [["answerCount", -1]],
    };
    const sortQuery = sortMap[sort] ?? sortMap.newest;

    await connectDB();
    const filter = tag ? { tags: tag } : {};

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("authorId", "username avatarUrl")
        .lean(),
      Question.countDocuments(filter),
    ]);

    return NextResponse.json({
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
