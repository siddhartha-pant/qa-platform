import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  reputation: number;
  questionCount: number;
  answerCount: number;
  joinedAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    passwordHash: { type: String, select: false },
    avatarUrl: { type: String },
    bio: { type: String, maxlength: 200 },
    website: { type: String },
    location: { type: String, maxlength: 100 },
    reputation: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
    answerCount: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ reputation: -1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
export default User;
