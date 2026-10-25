import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface IQuestionVote extends Document {
  userId: Types.ObjectId;
  questionId: Types.ObjectId;
  value: 1 | -1;
}

interface IAnswerVote extends Document {
  userId: Types.ObjectId;
  answerId: Types.ObjectId;
  value: 1 | -1;
}

const QuestionVoteSchema = new Schema<IQuestionVote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true },
);

QuestionVoteSchema.index({ userId: 1, questionId: 1 }, { unique: true });
QuestionVoteSchema.index({ questionId: 1 });

const AnswerVoteSchema = new Schema<IAnswerVote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answerId: { type: Schema.Types.ObjectId, ref: "Answer", required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true },
);

AnswerVoteSchema.index({ userId: 1, answerId: 1 }, { unique: true });
AnswerVoteSchema.index({ answerId: 1 });

export const QuestionVote: Model<IQuestionVote> =
  mongoose.models.QuestionVote ??
  mongoose.model<IQuestionVote>("QuestionVote", QuestionVoteSchema);

export const AnswerVote: Model<IAnswerVote> =
  mongoose.models.AnswerVote ??
  mongoose.model<IAnswerVote>("AnswerVote", AnswerVoteSchema);
