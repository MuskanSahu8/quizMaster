# 🏆 QuizMaster – Online Timed Quiz Website

> **Author**: muskan · **Release Date**: October 2026  
> A full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application where learners attempt timed multiple-choice quizzes, track score progression and history, and administrators manage all quiz content and question banks.

---

## 🌟 1. Project Overview & Problem Statement

Self-learners, bootcamp students, and job seekers often lack a dedicated, distraction-free platform to test their technical knowledge under real countdown pressure. **QuizMaster** bridges this gap by providing:
- **Topic-wise timed quizzes** in six core domains: **Java**, **JavaScript**, **React**, **HTML**, **CSS**, and **General Knowledge**.
- **Instant server-graded results** with percentage, pass/fail status, and deep contextual explanations for both correct and incorrect choices.
- **Persistent attempt history & analytics** to track average scores, best attempts, and topic-specific performance over time.
- **Comprehensive Admin Dashboard** with complete CRUD operations for quizzes, individual question management with 4 options, and platform usage metrics.

---

## 🚀 2. Key Features

### 👤 Learner Features
- **Secure Authentication**: Registration and login with bcrypt-hashed passwords (10 salt rounds) and signed JSON Web Tokens (JWT).
- **Quiz Catalog & Filtering**: Search quizzes by keyword and filter dynamically by Category and Difficulty (*Easy*, *Medium*, *Hard*).
- **Interactive Quiz Player**:
  - One question at a time with large, accessible tap targets (44px+ minimum).
  - Synchronized countdown timer that pulses red with audio/visual urgency when $\le$ 30 seconds remain.
  - Automatic submission when time reaches `00:00`.
  - Question Palette navigation to jump directly to any question, view answered vs. unanswered state, or change choices before final submission.
- **Instant Results & Celebration**:
  - Animated celebration confetti when passing ($\ge$ 60%).
  - Score card (Score, Percentage, Time Taken, Pass/Fail badge).
  - Question-by-question review highlighting correct answers in green, user's choices, and in-depth explanations.
- **Historical Tracker & Performance Analytics**:
  - Full attempt ledger with date, quiz title, score, percentage, and time taken.
  - Performance summary metrics: Total attempts, Average score %, Best score %, and Pass rate.
  - Visual topic-wise performance breakdown.
- **User Profile Management**: Update full name, email, or change account password with validation.

### 🛡️ Administrator Features
- **Role-Based Access Control**: Strict middleware ensuring `/api/admin/*` routes are exclusively accessible to administrators.
- **Platform Analytics**: Total users, total active quizzes, total questions, and total attempts with recent activity ledger.
- **Quiz Inventory CRUD**: Create, edit, and delete quizzes with configurable time limits (minutes), difficulty, and categories.
- **Question Bank Manager**: Add, edit, and delete questions linked to any quiz with 4 options, radio selector for the correct answer, and detailed explanations.
- **User Directory**: View all registered users, roles, email addresses, and attempt counts.

---

## 🔑 3. Preloaded Credentials & Demo Accounts

For immediate out-of-the-box evaluation, QuizMaster includes pre-seeded accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@quizmaster.com` | `Admin@123` | Full administrative control: Create/Edit/Delete quizzes & questions, inspect platform stats & user directory. |
| **Learner** | `learner@quizmaster.com` | `Learner@123` | Learner privileges: Attempt quizzes, view history, review score explanations, update profile. |

> 💡 *The login screen also features 1-Click Demo Buttons to fill credentials instantly.*

---

## 🛠️ 4. Technology Stack & Architecture

QuizMaster follows a three-tier decoupled client-server architecture:

```
┌────────────────────────────────────────────────────────┐
│             React Single Page App (Vite)               │
│  React Router · Context API · Tailwind CSS · Confetti  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / JSON (REST API)
┌───────────────────────────▼────────────────────────────┐
│              Express.js / Node.js API                  │
│   JWT Auth · bcryptjs · Role Middleware · Server Timer │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM / Driver
┌───────────────────────────▼────────────────────────────┐
│               MongoDB / Memory Fallback                │
│    Users · Quizzes · Questions · Attempts Collections  │
└────────────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, React Router v7 | Responsive UI, single-page routing, client state |
| **Styling** | Tailwind CSS, Lucide React Icons | Modern, accessible responsive design |
| **Backend** | Node.js, Express.js (ES Modules) | REST API endpoints, business logic, server grading |
| **Database** | MongoDB, Mongoose | Relational-style document modeling, indexed schemas |
| **Security** | JSON Web Tokens (JWT), bcryptjs | Secure stateless authentication, password hashing |
| **Resilience** | In-Memory Fallback Store | Guaranteed instant local runtime if MongoDB is offline |

---

## 🗄️ 5. Database Schema Design

QuizMaster utilizes four normalized MongoDB collections:

