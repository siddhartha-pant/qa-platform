import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type NotificationType =
  | "answer_added"
  | "answer_upvoted"
  | "best_answer"
  | "question_upvoted";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "answer_added",
        "answer_upvoted",
        "best_answer",
        "question_upvoted",
      ],
      required: true,
    },
    message: { type: String, required: true, maxlength: 300 },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
