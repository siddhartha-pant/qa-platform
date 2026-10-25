import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAnswer extends Document {
  content: string;
  authorId: Types.ObjectId;
  questionId: Types.ObjectId;
  isAnonymous: boolean;
  isBestAnswer: boolean;
  voteScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    content: { type: String, required: true, minlength: 10, maxlength: 10000 },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    isAnonymous: { type: Boolean, default: false },
    isBestAnswer: { type: Boolean, default: false },
    voteScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

AnswerSchema.index({ questionId: 1 });
AnswerSchema.index({ authorId: 1 });
AnswerSchema.index({ questionId: 1, isBestAnswer: -1, voteScore: -1 });

const Answer: Model<IAnswer> =
  mongoose.models.Answer ?? mongoose.model<IAnswer>("Answer", AnswerSchema);
export default Answer;
