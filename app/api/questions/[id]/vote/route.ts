import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import { QuestionVote } from "@/models/Vote";
import User from "@/models/User";
import mongoose from "mongoose";
import { checkVoteRateLimit, logSuspiciousVoting } from "@/lib/rateLimiter";

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

    const { value } = await req.json();
    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: "Vote value must be 1 or -1" },
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

    if (question.authorId.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot vote on your own question" },
        { status: 400 },
      );
    }

    const { allowed } = checkVoteRateLimit(session.user.id);
    if (!allowed) {
      logSuspiciousVoting(session.user.id, questionId);
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 20 votes per hour." },
        { status: 429 },
      );
    }

    const existing = await QuestionVote.findOne({
      userId: session.user.id,
      questionId,
    });

    if (existing) {
      if (existing.value === value) {
        // Remove vote
        const scoreDiff = -existing.value;
        await existing.deleteOne();
        await Question.findByIdAndUpdate(questionId, {
          $inc: { voteScore: scoreDiff },
        });
        await User.findByIdAndUpdate(question.authorId, {
          $inc: { reputation: value === 1 ? -10 : 2 },
        });
        return NextResponse.json({
          message: "Vote removed",
          voteScore: question.voteScore + scoreDiff,
          userVote: 0,
        });
      } else {
        // Change vote
        const scoreDiff = value - existing.value;
        existing.value = value;
        await existing.save();
        await Question.findByIdAndUpdate(questionId, {
          $inc: { voteScore: scoreDiff },
        });
        await User.findByIdAndUpdate(question.authorId, {
          $inc: { reputation: value === 1 ? 12 : -12 },
        });
        return NextResponse.json({
          message: "Vote updated",
          voteScore: question.voteScore + scoreDiff,
          userVote: value,
        });
      }
    }

    await QuestionVote.create({ userId: session.user.id, questionId, value });
    await Question.findByIdAndUpdate(questionId, {
      $inc: { voteScore: value },
    });
    await User.findByIdAndUpdate(question.authorId, {
      $inc: { reputation: value === 1 ? 10 : -5 },
    });

    return NextResponse.json({
      message: "Vote recorded",
      voteScore: question.voteScore + value,
      userVote: value,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const { id: questionId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ userVote: 0 });
    }

    await connectDB();
    const vote = await QuestionVote.findOne({
      userId: session.user.id,
      questionId,
    });
    return NextResponse.json({ userVote: vote?.value ?? 0 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
