# AskAnon – API Documentation

All API routes are under `/api`. JSON request/response bodies throughout.

## Authentication

Most mutation endpoints require a valid session cookie (set by NextAuth.js).
Protected endpoints return `401 Unauthorized` if no session exists.

---

## Auth Endpoints

### `POST /api/auth/register`

Create a new account.

**Body:**

```json
{ "email": "user@example.com", "username": "johndoe", "password": "secret123" }
```

**Response `201`:**

```json
{ "message": "Account created successfully", "userId": "<id>" }
```

**Errors:** `400` validation, `409` duplicate email/username

### `POST /api/auth/signin` _(NextAuth)_

Sign in via credentials or OAuth. Handled by NextAuth.js.

---

## Questions

### `GET /api/questions`

List questions with pagination.

**Query params:** `page`, `limit` (max 50), `sort` (`newest`|`most-voted`|`most-answered`), `tag`

**Response:**

```json
{
  "questions": [...],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

### `POST /api/questions` 🔒

Create a question.

**Body:**

```json
{
  "title": "...",
  "description": "...",
  "tags": ["javascript"],
  "isAnonymous": false
}
```

**Response `201`:** `{ "question": { ... } }`

### `GET /api/questions/[id]`

Get a question with its answers. Increments `viewCount`.

**Response:** `{ "question": { ... }, "answers": [...] }`

### `PUT /api/questions/[id]` 🔒

Update a question. Author only.

### `DELETE /api/questions/[id]` 🔒

Delete a question. Author only.

---

## Answers

### `POST /api/questions/[id]/answers` 🔒

Post an answer to a question.

**Body:** `{ "content": "...", "isAnonymous": false }`
**Response `201`:** `{ "answer": { ... } }`

### `PUT /api/answers/[id]/best` 🔒

Toggle best answer. Question author only.

---

## Voting

### `POST /api/questions/[id]/vote` 🔒

Vote on a question. Sending same value removes the vote.

**Body:** `{ "value": 1 }` or `{ "value": -1 }`
**Response:** `{ "voteScore": 5, "userVote": 1 }`
**Errors:** `400` own question, `429` rate limit exceeded

### `GET /api/questions/[id]/vote` 🔒

Get the current user's vote on a question.

### `POST /api/answers/[id]/vote` 🔒

Vote on an answer. Same as question voting.

---

## Search

### `GET /api/search?q=query`

Full-text search across question titles and descriptions.

**Query params:** `q` (required), `page`, `limit`, `sort` (`relevance`|`newest`|`most-voted`), `tag`

**Response:**

```json
{
  "query": "javascript async",
  "questions": [...],
  "pagination": { ... }
}
```

---

## Tags

### `GET /api/tags`

List popular tags sorted by usage.

**Query params:** `limit` (max 50)

### `POST /api/tags` 🔒

Create or update a tag.

**Body:** `{ "name": "javascript", "description": "..." }`

### `GET /api/tags/[name]`

Get a tag and its questions.

---

## Users

### `GET /api/users/[id]`

Get a user's public profile with recent activity.

**Response:**

```json
{
  "user": { "username": "...", "reputation": 150, ... },
  "recentQuestions": [...],
  "recentAnswers": [...]
}
```

---

## Leaderboard

### `GET /api/leaderboard`

Top 100 users by reputation.

**Query params:** `period` (`all-time` | `this-week` | `this-month`)

**Response:** `{ "users": [...], "period": "all-time", "generatedAt": "..." }`

> All-time result is cached for 1 hour.

---

## Notifications

### `GET /api/notifications` 🔒

Get current user's notifications (last 30).

**Response:** `{ "notifications": [...], "unreadCount": 3 }`

### `POST /api/notifications` 🔒

Create a notification.

**Body:** `{ "userId": "<id>", "type": "answer_added", "message": "...", "link": "/questions/123" }`

### `PUT /api/notifications/[id]` 🔒

Mark a notification as read.

### `PUT /api/notifications/all` 🔒

Mark all notifications as read.

---

## Error Format

All error responses follow:

```json
{ "error": "Human-readable message" }
```

Validation errors include field-level detail:

```json
{ "error": "Validation failed", "details": { "title": ["Required"] } }
```

## HTTP Status Codes

| Code | Meaning                        |
| ---- | ------------------------------ |
| 200  | Success                        |
| 201  | Created                        |
| 400  | Bad request / validation error |
| 401  | Unauthenticated                |
| 403  | Forbidden (wrong owner)        |
| 404  | Resource not found             |
| 409  | Conflict (duplicate)           |
| 429  | Rate limit exceeded            |
| 500  | Internal server error          |
