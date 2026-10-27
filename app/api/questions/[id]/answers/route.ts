import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Answer from "@/models/Answer";
import Question from "@/models/Question";
import { answerSchema } from "@/lib/validation";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: questionId } = await params;
    if (!mongoose.isValidObjectId(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const parsed = answerSchema.safeParse(body);
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

    const question = await Question.findById(questionId);
    if (!question)
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );

    const answer = await Answer.create({
      ...parsed.data,
      authorId: session.user.id,
      questionId,
    });

    await Promise.all([
      Question.findByIdAndUpdate(questionId, { $inc: { answerCount: 1 } }),
      // Import User inline to avoid circular dependency
      (await import("@/models/User")).default.findByIdAndUpdate(
        session.user.id,
        { $inc: { answerCount: 1 } },
      ),
    ]);

    const populated = await answer.populate(
      "authorId",
      "username avatarUrl reputation",
    );
    return NextResponse.json({ answer: populated }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
