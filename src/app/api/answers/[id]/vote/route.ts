import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Answer from "@/models/Answer";
import { AnswerVote } from "@/models/Vote";
import User from "@/models/User";
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

    const { id: answerId } = await params;
    if (!mongoose.isValidObjectId(answerId)) {
      return NextResponse.json({ error: "Invalid answer ID" }, { status: 400 });
    }

    const { value } = await req.json();
    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: "Vote value must be 1 or -1" },
        { status: 400 },
      );
    }

    await connectDB();
    const answer = await Answer.findById(answerId);
    if (!answer)
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });

    if (answer.authorId.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot vote on your own answer" },
        { status: 400 },
      );
    }

    const existing = await AnswerVote.findOne({
      userId: session.user.id,
      answerId,
    });

    if (existing) {
      if (existing.value === value) {
        const scoreDiff = -existing.value;
        await existing.deleteOne();
        await Answer.findByIdAndUpdate(answerId, {
          $inc: { voteScore: scoreDiff },
        });
        await User.findByIdAndUpdate(answer.authorId, {
          $inc: { reputation: value === 1 ? -25 : 2 },
        });
        return NextResponse.json({
          message: "Vote removed",
          voteScore: answer.voteScore + scoreDiff,
          userVote: 0,
        });
      } else {
        const scoreDiff = value - existing.value;
        existing.value = value;
        await existing.save();
        await Answer.findByIdAndUpdate(answerId, {
          $inc: { voteScore: scoreDiff },
        });
        await User.findByIdAndUpdate(answer.authorId, {
          $inc: { reputation: value === 1 ? 27 : -27 },
        });
        return NextResponse.json({
          message: "Vote updated",
          voteScore: answer.voteScore + scoreDiff,
          userVote: value,
        });
      }
    }

    await AnswerVote.create({ userId: session.user.id, answerId, value });
    await Answer.findByIdAndUpdate(answerId, { $inc: { voteScore: value } });
    await User.findByIdAndUpdate(answer.authorId, {
      $inc: { reputation: value === 1 ? 25 : -5 },
    });

    return NextResponse.json({
      message: "Vote recorded",
      voteScore: answer.voteScore + value,
      userVote: value,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
