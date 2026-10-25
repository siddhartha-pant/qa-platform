/**
 * Database optimization utilities.
 * Call ensureIndexes() once on startup to create missing indexes.
 */
import { connectDB } from "./db";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import User from "@/models/User";

export async function ensureIndexes(): Promise<void> {
  await connectDB();
  await Promise.all([
    Question.ensureIndexes(),
    Answer.ensureIndexes(),
    User.ensureIndexes(),
  ]);
}
