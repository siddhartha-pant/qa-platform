import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id).select("-passwordHash -email").lean();
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [recentQuestions, recentAnswers] = await Promise.all([
      Question.find({ authorId: id, isAnonymous: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title voteScore answerCount createdAt")
        .lean(),
      Answer.find({ authorId: id, isAnonymous: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("questionId", "title")
        .select("content voteScore isBestAnswer createdAt questionId")
        .lean(),
    ]);

    return NextResponse.json({ user, recentQuestions, recentAnswers });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
