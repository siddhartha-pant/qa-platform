import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
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

    const { id } = await params;
    if (id === "all") {
      await connectDB();
      await Notification.updateMany(
        { userId: session.user.id, read: false },
        { read: true },
      );
      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid notification ID" },
        { status: 400 },
      );
    }

    await connectDB();
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { read: true },
      { new: true },
    );

    if (!notification)
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    return NextResponse.json({ notification });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
