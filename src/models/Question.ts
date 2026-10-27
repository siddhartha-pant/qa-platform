import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  description: string;
  authorId: Types.ObjectId;
  isAnonymous: boolean;
  tags: string[];
  viewCount: number;
  voteScore: number;
  answerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 10000,
    },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAnonymous: { type: Boolean, default: false },
    tags: {
      type: [String],
      required: true,
      validate: [
        (v: string[]) => v.length >= 1 && v.length <= 5,
        "Must have 1-5 tags",
      ],
    },
    viewCount: { type: Number, default: 0 },
    voteScore: { type: Number, default: 0 },
    answerCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

QuestionSchema.index({ authorId: 1 });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ voteScore: -1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ title: "text", description: "text" });

const Question: Model<IQuestion> =
  mongoose.models.Question ??
  mongoose.model<IQuestion>("Question", QuestionSchema);
export default Question;
