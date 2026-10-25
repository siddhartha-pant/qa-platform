// Reputation point values
export const REPUTATION = {
  QUESTION_UPVOTE: 10,
  QUESTION_DOWNVOTE: -5,
  ANSWER_UPVOTE: 25,
  ANSWER_DOWNVOTE: -5,
  BEST_ANSWER: 50,
  DOWNVOTE_GIVEN: -1, // small penalty for frequent downvoters
} as const;

export type ReputationEvent = keyof typeof REPUTATION;
