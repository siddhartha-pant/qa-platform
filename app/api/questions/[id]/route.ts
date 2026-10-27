import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import { questionSchema } from "@/lib/validation";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const [question] = await Promise.all([
      Question.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
        .populate("authorId", "username avatarUrl reputation")
        .lean(),
    ]);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    const answers = await Answer.find({ questionId: id })
      .sort({ isBestAnswer: -1, voteScore: -1, createdAt: 1 })
      .populate("authorId", "username avatarUrl reputation")
      .lean();

    return NextResponse.json({ question, answers });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 },
      );
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
    const question = await Question.findById(id);
    if (!question)
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    if (question.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    Object.assign(question, parsed.data);
    await question.save();

    return NextResponse.json({ question });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 },
      );
    }

    await connectDB();
    const question = await Question.findById(id);
    if (!question)
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    if (question.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await question.deleteOne();
    return NextResponse.json({ message: "Question deleted" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
