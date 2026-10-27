import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Tag from "@/models/Tag";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

    await connectDB();
    const tags = await Tag.find()
      .sort({ questionCount: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const tag = await Tag.findOneAndUpdate(
      { name: name.toLowerCase().trim() },
      { description },
      { upsert: true, new: true },
    );

    return NextResponse.json({ tag }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
