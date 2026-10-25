import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tag from "@/models/Tag";
import Question from "@/models/Question";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") ?? "10"));

    await connectDB();

    const tag = await Tag.findOne({ name: name.toLowerCase() });
    if (!tag)
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });

    const [questions, total] = await Promise.all([
      Question.find({ tags: name.toLowerCase() })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("authorId", "username avatarUrl")
        .lean(),
      Question.countDocuments({ tags: name.toLowerCase() }),
    ]);

    return NextResponse.json({
      tag,
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
