import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITag extends Document {
  name: string;
  description?: string;
  questionCount: number;
  createdAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 30,
    },
    description: { type: String, maxlength: 200 },
    questionCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

TagSchema.index({ name: 1 }, { unique: true });
TagSchema.index({ questionCount: -1 });

const Tag: Model<ITag> =
  mongoose.models.Tag ?? mongoose.model<ITag>("Tag", TagSchema);
export default Tag;
