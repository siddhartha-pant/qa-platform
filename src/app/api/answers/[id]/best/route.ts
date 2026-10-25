import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Answer from "@/models/Answer";
import Question from "@/models/Question";
import mongoose from "mongoose";

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: answerId } = await params;
    if (!mongoose.isValidObjectId(answerId)) {
      return NextResponse.json({ error: "Invalid answer ID" }, { status: 400 });
    }

    await connectDB();

    const answer = await Answer.findById(answerId);
    if (!answer)
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });

    const question = await Question.findById(answer.questionId);
    if (!question)
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );

    if (question.authorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the question author can mark best answer" },
        { status: 403 },
      );
    }

    // Unmark any existing best answer for this question
    await Answer.updateMany(
      { questionId: answer.questionId, isBestAnswer: true },
      { isBestAnswer: false },
    );

    answer.isBestAnswer = !answer.isBestAnswer;
    await answer.save();

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
