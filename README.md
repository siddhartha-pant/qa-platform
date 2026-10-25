# AskAnon – Anonymous Q&A Platform

A full-stack anonymous Q&A platform built with Next.js 16, MongoDB, and TypeScript. Ask questions anonymously, get answers from the community, vote on helpful content, and earn reputation.

## ✨ Features

- **Anonymous Posting** – Ask questions or post answers without revealing your identity
- **Voting System** – Upvote/downvote questions and answers (one vote per user, toggleable)
- **Best Answer Selection** – Question authors can mark the best answer
- **Reputation System** – Earn points for upvotes (+10/+25) and best answers (+50)
- **Tags & Filtering** – Tag questions and filter by topic
- **Full-Text Search** – Search across question titles and descriptions
- **Leaderboard** – Top contributors ranked by reputation (all-time, monthly, weekly)
- **User Profiles** – View anyone's public activity, stats, and recent posts
- **Dark Mode** – System-aware with manual toggle, persisted in localStorage
- **Rate Limiting** – 20 votes per user per hour, with suspicious activity logging
- **Authentication** – GitHub OAuth + email/password via NextAuth.js v5

## 🛠️ Tech Stack

| Layer         | Technology              |
| ------------- | ----------------------- |
| Framework     | Next.js 16 (App Router) |
| Language      | TypeScript (strict)     |
| Styling       | Tailwind CSS v4         |
| Database      | MongoDB + Mongoose      |
| Auth          | NextAuth.js v5 (beta)   |
| Validation    | Zod                     |
| Forms         | React Hook Form         |
| Data Fetching | TanStack Query v5       |
| HTTP Client   | Axios                   |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (free tier works)
- GitHub OAuth app (optional, for social login)

### Installation

```bash
git clone https://github.com/Mohitbhatt27/qa-platform.git
cd qa-platform
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qa-platform
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-32-char-secret-here
GITHUB_CLIENT_ID=your-github-app-client-id
GITHUB_CLIENT_SECRET=your-github-app-client-secret
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
qa-platform/
├── app/                     # Next.js App Router pages
│   ├── questions/           # Questions listing and detail
│   │   ├── [id]/page.tsx    # Question detail with answers
│   │   └── ask/page.tsx     # Ask a question form
│   ├── leaderboard/         # Top users by reputation
│   ├── search/              # Full-text search results
│   ├── user/[id]/           # User profile page
│   ├── login/               # Sign in page
│   └── register/            # Create account page
├── src/
│   ├── app/api/             # API Route Handlers
│   │   ├── auth/            # NextAuth handlers + register
│   │   ├── questions/       # CRUD + voting + answers
│   │   ├── answers/         # Voting + best answer
│   │   ├── users/           # User profile
│   │   ├── tags/            # Tag listing
│   │   ├── search/          # Full-text search
│   │   ├── leaderboard/     # Reputation rankings
│   │   └── notifications/   # Notification system
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utilities (db, auth, validation, etc.)
│   └── models/              # Mongoose schemas
├── .env.example             # Environment variable template
└── tsconfig.json
```

## 🗃️ Database Models

| Model        | Key Fields                                                            |
| ------------ | --------------------------------------------------------------------- |
| User         | email, username, passwordHash, reputation, questionCount, answerCount |
| Question     | title, description, authorId, isAnonymous, tags, voteScore, viewCount |
| Answer       | content, authorId, questionId, isAnonymous, isBestAnswer, voteScore   |
| QuestionVote | userId, questionId, value (1 or -1)                                   |
| AnswerVote   | userId, answerId, value (1 or -1)                                     |
| Tag          | name, description, questionCount                                      |
| Notification | userId, type, message, link, read                                     |

## 🔐 Authentication

- Email/password registration at `POST /api/auth/register`
- Sign in via credentials or GitHub OAuth
- JWT sessions via NextAuth.js v5
- Protected routes enforced by middleware

## 🌐 Deployment

Deploy to Vercel:

```bash
npx vercel --prod
```

Add the same environment variables in your Vercel project settings.

## 📝 License

MIT
