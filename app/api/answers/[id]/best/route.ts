import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Answer from "@/models/Answer";
import Question from "@/models/Question";
import User from "@/models/User";
import { REPUTATION } from "@/lib/reputation";
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

    // Revoke reputation from any previously marked best answer
    const prevBest = await Answer.findOne({
      questionId: answer.questionId,
      isBestAnswer: true,
    });
    if (prevBest && prevBest._id.toString() !== answerId) {
      await User.findByIdAndUpdate(prevBest.authorId, {
        $inc: { reputation: -REPUTATION.BEST_ANSWER },
      });
    }

    await Answer.updateMany(
      { questionId: answer.questionId, isBestAnswer: true },
      { isBestAnswer: false },
    );

    const wasAlreadyBest = prevBest?._id.toString() === answerId;
    answer.isBestAnswer = !wasAlreadyBest;
    await answer.save();

    if (answer.isBestAnswer) {
      await User.findByIdAndUpdate(answer.authorId, {
        $inc: { reputation: REPUTATION.BEST_ANSWER },
      });
    }

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
