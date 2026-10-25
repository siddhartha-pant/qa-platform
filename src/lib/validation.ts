import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

export const questionSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(150, "Title too long"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(10000),
  tags: z
    .array(z.string().min(1).max(30))
    .min(1, "At least one tag required")
    .max(5, "Max 5 tags"),
  isAnonymous: z.boolean().default(false),
});

export const answerSchema = z.object({
  content: z
    .string()
    .min(10, "Answer must be at least 10 characters")
    .max(10000),
  isAnonymous: z.boolean().default(false),
});

export const voteSchema = z.object({
  value: z.enum(["1", "-1"]).transform(Number),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