### 1. `users`
- `_id`: ObjectId (Primary key)
- `name`: String
- `email`: String (Unique & indexed)
- `password`: String (bcrypt hash, `select: false`)
- `role`: String (`'user'` or `'admin'`, default: `'user'`)
- `createdAt` / `updatedAt`: Timestamps

### 2. `quizzes`
- `_id`: ObjectId (Primary key)
- `title`: String
- `description`: String
- `category`: String (`Java`, `JavaScript`, `React`, `HTML`, `CSS`, `General Knowledge`)
- `difficulty`: String (`Easy`, `Medium`, `Hard`)
- `timeLimit`: Number (Minutes)
- `createdBy`: ObjectId (Reference to `users`)

### 3. `questions`
- `_id`: ObjectId (Primary key)
- `quizId`: ObjectId (Reference to `quizzes`, indexed)
- `text`: String
- `options`: `[String]` (Exactly four options)
- `correctIndex`: Number (0 to 3; **strictly withheld from clients during quiz play**)
- `explanation`: String (Shown upon submission)

### 4. `attempts`
- `_id`: ObjectId (Primary key)
- `userId`: ObjectId (Reference to `users`, indexed)
- `quizId`: ObjectId (Reference to `quizzes`, indexed)
- `answers`: `[{ questionId, selectedIndex }]`
- `score`: Number
- `total`: Number
- `percentage`: Number (Calculated on the server)
- `timeTaken`: Number (Seconds)
- `submittedAt`: Date (Indexed for historical sorting)

---

## 📡 6. REST API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new learner account (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate credentials & return JWT |
| `GET` | `/api/auth/me` | Auth | Get current user profile |
| `PUT` | `/api/auth/me` | Auth | Update profile or change password |

### Quizzes (`/api/quizzes`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quizzes` | Public | List quizzes with optional `category`, `difficulty`, `search` |
| `GET` | `/api/quizzes/:id` | Auth | Get quiz details & questions (**without** correct answers) |
| `POST` | `/api/quizzes/:id/submit` | Auth | Submit user answers; server grades and returns review |

### History & Stats (`/api/attempts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attempts` | Auth | Get logged-in user's past quiz attempts |
| `GET` | `/api/attempts/stats` | Auth | Get aggregated metrics (average score, best score, topic breakdown) |
| `GET` | `/api/attempts/:id` | Auth | Get specific attempt result with full question review & explanations |

### Admin Console (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin | Overall metrics: Users, quizzes, questions, attempts |
| `GET` | `/api/admin/users` | Admin | List all registered users and attempt counts |
| `POST` | `/api/admin/quizzes` | Admin | Create a new quiz |
| `PUT` | `/api/admin/quizzes/:id` | Admin | Update quiz details |
| `DELETE`| `/api/admin/quizzes/:id` | Admin | Delete quiz and cascade delete questions |
| `GET` | `/api/admin/quizzes/:id/questions` | Admin | Get questions with correct index for quiz editor |
| `POST` | `/api/admin/quizzes/:id/questions` | Admin | Add a question with 4 options, correctIndex, explanation |
| `PUT` | `/api/admin/questions/:id` | Admin | Edit an existing question |
| `DELETE`| `/api/admin/questions/:id` | Admin | Delete a question |

---

## 🧪 7. Automated Testing Suite

The backend includes a 19-assertion automated test runner (`backend/test-api.js`) verifying all test cases specified in the project requirements:

- **TC-1**: Duplicate email registration rejection with `400 Bad Request`.
- **TC-2**: Invalid password rejection with `401 Unauthorized`.
- **TC-3**: Regular user access to `/api/admin/*` blocked with `403 Forbidden`.
- **TC-4**: Server-side answer evaluation and grading calculation.
- **TC-5**: Client question concealment of `correctIndex` & `explanation` during active sessions.
- **TC-6**: Cascade deletion of questions when an administrator deletes a quiz.

To run the automated test suite:
```bash
npm run test:backend
```

---

## 🏃 8. Getting Started & Local Development

### Prerequisites
- Node.js (v18 or newer)
- npm or pnpm

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Configure Environment Variables
Verify or edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/quizmaster
JWT_SECRET=quizmaster_super_secret_jwt_key_2026_xyz123
CLIENT_URL=http://localhost:5173
```
*(Note: If local MongoDB is not running, QuizMaster's built-in Memory Store automatically takes over with zero configuration!)*

### Step 3: Run the Development Servers
In two separate terminals:

```bash
# Terminal 1: Start Express API
npm run server

# Terminal 2: Start React Frontend (Vite)
npm run client
```

Open `http://localhost:5173` in your browser.

---

## 📦 9. Production Build

To test or build the frontend for production:
```bash
npm run build:client
```
Produces an optimized static bundle in `frontend/dist/`.
